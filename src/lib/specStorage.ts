import type { Spec } from "@json-render/core";

const STORAGE_KEY = "json-render-user-mgmt-spec";

export function saveSpec(spec: Spec): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spec));
}

export function loadSpec(): Spec | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Spec;
  } catch {
    return null;
  }
}

export function clearSpec(): void {
  localStorage.removeItem(STORAGE_KEY);
}
