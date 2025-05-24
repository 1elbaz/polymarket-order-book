// File: src/lib/apiClient.ts
import Decimal from 'decimal.js';
import type { OrderBook, OrderBookResponse, OrderLevel } from '@/types/orderbook';

const REST_BASE = 'https://api.polymarket.com';
const WS_BASE   = 'wss://ws-subscriptions-clob.polymarket.com';

/**
 * Fetch the order book for a given marketId (REST)
 */
export async function fetchOrderBook(marketId: string): Promise<OrderBook> {
  const resp = await fetch(`${REST_BASE}/book/${marketId}`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching order book`);
  const data: OrderBookResponse = await resp.json();
  return {
    bids: data.bids.map< OrderLevel >(([p, s]) => ({ price: new Decimal(p), size: new Decimal(s) })),
    asks: data.asks.map< OrderLevel >(([p, s]) => ({ price: new Decimal(p), size: new Decimal(s) })),
  };
}

/**
 * Lightweight WebSocket wrapper for live order-book updates
 */
export class OrderBookSocket {
  private ws?: WebSocket;
  private marketId: string;
  private onMessage: (book: OrderBook) => void;

  constructor(marketId: string, onMessage: (book: OrderBook) => void) {
    this.marketId = marketId;
    this.onMessage = onMessage;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(`${WS_BASE}/book/${this.marketId}`);
    this.ws.addEventListener('message', (evt) => {
      try {
        const data = JSON.parse(evt.data) as OrderBookResponse;
        const book: OrderBook = {
          bids: data.bids.map(([p, s]) => ({ price: new Decimal(p), size: new Decimal(s) })),
          asks: data.asks.map(([p, s]) => ({ price: new Decimal(p), size: new Decimal(s) })),
        };
        this.onMessage(book);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    });
    this.ws.addEventListener('close', () => {
      // simple auto-reconnect after 1s
      setTimeout(() => this.connect(), 1000);
    });
  }

  public close() {
    this.ws?.close();
  }
}
