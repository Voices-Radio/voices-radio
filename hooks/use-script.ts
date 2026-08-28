import { RefObject, useEffect, useState } from "react";

/**
 * Status cache for scripts already loaded on this page.
 *
 * Module scope, not a `useRef`. As a ref it was per-hook-instance, so the
 * "cache" it is named for could never be read by the component that would
 * benefit — a second consumer of the same script always started from scratch.
 */
const cachedScriptStatuses: Record<string, string> = {};

export function useScript(
  src: string,
  options: {
    removeOnUnmount?: boolean;
    ref?: RefObject<HTMLDivElement>;
    data?: string;
    id?: string;
  } = {},
) {
  const [status, setStatus] = useState<string>(() => {
    if (!src) {
      return "idle";
    }

    return cachedScriptStatuses[src] ?? "loading";
  });

  // Read once per effect run. The effect deliberately does not re-run when
  // these change: id/data/ref only matter at the moment the <script> element is
  // created, and adding them to the dependency array would tear down and
  // recreate a working script every time a caller passed a fresh object
  // literal — which every caller does.
  const { removeOnUnmount, ref, data, id } = options;

  useEffect(() => {
    if (!src) {
      return;
    }

    const cachedScriptStatus = cachedScriptStatuses[src];
    if (cachedScriptStatus === "ready" || cachedScriptStatus === "error") {
      setStatus(cachedScriptStatus);
      return;
    }

    let script: HTMLScriptElement | null = document.querySelector(
      `script[src="${src}"]`,
    );

    // Listeners registered on a script we created, so the cleanup below can
    // remove them. Previously these were never removed at all.
    const ownedListeners: Array<[string, EventListener]> = [];

    if (script) {
      setStatus(
        script.getAttribute("data-status") ?? cachedScriptStatus ?? "loading",
      );
    } else {
      script = document.createElement("script");
      script.id = id ?? "";
      script.src = src;
      script.async = true;
      script.innerHTML = data ?? "";
      script.setAttribute("data-status", "loading");

      if (ref?.current) {
        ref.current.appendChild(script);
      } else {
        document.body.appendChild(script);
      }

      const setAttributeFromEvent = (event: Event) => {
        const scriptStatus = event.type === "load" ? "ready" : "error";
        script?.setAttribute("data-status", scriptStatus);
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
      ownedListeners.push(
        ["load", setAttributeFromEvent],
        ["error", setAttributeFromEvent],
      );
    }

    const setStateFromEvent = (event: Event) => {
      const newStatus = event.type === "load" ? "ready" : "error";
      setStatus(newStatus);
      cachedScriptStatuses[src] = newStatus;
    };

    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);
    ownedListeners.push(
      ["load", setStateFromEvent],
      ["error", setStateFromEvent],
    );

    const element = script;

    return () => {
      for (const [type, listener] of ownedListeners) {
        element.removeEventListener(type, listener);
      }

      if (removeOnUnmount) {
        element.remove();
      }
    };
  }, [src, removeOnUnmount, ref, data, id]);

  return status;
}
