"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type ExploreFilterTransitionContextValue = {
  isPending: boolean;
  startFilterTransition: (callback: () => void) => void;
};

const ExploreFilterTransitionContext =
  createContext<ExploreFilterTransitionContextValue | null>(null);

export function ExploreFilterTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <ExploreFilterTransitionContext.Provider
      value={{ isPending, startFilterTransition: startTransition }}
    >
      {children}
    </ExploreFilterTransitionContext.Provider>
  );
}

export function useExploreFilterTransition() {
  const context = useContext(ExploreFilterTransitionContext);

  if (!context) {
    throw new Error(
      "useExploreFilterTransition must be used within ExploreFilterTransitionProvider",
    );
  }

  return context;
}

export function ExploreResultsTransition({ children }: { children: ReactNode }) {
  const { isPending } = useExploreFilterTransition();

  return (
    <div
      aria-busy={isPending}
      className={cn(
        "transition-opacity duration-200",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <span className="sr-only" aria-live="polite">
        {isPending ? "Updating shows" : "Shows updated"}
      </span>
      {children}
    </div>
  );
}
