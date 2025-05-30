// File: src/types/api.ts
import { z } from 'zod';
import Decimal from 'decimal.js';

// =============================================================================
// COMMON API TYPES
// =============================================================================

/**
 * Standard API response wrapper used by Polymarket
 */
export interface ApiResponse<T = unknown> {
  /** Response data payload */
  data: T;
  /** Response status code */
  status: number;
  /** Success indicator */
  success: boolean;
  /** Error message if request failed */
  message?: string;
  /** Response timestamp */
  timestamp: number;
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  /** Error message */
  error: string;
  /** Error code for programmatic handling */
  code: string;
  /** HTTP status code */
  status: number;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Timestamp when error occurred */
  timestamp: number;
  /** Request ID for debugging */
  requestId?: string;
}

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  /** Pagination metadata */
  meta: PaginationMeta;
}

// =============================================================================
// MARKET DATA API RESPONSES
// =============================================================================

/**
 * Raw market data from Polymarket API
 */
export interface MarketApiResponse {
  /** Unique market identifier */
  id: string;
  /** Market question/title */
  question: string;
  /** Detailed market description */
  description: string;
  /** Market category */
  category: string;
  /** Market subcategory */
  subcategory?: string;
  /** Market creation timestamp */
  createdAt: string;
  /** Market expiration/resolution timestamp */
  endDate: string;
  /** Market resolution timestamp (if resolved) */
  resolvedAt?: string;
  /** Market status */
  status: 'active' | 'closed' | 'resolved' | 'suspended';
  /** Current market price (probability) */
  price: number;
  /** 24-hour price change */
  priceChange24h: number;
  /** 24-hour volume in USD */
  volume24h: number;
  /** Total volume since creation */
  volumeTotal: number;
  /** Market maker liquidity */
  liquidity: number;
  /** Number of traders */
  traderCount: number;
  /** Market tags */
  tags: string[];
  /** Market creator information */
  creator?: {
    id: string;
    name: string;
  };
  /** Resolution criteria */
  resolutionCriteria?: string;
  /** Market outcomes (for multi-outcome markets) */
  outcomes?: Array<{
    id: string;
    name: string;
    price: number;
    volume: number;
  }>;
}

/**
 * Market list response
 */
export interface MarketsListResponse extends PaginatedResponse<MarketApiResponse> {
  /** Additional market list metadata */
  filters?: {
    category?: string;
    status?: string;
    searchQuery?: string;
  };
}

/**
 * Market search response
 */
export interface MarketSearchResponse extends ApiResponse<MarketApiResponse[]> {
  /** Search query used */
  query: string;
  /** Number of results found */
  resultCount: number;
  /** Search suggestions */
  suggestions?: string[];
}

// =============================================================================
// ORDER BOOK API RESPONSES
// =============================================================================

/**
 * Raw order book response from Polymarket API
 */
export interface OrderBookApiResponse {
  /** Market ID this order book belongs to */
  marketId: string;
  /** Buy orders [price, size] */
  bids: [number, number][];
  /** Sell orders [price, size] */
  asks: [number, number][];
  /** Sequence number for ordering updates */
  sequence: number;
  /** Timestamp when snapshot was taken */
  timestamp: number;
  /** Last trade price */
  lastPrice?: number;
  /** 24-hour volume */
  volume24h?: number;
  /** Best bid price */
  bestBid?: number;
  /** Best ask price */
  bestAsk?: number;
  /** Current spread */
  spread?: number;
}

/**
 * Order book depth response (for larger depth requests)
 */
export interface OrderBookDepthResponse extends OrderBookApiResponse {
  /** Number of price levels requested */
  depth: number;
  /** Whether this is a full snapshot */
  isSnapshot: boolean;
}

// =============================================================================
// TRADE HISTORY API RESPONSES
// =============================================================================

/**
 * Individual trade data from API
 */
export interface TradeApiResponse {
  /** Unique trade ID */
  id: string;
  /** Market ID */
  marketId: string;
  /** Trade price */
  price: number;
  /** Trade size/quantity */
  size: number;
  /** Trade timestamp */
  timestamp: number;
  /** Side of the trade (taker side) */
  side: 'buy' | 'sell';
  /** Trade type */
  type: 'market' | 'limit';
  /** Fee paid */
  fee?: number;
  /** Trader ID (if available) */
  traderId?: string;
}

/**
 * Trade history response
 */
export interface TradeHistoryResponse extends PaginatedResponse<TradeApiResponse> {
  /** Market ID for these trades */
  marketId: string;
  /** Time range of trades */
  timeRange: {
    from: number;
    to: number;
  };
  /** Trade statistics */
  stats?: {
    totalVolume: number;
    tradeCount: number;
    averageTradeSize: number;
    priceRange: {
      high: number;
      low: number;
    };
  };
}

// =============================================================================
// WEBSOCKET API MESSAGES
// =============================================================================

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 
  | 'subscribe'
  | 'unsubscribe'
  | 'orderbook_update'
  | 'trade_update'
  | 'market_update'
  | 'ping'
  | 'pong'
  | 'error'
  | 'connected'
  | 'disconnected';

/**
 * Base WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  /** Message type */
  type: WebSocketMessageType;
  /** Message payload */
  data: T;
  /** Channel or topic */
  channel?: string;
  /** Message timestamp */
  timestamp: number;
  /** Sequence number */
  sequence?: number;
}

/**
 * WebSocket subscription message
 */
export interface WebSocketSubscription {
  /** Channel to subscribe to */
  channel: string;
  /** Market ID for market-specific channels */
  marketId?: string;
  /** Subscription parameters */
  params?: Record<string, unknown>;
}

/**
 * WebSocket order book update message
 */
export interface WebSocketOrderBookUpdate {
  /** Market ID */
  marketId: string;
  /** Updated bids */
  bids: [number, number][];
  /** Updated asks */
  asks: [number, number][];
  /** Update sequence number */
  sequence: number;
  /** Update timestamp */
  timestamp: number;
  /** Whether this is a full snapshot or delta */
  isSnapshot: boolean;
}

/**
 * WebSocket trade update message
 */
export interface WebSocketTradeUpdate {
  /** Market ID */
  marketId: string;
  /** Trade data */
  trade: TradeApiResponse;
  /** Update timestamp */
  timestamp: number;
}

/**
 * WebSocket error message
 */
export interface WebSocketError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

// =============================================================================
// MARKET STATISTICS API RESPONSES
// =============================================================================

/**
 * Market statistics response
 */
export interface MarketStatsResponse {
  /** Market ID */
  marketId: string;
  /** Current price */
  currentPrice: number;
  /** Price change over different periods */
  priceChange: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
  };
  /** Volume over different periods */
  volume: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
    total: number;
  };
  /** Price range */
  priceRange: {
    '24h': { high: number; low: number };
    '7d': { high: number; low: number };
    allTime: { high: number; low: number };
  };
  /** Market depth statistics */
  depth: {
    bidTotal: number;
    askTotal: number;
    spread: number;
    spreadPercent: number;
  };
  /** Trader statistics */
  traders: {
    total: number;
    active24h: number;
  };
  /** Last update timestamp */
  lastUpdated: number;
}

// =============================================================================
// API REQUEST TYPES
// =============================================================================

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
  /** Page number (1-based) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sortBy?: string;
  /** Sort direction */
  sortDir?: 'asc' | 'desc';
  /** Search query */
  search?: string;
}

/**
 * Market list query parameters
 */
export interface MarketListParams extends ListQueryParams {
  /** Filter by category */
  category?: string;
  /** Filter by status */
  status?: 'active' | 'closed' | 'resolved' | 'suspended';
  /** Filter by tags */
  tags?: string[];
  /** Minimum volume filter */
  minVolume?: number;
  /** Maximum volume filter */
  maxVolume?: number;
  /** Date range filter */
  dateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Trade history query parameters
 */
export interface TradeHistoryParams extends ListQueryParams {
  /** Market ID */
  marketId: string;
  /** Start timestamp */
  from?: number;
  /** End timestamp */
  to?: number;
  /** Filter by trade side */
  side?: 'buy' | 'sell';
  /** Minimum trade size */
  minSize?: number;
  /** Maximum trade size */
  maxSize?: number;
}

/**
 * Order book depth parameters
 */
export interface OrderBookDepthParams {
  /** Market ID */
  marketId: string;
  /** Number of price levels per side */
  depth?: number;
  /** Whether to aggregate by price precision */
  precision?: number;
}

// =============================================================================
// RATE LIMITING TYPES
// =============================================================================

/**
 * Rate limiting information from API headers
 */
export interface RateLimitInfo {
  /** Requests remaining in current window */
  remaining: number;
  /** Total requests allowed per window */
  limit: number;
  /** Window reset timestamp */
  resetTime: number;
  /** Time until reset in seconds */
  resetIn: number;
  /** Whether rate limit is exceeded */
  exceeded: boolean;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  /** Base URL for API requests */
  baseUrl: string;
  /** API key for authentication (if required) */
  apiKey?: string;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Number of retry attempts */
  retryAttempts: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
  /** Rate limiting configuration */
  rateLimit?: {
    /** Max requests per window */
    maxRequests: number;
    /** Window duration in milliseconds */
    windowMs: number;
  };
  /** Custom headers to include with requests */
  headers?: Record<string, string>;
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

/**
 * Schema for validating market API responses
 */
export const MarketApiResponseSchema = z.object({
  id: z.string(),
  question: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  createdAt: z.string(),
  endDate: z.string(),
  resolvedAt: z.string().optional(),
  status: z.enum(['active', 'closed', 'resolved', 'suspended']),
  price: z.number(),
  priceChange24h: z.number(),
  volume24h: z.number(),
  volumeTotal: z.number(),
  liquidity: z.number(),
  traderCount: z.number(),
  tags: z.array(z.string()),
  creator: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  resolutionCriteria: z.string().optional(),
  outcomes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    volume: z.number(),
  })).optional(),
});

/**
 * Schema for validating order book API responses
 */
export const OrderBookApiResponseSchema = z.object({
  marketId: z.string(),
  bids: z.array(z.tuple([z.number(), z.number()])),
  asks: z.array(z.tuple([z.number(), z.number()])),
  sequence: z.number(),
  timestamp: z.number(),
  lastPrice: z.number().optional(),
  volume24h: z.number().optional(),
  bestBid: z.number().optional(),
  bestAsk: z.number().optional(),
  spread: z.number().optional(),
});

/**
 * Schema for validating trade API responses
 */
export const TradeApiResponseSchema = z.object({
  id: z.string(),
  marketId: z.string(),
  price: z.number(),
  size: z.number(),
  timestamp: z.number(),
  side: z.enum(['buy', 'sell']),
  type: z.enum(['market', 'limit']),
  fee: z.number().optional(),
  traderId: z.string().optional(),
});

/**
 * Schema for validating WebSocket messages
 */
export const WebSocketMessageSchema = z.object({
  type: z.enum([
    'subscribe', 'unsubscribe', 'orderbook_update', 'trade_update',
    'market_update', 'ping', 'pong', 'error', 'connected', 'disconnected'
  ]),
  data: z.unknown(),
  channel: z.string().optional(),
  timestamp: z.number(),
  sequence: z.number().optional(),
});

/**
 * Schema for validating API error responses
 */
export const ApiErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string(),
  status: z.number(),
  details: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  requestId: z.string().optional(),
});

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for API responses
 */
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'status' in value &&
    'success' in value &&
    'timestamp' in value
  );
}

/**
 * Type guard for API error responses
 */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  try {
    ApiErrorResponseSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for market API responses
 */
export function isMarketApiResponse(value: unknown): value is MarketApiResponse {
  try {
    MarketApiResponseSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for order book API responses
 */
export function isOrderBookApiResponse(value: unknown): value is OrderBookApiResponse {
  try {
    OrderBookApiResponseSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for trade API responses
 */
export function isTradeApiResponse(value: unknown): value is TradeApiResponse {
  try {
    TradeApiResponseSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard for WebSocket messages
 */
export function isWebSocketMessage(value: unknown): value is WebSocketMessage {
  try {
    WebSocketMessageSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}