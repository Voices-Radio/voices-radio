import { getSettings } from "@/sanity.queries";

export default async function Home() {
  const { title, description } = await getSettings();

  return (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
    </>
  );
}
