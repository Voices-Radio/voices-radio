import Chatango from "./components/chatango";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
};

export default function ChatPage() {
  return <Chatango />;
}
