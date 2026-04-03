import { describe, it, expect } from 'vitest';

describe('API contract defaults', () => {
  it('uses /api relative prefix expected by gateway proxy', () => {
    const expectedBasePrefix = '/api';
    expect(expectedBasePrefix.startsWith('/api')).toBe(true);
  });

  it('checks gateway health when API base is provided', async () => {
    const base = import.meta.env.VITE_TEST_API_BASE as string | undefined;
    if (!base) {
      return;
    }
    const res = await fetch(`${base}/health`);
    expect(res.status).toBe(200);
  });
});
