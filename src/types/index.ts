// File: src/types/index.ts

// =============================================================================
// EXPLICIT TYPE EXPORTS (only export what actually exists)
// =============================================================================

// Order book types
export type {
  Order,
  OrderBook,
  OrderBookLevel,
  AggregatedOrderBook,
  OrderBookResponse,
  OrderBookUpdate,
  OrderBookConfig,
  PriceImpactResult,
  OrderBookError,
  OrderBookSide,
  OrderBookOperation,
  PrecisionLevel,
  RowCountOption,
  ConnectionStatus,
  OrderBookErrorType,
  TransformOptions,
  TransformResult,
  TrendDirection, // Export TrendDirection from orderbook (if it exists there)
} from './orderbook';

// API types
export type {
  ApiResponse,
  ApiErrorResponse,
  PaginationMeta,
  PaginatedResponse,
  MarketApiResponse,
  MarketsListResponse,
  MarketSearchResponse,
  OrderBookApiResponse,
  OrderBookDepthResponse,
  TradeApiResponse,
  TradeHistoryResponse,
  WebSocketMessageType,
  WebSocketMessage,
  WebSocketSubscription,
  WebSocketOrderBookUpdate,
  WebSocketTradeUpdate,
  WebSocketError,
  MarketStatsResponse,
  ListQueryParams,
  MarketListParams,
  TradeHistoryParams,
  OrderBookDepthParams,
  RateLimitInfo,
  ApiClientConfig,
} from './api';

// Market types (only export what actually exists)
export type {
  Market,
  MarketCreator,
  MarketResolver,
  MarketOutcome,
  MarketStatus,
  ResolutionStatus,
  MarketOutcomeType,
  MarketFilters,
  MarketSortOptions,
  MarketSearchRequest,
  MarketSearchResult,
  MarketPreferences,
  RecentMarketActivity,
} from './market';

// Add DetailedMarket and other types only if they exist
// Check your market.ts file and add these if they're actually exported:
// DetailedMarket,
// MarketPricing,
// MarketStats,
// MarketLiquidity,
// MarketResolution,
// MarketTrend,
// MarketSentiment,
// MarketComparison,

// State types (only export what actually exists)
export type {
  AppState,
  MarketState,
  OrderBookState,
  TradeState,
  UIState,
  UserState,
  ConnectionState,
  ErrorState,
  AnalyticsState,
  ActionType,
  Action,
  // State-specific types
  StateDecimal,
  ThemeMode,
  FontSize,
  AppView,
  MobileTab,
  NotificationType,
  Breakpoint,
  Orientation,
  NetworkType,
  ErrorSeverity,
  ErrorType,
  TradeSideFilter,
  ConnectionHealth,
} from './state';

// =============================================================================
// VALIDATION SCHEMAS (only export what exists)
// =============================================================================

export {
  OrderBookResponseSchema,
  OrderBookUpdateSchema,
  OrderBookConfigSchema,
} from './orderbook';

export {
  MarketApiResponseSchema,
  OrderBookApiResponseSchema,
  TradeApiResponseSchema,
  WebSocketMessageSchema,
  ApiErrorResponseSchema,
} from './api';

export {
  MarketStatusSchema,
  MarketOutcomeTypeSchema,
  MarketSchema,
  MarketFiltersSchema,
} from './market';

export {
  UIThemeSchema,
  ConnectionStatusSchema,
} from './state';

// =============================================================================
// TYPE GUARDS (only export what exists)
// =============================================================================

export {
  isOrderBookResponse,
  isOrderBookUpdate,
  isValidOrder,
  isValidOrderBook,
} from './orderbook';

export {
  isApiResponse,
  isApiErrorResponse,
  isMarketApiResponse,
  isOrderBookApiResponse,
  isTradeApiResponse,
  isWebSocketMessage,
} from './api';

export {
  isValidMarketStatus,
  isValidMarketOutcomeType,
  isValidMarket,
  isValidMarketFilters,
  isActiveMarket,
  isResolvedMarket,
  isBinaryMarket,
} from './market';

export {
  isValidAction,
  isValidUITheme,
  isValidConnectionStatus,
} from './state';

// =============================================================================
// UTILITY FUNCTIONS (only export what exists)
// =============================================================================

export {
  getMarketAge,
  getTimeUntilClose,
  isMarketClosingSoon,
  formatMarketDuration,
  getMarketSlug,
} from './market';

export {
  createInitialAppState,
  mergeState,
} from './state';