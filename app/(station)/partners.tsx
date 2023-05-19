import { getPartners } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";
import Image from "next/image";

export default async function PartnersSection() {
  const partners = await getPartners();

  return (
    <section className="p-8">
      <h3>Our Partners</h3>

      <div className="flex flex-col gap-8">
        {partners.map((partner) => (
          <div key={partner.name}>
            <Image
              width={200}
              height={60}
              alt={partner.name}
              src={urlForImage(partner.logo).url()}
            />

            <PortableText value={partner.details} />
          </div>
        ))}
      </div>
    </section>
  );
}
