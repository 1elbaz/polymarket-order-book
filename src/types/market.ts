// File: src/types/market.ts
import { z } from 'zod';
import Decimal from 'decimal.js';

// =============================================================================
// CORE MARKET TYPES
// =============================================================================

/**
 * Market status enumeration
 */
export type MarketStatus = 
  | 'active'      // Market is live and trading
  | 'paused'      // Temporarily suspended
  | 'closed'      // No longer accepting trades, awaiting resolution
  | 'resolved'    // Market has been resolved with outcome
  | 'cancelled'   // Market was cancelled before resolution
  | 'invalid';    // Market was deemed invalid

/**
 * Market resolution status
 */
export type ResolutionStatus = 
  | 'unresolved'
  | 'resolved'
  | 'disputed'
  | 'invalid'
  | 'cancelled';

/**
 * Market outcome types for different market structures
 */
export type MarketOutcomeType = 
  | 'binary'      // Yes/No markets
  | 'categorical' // Multiple choice
  | 'scalar'      // Numerical range
  | 'conditional'; // Complex conditional markets

/**
 * Basic market information
 */
export interface Market {
  /** Unique market identifier */
  id: string;
  /** Market question/title */
  question: string;
  /** Detailed market description */
  description: string;
  /** Market category (e.g., "Politics", "Sports", "Crypto") */
  category: string;
  /** Market subcategory */
  subcategory?: string;
  /** Market tags for filtering */
  tags: string[];
  /** Market outcome type */
  outcomeType: MarketOutcomeType;
  /** Current market status */
  status: MarketStatus;
  /** Market creation timestamp */
  createdAt: number;
  /** Market end/close timestamp */
  endDate: number;
  /** Market resolution timestamp (if resolved) */
  resolvedAt?: number;
  /** Resolution criteria/rules */
  resolutionCriteria?: string;
  /** Market creator information */
  creator?: MarketCreator;
  /** Market resolver information */
  resolver?: MarketResolver;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Market creator information
 */
export interface MarketCreator {
  /** Creator ID */
  id: string;
  /** Creator display name */
  name: string;
  /** Creator avatar URL */
  avatarUrl?: string;
  /** Creator reputation score */
  reputation?: number;
  /** Number of markets created */
  marketsCreated?: number;
}

/**
 * Market resolver information
 */
export interface MarketResolver {
  /** Resolver ID */
  id: string;
  /** Resolver display name */
  name: string;
  /** Resolver type (human, oracle, automated) */
  type: 'human' | 'oracle' | 'automated';
  /** Resolver reputation */
  reputation?: number;
  /** Number of markets resolved */
  marketsResolved?: number;
}

/**
 * Market outcome definition
 */
export interface MarketOutcome {
  /** Outcome ID */
  id: string;
  /** Outcome name/description */
  name: string;
  /** Current probability/price */
  price: Decimal;
  /** 24-hour price change */
  priceChange24h: Decimal;
  /** Trading volume for this outcome */
  volume: Decimal;
  /** Number of traders for this outcome */
  traderCount: number;
  /** Whether this outcome won (for resolved markets) */
  isWinner?: boolean;
  /** Outcome metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Complete market with pricing and statistics
 */
export interface DetailedMarket extends Market {
  /** Market outcomes */
  outcomes: MarketOutcome[];
  /** Current price statistics */
  pricing: MarketPricing;
  /** Trading statistics */
  stats: MarketStats;
  /** Liquidity information */
  liquidity: MarketLiquidity;
  /** Resolution information (if applicable) */
  resolution?: MarketResolution;
}

/**
 * Market pricing information
 */
export interface MarketPricing {
  /** Current market price (for binary markets) */
  currentPrice?: Decimal;
  /** Previous price for comparison */
  previousPrice?: Decimal;
  /** Price change over different periods */
  priceChange: {
    '1h': Decimal;
    '24h': Decimal;
    '7d': Decimal;
    '30d': Decimal;
  };
  /** Price range over different periods */
  priceRange: {
    '24h': { high: Decimal; low: Decimal };
    '7d': { high: Decimal; low: Decimal };
    allTime: { high: Decimal; low: Decimal };
  };
  /** Last update timestamp */
  lastUpdated: number;
}

/**
 * Market trading statistics
 */
export interface MarketStats {
  /** Trading volume over different periods */
  volume: {
    '1h': Decimal;
    '24h': Decimal;
    '7d': Decimal;
    '30d': Decimal;
    total: Decimal;
  };
  /** Number of trades over different periods */
  tradeCount: {
    '1h': number;
    '24h': number;
    '7d': number;
    '30d': number;
    total: number;
  };
  /** Number of unique traders */
  traderCount: {
    total: number;
    active24h: number;
    active7d: number;
  };
  /** Average trade size */
  averageTradeSize: Decimal;
  /** Market activity indicators */
  activity: {
    /** Trades per hour average */
    tradesPerHour: number;
    /** Volume velocity (volume/time) */
    volumeVelocity: Decimal;
    /** Price volatility */
    volatility: Decimal;
  };
}

/**
 * Market liquidity information
 */
export interface MarketLiquidity {
  /** Total available liquidity */
  total: Decimal;
  /** Bid side liquidity */
  bidLiquidity: Decimal;
  /** Ask side liquidity */
  askLiquidity: Decimal;
  /** Current spread */
  spread: Decimal;
  /** Spread as percentage */
  spreadPercent: Decimal;
  /** Liquidity depth at different percentage levels */
  depth: {
    /** Liquidity within 1% of current price */
    onePercent: Decimal;
    /** Liquidity within 5% of current price */
    fivePercent: Decimal;
    /** Liquidity within 10% of current price */
    tenPercent: Decimal;
  };
  /** Market maker activity */
  marketMakers: {
    /** Number of active market makers */
    count: number;
    /** Market maker provided liquidity */
    providedLiquidity: Decimal;
  };
}

/**
 * Market resolution information
 */
export interface MarketResolution {
  /** Resolution status */
  status: ResolutionStatus;
  /** Winning outcome ID(s) */
  winningOutcomeIds: string[];
  /** Resolution timestamp */
  resolvedAt: number;
  /** Resolution reason/explanation */
  reason?: string;
  /** Resolution evidence/sources */
  evidence?: string[];
  /** Resolver information */
  resolvedBy: MarketResolver;
  /** Payout information */
  payout?: {
    /** Total payout amount */
    totalAmount: Decimal;
    /** Payout per winning share */
    perShare: Decimal;
    /** Number of winning shares */
    winningShares: Decimal;
  };
  /** Dispute information (if applicable) */
  dispute?: {
    /** Whether resolution was disputed */
    isDisputed: boolean;
    /** Dispute reason */
    reason?: string;
    /** Dispute resolution */
    resolution?: string;
    /** Dispute timestamp */
    disputedAt?: number;
  };
}

// =============================================================================
// MARKET SEARCH AND FILTERING
// =============================================================================

/**
 * Market search filters
 */
export interface MarketFilters {
  /** Search query text */
  query?: string;
  /** Filter by category */
  category?: string;
  /** Filter by subcategory */
  subcategory?: string;
  /** Filter by tags */
  tags?: string[];
  /** Filter by status */
  status?: MarketStatus[];
  /** Filter by outcome type */
  outcomeType?: MarketOutcomeType[];
  /** Price range filter */
  priceRange?: {
    min: Decimal;
    max: Decimal;
  };
  /** Volume range filter */
  volumeRange?: {
    min: Decimal;
    max: Decimal;
  };
  /** Date range filter */
  dateRange?: {
    from: number;
    to: number;
  };
  /** Minimum liquidity filter */
  minLiquidity?: Decimal;
  /** Creator filter */
  creatorId?: string;
}

/**
 * Market sorting options
 */
export interface MarketSortOptions {
  /** Field to sort by */
  field: 
    | 'createdAt'
    | 'endDate'
    | 'volume24h'
    | 'volumeTotal'
    | 'price'
    | 'priceChange24h'
    | 'liquidity'
    | 'traderCount'
    | 'activity';
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Market search request
 */
export interface MarketSearchRequest {
  /** Search filters */
  filters: MarketFilters;
  /** Sort options */
  sort: MarketSortOptions;
  /** Pagination */
  pagination: {
    page: number;
    limit: number;
  };
}

/**
 * Market search result
 */
export interface MarketSearchResult {
  /** Found markets */
  markets: DetailedMarket[];
  /** Total number of matches */
  total: number;
  /** Search facets/aggregations */
  facets: {
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    statuses: Array<{ status: MarketStatus; count: number }>;
  };
  /** Search suggestions */
  suggestions?: string[];
  /** Search metadata */
  metadata: {
    query: string;
    searchTime: number;
    page: number;
    limit: number;
  };
}

// =============================================================================
// MARKET ANALYTICS
// =============================================================================

/**
 * Market trend analysis
 */
export interface MarketTrend {
  /** Trend direction */
  direction: 'bullish' | 'bearish' | 'sideways';
  /** Trend strength (0-1) */
  strength: Decimal;
  /** Trend duration in hours */
  duration: number;
  /** Price momentum */
  momentum: Decimal;
  /** Volume trend */
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
  /** Support and resistance levels */
  levels: {
    support: Decimal[];
    resistance: Decimal[];
  };
}

/**
 * Market sentiment analysis
 */
export interface MarketSentiment {
  /** Overall sentiment score (-1 to 1) */
  score: Decimal;
  /** Sentiment label */
  label: 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';
  /** Sentiment confidence (0-1) */
  confidence: Decimal;
  /** Sentiment factors */
  factors: {
    /** Price momentum contribution */
    priceMomentum: Decimal;
    /** Volume contribution */
    volume: Decimal;
    /** Trading activity contribution */
    activity: Decimal;
    /** Market participation contribution */
    participation: Decimal;
  };
  /** Last analysis timestamp */
  analyzedAt: number;
}

/**
 * Market comparison data
 */
export interface MarketComparison {
  /** Markets being compared */
  markets: {
    primary: Market;
    comparisons: Market[];
  };
  /** Comparison metrics */
  metrics: {
    /** Volume comparison */
    volume: Record<string, Decimal>;
    /** Liquidity comparison */
    liquidity: Record<string, Decimal>;
    /** Activity comparison */
    activity: Record<string, number>;
    /** Performance comparison */
    performance: Record<string, Decimal>;
  };
  /** Correlation analysis */
  correlation?: {
    /** Price correlation between markets */
    priceCorrelation: Record<string, Decimal>;
    /** Volume correlation */
    volumeCorrelation: Record<string, Decimal>;
  };
}

// =============================================================================
// USER PREFERENCES AND WATCHLISTS
// =============================================================================

/**
 * User market preferences
 */
export interface MarketPreferences {
  /** Favorite categories */
  favoriteCategories: string[];
  /** Watched markets */
  watchlist: string[];
  /** Preferred price display format */
  priceFormat: 'decimal' | 'percentage' | 'fractional';
  /** Preferred volume display */
  volumeFormat: 'usd' | 'shares' | 'both';
  /** Default sort preference */
  defaultSort: MarketSortOptions;
  /** Default filters */
  defaultFilters: Partial<MarketFilters>;
  /** Notification preferences */
  notifications: {
    priceAlerts: boolean;
    volumeAlerts: boolean;
    resolutionAlerts: boolean;
    newMarketAlerts: boolean;
  };
}

/**
 * Recent market activity for user
 */
export interface RecentMarketActivity {
  /** Recently viewed markets */
  recentlyViewed: Array<{
    marketId: string;
    viewedAt: number;
    duration: number; // Time spent viewing in seconds
  }>;
  /** Recently searched queries */
  recentSearches: Array<{
    query: string;
    searchedAt: number;
    resultCount: number;
  }>;
  /** Recently applied filters */
  recentFilters: Array<{
    filters: MarketFilters;
    appliedAt: number;
    resultCount: number;
  }>;
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

/**
 * Schema for validating market status
 */
export const MarketStatusSchema = z.enum([
  'active', 'paused', 'closed', 'resolved', 'cancelled', 'invalid'
]);

/**
 * Schema for validating market outcome type
 */
export const MarketOutcomeTypeSchema = z.enum([
  'binary', 'categorical', 'scalar', 'conditional'
]);

/**
 * Schema for validating basic market data
 */
export const MarketSchema = z.object({
  id: z.string(),
  question: z.string(),
  description: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()),
  outcomeType: MarketOutcomeTypeSchema,
  status: MarketStatusSchema,
  createdAt: z.number(),
  endDate: z.number(),
  resolvedAt: z.number().optional(),
  resolutionCriteria: z.string().optional(),
  creator: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    reputation: z.number().optional(),
    marketsCreated: z.number().optional(),
  }).optional(),
  resolver: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['human', 'oracle', 'automated']),
    reputation: z.number().optional(),
    marketsResolved: z.number().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Schema for validating market filters
 */
export const MarketFiltersSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.array(MarketStatusSchema).optional(),
  outcomeType: z.array(MarketOutcomeTypeSchema).optional(),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  volumeRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  dateRange: z.object({
    from: z.number(),
    to: z.number(),
  }).optional(),
  minLiquidity: z.number().optional(),
  creatorId: z.string().optional(),
});

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for market status
 */
export function isValidMarketStatus(status: unknown): status is MarketStatus {
  return MarketStatusSchema.safeParse(status).success;
}

/**
 * Type guard for market outcome type
 */
export function isValidMarketOutcomeType(type: unknown): type is MarketOutcomeType {
  return MarketOutcomeTypeSchema.safeParse(type).success;
}

/**
 * Type guard for market data
 */
export function isValidMarket(market: unknown): market is Market {
  return MarketSchema.safeParse(market).success;
}

/**
 * Type guard for market filters
 */
export function isValidMarketFilters(filters: unknown): filters is MarketFilters {
  return MarketFiltersSchema.safeParse(filters).success;
}

/**
 * Type guard to check if market is active
 */
export function isActiveMarket(market: Market): boolean {
  return market.status === 'active' && market.endDate > Date.now();
}

/**
 * Type guard to check if market is resolved
 */
export function isResolvedMarket(market: Market): market is Market & { resolvedAt: number } {
  return market.status === 'resolved' && market.resolvedAt !== undefined;
}

/**
 * Type guard to check if market is binary
 */
export function isBinaryMarket(market: Market): boolean {
  return market.outcomeType === 'binary';
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate market age in hours
 */
export function getMarketAge(market: Market): number {
  return (Date.now() - market.createdAt) / (1000 * 60 * 60);
}

/**
 * Calculate time until market closes
 */
export function getTimeUntilClose(market: Market): number {
  return Math.max(0, market.endDate - Date.now());
}

/**
 * Check if market is closing soon (within 24 hours)
 */
export function isMarketClosingSoon(market: Market): boolean {
  const timeUntilClose = getTimeUntilClose(market);
  return timeUntilClose > 0 && timeUntilClose <= 24 * 60 * 60 * 1000;
}

/**
 * Format market duration
 */
export function formatMarketDuration(market: Market): string {
  const duration = market.endDate - market.createdAt;
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

/**
 * Get market URL slug
 */
export function getMarketSlug(market: Market): string {
  return market.question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}