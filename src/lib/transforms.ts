// File: src/lib/api/transforms.ts
import Decimal from 'decimal.js';
import type { 
  OrderBookResponse, 
  OrderBook, 
  Order,
  MarketApiResponse,
  Market,
  TradeApiResponse 
} from '@/types';

/**
 * Transform raw API order book response to typed OrderBook
 */
export function transformOrderBookResponse(apiResponse: OrderBookResponse): OrderBook {
  const now = Date.now();
  
  const transformOrders = (orders: [number, number][]): Order[] => {
    let cumulativeTotal = new Decimal(0);
    
    return orders.map(([price, size]) => {
      const orderSize = new Decimal(size);
      cumulativeTotal = cumulativeTotal.plus(orderSize);
      
      return {
        price: new Decimal(price),
        size: orderSize,
        total: cumulativeTotal,
        timestamp: now,
      };
    });
  };

  // Sort bids descending (highest price first)
  const sortedBids = [...apiResponse.bids].sort((a, b) => b[0] - a[0]);
  
  // Sort asks ascending (lowest price first)
  const sortedAsks = [...apiResponse.asks].sort((a, b) => a[0] - b[0]);

  return {
    bids: transformOrders(sortedBids),
    asks: transformOrders(sortedAsks),
    lastUpdateId: apiResponse.lastUpdateId || 0,
    timestamp: apiResponse.timestamp || now,
    lastPrice: apiResponse.lastPrice ? new Decimal(apiResponse.lastPrice) : undefined,
    priceChange24h: undefined, // Not provided in basic order book response
    volume24h: apiResponse.volume24h ? new Decimal(apiResponse.volume24h) : undefined,
  };
}

/**
 * Transform raw API market response to typed Market
 */
export function transformMarketResponse(apiResponse: MarketApiResponse): Market {
  return {
    id: apiResponse.id,
    question: apiResponse.question,
    description: apiResponse.description,
    category: apiResponse.category,
    subcategory: apiResponse.subcategory,
    tags: apiResponse.tags || [],
    outcomeType: 'binary', // Most Polymarket markets are binary
    status: apiResponse.status === 'suspended' ? 'paused' : apiResponse.status,
    createdAt: new Date(apiResponse.createdAt).getTime(),
    endDate: new Date(apiResponse.endDate).getTime(),
    resolvedAt: apiResponse.resolvedAt ? new Date(apiResponse.resolvedAt).getTime() : undefined,
    resolutionCriteria: apiResponse.resolutionCriteria,
    creator: apiResponse.creator,
    metadata: {
      price: apiResponse.price,
      priceChange24h: apiResponse.priceChange24h,
      volume24h: apiResponse.volume24h,
      volumeTotal: apiResponse.volumeTotal,
      liquidity: apiResponse.liquidity,
      traderCount: apiResponse.traderCount,
    },
  };
}

/**
 * Transform trade API response
 */
export function transformTradeResponse(apiResponse: TradeApiResponse) {
  return {
    ...apiResponse,
    // Add any necessary transformations
    price: new Decimal(apiResponse.price),
    size: new Decimal(apiResponse.size),
    timestamp: apiResponse.timestamp,
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
 * Normalize market ID from URL or direct input
 */
export function normalizeMarketId(input: string): string {
  // If it's a URL, extract the market ID
  if (input.includes('polymarket.com')) {
    const matches = input.match(/\/market\/([^/?]+)/);
    if (matches && matches[1]) {
      return matches[1];
    }
  }
  
  // If it's already a market ID, return as-is
  return input;
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
