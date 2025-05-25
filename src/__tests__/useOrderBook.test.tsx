// File: src/__tests__/useOrderBook.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import type { OrderBookResponse } from '@/types/orderbook';
import { OrderBookProvider, useOrderBook } from '@/contexts/OrderBookContext';

// Mock initial and updated data
const initialData: OrderBookResponse = {
  bids: [[1.23, 100], [1.22, 50]],
  asks: [[1.24, 80], [1.25, 40]],
};
const updatedData: OrderBookResponse = {
  bids: [[2.34, 200], [2.33, 150]],
  asks: [[2.35, 180], [2.36, 140]],
};

// MSW server for REST endpoint
const server = setupServer(
  rest.get('https://api.polymarket.com/book/:marketId', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(initialData));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Polyfill WebSocket
beforeEach(() => {
  // @ts-ignore
  global.WebSocket = class {
    listeners: Record<string, (event: any) => void> = {};
    constructor() {
      setTimeout(() => this.listeners.open?.({ type: 'open' }), 0);
    }
    addEventListener(type: string, listener: (event: any) => void) {
      this.listeners[type] = listener;
    }
    removeEventListener(type: string) {
      delete this.listeners[type];
    }
    close() {}
  };
});

type Status = 'idle' | 'connecting' | 'open' | 'error';

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
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('open'));
    expect(screen.getByTestId('bid')).toHaveTextContent('1.23');

    // Simulate WS message
    act(() => {
      // @ts-ignore
      global.WebSocket.prototype.listeners.message({ data: JSON.stringify(updatedData) });
    });

    // Wait for update
    await waitFor(() => expect(screen.getByTestId('bid')).toHaveTextContent('2.34'));
  });

  it('sets status to error on fetch failure', async () => {
    server.use(
      rest.get('https://api.polymarket.com/book/:marketId', (req, res, ctx) => res(ctx.status(500)))
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
