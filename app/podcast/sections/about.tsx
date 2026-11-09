export function AboutSection() {
  return (
    <>
      {/* About Section */}
      <section id="about" className="bg-slate-50 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-slate-800 sm:text-4xl md:mb-6 md:text-5xl">
              About Voices Studio
            </h2>
          </div>

          {/* Main About Content */}
          <div className="rounded-2xl bg-white p-6 shadow-lg md:p-8 lg:p-12">
            <div className="mx-auto max-w-4xl text-center">
              <h3 className="mb-6 text-2xl font-bold text-slate-800 sm:text-3xl md:mb-8">
                Welcome To Voices Studio
              </h3>
              <div className="space-y-4 text-base leading-relaxed text-slate-600 md:space-y-6 md:text-lg">
                <p>
                  <strong>Voices Studio</strong> is a dedicated Podcasting
                  studio in <strong>Kings Cross, within Mare St Market</strong>.
                </p>
                <p>
                  Situated a stone&apos;s throw from the radio station, the
                  studio is <strong>kitted out with everything you need</strong>{" "}
                  to record high-quality audio and video podcasts, with the
                  added bonus of having everything{" "}
                  <strong>Mare St Market & Coal Drops Yard</strong> has to offer
                  right outside our door!
                </p>
                <p>
                  Drop into the <strong>mezzanine bar</strong> for a quick
                  aperitif before your podcast, or venture down to the
                  restaurant with your guests for some of the{" "}
                  <strong>best grub that KX has to offer</strong>. We&apos;re
                  very proud to be part of such a vibrant new space and are very
                  happy to recommend things to do in the area during your visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
