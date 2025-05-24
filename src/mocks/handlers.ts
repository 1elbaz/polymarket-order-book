// File: src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.polymarket.com/book/:marketId', () => {
    return HttpResponse.json({
      bids: [
        [1.23, 100],
        [1.22, 50],
      ],
      asks: [
        [1.24, 80],
        [1.25, 40],
      ],
    });
  }),
];