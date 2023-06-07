"use client";

import ArrowDown from "@/icons/arrow-down";

export default function ScrollAfforance({ target }: { target: `#${string}` }) {
  function scrollIntoView() {
    const element = document.querySelector(target);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollIntoView}
      className="absolute bottom-5 left-1/2 hidden h-11 w-11 -translate-x-1/2 rounded-full bg-black p-2.5 text-white lg:block"
    >
      <span className="sr-only">Scroll Down</span>
      <ArrowDown />
    </button>
  );
}
