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
      className="absolute left-1/2 -translate-x-1/2 bottom-5 p-2.5 h-11 w-11 rounded-full text-white bg-black"
    >
      <ArrowDown />
    </button>
  );
}
