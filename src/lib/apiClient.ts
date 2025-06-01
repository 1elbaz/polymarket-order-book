// File: src/lib/apiClient.ts
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { z } from 'zod';
import { ApiError, handleApiError, createApiError, isAxiosError } from '@/lib/errors';
import type { RateLimitInfo } from '@/types/api';

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Number of retry attempts */
  retryAttempts: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
  /** Custom headers to include with requests */
  headers?: Record<string, string>;
  /** Enable request/response logging */
  debug?: boolean;
}

/**
 * Default configuration for the API client
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'https://clob.polymarket.com',
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Enhanced API client with retry logic, validation, and error handling
 */
export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = this.createAxiosInstance();
    this.setupRetryLogic();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.config.headers,
      },
    });
  }

  private setupRetryLogic(): void {
    axiosRetry(this.client, {
      retries: this.config.retryAttempts,
      retryDelay: (retryCount) => {
        // Exponential backoff with jitter
        const delay = Math.min(this.config.retryDelay * Math.pow(2, retryCount - 1), 30000);
        const jitter = Math.random() * 0.1 * delay;
        return delay + jitter;
      },
      retryCondition: (error: AxiosError) => {
        // Retry on network errors or 5xx responses
        return axiosRetry.isNetworkError(error) || 
               axiosRetry.isRetryableError(error) ||
               (error.response?.status ? error.response.status >= 500 : false);
      },
      onRetry: (retryCount, error) => {
        if (this.config.debug) {
          console.warn(`API request retry ${retryCount}:`, error.message);
        }
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.config.debug) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        if (this.config.debug) {
          console.error('API Request Error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Update rate limit info from headers
        this.updateRateLimitInfo(response);
        
        if (this.config.debug) {
          console.log(`API Response: ${response.status} ${response.config.url}`);
        }
        
        return response;
      },
      (error) => {
        if (this.config.debug) {
          console.error('API Response Error:', error.response?.status, error.message);
        }
        
        // Convert axios error to our custom error
        return Promise.reject(handleApiError(error));
      }
    );
  }

  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;
    if (headers['x-ratelimit-limit'] && headers['x-ratelimit-remaining']) {
      this.rateLimitInfo = {
        limit: parseInt(headers['x-ratelimit-limit'], 10),
        remaining: parseInt(headers['x-ratelimit-remaining'], 10),
        resetTime: parseInt(headers['x-ratelimit-reset'], 10) || Date.now() + 60000,
        resetIn: Math.max(0, parseInt(headers['x-ratelimit-reset'], 10) - Math.floor(Date.now() / 1000)),
        exceeded: parseInt(headers['x-ratelimit-remaining'], 10) <= 0,
      };
    }
  }

  /**
   * Get current rate limit information
   */
  public getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  /**
   * Generic GET request with validation
   */
  public async get<T>(url: string, schema?: z.ZodType<T>, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get(url, config);
      return this.validateAndTransform(response.data, schema);
    } catch (error: unknown) {
      throw this.enhanceError(error, 'GET', url);
    }
  }

  /**
   * Generic POST request with validation
   */
  public async post<T>(
    url: string, 
    data?: unknown, 
    schema?: z.ZodType<T>, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post(url, data, config);
      return this.validateAndTransform(response.data, schema);
    } catch (error: unknown) {
      throw this.enhanceError(error, 'POST', url);
    }
  }

  /**
   * Generic PUT request with validation
   */
  public async put<T>(
    url: string, 
    data?: unknown, 
    schema?: z.ZodType<T>, 
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.put(url, data, config);
      return this.validateAndTransform(response.data, schema);
    } catch (error: unknown) {
      throw this.enhanceError(error, 'PUT', url);
    }
  }

  /**
   * Generic DELETE request with validation
   */
  public async delete<T>(url: string, schema?: z.ZodType<T>, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete(url, config);
      return this.validateAndTransform(response.data, schema);
    } catch (error: unknown) {
      throw this.enhanceError(error, 'DELETE', url);
    }
  }

  /**
   * Validate and transform response data
   */
  private validateAndTransform<T>(data: unknown, schema?: z.ZodType<T>): T {
    if (!schema) {
      return data as T;
    }

    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createApiError(
          'VALIDATION_ERROR',
          'Response validation failed',
          400,
          { validationErrors: error.errors, originalData: data }
        );
      }
      throw error;
    }
  }

  /**
   * Enhance error with additional context
   */
  private enhanceError(error: unknown, method: string, url: string): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (isAxiosError(error)) {
      return handleApiError(error);
    }

    return createApiError(
      'UNKNOWN_ERROR',
      `Unknown error during ${method} ${url}`,
      500,
      { originalError: error }
    );
  }

  /**
   * Check if the client is healthy (not rate limited, etc.)
   */
  public isHealthy(): boolean {
    return !this.rateLimitInfo?.exceeded;
  }

  /**
   * Get client configuration
   */
  public getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  /**
   * Update client configuration
   */
  public updateConfig(updates: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...updates };
    // Note: This doesn't recreate the axios instance
    // For base URL changes, you'd need to create a new client
  }
}

// Create and export a default client instance
export const apiClient = new ApiClient();

// Re-export the specific client implementations
export { polymarketClient as default, fetchOrderBook, fetchMarket, PolymarketClient } from './polymarket';
export { OrderBookSocket } from './websocket';