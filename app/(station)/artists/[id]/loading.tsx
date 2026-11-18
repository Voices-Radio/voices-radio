import DetailPageSkeleton from "../../components/redesign/detail-page-skeleton";

export default function Loading() {
  return (
    <DetailPageSkeleton
      label="Loading artist"
      mobileArtworkClassName="h-[381px] border border-voicesNext-border"
      desktopArtworkColumn="minmax(0, 360px)"
    />
  );
}
