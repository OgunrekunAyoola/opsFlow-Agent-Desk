import { Queue } from 'bullmq';

function buildConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      const u = new URL(url);
      const tls = u.protocol === 'rediss:' ? {} : undefined;
      return {
        host: u.hostname,
        port: Number(u.port || 6379),
        username: u.username || undefined,
        password: u.password || undefined,
        tls,
      } as any;
    } catch {
      return {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: Number(process.env.REDIS_PORT || 6379),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      } as any;
    }
  }
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  } as any;
}

const shouldUseMock =
  !process.env.REDIS_URL &&
  !process.env.REDIS_HOST &&
  (process.env.NODE_ENV !== 'production');

class MockQueue {
  async add(_name: string, _data: any) {
    return { id: 'mock', name: _name };
  }
}

export const emailSendQueue: { add: (name: string, data: any) => Promise<any> } = shouldUseMock
  ? new MockQueue()
  : new Queue('email-send', { connection: buildConnection() });
