import { getHome } from "@/sanity.client";

export default async function ApplySection() {
  const home = await getHome();

  return (
    <section className="p-8">
      <h2>{home.apply_heading}</h2>

      <p className="text-center">{home.apply_subheading}</p>

      <a href={home.apply_cta_url}>{home.apply_cta_text}</a>
    </section>
  );
}
