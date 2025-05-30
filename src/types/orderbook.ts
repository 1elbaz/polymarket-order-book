// File: src/types/orderbook.ts
import Decimal from 'decimal.js';
import { z } from 'zod';

/**
 * Raw API response shape for a single order level from Polymarket
 * Format: [price, size] as numbers from the API
 */
export type RawOrderLevel = [number, number];

/**
 * Raw API response shape from Polymarket order book endpoint
 */
export interface OrderBookResponse {
  bids: RawOrderLevel[];
  asks: RawOrderLevel[];
  lastUpdateId?: number;
  timestamp?: number;
  lastPrice?: number;
  priceChange24h?: number;
  volume24h?: number;
}

/**
 * A single order in the order book with high-precision decimals
 */
export interface Order {
  /** Price level for this order */
  price: Decimal;
  /** Size/quantity at this price level */
  size: Decimal;
  /** Cumulative total size from best price to this level (calculated) */
  total: Decimal;
  /** Optional order ID for tracking individual orders */
  orderId?: string;
  /** Timestamp when this order was placed/updated */
  timestamp?: number;
}

/**
 * Aggregated order book level after precision grouping
 * Multiple individual orders may be combined into a single level
 */
export interface OrderBookLevel {
  /** Aggregated price level (rounded to specified precision) */
  price: Decimal;
  /** Total size at this aggregated price level */
  size: Decimal;
  /** Cumulative total size from best price to this level */
  total: Decimal;
  /** Number of individual orders aggregated into this level */
  count: number;
  /** Average price of orders in this level (for better accuracy) */
  averagePrice?: Decimal;
}

/**
 * Complete order book with bids and asks
 */
export interface OrderBook {
  /** Buy orders (bids) sorted by price descending (highest first) */
  bids: Order[];
  /** Sell orders (asks) sorted by price ascending (lowest first) */
  asks: Order[];
  /** Sequence number for update ordering */
  lastUpdateId: number;
  /** Timestamp when this order book snapshot was created */
  timestamp: number;
  /** Last traded price (if available) */
  lastPrice?: Decimal;
  /** 24-hour price change */
  priceChange24h?: Decimal;
  /** 24-hour volume */
  volume24h?: Decimal;
}

/**
 * Aggregated order book after applying precision settings
 */
export interface AggregatedOrderBook {
  /** Aggregated buy orders */
  bids: OrderBookLevel[];
  /** Aggregated sell orders */
  asks: OrderBookLevel[];
  /** Original order book metadata */
  lastUpdateId: number;
  timestamp: number;
  lastPrice?: Decimal;
  /** Precision level used for aggregation */
  precision: number;
  /** Total number of original orders before aggregation */
  originalOrderCount: {
    bids: number;
    asks: number;
  };
}

/**
 * Order book update/delta for real-time updates
 */
export interface OrderBookUpdate {
  /** Updated bid levels (empty array if no changes) */
  bids: Order[];
  /** Updated ask levels (empty array if no changes) */
  asks: Order[];
  /** Sequence number for this update */
  updateId: number;
  /** Timestamp of this update */
  timestamp: number;
  /** Type of update */
  type: 'snapshot' | 'delta';
  /** Market ID this update applies to */
  marketId: string;
}

/**
 * Price impact calculation result
 */
export interface PriceImpactResult {
  /** Average execution price for the order */
  averagePrice: Decimal;
  /** Price impact as a percentage */
  impact: Decimal;
  /** Total size that would be filled */
  filledSize: Decimal;
  /** Remaining unfilled size (if insufficient liquidity) */
  remainingSize: Decimal;
  /** Breakdown of how the order would be filled across price levels */
  levels: Array<{
    price: Decimal;
    size: Decimal;
    contribution: Decimal; // Cost contribution from this level
  }>;
  /** Whether the order can be fully filled */
  canFillCompletely: boolean;
  /** Slippage from current best price */
  slippage: Decimal;
}

/**
 * Configuration for order book precision and display
 */
export interface OrderBookConfig {
  /** Number of decimal places for price aggregation (0-8) */
  precision: number;
  /** Number of price levels to display per side */
  rowCount: number;
  /** Whether to show cumulative totals */
  showTotals: boolean;
  /** Whether to show order counts per level */
  showOrderCounts: boolean;
  /** Minimum size threshold for displaying levels */
  minSizeThreshold?: Decimal;
}

/**
 * Order book statistics for analysis
 */
export interface OrderBookStats {
  /** Current spread (ask price - bid price) */
  spread: Decimal;
  /** Spread as percentage of mid price */
  spreadPercentage: Decimal;
  /** Mid price ((best bid + best ask) / 2) */
  midPrice: Decimal;
  /** Total liquidity on bid side */
  bidLiquidity: Decimal;
  /** Total liquidity on ask side */
  askLiquidity: Decimal;
  /** Liquidity ratio (bid liquidity / ask liquidity) */
  liquidityRatio: Decimal;
  /** Depth at different percentage levels from mid price */
  depthAnalysis: {
    /** Liquidity within 1% of mid price */
    depth1Percent: { bids: Decimal; asks: Decimal };
    /** Liquidity within 5% of mid price */
    depth5Percent: { bids: Decimal; asks: Decimal };
    /** Liquidity within 10% of mid price */
    depth10Percent: { bids: Decimal; asks: Decimal };
  };
}

/**
 * Market trend direction
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Last trade information
 */
export interface LastTrade {
  /** Price of the last trade */
  price: Decimal;
  /** Size of the last trade */
  size: Decimal;
  /** Timestamp of the last trade */
  timestamp: number;
  /** Direction of price movement */
  direction: TrendDirection;
  /** Side of the trade (which side was the aggressor) */
  side: 'buy' | 'sell';
  /** Change from previous trade */
  priceChange: Decimal;
  /** Percentage change from previous trade */
  priceChangePercent: Decimal;
}

/**
 * Side of the order book (bids or asks)
 */
export type OrderBookSide = 'bids' | 'asks';

/**
 * Order book operation types for updates
 */
export type OrderBookOperation = 'insert' | 'update' | 'delete';

/**
 * Precision levels supported by the application
 */
export type PrecisionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Row count options for display
 */
export type RowCountOption = 5 | 10 | 15 | 20 | 25 | 50;

/**
 * Connection status for real-time data
 */
export type ConnectionStatus = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting'
  | 'disconnected' 
  | 'error'
  | 'fallback'; // Using polling fallback

/**
 * Error types that can occur during order book operations
 */
export type OrderBookErrorType = 
  | 'network_error'
  | 'validation_error'
  | 'calculation_error'
  | 'websocket_error'
  | 'api_error'
  | 'unknown_error';

/**
 * Error information for order book operations
 */
export interface OrderBookError {
  type: OrderBookErrorType;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: number;
  retryable: boolean;
}

/**
 * Options for transforming raw API data to OrderBook
 */
export interface TransformOptions {
  /** Whether to validate the data with Zod schemas */
  validate?: boolean;
  /** Whether to sort the orders */
  sort?: boolean;
  /** Whether to calculate cumulative totals */
  calculateTotals?: boolean;
  /** Default timestamp if not provided */
  defaultTimestamp?: number;
}

/**
 * Result of order book transformation
 */
export interface TransformResult<T> {
  /** The transformed data */
  data: T | null;
  /** Any errors that occurred during transformation */
  error: OrderBookError | null;
  /** Whether the transformation was successful */
  success: boolean;
  /** Transformation metadata */
  metadata: {
    originalOrderCount: number;
    transformedOrderCount: number;
    duration: number;
  };
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

/**
 * Zod schema for validating raw order book responses from API
 */
export const OrderBookResponseSchema = z.object({
  bids: z.array(z.tuple([z.number(), z.number()])),
  asks: z.array(z.tuple([z.number(), z.number()])),
  lastUpdateId: z.number().optional(),
  timestamp: z.number().optional(),
});

/**
 * Zod schema for order book updates/deltas
 */
export const OrderBookUpdateSchema = z.object({
  bids: z.array(z.tuple([z.number(), z.number()])),
  asks: z.array(z.tuple([z.number(), z.number()])),
  updateId: z.number(),
  timestamp: z.number(),
  type: z.enum(['snapshot', 'delta']),
  marketId: z.string(),
});

/**
 * Zod schema for order book configuration
 */
export const OrderBookConfigSchema = z.object({
  precision: z.number().min(0).max(8),
  rowCount: z.number().min(1).max(100),
  showTotals: z.boolean(),
  showOrderCounts: z.boolean(),
  minSizeThreshold: z.number().optional(),
});

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a value is a valid OrderBookResponse
 */
export function isOrderBookResponse(value: unknown): value is OrderBookResponse {
  try {
    OrderBookResponseSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if a value is a valid OrderBookUpdate
 */
export function isOrderBookUpdate(value: unknown): value is OrderBookUpdate {
  try {
    OrderBookUpdateSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if an Order has all required fields
 */
export function isValidOrder(order: Partial<Order>): order is Order {
  return (
    order.price instanceof Decimal &&
    order.size instanceof Decimal &&
    order.total instanceof Decimal &&
    order.price.isPositive() &&
    order.size.isPositive() &&
    order.total.isPositive()
  );
}

/**
 * Type guard to check if an OrderBook is valid
 */
export function isValidOrderBook(book: Partial<OrderBook>): book is OrderBook {
  return (
    Array.isArray(book.bids) &&
    Array.isArray(book.asks) &&
    typeof book.lastUpdateId === 'number' &&
    typeof book.timestamp === 'number' &&
    book.bids.every(isValidOrder) &&
    book.asks.every(isValidOrder)
  );
}
