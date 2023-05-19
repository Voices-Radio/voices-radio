import { groq } from "next-sanity";

export const query = groq`count(*[])`;

export function DocumentsCount({ data }: { data: number }) {
  return (
    <p>
      Documents: <strong>{data}</strong>
    </p>
  );
}
