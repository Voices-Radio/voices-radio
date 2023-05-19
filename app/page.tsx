import { draftMode } from "next/headers";
import PreviewSuspense from "@/components/PreviewSuspense";
import { DocumentsCount, query } from "@/components/DocumentsCount";
import PreviewDocumentsCount from "@/components/PreviewDocumentsCount";
import { client } from "@/sanity.client";
import { cache } from "react";

// Enable NextJS to cache and dedupe queries
const clientFetch = cache(client.fetch.bind(client));

export default async function Home() {
  const { isEnabled } = draftMode();

  if (isEnabled) {
    return (
      <>
        <PreviewSuspense fallback="Loading...">
          <PreviewDocumentsCount />
        </PreviewSuspense>

        <p>
          <a href="/api/disable-draft">Exit Draft Mode</a>
        </p>
      </>
    );
  }

  const data = await clientFetch(query);

  return (
    <>
      <p>
        <a href="/api/draft">Enter Draft Mode</a>
      </p>

      <DocumentsCount data={data} />
    </>
  );
}
