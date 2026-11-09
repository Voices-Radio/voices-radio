import { socialLinks } from "../podcast-content";
import { SectionLink } from "../section-link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Footer */}
      <footer className="bg-slate-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2 md:pr-8">
              <div className="mb-6 flex items-center space-x-2">
                <span className="text-2xl font-bold">Voices Studio</span>
              </div>
              <p className="mb-6 max-w-md leading-relaxed text-slate-300">
                Podcast Studio in Kings Cross. Professional podcast recording
                with state-of-the-art equipment and flexible booking options.
              </p>
              <div className="mb-4 flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="transform text-slate-400 transition-colors duration-200 hover:scale-110 hover:text-accent"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="text-slate-300">
                <a
                  href="mailto:podcast@voicesradio.co.uk"
                  className="transition-colors duration-200 hover:text-accent"
                >
                  podcast@voicesradio.co.uk
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:ml-auto">
              <h4 className="mb-6 text-lg font-semibold">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  "Home",
                  "About",
                  "Studio",
                  "Services",
                  "Technology",
                  "Contact",
                ].map((item) => (
                  <li key={item}>
                    <SectionLink
                      sectionId={item.toLowerCase()}
                      className="text-slate-300 transition-colors duration-200 hover:text-accent"
                    >
                      {item}
                    </SectionLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <p className="mb-4 text-sm text-slate-400 md:mb-0">
                © {currentYear} Studio London. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a
                  href="#"
                  className="text-slate-400 transition-colors duration-200 hover:text-accent"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-slate-400 transition-colors duration-200 hover:text-accent"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-slate-400 transition-colors duration-200 hover:text-accent"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
