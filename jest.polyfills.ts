// jest.polyfills.ts
import { TextEncoder, TextDecoder } from 'util';
import { Readable } from 'stream';

// Polyfill TextEncoder/TextDecoder for MSW interceptors
Object.assign(global, { TextDecoder, TextEncoder });

// Polyfill fetch + related types for your API client & MSW
import 'cross-fetch/polyfill';

// Polyfill Web Streams API for MSW v2 (Mock implementation)
class MockTransformStream {
  readable: any;
  writable: any;
  
  constructor() {
    this.readable = new Readable({ read() {} });
    this.writable = {
      write: () => {},
      end: () => {},
      getWriter: () => ({
        write: async () => {},
        close: async () => {},
        releaseLock: () => {}
      })
    };
  }
}

class MockReadableStream {
  constructor(source?: any) {}
  getReader() {
    return {
      read: async () => ({ done: true, value: undefined }),
      releaseLock: () => {}
    };
  }
  pipeTo() {
    return Promise.resolve();
  }
  tee() {
    return [new MockReadableStream(), new MockReadableStream()];
  }
}

class MockWritableStream {
  constructor() {}
  getWriter() {
    return {
      write: async () => {},
      close: async () => {},
      releaseLock: () => {}
    };
  }
}

Object.assign(global, { 
  TransformStream: MockTransformStream,
  ReadableStream: MockReadableStream,
  WritableStream: MockWritableStream
});

// BroadcastChannel stub for MSW's WebSocket fallback
class PolyBroadcastChannel {
  name: string;
  
  constructor(name: string) {
    this.name = name;
  }
  
  postMessage(_msg: any) {}
  addEventListener(_type: string, _listener: any) {}
  removeEventListener(_type: string, _listener: any) {}
  close() {}
}

Object.assign(global, { BroadcastChannel: PolyBroadcastChannel });