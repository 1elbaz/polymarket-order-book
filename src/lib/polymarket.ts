// File: src/lib/polymarket.ts - FIXED
import { ApiClient } from './apiClient';
import { ENDPOINTS, API_CONFIG } from './endpoints';
import {
  transformOrderBookResponse,
  transformMarketResponse,
  normalizeTokenId, // FIXED: Updated function name
  sanitizeApiInput,
  buildQueryParams // FIXED: Added utility function
} from './transforms';
import {
  OrderBookApiResponseSchema, // FIXED: Updated schema name
  MarketApiResponseSchema,
  TradeApiResponseSchema,
} from '@/types';
import type {
  OrderBook,
  Market,
  OrderBookApiResponse, // FIXED: Updated type name
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
   * Fetch order book for a specific token - FIXED
   */
  async fetchOrderBook(tokenId: string): Promise<OrderBook> {
    const normalizedId = normalizeTokenId(sanitizeApiInput(tokenId));
    
    // FIXED: Use correct endpoint with query parameter
    const queryParams = buildQueryParams({ token_id: normalizedId });
    const endpoint = `${ENDPOINTS.GET_BOOK}${queryParams}`;
    
    const response = await this.client.get<OrderBookApiResponse>(
      endpoint,
      OrderBookApiResponseSchema
    );
    
    return transformOrderBookResponse(response);
  }

  /**
   * Fetch market details - FIXED
   */
  async fetchMarket(conditionId: string): Promise<Market> {
    const normalizedId = sanitizeApiInput(conditionId);
    const endpoint = ENDPOINTS.GET_MARKET(normalizedId);
    
    const response = await this.client.get<MarketApiResponse>(
      endpoint,
      MarketApiResponseSchema
    );
    
    return transformMarketResponse(response);
  }

  /**
   * Search markets - FIXED
   */
  async searchMarkets(query: string, limit: number = 20): Promise<Market[]> {
    const sanitizedQuery = sanitizeApiInput(query);
    const queryParams = buildQueryParams({ 
      next_cursor: '', // Start from beginning
      // Note: The real API doesn't have a search endpoint like this
      // You'd need to use the markets endpoint and filter client-side
    });
    const endpoint = `${ENDPOINTS.GET_MARKETS}${queryParams}`;
    
    // FIXED: The response is actually a paginated response
    const response = await this.client.get<{
      data: MarketApiResponse[];
      count: number;
      limit: number;
      next_cursor: string;
    }>(endpoint);
    
    // Filter by query client-side since API doesn't have text search
    const filteredMarkets = response.data
      .filter(market => 
        market.question.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
        market.description.toLowerCase().includes(sanitizedQuery.toLowerCase())
      )
      .slice(0, limit);
    
    return filteredMarkets.map(transformMarketResponse);
  }

  /**
   * Fetch trade history - FIXED
   */
  async fetchTradeHistory(marketId: string, limit: number = 50): Promise<TradeApiResponse[]> {
    const normalizedId = sanitizeApiInput(marketId);
    const queryParams = buildQueryParams({ 
      market: normalizedId,
      limit: limit.toString()
    });
    const endpoint = `${ENDPOINTS.GET_TRADES}${queryParams}`;
    
    // FIXED: Return the response directly since it's already the correct type
    return await this.client.get<TradeApiResponse[]>(
      endpoint,
      TradeApiResponseSchema.array()
    );
  }

  /**
   * Get order book for multiple tokens - NEW
   */
  async fetchOrderBooks(tokenIds: string[]): Promise<OrderBook[]> {
    const params = tokenIds.map(tokenId => ({ token_id: tokenId }));
    
    const response = await this.client.post<OrderBookApiResponse[]>(
      ENDPOINTS.GET_BOOKS,
      { params }
    );
    
    return response.map(transformOrderBookResponse);
  }

  /**
   * Get price for a token - NEW
   */
  async fetchPrice(tokenId: string, side: 'BUY' | 'SELL'): Promise<string> {
    const queryParams = buildQueryParams({ 
      token_id: tokenId,
      side 
    });
    const endpoint = `${ENDPOINTS.GET_PRICE}${queryParams}`;
    
    const response = await this.client.get<{ price: string }>(endpoint);
    return response.price;
  }

  /**
   * Get midpoint price for a token - NEW
   */
  async fetchMidpoint(tokenId: string): Promise<string> {
    const queryParams = buildQueryParams({ token_id: tokenId });
    const endpoint = `${ENDPOINTS.GET_MIDPOINT}${queryParams}`;
    
    const response = await this.client.get<{ mid: string }>(endpoint);
    return response.mid;
  }

  /**
   * Get spread for a token - NEW
   */
  async fetchSpread(tokenId: string): Promise<string> {
    const queryParams = buildQueryParams({ token_id: tokenId });
    const endpoint = `${ENDPOINTS.GET_SPREAD}${queryParams}`;
    
    const response = await this.client.get<{ spread: string }>(endpoint);
    return response.spread;
  }

  /**
   * Get markets list - NEW
   */
  async fetchMarkets(nextCursor: string = ''): Promise<{
    data: Market[];
    count: number;
    limit: number;
    next_cursor: string;
  }> {
    const queryParams = buildQueryParams({ next_cursor: nextCursor });
    const endpoint = `${ENDPOINTS.GET_MARKETS}${queryParams}`;
    
    const response = await this.client.get<{
      data: MarketApiResponse[];
      count: number;
      limit: number;
      next_cursor: string;
    }>(endpoint);
    
    return {
      ...response,
      data: response.data.map(transformMarketResponse)
    };
  }

  /**
   * Check API health - FIXED (API doesn't have ping endpoint)
   */
  async ping(): Promise<boolean> {
    try {
      // Use markets endpoint as health check since there's no ping endpoint
      await this.client.get(ENDPOINTS.GET_MARKETS + '?limit=1');
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
export async function fetchOrderBook(tokenId: string): Promise<OrderBook> {
  return polymarketClient.fetchOrderBook(tokenId);
}

export async function fetchMarket(conditionId: string): Promise<Market> {
  return polymarketClient.fetchMarket(conditionId);
}

// Additional utility exports
export async function fetchPrice(tokenId: string, side: 'BUY' | 'SELL'): Promise<string> {
  return polymarketClient.fetchPrice(tokenId, side);
}

export async function fetchMidpoint(tokenId: string): Promise<string> {
  return polymarketClient.fetchMidpoint(tokenId);
}