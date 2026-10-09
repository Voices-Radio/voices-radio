import { ArrowRight } from "lucide-react";
import { services, pricingOptions } from "../podcast-content";

export function ServicesSection() {
  return (
    <>
      {/* Services Section */}
      <section id="services" className="bg-white py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center md:mb-16">
            <h2 className="mb-4 text-3xl font-bold text-slate-800 sm:text-4xl md:mb-6 md:text-5xl">
              Our Services
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
              From recording to distribution, we provide comprehensive podcast
              production services tailored to your needs and budget.
            </p>
          </div>

          {/* Services Grid */}
          <div className="mb-12 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="group transform rounded-xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-4"
              >
                <div className="mb-3 text-accent transition-transform duration-300 group-hover:scale-110">
                  {service.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-800">
                  {service.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
                <ul className="space-y-1">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-sm text-slate-600"
                    >
                      <div className="mr-2 h-1.5 w-1.5 rounded-full bg-accent"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div
            id="pricing"
            className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg md:p-8 lg:p-12"
          >
            <h3 className="mb-6 text-center text-2xl font-bold text-slate-800 sm:text-3xl md:mb-8">
              Pricing & Packages
            </h3>
            <p className="mx-auto mb-8 max-w-4xl text-center text-base leading-relaxed md:mb-12 md:text-slate-600">
              Our podcast recording studio is{" "}
              <strong>bookable by the hour</strong> and is available as a
              self-service offering or with additional, hands-on engineer
              support. Need additional help with the production of your podcast
              or editing? We have <strong>engineers available</strong> to walk
              you through your recording as well as an{" "}
              <strong>in-house edit team</strong> who will get your podcast
              looking and sounding professional.
            </p>

            <div className="mb-6 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:mb-8 md:gap-6 lg:grid-cols-4">
              {pricingOptions.map((option, index) => (
                <div
                  key={index}
                  className={`flex transform flex-col rounded-2xl border-2 bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl md:p-6 ${
                    option.popular
                      ? "border-accent ring-2 ring-red-100"
                      : "border-slate-100"
                  } h-full`}
                >
                  <div className="mb-4 flex-shrink-0 text-center">
                    <h4 className="mb-2 text-lg font-bold text-slate-800">
                      {option.title}
                    </h4>
                    {option.popular && (
                      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-accent">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="mb-6 flex-shrink-0">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-slate-800">
                        {option.price}
                      </span>
                      <span className="block text-sm text-slate-500">
                        {option.period}
                      </span>
                    </div>
                  </div>
                  <ul className="mb-6 flex-grow space-y-2">
                    {option.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex min-h-[20px] items-start text-sm text-slate-600"
                      >
                        {feature && (
                          <div className="mr-2 mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent"></div>
                        )}
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Book Now Call to Action */}
            <div className="mb-8 rounded-xl bg-gradient-to-r from-accent to-orange-600 p-8 text-center">
              <h4 className="mb-4 text-2xl font-bold text-white">
                Ready to Book Your Studio Session?
              </h4>
              <p className="mb-6 text-lg text-white/90">
                Choose your package and book your podcast recording session
                today
              </p>
              <a
                href="https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex transform items-center rounded-full bg-white px-8 py-4 text-lg font-bold text-accent shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100"
              >
                <span>Book Now</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>

            {/* Contact for Custom Quote */}
            <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-6 text-center">
              <h4 className="mb-3 text-xl font-bold text-slate-800">
                Need Editing Services?
              </h4>
              <p className="text-slate-600">
                We offer comprehensive editing packages for your podcast. Drop
                us an email at{" "}
                <a
                  href="mailto:podcast@voicesradio.co.uk"
                  className="font-semibold text-accent underline hover:text-red-700"
                >
                  podcast@voicesradio.co.uk
                </a>{" "}
                and we can build you a bespoke quote!
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
