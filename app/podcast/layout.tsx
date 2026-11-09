import SpriteSheet from "../components/sprite-sheet";

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <SpriteSheet />
    </>
  );
}
