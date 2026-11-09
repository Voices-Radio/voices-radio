import { useState } from "react";
import { useInterval } from "./use-timer";

/** The current time, refreshed every `intervalMs`, so time-based UI follows the clock. */
export default function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());

  useInterval(() => setNow(new Date()), intervalMs);

  return now;
}
