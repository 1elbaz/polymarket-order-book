// File: src/lib/api/polymarket.ts
import { ApiClient } from './apiClient';
import { ENDPOINTS, API_CONFIG } from './endpoints';
import { 
  transformOrderBookResponse, 
  transformMarketResponse,
  normalizeMarketId,
  sanitizeApiInput 
} from './transforms';
import {
  OrderBookResponseSchema,
  MarketApiResponseSchema,
  TradeApiResponseSchema,
} from '@/types';
import type { 
  OrderBook, 
  Market, 
  OrderBookResponse,
  MarketApiResponse,
  TradeApiResponse 
} from '@/types';

/**
 * Polymarket-specific API client
 */
export class PolymarketClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient({
      baseUrl: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      retryAttempts: API_CONFIG.RETRY_ATTEMPTS,
      retryDelay: API_CONFIG.RETRY_DELAY,
    });
  }

  /**
   * Fetch order book for a specific market
   */
  async fetchOrderBook(marketId: string): Promise<OrderBook> {
    const normalizedId = normalizeMarketId(sanitizeApiInput(marketId));
    const endpoint = ENDPOINTS.ORDER_BOOK(normalizedId);
    
    const response = await this.client.get<OrderBookResponse>(
      endpoint,
      OrderBookResponseSchema
    );
    
    return transformOrderBookResponse(response);
  }

  /**
   * Fetch market details
   */
  async fetchMarket(marketId: string): Promise<Market> {
    const normalizedId = normalizeMarketId(sanitizeApiInput(marketId));
    const endpoint = ENDPOINTS.MARKET_DETAIL(normalizedId);
    
    const response = await this.client.get<MarketApiResponse>(
      endpoint,
      MarketApiResponseSchema
    );
    
    return transformMarketResponse(response);
  }

  /**
   * Search markets
   */
  async searchMarkets(query: string, limit: number = 20): Promise<Market[]> {
    const sanitizedQuery = sanitizeApiInput(query);
    const endpoint = `${ENDPOINTS.MARKET_SEARCH}?q=${encodeURIComponent(sanitizedQuery)}&limit=${limit}`;
    
    const response = await this.client.get<MarketApiResponse[]>(endpoint);
    
    return response.map(transformMarketResponse);
  }

  /**
   * Fetch trade history
   */
  async fetchTradeHistory(marketId: string, limit: number = 50): Promise<TradeApiResponse[]> {
    const normalizedId = normalizeMarketId(sanitizeApiInput(marketId));
    const endpoint = `${ENDPOINTS.TRADES(normalizedId)}?limit=${limit}`;
    
    return await this.client.get<TradeApiResponse[]>(
      endpoint,
      TradeApiResponseSchema.array()
    );
  }

  /**
   * Check API health
   */
  async ping(): Promise<boolean> {
    try {
      await this.client.get(ENDPOINTS.PING);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo() {
    return this.client.getRateLimitInfo();
  }

  /**
   * Check if client is healthy
   */
  isHealthy(): boolean {
    return this.client.isHealthy();
  }
}

// Create and export singleton instance
export const polymarketClient = new PolymarketClient();

// For backward compatibility, also export the old functions
export async function fetchOrderBook(marketId: string): Promise<OrderBook> {
  return polymarketClient.fetchOrderBook(marketId);
}

export async function fetchMarket(marketId: string): Promise<Market> {
  return polymarketClient.fetchMarket(marketId);
}
