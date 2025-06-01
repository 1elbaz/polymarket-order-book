// File: src/__tests__/useOrderBook.test.tsx - FIXED ESLint errors
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import type { OrderBookApiResponse } from '@/types';
import { OrderBookProvider, useOrderBook } from '@/contexts/OrderBookContext';

// FIXED: Add proper typing for mock WebSocket
interface MockWebSocket {
  listeners: Record<string, (event: unknown) => void>;
  addEventListener(type: string, listener: (event: unknown) => void): void;
  removeEventListener(type: string): void;
  close(): void;
}

// FIXED: Move MockWebSocket class to module level
class MockWebSocketImpl implements MockWebSocket {
  listeners: Record<string, (event: unknown) => void> = {};
  
  constructor() {
    setTimeout(() => this.listeners.open?.({ type: 'open' }), 0);
  }
  
  addEventListener(type: string, listener: (event: unknown) => void) {
    this.listeners[type] = listener;
  }
  
  removeEventListener(type: string) {
    delete this.listeners[type];
  }
  
  close() {
    // Mock close implementation
  }
}

// Mock initial and updated data
const initialData: OrderBookApiResponse = {
  market: 'test-market',
  asset_id: 'test-asset',
  hash: '0x123',
  timestamp: '1672290701000',
  bids: [{ price: '1.23', size: '100' }, { price: '1.22', size: '50' }],
  asks: [{ price: '1.24', size: '80' }, { price: '1.25', size: '40' }],
};

const updatedData: OrderBookApiResponse = {
  market: 'test-market',
  asset_id: 'test-asset',
  hash: '0x456',
  timestamp: '1672290702000',
  bids: [{ price: '2.34', size: '200' }, { price: '2.33', size: '150' }],
  asks: [{ price: '2.35', size: '180' }, { price: '2.36', size: '140' }],
};

// MSW server for REST endpoint
const server = setupServer(
  http.get('https://clob.polymarket.com/book', () => {
    return HttpResponse.json(initialData);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Polyfill WebSocket
beforeEach(() => {
  // @ts-expect-error - Mocking WebSocket for testing
  global.WebSocket = MockWebSocketImpl;
});

// Test component that displays status and top bid
const TestComponent: React.FC = () => {
  const { status, book } = useOrderBook();
  return (
    <>
      <div data-testid="status">{status}</div>
      <div data-testid="bid">{book ? book.bids[0].price.toString() : '-'}</div>
    </>
  );
};

describe('useOrderBook integration', () => {
  it('loads initial data and updates via WebSocket', async () => {
    render(
      <OrderBookProvider marketId="test-market">
        <TestComponent />
      </OrderBookProvider>
    );

    // Initially connecting
    expect(screen.getByTestId('status')).toHaveTextContent('connecting');

    // Wait for initial fetch
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('connected'));
    expect(screen.getByTestId('bid')).toHaveTextContent('1.23');

    // Simulate WS message - FIXED: Simplified approach
    act(() => {
      // Create a mock instance and trigger the message
      const mockInstance = new MockWebSocketImpl();
      mockInstance.listeners.message?.({ 
        data: JSON.stringify({
          event_type: 'book',
          asset_id: 'test-asset',
          market: 'test-market',
          hash: '0x456',
          timestamp: '1672290702000',
          buys: updatedData.bids,
          sells: updatedData.asks,
        })
      });
    });

    // Wait for update
    await waitFor(() => expect(screen.getByTestId('bid')).toHaveTextContent('2.34'));
  });

  it('sets status to error on fetch failure', async () => {
    server.use(
      http.get('https://clob.polymarket.com/book', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <OrderBookProvider marketId="test-market">
        <TestComponent />
      </OrderBookProvider>
    );

    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'));
    expect(screen.getByTestId('bid')).toHaveTextContent('-');
  });
});