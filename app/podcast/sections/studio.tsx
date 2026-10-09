import Image from "next/image";
import { studioImages } from "../podcast-content";

export function StudioSection() {
  return (
    <>
      {/* Studio Showcase Section */}
      <section id="studio" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-slate-800 md:text-5xl">
              Our Studio
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
              Step into our world-class facilities designed specifically for
              podcast production. Every detail has been crafted to deliver
              exceptional audio quality and a comfortable recording experience.
            </p>
          </div>

          {/* Featured Studio Image */}
          <div className="mb-16">
            <div className="relative h-96 overflow-hidden rounded-2xl shadow-2xl md:h-[500px]">
              <Image
                src="/studio-2.jpg"
                alt="Professional podcast studio overview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="mb-2 text-2xl font-bold">
                  Professional Recording Environment
                </h3>
                <p className="text-lg text-gray-200">
                  Acoustically treated rooms with state-of-the-art equipment
                </p>
              </div>
            </div>
          </div>

          {/* Studio Gallery */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {studioImages.map((image, index) => (
              <div
                key={index}
                className="group relative h-64 transform overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <h4 className="font-semibold">{image.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
