/**
 * Stub for socket.io — not available in Cloudflare Workers.
 * WebSocket support requires Durable Objects (future enhancement).
 */
export class Server {
  constructor() {}
  to() { return this; }
  emit() { return this; }
  on() { return this; }
  use() { return this; }
}

export class Socket {
  id = "";
  on() { return this; }
  emit() { return this; }
  join() { return this; }
  leave() { return this; }
}

export default { Server, Socket };
