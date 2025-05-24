// File: src/types/orderbook.ts
import Decimal from 'decimal.js';

/**
 * A single order-book level: [price, size]
 */
export interface OrderLevel {
  price: Decimal;
  size: Decimal;
}

/**
 * Raw API response shape, before Decimal conversion.
 */
export interface OrderBookResponse {
  bids: [number, number][];
  asks: [number, number][];
}

/**
 * Parsed order book with high‐precision decimals
 */
export interface OrderBook {
  bids: OrderLevel[];
  asks: OrderLevel[];
}
