// jest.polyfills.ts
// 1) Polyfill TextEncoder/TextDecoder for MSW interceptors
import { TextEncoder, TextDecoder } from 'util';

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// 2) Polyfill fetch + related types for your API client & MSW
import 'cross-fetch/polyfill';

// 3) BroadcastChannel stub for MSW’s WebSocket fallback
class PolyBroadcastChannel {
    name: string;
    constructor(name: string) { this.name = name; }
    postMessage(_msg: any) {}
    addEventListener(_type: string, _listener: any) {}
    removeEventListener(_type: string, _listener: any) {}
    close() {}
  }
  ;(global as any).BroadcastChannel = PolyBroadcastChannel;