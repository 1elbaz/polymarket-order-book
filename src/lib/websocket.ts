// File: src/lib/websocket.ts
import { transformOrderBookResponse } from './transforms';
import type { OrderBook, ConnectionStatus } from '@/types/orderbook';
import type { OrderBookApiResponse, WSBookMessage } from '@/types';

/**
 * WebSocket client for real-time order book updates
 */
export class OrderBookSocket {
  private ws: WebSocket | null = null;
  private marketId: string;
  private onUpdate: (orderBook: OrderBook) => void;
  private onStatusChange?: (status: ConnectionStatus) => void;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private currentStatus: ConnectionStatus = 'idle';

  constructor(
    marketId: string, 
    onUpdate: (orderBook: OrderBook) => void,
    onStatusChange?: (status: ConnectionStatus) => void
  ) {
    this.marketId = marketId;
    this.onUpdate = onUpdate;
    this.onStatusChange = onStatusChange;
    this.connect();
  }

  private connect(): void {
    try {
      this.updateStatus('connecting');
      
      // Use Polymarket WebSocket endpoint
      const wsUrl = `wss://ws-subscriptions-clob.polymarket.com/ws/`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.updateStatus('error');
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log(`WebSocket connected for market ${this.marketId}`);
    
    // Send subscription message according to Polymarket protocol
    const subscriptionMessage = {
      type: 'market',
      assets_ids: [this.marketId], // Subscribe to this specific token ID
    };
    
    this.ws!.send(JSON.stringify(subscriptionMessage));
    this.updateStatus('connected');
    this.reconnectAttempts = 0;
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      
      // Handle different message types according to Polymarket protocol
      if (message.event_type === 'book') {
        const bookMessage = message as WSBookMessage;
        
        // Transform WebSocket book message to OrderBookApiResponse format
        const orderBookData: OrderBookApiResponse = {
          market: bookMessage.market,
          asset_id: bookMessage.asset_id,
          hash: bookMessage.hash,
          timestamp: bookMessage.timestamp,
          bids: bookMessage.buys || [],
          asks: bookMessage.sells || [],
        };
        
        const orderBook = transformOrderBookResponse(orderBookData);
        this.onUpdate(orderBook);
      } else if (message.event_type === 'price_change') {
        // Handle individual price level changes
        console.log('Price change received:', message);
        // You might want to update individual levels rather than full book
      }
      
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
    this.updateStatus('disconnected');
    this.stopHeartbeat();
    
    if (!this.isIntentionallyClosed) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.updateStatus('error');
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateStatus('error');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    
    this.updateStatus('reconnecting');
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    // Send ping every 30 seconds to keep connection alive
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private updateStatus(status: ConnectionStatus): void {
    this.currentStatus = status;
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  /**
   * Close the WebSocket connection
   */
  public close(): void {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    
    this.updateStatus('disconnected');
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  /**
   * Manually trigger reconnection
   */
  public reconnect(): void {
    this.close();
    this.isIntentionallyClosed = false;
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 100);
  }
}