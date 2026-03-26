"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Options<T> = {
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  initialItems: T[];
};

export const useInfiniteScroll = <T>({ fetchFn, initialItems }: Options<T>) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const { items: newItems, hasMore: more } = await fetchFn(nextPage);
      setItems((prev) => [...prev, ...newItems]);
      setPage(nextPage);
      setHasMore(more);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchFn]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return { items, setItems, loading, hasMore, sentinelRef };
};
