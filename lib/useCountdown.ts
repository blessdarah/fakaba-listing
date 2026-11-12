import { useCallback, useEffect, useState } from "react";

/** Simple resend timer: `restart()` begins counting down from `seconds`. */
export function useCountdown(seconds: number, startImmediately = true) {
  const [left, setLeft] = useState(startImmediately ? seconds : 0);

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const restart = useCallback(() => setLeft(seconds), [seconds]);
  return { left, done: left <= 0, restart };
}
