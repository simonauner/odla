import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { scheduleSlowLoading } from "./slow-loading";

beforeEach(() => {
  vi.useFakeTimers({ now: 0 });
});
afterEach(() => {
  vi.useRealTimers();
});

test("fast loads never show a message, including after cancellation", () => {
  const updates: (number | null)[] = [];
  const cancel = scheduleSlowLoading(true, null, (value) => updates.push(value));
  vi.advanceTimersByTime(1999);
  expect(updates).toEqual([]);
  cancel!();
  vi.advanceTimersByTime(1000);
  expect(updates).toEqual([]);
});

test("slow loads show after two seconds and stay for at least half a second", () => {
  let shownAt: number | null = null;
  const update = (value: number | null) => {
    shownAt = value;
  };
  scheduleSlowLoading(true, shownAt, update);
  vi.advanceTimersByTime(2000);
  expect(shownAt).toBe(2000);
  vi.advanceTimersByTime(100);
  scheduleSlowLoading(false, shownAt, update);
  vi.advanceTimersByTime(399);
  expect(shownAt).toBe(2000);
  vi.advanceTimersByTime(1);
  expect(shownAt).toBe(null);
});

test("long loads need no extra delay; restarting cancels a pending hide", () => {
  vi.setSystemTime(2000);
  let shownAt: number | null = 2000;
  const update = (value: number | null) => {
    shownAt = value;
  };
  const cancel = scheduleSlowLoading(false, shownAt, update);
  vi.advanceTimersByTime(100);
  cancel!();
  expect(scheduleSlowLoading(true, shownAt, update)).toBeUndefined();
  vi.advanceTimersByTime(1000);
  expect(shownAt).toBe(2000);
  scheduleSlowLoading(false, shownAt, update);
  vi.advanceTimersByTime(0);
  expect(shownAt).toBe(null);
});
