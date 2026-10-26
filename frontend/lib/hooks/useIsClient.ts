import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during prerendering and hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
