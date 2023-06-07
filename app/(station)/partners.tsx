import { getPartners } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";

export default async function PartnersSection() {
  const partners = await getPartners();

  return (
    <section className="bg-voices-gray px-5 py-10 pb-10 md:p-12">
      <div className="mb-6 md:hidden">
        <h2 className="text-center font-kinfolk text-mobile-kinfolk-headline uppercase">
          Our Partners
        </h2>
      </div>

      <div className="mx-auto flex max-w-[90rem] flex-col gap-10 md:flex-row">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="flex-1 text-mobile-inter-xsmall md:text-inter-text-small"
          >
            <div className="mb-4 flex h-16 items-center justify-center md:h-24">
              <Image
                width={200}
                height={60}
                alt={partner.name}
                src={urlForImage(partner.logo).url()}
              />
            </div>

            <PortableText
              value={partner.details}
              components={{
                marks: { u: ({ children }) => <u>{children}</u> },
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
