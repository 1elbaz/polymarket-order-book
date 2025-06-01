// File: src/types/api.ts - CORRECTED to match actual Polymarket API
import { z } from 'zod';
// REMOVED: import Decimal from 'decimal.js'; // Not used in this file

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
// MARKET DATA API RESPONSES - CORRECTED
// =============================================================================

/**
 * Raw market data from Polymarket API - CORRECTED STRUCTURE
 */
export interface MarketApiResponse {
  /** Condition ID - the actual market identifier */
  condition_id: string;
  /** Question ID - hash of UMA ancillary data */
  question_id: string;
  /** Binary token pair for market */
  tokens: [TokenInfo, TokenInfo];
  /** Rewards program data */
  rewards: RewardsInfo;
  /** Minimum order size */
  minimum_order_size: string;
  /** Minimum tick size */
  minimum_tick_size: string;
  /** Market description */
  description: string;
  /** Market category */
  category: string;
  /** Market end date ISO string */
  end_date_iso: string;
  /** Game start time for in-game markets */
  game_start_time: string;
  /** Market question */
  question: string;
  /** URL slug */
  market_slug: string;
  /** Minimum size for incentive qualification */
  min_incentive_size: string;
  /** Max spread for incentives (in cents) */
  max_incentive_spread: string;
  /** Whether market is active/live */
  active: boolean;
  /** Whether market is closed/open */
  closed: boolean;
  /** Seconds of match delay for in-game trading */
  seconds_delay: number;
  /** Market icon reference */
  icon: string;
  /** FPMM contract address */
  fpmm: string;
}

/**
 * Token information in market
 */
export interface TokenInfo {
  /** ERC1155 token ID */
  token_id: string;
  /** Human readable outcome (YES/NO) */
  outcome: string;
}

/**
 * Rewards program information
 */
export interface RewardsInfo {
  /** Minimum size of order to score */
  min_size: number;
  /** Max spread from midpoint until order scores */
  max_spread: number;
  /** Event start date string */
  event_start_date: string;
  /** Event end date string */
  event_end_date: string;
  /** Reward multiplier while game has started */
  in_game_multiplier: number;
  /** Current reward epoch */
  reward_epoch: number;
}

/**
 * Market list response - using actual pagination format
 */
export interface MarketsListResponse {
  /** Maximum results per page */
  limit: number;
  /** Number of results */
  count: number;
  /** Next cursor for pagination */
  next_cursor: string;
  /** Array of markets */
  data: MarketApiResponse[];
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
// ORDER BOOK API RESPONSES - CORRECTED
// =============================================================================

/**
 * Order summary from API - CORRECTED to match actual response
 */
export interface OrderSummary {
  /** Price as string */
  price: string;
  /** Size as string */
  size: string;
}

/**
 * Raw order book response from Polymarket API - CORRECTED STRUCTURE
 */
export interface OrderBookApiResponse {
  /** Condition ID */
  market: string;
  /** Token ID (asset ID) */
  asset_id: string;
  /** Hash summary of orderbook content */
  hash: string;
  /** Unix timestamp in milliseconds */
  timestamp: string;
  /** Bid levels as objects with price/size */
  bids: OrderSummary[];
  /** Ask levels as objects with price/size */
  asks: OrderSummary[];
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
// TRADE HISTORY API RESPONSES - CORRECTED
// =============================================================================

/**
 * Maker order information in trades
 */
export interface MakerOrderInfo {
  /** Maker order ID */
  order_id: string;
  /** Maker address */
  maker_address: string;
  /** Owner API key */
  owner: string;
  /** Amount matched in this trade */
  matched_amount: string;
  /** Fee rate in basis points */
  fee_rate_bps: string;
  /** Price of maker order */
  price: string;
  /** Asset ID */
  asset_id: string;
  /** Outcome string */
  outcome: string;
}

/**
 * Individual trade data from API - CORRECTED STRUCTURE
 */
export interface TradeApiResponse {
  /** Unique trade ID */
  id: string;
  /** Taker order ID that catalyzed the trade */
  taker_order_id: string;
  /** Market ID (condition ID) */
  market: string;
  /** Asset ID (token ID) of taker order */
  asset_id: string;
  /** Buy or sell */
  side: string;
  /** Trade size */
  size: string;
  /** Fee rate in basis points */
  fee_rate_bps: string;
  /** Limit price of taker order */
  price: string;
  /** Trade status */
  status: string;
  /** Time trade was matched */
  match_time: string;
  /** Timestamp of last status update */
  last_update: string;
  /** Human readable outcome */
  outcome: string;
  /** Maker address */
  maker_address: string;
  /** API key of taker */
  owner: string;
  /** Transaction hash */
  transaction_hash: string;
  /** Bucket index for multi-transaction trades */
  bucket_index: number;
  /** Maker orders this trade was filled against */
  maker_orders: MakerOrderInfo[];
  /** Side of trade: TAKER or MAKER */
  type: string;
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
// WEBSOCKET API MESSAGES - CORRECTED
// =============================================================================

/**
 * WebSocket message types - updated for actual Polymarket protocol
 */
export type WebSocketMessageType = 
  | 'book'
  | 'price_change'
  | 'tick_size_change'
  | 'trade'
  | 'order'
  | 'ping'
  | 'pong'
  | 'error'
  | 'connected'
  | 'disconnected';

/**
 * WebSocket authentication for user channel
 */
export interface WSAuth {
  /** API key */
  apiKey?: string;
  /** API secret */
  secret?: string;
  /** API passphrase */
  passphrase?: string;
}

/**
 * WebSocket subscription message - CORRECTED
 */
export interface WebSocketSubscription {
  /** Authentication (only for user channel) */
  auth?: WSAuth;
  /** Market condition IDs (for user channel) */
  markets?: string[];
  /** Asset/token IDs (for market channel) */
  assets_ids?: string[];
  /** Channel type */
  type: 'user' | 'market';
}

/**
 * WebSocket book message - CORRECTED
 */
export interface WSBookMessage {
  /** Event type */
  event_type: 'book';
  /** Asset ID (token ID) */
  asset_id: string;
  /** Market condition ID */
  market: string;
  /** Timestamp */
  timestamp: string;
  /** Hash summary */
  hash: string;
  /** Buy orders */
  buys: OrderSummary[];
  /** Sell orders */
  sells: OrderSummary[];
}

/**
 * WebSocket price change message - CORRECTED
 */
export interface WSPriceChangeMessage {
  /** Event type */
  event_type: 'price_change';
  /** Asset ID */
  asset_id: string;
  /** Market condition ID */
  market: string;
  /** Price level affected */
  price: string;
  /** New aggregate size */
  size: string;
  /** Buy or sell side */
  side: 'buy' | 'sell';
  /** Timestamp */
  timestamp: string;
}

/**
 * WebSocket trade message - CORRECTED
 */
export interface WSTradeMessage {
  /** Event type */
  event_type: 'trade';
  /** Asset ID */
  asset_id: string;
  /** Trade ID */
  id: string;
  /** Last update timestamp */
  last_update: string;
  /** Maker orders involved */
  maker_orders: MakerOrderInfo[];
  /** Market condition ID */
  market: string;
  /** Match time */
  matchtime: string;
  /** Outcome */
  outcome: string;
  /** Owner API key */
  owner: string;
  /** Price */
  price: string;
  /** Side */
  side: string;
  /** Size */
  size: string;
  /** Status */
  status: string;
  /** Taker order ID */
  taker_order_id: string;
  /** Timestamp */
  timestamp: string;
  /** Trade owner */
  trade_owner: string;
  /** Type */
  type: 'TRADE';
}

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
 * WebSocket order book update message - CORRECTED
 */
export interface WebSocketOrderBookUpdate {
  /** Market ID */
  marketId: string;
  /** Updated bids */
  bids: OrderSummary[];
  /** Updated asks */
  asks: OrderSummary[];
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

/**
 * Book parameters for batch requests
 */
export interface BookParams {
  /** Token ID */
  token_id: string;
  /** Side (for price requests) */
  side?: 'BUY' | 'SELL';
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
// ZOD VALIDATION SCHEMAS - CORRECTED
// =============================================================================

/**
 * Schema for validating market API responses - CORRECTED
 */
export const MarketApiResponseSchema = z.object({
  condition_id: z.string(),
  question_id: z.string(),
  tokens: z.tuple([
    z.object({
      token_id: z.string(),
      outcome: z.string(),
    }),
    z.object({
      token_id: z.string(),
      outcome: z.string(),
    }),
  ]), // FIXED: Use z.tuple() to enforce exactly 2 elements
  rewards: z.object({
    min_size: z.number(),
    max_spread: z.number(),
    event_start_date: z.string(),
    event_end_date: z.string(),
    in_game_multiplier: z.number(),
    reward_epoch: z.number(),
  }),
  minimum_order_size: z.string(),
  minimum_tick_size: z.string(),
  description: z.string(),
  category: z.string(),
  end_date_iso: z.string(),
  game_start_time: z.string(),
  question: z.string(),
  market_slug: z.string(),
  min_incentive_size: z.string(),
  max_incentive_spread: z.string(),
  active: z.boolean(),
  closed: z.boolean(),
  seconds_delay: z.number(),
  icon: z.string(),
  fpmm: z.string(),
});

/**
 * Schema for validating order book API responses - CORRECTED
 */
export const OrderBookApiResponseSchema = z.object({
  market: z.string(),
  asset_id: z.string(),
  hash: z.string(),
  timestamp: z.string(),
  bids: z.array(z.object({
    price: z.string(),
    size: z.string(),
  })),
  asks: z.array(z.object({
    price: z.string(),
    size: z.string(),
  })),
});

/**
 * Schema for validating trade API responses - CORRECTED
 */
export const TradeApiResponseSchema = z.object({
  id: z.string(),
  taker_order_id: z.string(),
  market: z.string(),
  asset_id: z.string(),
  side: z.string(),
  size: z.string(),
  fee_rate_bps: z.string(),
  price: z.string(),
  status: z.string(),
  match_time: z.string(),
  last_update: z.string(),
  outcome: z.string(),
  maker_address: z.string(),
  owner: z.string(),
  transaction_hash: z.string(),
  bucket_index: z.number(),
  maker_orders: z.array(z.object({
    order_id: z.string(),
    maker_address: z.string(),
    owner: z.string(),
    matched_amount: z.string(),
    fee_rate_bps: z.string(),
    price: z.string(),
    asset_id: z.string(),
    outcome: z.string(),
  })),
  type: z.string(),
});

/**
 * Schema for validating WebSocket messages
 */
export const WebSocketMessageSchema = z.object({
  type: z.enum([
    'book', 'price_change', 'tick_size_change', 'trade', 'order',
    'ping', 'pong', 'error', 'connected', 'disconnected'
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
// TYPE GUARDS - UPDATED
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
 * Type guard for order book API responses - CORRECTED
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