// tests/api/tasks.route.test.ts
/**
 * Unit tests for app/api/tasks/route.ts
 * - Mocks prisma and getCurrentUserId to isolate behavior
 */

// Mock NextResponse to a minimal interface used by the route handlers
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 })
  }
}));

// Mock prisma client used by the route
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
jest.mock('../../lib/prisma', () => ({ prisma: { task: { create: mockCreate, findMany: mockFindMany } } }));

jest.mock('../../lib/auth', () => ({ getCurrentUserId: jest.fn().mockResolvedValue(undefined) }));

import { GET, POST } from '../../app/api/tasks/route';

describe('app/api/tasks/route', () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockFindMany.mockReset();
  });

  test('GET returns list of tasks', async () => {
    const fakeTasks = [{ id: '1', title: 'one' }];
    mockFindMany.mockResolvedValue(fakeTasks);

    const res = await GET(new Request('http://localhost')); // minimal Request
    expect(res).toBeDefined();
    // Our NextResponse.json mock returns an object with body and status
    // @ts-ignore
    expect(res.body).toEqual(fakeTasks);
    // @ts-ignore
    expect(res.status).toBe(200);
  });

  test('POST without title returns 400', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req as any);
    // @ts-ignore
    expect(res.status).toBe(400);
    // @ts-ignore
    expect(res.body).toHaveProperty('error');
  });

  test('POST with title creates a task', async () => {
    const created = { id: 'abc', title: 'new' };
    mockCreate.mockResolvedValue(created);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ title: 'new' }) });
    const res = await POST(req as any);
    // @ts-ignore
    expect(res.status).toBe(200);
    // @ts-ignore
    expect(res.body).toEqual(created);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});
