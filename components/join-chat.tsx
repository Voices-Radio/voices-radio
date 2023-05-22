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
      className="px-4 bg-white rounded-full py-0.5 leading-6 text-lg hidden md:block whitespace-nowrap"
      type="button"
    >
      Join Chat
    </button>
  );
}
