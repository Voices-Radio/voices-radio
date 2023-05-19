import { DocumentsCount, query } from "@/components/DocumentsCount";
import { clientFetch } from "@/sanity.client";

export default async function Home() {
  const data = await clientFetch(query);

  return (
    <>
      <DocumentsCount data={data} />
    </>
  );
}
