/// <reference types="msw" />
import { rest, RestRequest, RestResponse, RestContext } from 'msw';

export const handlers = [
  rest.get('https://api.polymarket.com/book/:marketId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        bids: [
          [1.23, 100],
          [1.22, 50],
        ],
        asks: [
          [1.24, 80],
          [1.25, 40],
        ],
      })
    );
  }),
];
