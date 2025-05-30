// File: src/lib/api/errors.ts
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly retryable: boolean;
  public readonly timestamp: number;

  constructor(
    code: string,
    message: string,
    status: number = 500,
    details?: Record<string, unknown>,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.retryable = retryable;
    this.timestamp = Date.now();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert to JSON for logging/reporting
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
      retryable: this.retryable,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Check if error is of a specific type
   */
  public isType(code: string): boolean {
    return this.code === code;
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(): boolean {
    return this.retryable;
  }
}

/**
 * Error codes for different types of API errors
 */
export const API_ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // HTTP errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SCHEMA_ERROR: 'SCHEMA_ERROR',
  
  // Business logic errors
  MARKET_NOT_FOUND: 'MARKET_NOT_FOUND',
  MARKET_CLOSED: 'MARKET_CLOSED',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;

/**
 * Create a new API error
 */
export function createApiError(
  code: ApiErrorCode,
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): ApiError {
  const retryable = isRetryableError(code, status);
  return new ApiError(code, message, status, details, retryable);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(code: ApiErrorCode, status: number): boolean {
  // Network errors are generally retryable
  if (code === 'NETWORK_ERROR' || code === 'TIMEOUT_ERROR' || code === 'CONNECTION_ERROR') {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (status >= 500) {
    return true;
  }
  
  // Rate limiting might be retryable after delay
  if (code === 'RATE_LIMITED') {
    return true;
  }
  
  // Client errors (4xx) are generally not retryable
  return false;
}

/**
 * Handle axios errors and convert to ApiError
 */
export function handleApiError(error: AxiosError): ApiError {
  // Network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return createApiError(
      'TIMEOUT_ERROR',
      'Request timed out',
      408,
      { originalError: error.message }
    );
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return createApiError(
      'CONNECTION_ERROR',
      'Connection failed',
      503,
      { originalError: error.message }
    );
  }

  if (!error.response) {
    return createApiError(
      'NETWORK_ERROR',
      'Network error occurred',
      503,
      { originalError: error.message }
    );
  }

  // HTTP errors
  const { status, data } = error.response as { status: number; data?: { message?: string } };
  
  switch (status) {
    case 400:
      return createApiError(
        'BAD_REQUEST',
        data?.message || 'Bad request',
        status,
        { responseData: data }
      );
      
    case 401:
      return createApiError(
        'UNAUTHORIZED',
        (data && typeof data.message === 'string' ? data.message : 'Unauthorized'),
        status,
        { responseData: data }
      );
      
    case 403:
      return createApiError(
        'FORBIDDEN',
        data?.message || 'Forbidden',
        status,
        { responseData: data }
      );
      
    case 404:
      return createApiError(
        'NOT_FOUND',
        data?.message || 'Resource not found',
        status,
        { responseData: data }
      );
      
    case 405:
      return createApiError(
        'METHOD_NOT_ALLOWED',
        data?.message || 'Method not allowed',
        status,
        { responseData: data }
      );
      
    case 429:
      return createApiError(
        'RATE_LIMITED',
        data?.message || 'Rate limit exceeded',
        status,
        { 
          responseData: data,
          retryAfter: error.response.headers['retry-after']
        }
      );
      
    case 500:
      return createApiError(
        'SERVER_ERROR',
        data?.message || 'Internal server error',
        status,
        { responseData: data }
      );
      
    case 503:
      return createApiError(
        'SERVICE_UNAVAILABLE',
        data?.message || 'Service unavailable',
        status,
        { responseData: data }
      );
      
    default:
      return createApiError(
        status >= 500 ? 'SERVER_ERROR' : 'BAD_REQUEST',
        data?.message || `HTTP ${status} error`,
        status,
        { responseData: data }
      );
  }
}

/**
 * Check if an error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

/**
 * Extract error code for programmatic handling
 */
export function getErrorCode(error: unknown): string {
  if (isApiError(error)) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
}