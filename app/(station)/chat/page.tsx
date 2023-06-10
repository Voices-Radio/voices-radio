import Chatango from "@/components/chatango";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
};

export default function ChatPage() {
  return (
    <div className="relative mt-[120px] min-h-[calc(100vh-120px)] lg:mt-[72px] lg:min-h-[calc(100vh-72px)]">
      <Chatango />
    </div>
  );
}
