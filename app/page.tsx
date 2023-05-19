import { getSettings } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";

export default async function Home() {
  const { title, description, ogImage } = await getSettings();

  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
      {ogImage && (
        <img src={urlForImage(ogImage)?.width(100).height(100).url()} alt="" />
      )}
    </>
  );
}
