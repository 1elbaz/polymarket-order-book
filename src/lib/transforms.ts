// File: src/lib/transforms.ts - CORRECTED to match actual Polymarket API
import Decimal from 'decimal.js';
import type { 
  OrderBookApiResponse, // CORRECTED: using the new API response type
  OrderBook, 
  Order,
  MarketApiResponse,
  Market,
  TradeApiResponse,
  OrderSummary // CORRECTED: added the OrderSummary type
} from '@/types';

/**
 * Transform raw API order book response to typed OrderBook - CORRECTED
 */
export function transformOrderBookResponse(apiResponse: OrderBookApiResponse): OrderBook {
  const now = Date.now();
  
  // CORRECTED: Handle OrderSummary objects instead of tuples
  const transformOrders = (orders: OrderSummary[]): Order[] => {
    let cumulativeTotal = new Decimal(0);
    
    return orders.map((orderSummary) => {
      // CORRECTED: Access .price and .size properties instead of array destructuring
      const orderSize = new Decimal(orderSummary.size);
      cumulativeTotal = cumulativeTotal.plus(orderSize);
      
      return {
        price: new Decimal(orderSummary.price),
        size: orderSize,
        total: cumulativeTotal,
        timestamp: now,
      };
    });
  };

  // CORRECTED: Sort by price property instead of array index
  const sortedBids = [...apiResponse.bids].sort((a, b) => 
    parseFloat(b.price) - parseFloat(a.price) // Highest price first
  );
  
  const sortedAsks = [...apiResponse.asks].sort((a, b) => 
    parseFloat(a.price) - parseFloat(b.price) // Lowest price first
  );

  return {
    bids: transformOrders(sortedBids),
    asks: transformOrders(sortedAsks),
    // CORRECTED: Use hash as update ID since lastUpdateId doesn't exist
    lastUpdateId: parseInt(apiResponse.hash.slice(2, 10), 16) || 0,
    // CORRECTED: Parse timestamp string to number
    timestamp: parseInt(apiResponse.timestamp) || now,
    lastPrice: undefined, // Not provided in order book response
    priceChange24h: undefined, // Not provided in basic order book response
    volume24h: undefined, // Not provided in basic order book response
  };
}

/**
 * Transform raw API market response to typed Market - CORRECTED
 */
export function transformMarketResponse(apiResponse: MarketApiResponse): Market {
  return {
    // CORRECTED: Use condition_id instead of id
    id: apiResponse.condition_id,
    question: apiResponse.question,
    description: apiResponse.description,
    category: apiResponse.category,
    subcategory: undefined, // Not in the real API response
    tags: [], // Not directly available in this format
    outcomeType: 'binary', // Polymarket is always binary
    // CORRECTED: Map active/closed to our status format
    status: apiResponse.closed ? 'closed' : (apiResponse.active ? 'active' : 'paused'),
    // CORRECTED: Parse ISO date strings
    createdAt: Date.now(), // Not provided in API, use current time
    endDate: new Date(apiResponse.end_date_iso).getTime(),
    resolvedAt: undefined, // Would need additional API call to get resolution info
    resolutionCriteria: undefined, // Would need additional data
    creator: undefined, // Not in basic market response
    metadata: {
      // CORRECTED: These fields don't exist in the real API response
      // Would need to get from separate price/stats endpoints
      price: undefined,
      priceChange24h: undefined,
      volume24h: undefined,
      volumeTotal: undefined,
      liquidity: undefined,
      traderCount: undefined,
      // Add fields that do exist
      minimumOrderSize: apiResponse.minimum_order_size,
      minimumTickSize: apiResponse.minimum_tick_size,
      marketSlug: apiResponse.market_slug,
      secondsDelay: apiResponse.seconds_delay,
      fpmm: apiResponse.fpmm,
      icon: apiResponse.icon,
      // Token information
      tokens: apiResponse.tokens,
      rewards: apiResponse.rewards,
    },
  };
}

/**
 * Transform trade API response - CORRECTED
 */
export function transformTradeResponse(apiResponse: TradeApiResponse) {
  return {
    // CORRECTED: Handle string fields from actual API
    id: apiResponse.id,
    marketId: apiResponse.market, // CORRECTED: market field name
    price: new Decimal(apiResponse.price), // CORRECTED: price is string
    size: new Decimal(apiResponse.size), // CORRECTED: size is string
    timestamp: parseInt(apiResponse.match_time), // CORRECTED: use match_time
    side: apiResponse.side.toLowerCase() as 'buy' | 'sell', // CORRECTED: normalize case
    type: 'limit' as const, // Default since all CLOB orders are limit orders
    fee: parseFloat(apiResponse.fee_rate_bps) / 10000, // CORRECTED: convert bps to decimal
    traderId: apiResponse.owner, // CORRECTED: use owner field
    // Additional fields from real API
    takerOrderId: apiResponse.taker_order_id,
    assetId: apiResponse.asset_id,
    status: apiResponse.status,
    outcome: apiResponse.outcome,
    makerAddress: apiResponse.maker_address,
    transactionHash: apiResponse.transaction_hash,
    bucketIndex: apiResponse.bucket_index,
    makerOrders: apiResponse.maker_orders,
  };
}

/**
 * Calculate order book statistics
 */
export function calculateOrderBookStats(orderBook: OrderBook) {
  if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return null;
  }

  const bestBid = orderBook.bids[0].price;
  const bestAsk = orderBook.asks[0].price;
  const spread = bestAsk.minus(bestBid);
  const midPrice = bestBid.plus(bestAsk).dividedBy(2);
  
  const bidLiquidity = orderBook.bids.reduce(
    (total, order) => total.plus(order.size),
    new Decimal(0)
  );
  
  const askLiquidity = orderBook.asks.reduce(
    (total, order) => total.plus(order.size),
    new Decimal(0)
  );

  return {
    spread,
    spreadPercentage: spread.dividedBy(midPrice).times(100),
    midPrice,
    bidLiquidity,
    askLiquidity,
    liquidityRatio: bidLiquidity.dividedBy(askLiquidity),
    depthAnalysis: {
      depth1Percent: calculateDepthAtPercentage(orderBook, 0.01),
      depth5Percent: calculateDepthAtPercentage(orderBook, 0.05),
      depth10Percent: calculateDepthAtPercentage(orderBook, 0.10),
    },
  };
}

/**
 * Calculate liquidity depth at percentage from mid price
 */
function calculateDepthAtPercentage(orderBook: OrderBook, percentage: number) {
  const bestBid = orderBook.bids[0]?.price;
  const bestAsk = orderBook.asks[0]?.price;
  
  if (!bestBid || !bestAsk) {
    return { bids: new Decimal(0), asks: new Decimal(0) };
  }

  const midPrice = bestBid.plus(bestAsk).dividedBy(2);
  const bidThreshold = midPrice.times(1 - percentage);
  const askThreshold = midPrice.times(1 + percentage);

  const bidDepth = orderBook.bids
    .filter(order => order.price.gte(bidThreshold))
    .reduce((total, order) => total.plus(order.size), new Decimal(0));

  const askDepth = orderBook.asks
    .filter(order => order.price.lte(askThreshold))
    .reduce((total, order) => total.plus(order.size), new Decimal(0));

  return { bids: bidDepth, asks: askDepth };
}

/**
 * Normalize token ID from URL or direct input - CORRECTED FUNCTION NAME
 */
export function normalizeTokenId(input: string): string {
  // If it's a URL, try to extract token ID (this is complex - would need market->token mapping)
  if (input.includes('polymarket.com')) {
    console.warn('URL to token ID conversion not fully implemented');
    // For now, just return the input
    return input;
  }
  
  // If it's already a token ID (long hex string), return as-is
  return input;
}

/**
 * LEGACY: Keep old function name for backward compatibility
 */
export function normalizeMarketId(input: string): string {
  return normalizeTokenId(input);
}

/**
 * Validate and sanitize API input
 */
export function sanitizeApiInput(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input: must be a string');
  }
  
  // Remove potentially dangerous characters
  return input.replace(/[<>\"']/g, '').trim();
}

/**
 * Helper function to fetch order book with correct API call - ADDED
 */
export async function fetchOrderBookFromAPI(tokenId: string): Promise<OrderBook> {
  const response = await fetch(
    `https://clob.polymarket.com/book?token_id=${encodeURIComponent(tokenId)}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const apiResponse: OrderBookApiResponse = await response.json();
  return transformOrderBookResponse(apiResponse);
}

/**
 * Build query parameters for API requests - ADDED UTILITY
 */
export function buildQueryParams(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}