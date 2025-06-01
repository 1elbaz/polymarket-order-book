// File: src/types/index.ts - FIXED to only export existing types

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
  TrendDirection,
} from './orderbook';

// API types - UPDATED with new corrected types
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
  OrderSummary,               
  TokenInfo,                  
  RewardsInfo,                
  TradeApiResponse,
  TradeHistoryResponse,
  MakerOrderInfo,             
  WebSocketMessageType,
  WebSocketMessage,
  WebSocketSubscription,
  WebSocketOrderBookUpdate,
  WebSocketTradeUpdate,
  WebSocketError,
  WSAuth,                     
  WSBookMessage,              
  WSPriceChangeMessage,       
  WSTradeMessage,             
  MarketStatsResponse,
  ListQueryParams,
  MarketListParams,
  TradeHistoryParams,
  OrderBookDepthParams,
  BookParams,                 
  RateLimitInfo,
  ApiClientConfig,
} from './api';

// Market types
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

// State types - COMMENTED OUT until properly implemented
// NOTE: These exports are causing TypeScript errors because the types don't exist
// or aren't properly exported from ./state. Uncomment when they're implemented.
/*
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
*/

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

// State schemas - COMMENTED OUT until properly implemented
/*
export {
  UIThemeSchema,
  ConnectionStatusSchema,
} from './state';
*/

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

// State type guards - COMMENTED OUT until properly implemented
/*
export {
  isValidAction,
  isValidUITheme,
  isValidConnectionStatus,
} from './state';
*/

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

// State utilities - COMMENTED OUT until properly implemented
/*
export {
  createInitialAppState,
  mergeState,
} from './state';
*/