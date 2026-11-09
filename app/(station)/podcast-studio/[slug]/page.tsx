import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/site-url";
import {
  buildLocationJsonLd,
  buildLocationMetadata,
} from "@/lib/location-page";
import {
  getLocationPageBySlug,
  getLocationPageSlugs,
  getPodcast,
} from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { JsonLd } from "../../../components/json-ld";
import { blogPortableTextComponents } from "../../blog/components/portable-text-components";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const slugs = await getLocationPageSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLocationPageBySlug(slug);
  if (!page) return {};

  const ogImageUrl = page.ogImage
    ? urlForImage(page.ogImage).width(1200).height(627).url()
    : undefined;

  return buildLocationMetadata(page, slug, ogImageUrl);
}

const ctaClassName =
  "inline-flex h-14 items-center justify-center border border-voicesNext-orange bg-voicesNext-orange px-8 font-gabarito text-lg font-bold text-voicesNext-background transition-colors hover:bg-voicesNext-cream focus:outline-none focus:ring-2 focus:ring-voicesNext-orange focus:ring-offset-2 focus:ring-offset-voicesNext-background";

const inlineLinkClassName =
  "text-voicesNext-orangeText underline underline-offset-2 hover:text-voicesNext-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-voicesNext-orange";

export default async function LocationPageRoute({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const [page, podcast] = await Promise.all([
    getLocationPageBySlug(slug),
    getPodcast(),
  ]);

  if (!page) notFound();

  const { localBusiness, faq, breadcrumb } = buildLocationJsonLd({
    page,
    podcast,
    baseUrl: getBaseUrl(),
    slug,
  });

  return (
    <>
      <JsonLd data={localBusiness} />
      <JsonLd data={breadcrumb} />
      {faq && <JsonLd data={faq} />}

      <main id="main-content" className="scroll-mt-24">
        <section className="border-b border-voicesNext-border">
          <div className="mx-auto max-w-[1120px] px-4 py-12 md:px-8 md:py-20">
            <p className="mb-4 font-asap text-sm font-bold uppercase text-voicesNext-orangeText">
              Podcast Studio
            </p>
            <h1 className="text-balance max-w-4xl font-outfit text-5xl font-black uppercase leading-[0.95] text-voicesNext-cream md:text-7xl">
              {page.h1}
            </h1>

            {page.intro && (
              <div className="mt-6 max-w-2xl">
                <PortableText
                  value={page.intro}
                  components={blogPortableTextComponents}
                />
              </div>
            )}

            {page.ctaText && page.ctaUrl && (
              <Link href={page.ctaUrl} className={`${ctaClassName} mt-8`}>
                {page.ctaText}
              </Link>
            )}
          </div>
        </section>

        {page.body && (
          <section className="border-b border-voicesNext-border">
            <div className="mx-auto max-w-[1120px] px-4 py-12 md:px-8 md:py-16">
              <div className="max-w-3xl">
                <PortableText
                  value={page.body}
                  components={blogPortableTextComponents}
                />
              </div>
            </div>
          </section>
        )}

        {page.faq && page.faq.length > 0 && (
          <section className="border-b border-voicesNext-border">
            <div className="mx-auto max-w-[1120px] px-4 py-12 md:px-8 md:py-16">
              <h2 className="font-gabarito text-2xl font-bold text-voicesNext-cream md:text-3xl">
                Frequently asked questions
              </h2>
              <dl className="mt-8 grid max-w-3xl gap-6">
                {page.faq.map((item) => (
                  <div key={item.question}>
                    <dt className="font-gabarito text-lg font-bold text-voicesNext-cream">
                      {item.question}
                    </dt>
                    <dd className="mt-2 font-gabarito text-base leading-relaxed text-voicesNext-secondary">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        <section>
          <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-8">
            <p className="font-gabarito text-base text-voicesNext-secondary">
              <Link href="/podcast" className={inlineLinkClassName}>
                Learn more about the Voices Radio podcast studio
              </Link>{" "}
              or{" "}
              <Link href="/services" className={inlineLinkClassName}>
                view all our services
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
