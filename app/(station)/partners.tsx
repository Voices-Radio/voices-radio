import { getPartners } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";

export default async function PartnersSection() {
  const partners = await getPartners();

  return (
    <section className="bg-voices-gray p-5 md:p-12 pb-10">
      <div className="mb-6 md:hidden">
        <h2 className="font-kinfolk text-mobile-kinfolk-headline uppercase text-center">
          Our Partners
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-10 max-w-6xl mx-auto">
        {partners.map((partner) => (
          <div
            key={partner.name}
            className="text-mobile-inter-xsmall md:text-inter-text-small flex-1"
          >
            <div className="mb-4 h-16 md:h-24 flex items-center justify-center">
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
