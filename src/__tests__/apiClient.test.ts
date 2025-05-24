// File: src/__tests__/apiClient.test.ts
import Decimal from 'decimal.js';
import { fetchOrderBook } from '@/lib/apiClient';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const mockData = {
  bids: [[1.23, 100], [1.22, 50]],
  asks: [[1.24, 80], [1.25, 40]],
};

const server = setupServer(
  rest.get('https://api.polymarket.com/book/:marketId', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockData));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchOrderBook', () => {
  it('parses bids and asks into Decimals', async () => {
    const book = await fetchOrderBook('test-market');
    expect(book.bids).toHaveLength(2);
    expect(book.bids[0].price).toBeInstanceOf(Decimal);
    expect(book.bids[0].price.toString()).toBe('1.23');
    expect(book.bids[0].size.toString()).toBe('100');
    expect(book.asks[1].price.eq(new Decimal(1.25))).toBe(true);
  });

  it('throws on non-2xx responses', async () => {
    server.use(
      rest.get('https://api.polymarket.com/book/:marketId', (req, res, ctx) =>
        res(ctx.status(500))
      )
    );
    await expect(fetchOrderBook('bad')).rejects.toThrow('HTTP 500');
  });
});
