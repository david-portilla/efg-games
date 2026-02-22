import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
let intersectionCallback: IntersectionCallback;

beforeEach(() => {
  const MockIntersectionObserver = vi.fn(function (this: unknown, callback: IntersectionCallback) {
    intersectionCallback = callback;
    return { observe: mockObserve, disconnect: mockDisconnect };
  });
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

interface TestComponentProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

function TestComponent({ hasMore, isLoading, onLoadMore }: TestComponentProps) {
  const { sentinelRef } = useInfiniteScroll({ hasMore, isLoading, onLoadMore });
  return <div ref={sentinelRef} data-testid="sentinel" />;
}

const triggerIntersection = (isIntersecting: boolean) => {
  act(() => {
    intersectionCallback([{ isIntersecting } as IntersectionObserverEntry]);
  });
};

describe('useInfiniteScroll', () => {
  it('calls onLoadMore when sentinel intersects and hasMore is true', () => {
    const onLoadMore = vi.fn();
    render(<TestComponent hasMore={true} isLoading={false} onLoadMore={onLoadMore} />);

    triggerIntersection(true);

    expect(onLoadMore).toHaveBeenCalled();
  });

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = vi.fn();
    render(<TestComponent hasMore={false} isLoading={false} onLoadMore={onLoadMore} />);

    triggerIntersection(true);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when isLoading is true', () => {
    const onLoadMore = vi.fn();
    render(<TestComponent hasMore={true} isLoading={true} onLoadMore={onLoadMore} />);

    triggerIntersection(true);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when sentinel is not intersecting', () => {
    const onLoadMore = vi.fn();
    render(<TestComponent hasMore={true} isLoading={false} onLoadMore={onLoadMore} />);

    triggerIntersection(false);

    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(
      <TestComponent hasMore={true} isLoading={false} onLoadMore={vi.fn()} />,
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });
});
