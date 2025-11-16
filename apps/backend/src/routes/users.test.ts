import { describe, expect, it } from 'vitest';

describe('Sample Backend Test', () => {
  it('should add two numbers correctly', () => {
    const result = 2 + 2;
    expect(result).toBe(4);
  });

  it('should handle string concatenation', () => {
    const greeting = 'Hello' + ' ' + 'World';
    expect(greeting).toBe('Hello World');
  });
});

describe('API Response Format', () => {
  it('should create a success response', () => {
    const response = {
      success: true,
      data: { id: 1, name: 'Test User' },
    };

    expect(response).toHaveProperty('success');
    expect(response.success).toBe(true);
    expect(response.data).toHaveProperty('id');
  });

  it('should create an error response', () => {
    const response = {
      success: false,
      error: 'Something went wrong',
    };

    expect(response).toHaveProperty('success');
    expect(response.success).toBe(false);
    expect(response).toHaveProperty('error');
  });
});
