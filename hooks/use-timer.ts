import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from "react";

export default function useTimer(callback: () => void, delay: number) {
  const onTick = useEffectEvent(() => {
    callback();
  });

  useEffect(() => {
    const id = setInterval(() => {
      onTick(); // ✅ Good: Only called locally inside an Effect
    }, delay);

    return () => {
      clearInterval(id);
    };
  }, [delay]); // No need to specify "onTick" (an Effect Event) as a dependency
}
