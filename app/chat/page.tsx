import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat",
  alternates: { canonical: "/chat" },
};

export default async function ChatPage() {
  return <div className="flex flex-col min-h-screen">INSERT CHAT HERE</div>;
}
