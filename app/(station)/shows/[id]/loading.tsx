import DetailPageSkeleton from "../../components/redesign/detail-page-skeleton";

export default function Loading() {
  return (
    <DetailPageSkeleton
      label="Loading show"
      mobileArtworkClassName="-mx-2 aspect-square"
      desktopArtworkColumn="minmax(0, 420px)"
    />
  );
}
