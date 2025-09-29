import Footer from "../components/navigation/footer";
import SpriteSheet from "../components/sprite-sheet";
import ChatbotWidget from "./chatbot-widget";

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <SpriteSheet />
      
      {/* Global chatbot management */}
      <ChatbotWidget />
    </>
  );
}
