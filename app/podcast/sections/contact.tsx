export function ContactSection() {
  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Location Section */}
          <div className="mb-20">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">
              Location
            </h2>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h4 className="mb-6 text-xl font-bold text-slate-800">
                  Address & Transport
                </h4>
                <div className="space-y-4 text-slate-600">
                  <p className="font-semibold text-slate-800">
                    Lewis Cubitt Walk, N1C 4DY, King&apos;s Cross
                  </p>
                  <div className="space-y-2">
                    <p>
                      • Distance to{" "}
                      <strong>
                        Kings Cross and London St Pancras Stations
                      </strong>
                      : 10 mins
                    </p>
                    <p>
                      • Distance to{" "}
                      <strong>Caledonian Road and Barnsbury</strong>: 8 mins
                    </p>
                    <p>
                      • Accessible by taxi via <strong>Handyside Street</strong>
                    </p>
                    <p>
                      • On-site parking at <strong>Handyside Car Park</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-8 shadow-lg">
                <h4 className="mb-6 text-xl font-bold text-slate-800">
                  Accessibility & Amenities
                </h4>
                <div className="space-y-2 text-slate-600">
                  <p>
                    • <strong>Keyless Entry</strong>
                  </p>
                  <p>
                    • <strong>Wheelchair Accessible</strong>
                  </p>
                  <p>
                    • <strong>AC & Heating</strong>
                  </p>
                  <p>
                    • Door access via your phone, <strong>no app needed</strong>
                  </p>
                  <p>
                    • <strong>Toilets, food and drinks amenities</strong> on
                    site
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Find Us Section */}
          <div className="mx-auto max-w-4xl">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800">Find Us</h3>
              <div className="mb-6 rounded-xl bg-slate-50 p-6">
                <h4 className="mb-3 text-lg font-semibold text-slate-800">
                  Directions
                </h4>
                <p className="text-slate-600">
                  Walk into <strong>Mare Street Market Kings Cross</strong>,
                  head up the stairs on your left, walk beyond the bar and you
                  will find our podcast studio in the corner.
                </p>
              </div>
              <div className="h-80 overflow-hidden rounded-xl bg-slate-100 shadow-lg">
                <iframe
                  src="https://www.google.com/maps?q=Mare+Street+Market+Kings+Cross%2C+Lewis+Cubitt+Square%2C+London+N1C+4DY&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Map: Voices Podcast Studio, Mare Street Market Kings Cross, Lewis Cubitt Square, London N1C 4DY"
                  className="h-full w-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
