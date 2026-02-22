import { describe, it, expect } from 'vitest';

describe('test infrastructure', () => {
  it('runs tests', () => {
    expect(true).toBe(true);
  });

  it('has jest-dom matchers available', () => {
    const el = document.createElement('div');
    el.textContent = 'hello';
    document.body.appendChild(el);
    expect(el).toBeInTheDocument();
    document.body.removeChild(el);
  });
});
