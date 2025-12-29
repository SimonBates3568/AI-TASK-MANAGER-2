// tests/api/nlp.route.test.ts
/**
 * Unit tests for app/api/nlp/route.ts
 * - Mocks lib/nlp to isolate behavior
 */

// Mock NextResponse to a minimal interface used by the route handlers
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: any, init?: any) => ({ body, status: init?.status ?? 200 })
  }
}));

const mockParse = jest.fn();
jest.mock('../../lib/nlp', () => ({ parseNaturalLanguageTask: mockParse }));

import { POST } from '../../app/api/nlp/route';

describe('app/api/nlp/route', () => {
  beforeEach(() => mockParse.mockReset());

  test('POST without text returns 400', async () => {
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req as any);
    // @ts-ignore
    expect(res.status).toBe(400);
  });

  test('POST with text calls parser and returns parsed object', async () => {
    const parsed = { title: 'T', description: 'D', priority: 'HIGH', dueDate: null, tags: [], raw: 'r' };
    mockParse.mockResolvedValue(parsed);
    const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({ text: 'Do X by tomorrow' }) });
    const res = await POST(req as any);
    // @ts-ignore
    expect(res.status).toBe(200);
    // @ts-ignore
    expect(res.body).toEqual(parsed);
    expect(mockParse).toHaveBeenCalledTimes(1);
  });
});
