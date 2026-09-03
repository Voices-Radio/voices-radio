"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Play,
  Mic,
  Video,
  Edit,
  Users,
  TrendingUp,
  Calculator,
  Headphones,
  Camera,
  Monitor,
  Lightbulb,
  Thermometer,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Menu,
  X,
} from "lucide-react";

const PodcastPage = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsNavOpen(false);
    }
  };

  const studioImages = [
    {
      url: "/studio-6.jpg",
      alt: "Voices Studio recording setup",
      title: "Studio Setup",
    },
    {
      url: "/studio-3.jpg",
      alt: "Professional podcast recording environment",
      title: "Recording Environment",
    },
    {
      url: "/studio-4.jpg",
      alt: "Voices Studio podcast recording",
      title: "Venue Exterior",
    },
    {
      url: "/studio-5.jpg",
      alt: "Additional Voices Studio recording setup",
      title: "Restaurant & Bar",
    },
  ];

  const services = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Podcast Studio Booking",
      description:
        "Bookable by the hour, with optional hands-on Engineer support and multiple camera angles!",
      features: [
        "Self-service or engineer support",
        "Professional equipment included",
        "Flexible hourly booking",
      ],
    },
    {
      icon: <Edit className="h-8 w-8" />,
      title: "Audio-only Production",
      description:
        "Our professional audio editing services will polish your podcast to perfection, delivering crisp and clear sound for your audience.",
      features: [
        "Professional audio editing",
        "Noise reduction & enhancement",
        "Crisp, clear sound delivery",
      ],
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Video Production",
      description:
        "Elevate your podcast with our professional video editing services, ensuring engaging visuals and seamless production.",
      features: [
        "Professional video editing",
        "Engaging visual content",
        "Seamless production quality",
      ],
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Promotional Content Services",
      description:
        "Maximize your podcast's social media presence with our service that transforms longer episodes into compelling shorts designed for sharing.",
      features: [
        "Social media optimization",
        "Episode highlights creation",
        "Shareable content formats",
      ],
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Bulk Discounts",
      description:
        "Take advantage of our bulk discounts to save on multiple bookings.",
      features: [
        "Volume pricing available",
        "Cost-effective packages",
        "Flexible booking terms",
      ],
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Podcasting Strategy",
      description:
        "We offer comprehensive podcast strategy services, guiding you through idea generation, to scripting and effective distribution to launch and grow your show.",
      features: [
        "Idea generation support",
        "Scripting assistance",
        "Distribution strategy",
        "Host introductions available",
      ],
    },
  ];

  const pricingOptions = [
    {
      title: "Audio Package",
      price: "£65",
      period: "per hour",
      features: [
        "Professional audio recording",
        "Acoustically treated room",
        "Self-service studio access",
        "",
        "",
      ],
      popular: false,
      isAddon: false,
    },
    {
      title: "Single Camera",
      price: "£90",
      period: "per hour",
      features: [
        "Everything in Audio Package",
        "Single camera setup",
        "Professional lighting",
        "",
        "",
      ],
      popular: false,
      isAddon: false,
    },
    {
      title: "Dual Camera",
      price: "£170",
      period: "per hour",
      features: [
        "Everything in Single Camera",
        "Second camera angle",
        "Multi-angle recording",
        "",
        "",
      ],
      popular: true,
      isAddon: false,
    },
    {
      title: "Engineer Support",
      price: "£30",
      period: "per hour add-on",
      features: [
        "Technical assistance",
        "Equipment setup help",
        "Recording guidance",
        "Quality assurance",
        "Available for all packages",
      ],
      popular: false,
      isAddon: true,
    },
  ];

  const audioEquipment = [
    "4 x Shure SM7B dynamic microphones",
    "4 x Sony MDR-7506 production headphones",
    "4 x Rode PSA1 boom arms",
    "Rodecaster Pro digital mixing desk, recorder and audio interface",
    "2 x Yamaha HS8 speakers",
  ];

  const videoEquipment = [
    "Sony FX30",
    "Sigma Art 12-24mm F2.8 lens",
    "Godox SL60W adjustable lighting with softbox",
    "1 x Tripod",
  ];

  const otherEquipment = [
    "Controllable lighting",
    "Climate control (A/C, Heating)",
    "Door access via your phone, no app needed",
    "Wheelchair accessible",
    "Toilets, food and drinks amenities on site",
  ];

  const socialLinks = [
    {
      icon: <Instagram className="h-5 w-5" />,
      href: "https://www.instagram.com/voices_studio_/",
      label: "Instagram",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://www.linkedin.com/company/104914569/admin/dashboard/",
      label: "LinkedIn",
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-white shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="ml-2 flex items-center space-x-2">
              <Image
                src="/VOICESLOGO_LIGHTBOX.png"
                alt="Voices Studio Logo"
                width={32}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span
                className={`text-xl font-bold ${
                  isScrolled ? "text-slate-800" : "text-white"
                }`}
              >
                Voices Studio
              </span>
            </div>

            <div className="hidden md:block">
              <div className="mr-2 flex items-center space-x-6">
                {[
                  "home",
                  "about",
                  "studio",
                  "services",
                  "equipment",
                  "blog",
                  "pricing",
                  "contact",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === "blog") {
                        window.location.href = "/podcast/blog";
                      } else {
                        scrollToSection(
                          item === "equipment" ? "technology" : item,
                        );
                      }
                    }}
                    className={`font-medium capitalize transition-colors duration-200 hover:text-accent ${
                      isScrolled ? "text-slate-600" : "text-white"
                    }`}
                  >
                    {item === "equipment"
                      ? "Equipment"
                      : item === "pricing"
                      ? "Pricing"
                      : item}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className={`${isScrolled ? "text-slate-800" : "text-white"}`}
              >
                {isNavOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isNavOpen && (
          <div className="bg-white shadow-lg md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {[
                "home",
                "about",
                "studio",
                "services",
                "equipment",
                "blog",
                "pricing",
                "contact",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === "blog") {
                      window.location.href = "/podcast/blog";
                    } else {
                      scrollToSection(
                        item === "equipment" ? "technology" : item,
                      );
                    }
                  }}
                  className="block w-full px-3 py-2 text-left font-medium capitalize text-slate-600 hover:text-accent"
                >
                  {item === "equipment"
                    ? "Equipment"
                    : item === "pricing"
                    ? "Pricing"
                    : item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

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

      {/* Featured Blog Posts Section */}
      <section id="blog" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-slate-800 md:text-5xl">
              Latest Insights
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600">
              Discover expert tips, industry news, and studio updates to help
              you create better podcasts.
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder for featured blog posts - will be populated when blog posts are created */}
            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Coming Soon
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                We&apos;re preparing amazing content about podcast recording,
                equipment reviews, and industry insights.
              </p>
              <Link
                href="/podcast/blog"
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-orange-700"
              >
                View Blog
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Expert Tips
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Learn professional recording techniques and equipment
                recommendations from our experienced team.
              </p>
              <Link
                href="/podcast/blog"
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-orange-700"
              >
                Read More
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <svg
                  className="h-8 w-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-800">
                Industry News
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Stay updated with the latest podcast industry trends, technology
                updates, and market insights.
              </p>
              <Link
                href="/podcast/blog"
                className="inline-flex items-center text-sm font-semibold text-accent hover:text-orange-700"
              >
                Explore
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/podcast/blog"
              className="inline-flex transform items-center rounded-full bg-accent px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-orange-700"
            >
              <span>View All Posts</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-800">
              Studio Equipment
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-slate-600">
              Professional-grade equipment for exceptional podcast production
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Audio Equipment */}
            <div className="rounded-2xl bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-xl bg-red-100 p-3">
                  <Mic className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Audio</h3>
              </div>
              <ul className="space-y-3">
                {audioEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"></div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Equipment */}
            <div className="rounded-2xl bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-lg">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-xl bg-red-100 p-3">
                  <Camera className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Video</h3>
              </div>
              <ul className="space-y-3">
                {videoEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"></div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Other Equipment - Centered */}
          <div className="mt-8 flex justify-center">
            <div className="w-full rounded-2xl bg-slate-50 p-6 transition-shadow duration-300 hover:shadow-lg md:w-1/2">
              <div className="mb-6 flex items-center">
                <div className="mr-4 rounded-xl bg-red-100 p-3">
                  <Monitor className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Other</h3>
              </div>
              <ul className="space-y-3">
                {otherEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent"></div>
                    <span className="text-sm text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

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
                    <button
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-slate-300 transition-colors duration-200 hover:text-accent"
                    >
                      {item}
                    </button>
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
    </div>
  );
};

export default PodcastPage;
