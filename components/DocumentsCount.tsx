import { groq } from "next-sanity";

export const query = groq`count(*[])`;

export function DocumentsCount({ data }: { data: any }) {
  return (
    <>
      Documents: <strong>{data}</strong>
    </>
  );
}
