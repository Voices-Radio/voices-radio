import { getSettings } from "@/sanity.client";
import { PortableText } from "@portabletext/react";

export default async function Footer() {
  const settings = await getSettings();

  return (
    <div className="bg-black text-white p-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex gap-8">
          <div className="flex-1">
            <address className="not-italic">
              <PortableText
                value={settings.address}
                components={{
                  block: ({ children }) => <>{children}</>,
                }}
              />
            </address>
          </div>

          <div className="flex-1">Icons</div>

          <div className="flex-1">
            <a href={settings.contact_link}>Contact Us</a>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="h-96 w-96 bg-white rounded-full" />
        </div>

        <div>
          <div className="flex">
            <div className="flex-1"></div>
            <div className="flex-1"></div>
            <div className="flex-1">Privacy Policy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
