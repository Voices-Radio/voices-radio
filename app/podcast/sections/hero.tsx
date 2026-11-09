import { ArrowRight, ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
      >
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/Voices Studio_Hero Video v3.mp4" type="video/mp4" />
            {/* Fallback image for browsers that don't support video */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url(/studio-1.jpg)",
              }}
            />
          </video>
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-20 text-center text-white md:pt-0">
          <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl md:mb-6 md:text-7xl">
            Welcome to
            <span className="block text-accent">Voices Studio</span>
          </h1>
          <p className="mb-6 text-lg leading-relaxed text-gray-200 sm:text-xl md:mb-8 md:text-2xl">
            Professional podcast recording with everything you need for
            high-quality audio and video.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex transform items-center space-x-2 rounded-full bg-accent px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-orange-700"
            >
              <span>Book Now</span>
              <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Scroll indicator - centered horizontally, same height as before */}
        <div className="absolute bottom-8 flex w-full animate-bounce justify-center">
          <div className="flex flex-col items-center text-accent">
            <span className="mb-2 text-sm font-medium text-white">
              Scroll Down
            </span>
            <ArrowDown className="h-8 w-8 animate-pulse" />
          </div>
        </div>
      </section>
    </>
  );
}
