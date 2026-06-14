import { Reward } from "./types";

/** Napredek do naslednje (najcenejše še nedosežene) nagrade. */
export function nextRewardProgress(points: number, rewards: Reward[]) {
  const sorted = [...rewards].sort((a, b) => a.points_required - b.points_required);
  const next = sorted.find((r) => r.points_required > points);
  if (!next) return null;
  return {
    name: next.name,
    points_required: next.points_required,
    remaining: next.points_required - points,
  };
}

export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Prišlo je do napake.";
}
