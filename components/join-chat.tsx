"use client";

export default function JoinChat() {
  function joinChat() {
    window.open(
      "/chat",
      "voiceschatwindow",
      "width=480,height=520,menubar=no,location=no,resizable=no,scrollbars=no,status=no"
    );
  }

  return (
    <button
      onClick={joinChat}
      className="px-6 bg-white rounded-full py-1.5 text-inter-text-small hidden md:block whitespace-nowrap"
      type="button"
    >
      Join Chat
    </button>
  );
}
