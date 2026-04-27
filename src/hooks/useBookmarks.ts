"use client";

import { useState, useEffect, useCallback } from "react";

export interface BookmarkedCandidate {
  huboid: string;
  name: string;
  party: string;
  giho: string;
  sggName: string; // 선거구 (e.g. "서울특별시", "종로구")
  electionName: string; // 선거 종류 (e.g. "시·도지사")
  savedAt: number; // timestamp
}

const KEY = "suyo_bookmarks";

function load(): BookmarkedCandidate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: BookmarkedCandidate[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCandidate[]>([]);

  useEffect(() => {
    setBookmarks(load());
  }, []);

  const isBookmarked = useCallback(
    (huboid: string) => bookmarks.some((b) => b.huboid === huboid),
    [bookmarks]
  );

  const toggle = useCallback((candidate: Omit<BookmarkedCandidate, "savedAt">) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.huboid === candidate.huboid);
      const next = exists
        ? prev.filter((b) => b.huboid !== candidate.huboid)
        : [{ ...candidate, savedAt: Date.now() }, ...prev];
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((huboid: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.huboid !== huboid);
      save(next);
      return next;
    });
  }, []);

  return { bookmarks, isBookmarked, toggle, remove };
}
