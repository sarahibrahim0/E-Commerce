import { normalizeApiError, ApiError } from './api-error';

describe('normalizeApiError', () => {
  it('passes through ApiError instances', () => {
    const err = new ApiError(404, 'not found');
    expect(normalizeApiError(err)).toBe(err);
  });

  it('extracts status and string error body', () => {
    const out = normalizeApiError({ status: 400, error: 'bad request' });
    expect(out.status).toBe(400);
    expect(out.message).toBe('bad request');
  });

  it('extracts message from object error body', () => {
    const out = normalizeApiError({ status: 409, error: { message: 'insufficient stock' } });
    expect(out.message).toBe('insufficient stock');
  });

  it('falls back to a generic message', () => {
    const out = normalizeApiError(new Error('network down'));
    expect(out.message).toBe('network down');
  });
});
