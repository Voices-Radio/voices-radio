import { RefObject, useEffect, useRef, useState } from "react";

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

    return "loading";
  });

  const cachedScriptStatuses = useRef<{ [key: string]: string }>({});

  useEffect(() => {
    if (!src) {
      return;
    }

    const cachedScriptStatus = cachedScriptStatuses.current[src];
    if (cachedScriptStatus === "ready" || cachedScriptStatus === "error") {
      setStatus(cachedScriptStatus);
      return;
    }

    let script: HTMLScriptElement | null = document.querySelector(
      `script[src="${src}"]`,
    );

    if (script) {
      setStatus(
        script.getAttribute("data-status") ?? cachedScriptStatus ?? "loading",
      );
    } else {
      script = document.createElement("script");
      script.id = options.id ?? "";
      script.src = src;
      script.async = true;
      script.innerHTML = options.data ?? "";
      script.setAttribute("data-status", "loading");
      if (options.ref && options.ref.current) {
        options.ref.current.appendChild(script);
      } else {
        document.body.appendChild(script);
      }

      const setAttributeFromEvent = (event: Event) => {
        const scriptStatus = event.type === "load" ? "ready" : "error";

        if (script) {
          script.setAttribute("data-status", scriptStatus);
        }
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    }

    const setStateFromEvent = (event: Event) => {
      const newStatus = event.type === "load" ? "ready" : "error";
      setStatus(newStatus);
      cachedScriptStatuses.current[src] = newStatus;
    };

    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);

    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);
      }

      if (script && options.removeOnUnmount) {
        script.remove();
      }
    };
  }, [src, options.removeOnUnmount]);

  return status;
}
