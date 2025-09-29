'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowDown, Play, Mic, Video, Edit, Users, TrendingUp, Calculator, Headphones, Camera, Monitor, Lightbulb, Thermometer, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Menu, X } from 'lucide-react';

const PodcastPage = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsNavOpen(false);
    }
  };

  const studioImages = [
    {
      url: '/studio-6.jpg',
      alt: 'Voices Studio recording setup',
      title: 'Studio Setup'
    },
    {
      url: '/studio-3.jpg',
      alt: 'Professional podcast recording environment',
      title: 'Recording Environment'
    },
    {
      url: '/studio-4.jpg',
      alt: 'Voices Studio podcast recording',
      title: 'Venue Exterior'
    },
    {
      url: '/studio-5.jpg',
      alt: 'Additional Voices Studio recording setup',
      title: 'Restaurant & Bar'
    }
  ];

  const services = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: 'Podcast Studio Booking',
      description: 'Bookable by the hour, with optional hands-on Engineer support and multiple camera angles!',
      features: ['Self-service or engineer support', 'Professional equipment included', 'Flexible hourly booking']
    },
    {
      icon: <Edit className="h-8 w-8" />,
      title: 'Audio-only Production',
      description: 'Our professional audio editing services will polish your podcast to perfection, delivering crisp and clear sound for your audience.',
      features: ['Professional audio editing', 'Noise reduction & enhancement', 'Crisp, clear sound delivery']
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: 'Video Production',
      description: 'Elevate your podcast with our professional video editing services, ensuring engaging visuals and seamless production.',
      features: ['Professional video editing', 'Engaging visual content', 'Seamless production quality']
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Promotional Content Services',
      description: 'Maximize your podcast\'s social media presence with our service that transforms longer episodes into compelling shorts designed for sharing.',
      features: ['Social media optimization', 'Episode highlights creation', 'Shareable content formats']
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: 'Bulk Discounts',
      description: 'Take advantage of our bulk discounts to save on multiple bookings.',
      features: ['Volume pricing available', 'Cost-effective packages', 'Flexible booking terms']
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Podcasting Strategy',
      description: 'We offer comprehensive podcast strategy services, guiding you through idea generation, to scripting and effective distribution to launch and grow your show.',
      features: ['Idea generation support', 'Scripting assistance', 'Distribution strategy', 'Host introductions available']
    }
  ];

  const pricingOptions = [
    {
      title: 'Audio Package',
      price: '£65',
      period: 'per hour',
      features: ['Professional audio recording', 'Acoustically treated room', 'Self-service studio access', '', ''],
      popular: false,
      isAddon: false
    },
    {
      title: 'Single Camera',
      price: '£90',
      period: 'per hour',
      features: ['Everything in Audio Package', 'Single camera setup', 'Professional lighting', '', ''],
      popular: false,
      isAddon: false
    },
    {
      title: 'Dual Camera',
      price: '£170',
      period: 'per hour',
      features: ['Everything in Single Camera', 'Second camera angle', 'Multi-angle recording', '', ''],
      popular: true,
      isAddon: false
    },
    {
      title: 'Engineer Support',
      price: '£30',
      period: 'per hour add-on',
      features: ['Technical assistance', 'Equipment setup help', 'Recording guidance', 'Quality assurance', 'Available for all packages'],
      popular: false,
      isAddon: true
    }
  ];

  const audioEquipment = [
    '4 x Shure SM7B dynamic microphones',
    '4 x Sony MDR-7506 production headphones',
    '4 x Rode PSA1 boom arms',
    'Rodecaster Pro digital mixing desk, recorder and audio interface',
    '2 x Yamaha HS8 speakers'
  ];

  const videoEquipment = [
    'Sony FX30',
    'Sigma Art 12-24mm F2.8 lens',
    'Godox SL60W adjustable lighting with softbox',
    '1 x Tripod'
  ];

  const otherEquipment = [
    'Controllable lighting',
    'Climate control (A/C, Heating)',
    'Door access via your phone, no app needed',
    'Wheelchair accessible',
    'Toilets, food and drinks amenities on site'
  ];

  const socialLinks = [
    { icon: <Instagram className="h-5 w-5" />, href: 'https://www.instagram.com/voices_studio_/', label: 'Instagram' },
    { icon: <Linkedin className="h-5 w-5" />, href: 'https://www.linkedin.com/company/104914569/admin/dashboard/', label: 'LinkedIn' }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image 
                src="/voices.svg" 
                alt="Voices Studio Logo" 
                width={32}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <span className={`text-xl font-bold ${isScrolled ? 'text-slate-800' : 'text-white'}`}>
                Voices Studio
              </span>
            </div>
            
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                {['home', 'about', 'studio', 'services', 'equipment', 'pricing', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item === 'equipment' ? 'technology' : item)}
                    className={`capitalize font-medium transition-colors duration-200 hover:text-accent ${
                      isScrolled ? 'text-slate-600' : 'text-white'
                    }`}
                  >
                    {item === 'equipment' ? 'Equipment' : item === 'pricing' ? 'Pricing' : item}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsNavOpen(!isNavOpen)}
                className={`${isScrolled ? 'text-slate-800' : 'text-white'}`}
              >
                {isNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isNavOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {['home', 'about', 'studio', 'services', 'equipment', 'pricing', 'contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item === 'equipment' ? 'technology' : item)}
                  className="block px-3 py-2 text-slate-600 hover:text-accent capitalize font-medium w-full text-left"
                >
                  {item === 'equipment' ? 'Equipment' : item === 'pricing' ? 'Pricing' : item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/studio-1.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 pt-20 md:pt-0">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight">
            Welcome to
            <span className="block text-accent">Voices Studio</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 text-gray-200 leading-relaxed">
            Professional podcast recording with everything you need for high-quality audio and video.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-accent hover:bg-orange-700 text-white px-8 py-4 rounded-full font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
            >
              <span>Book Now</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform text-white" />
            </a>
          </div>
        </div>

        {/* Scroll indicator - centered horizontally, same height as before */}
        <div className="absolute bottom-8 w-full flex justify-center animate-bounce">
          <div className="flex flex-col items-center text-accent">
            <span className="text-sm font-medium mb-2 text-white">Scroll Down</span>
            <ArrowDown className="h-8 w-8 animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 md:mb-6">
              About Voices Studio
            </h2>
          </div>

          {/* Main About Content */}
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 md:mb-8">
                Welcome To Voices Studio
              </h3>
              <div className="space-y-4 md:space-y-6 text-base md:text-lg text-slate-600 leading-relaxed">
                <p>
                  <strong>Voices Studio</strong> is a dedicated Podcasting studio in <strong>Kings Cross, within Mare St Market</strong>.
                </p>
                <p>
                  Situated a stone's throw from the radio station, the studio is <strong>kitted out with everything you need</strong> to record high-quality audio and video podcasts, with the added bonus of having everything <strong>Mare St Market & Coal Drops Yard</strong> has to offer right outside our door!
                </p>
                <p>
                  Drop into the <strong>mezzanine bar</strong> for a quick aperitif before your podcast, or venture down to the restaurant with your guests for some of the <strong>best grub that KX has to offer</strong>. We're very proud to be part of such a vibrant new space and are very happy to recommend things to do in the area during your visit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Showcase Section */}
      <section id="studio" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Our Studio
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Step into our world-class facilities designed specifically for podcast production. 
              Every detail has been crafted to deliver exceptional audio quality and a comfortable recording experience.
            </p>
          </div>

          {/* Featured Studio Image */}
          <div className="mb-16">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
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
                <h3 className="text-2xl font-bold mb-2">Professional Recording Environment</h3>
                <p className="text-lg text-gray-200">Acoustically treated rooms with state-of-the-art equipment</p>
              </div>
            </div>
          </div>

          {/* Studio Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studioImages.map((image, index) => (
              <div 
                key={index}
                className="group relative h-64 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Image 
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h4 className="font-semibold">{image.title}</h4>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-4 md:mb-6">
              Our Services
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From recording to distribution, we provide comprehensive podcast production services 
              tailored to your needs and budget.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4 mb-12 md:mb-16">
            {services.map((service, index) => (
              <div 
                key={index}
                className="group bg-white p-6 md:p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-slate-100"
              >
                <div className="text-accent mb-3 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-slate-600 mb-3 leading-relaxed text-sm">
                  {service.description}
                </p>
                <ul className="space-y-1">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-slate-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 md:mb-8 text-center">
              Pricing & Packages
            </h3>
            <p className="text-base md:text-slate-600 text-center mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed">
              Our podcast recording studio is <strong>bookable by the hour</strong> and is available as a self-service offering or with additional, hands-on engineer support. 
              Need additional help with the production of your podcast or editing? We have <strong>engineers available</strong> to walk you through your recording as well as an <strong>in-house edit team</strong> who will get your podcast looking and sounding professional.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 items-stretch">
              {pricingOptions.map((option, index) => (
                <div 
                  key={index}
                  className={`bg-white p-4 md:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-2 flex flex-col ${
                    option.popular ? 'border-accent ring-2 ring-red-100' : 'border-slate-100'
                  } h-full`}
                >
                  <div className="text-center mb-4 flex-shrink-0">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{option.title}</h4>
                    {option.popular && (
                      <span className="inline-block bg-red-100 text-accent text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <div className="mb-6 flex-shrink-0">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-slate-800">{option.price}</span>
                      <span className="text-slate-500 text-sm block">{option.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {option.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-slate-600 text-sm min-h-[20px]">
                        {feature && <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2 mt-2 flex-shrink-0"></div>}
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Book Now Call to Action */}
            <div className="bg-gradient-to-r from-accent to-orange-600 rounded-xl p-8 text-center mb-8">
              <h4 className="text-2xl font-bold text-white mb-4">Ready to Book Your Studio Session?</h4>
              <p className="text-white/90 mb-6 text-lg">
                Choose your package and book your podcast recording session today
              </p>
              <a 
                href="https://voicesradio.spaces.nexudus.com/bookings?tab=Resources&view=card"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white text-accent px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>Book Now</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </div>

            {/* Contact for Custom Quote */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 text-center">
              <h4 className="text-xl font-bold text-slate-800 mb-3">Need Editing Services?</h4>
              <p className="text-slate-600">
                We offer comprehensive editing packages for your podcast. Drop us an email at <a href="mailto:podcast@voicesradio.co.uk" className="text-accent hover:text-red-700 font-semibold underline">podcast@voicesradio.co.uk</a> and we can build you a bespoke quote!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Studio Equipment</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional-grade equipment for exceptional podcast production
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Audio Equipment */}
            <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-xl mr-4">
                  <Mic className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Audio</h3>
              </div>
              <ul className="space-y-3">
                {audioEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video Equipment */}
            <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-xl mr-4">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Video</h3>
              </div>
              <ul className="space-y-3">
                {videoEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Other Equipment - Centered */}
          <div className="flex justify-center mt-8">
            <div className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 w-full md:w-1/2">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-xl mr-4">
                  <Monitor className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Other</h3>
              </div>
              <ul className="space-y-3">
                {otherEquipment.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Location Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Location</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-xl font-bold text-slate-800 mb-6">Address & Transport</h4>
                <div className="space-y-4 text-slate-600">
                  <p className="font-semibold text-slate-800">Lewis Cubitt Walk, N1C 4DY, King's Cross</p>
                  <div className="space-y-2">
                    <p>• Distance to <strong>Kings Cross and London St Pancras Stations</strong>: 10 mins</p>
                    <p>• Distance to <strong>Caledonian Road and Barnsbury</strong>: 8 mins</p>
                    <p>• Accessible by taxi via <strong>Handyside Street</strong></p>
                    <p>• On-site parking at <strong>Handyside Car Park</strong></p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h4 className="text-xl font-bold text-slate-800 mb-6">Accessibility & Amenities</h4>
                <div className="space-y-2 text-slate-600">
                  <p>• <strong>Keyless Entry</strong></p>
                  <p>• <strong>Wheelchair Accessible</strong></p>
                  <p>• <strong>AC & Heating</strong></p>
                  <p>• Door access via your phone, <strong>no app needed</strong></p>
                  <p>• <strong>Toilets, food and drinks amenities</strong> on site</p>
                </div>
              </div>
            </div>
          </div>

          {/* Find Us Section */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-800">Find Us</h3>
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Directions</h4>
                <p className="text-slate-600">
                  Walk into <strong>Mare Street Market Kings Cross</strong>, head up the stairs on your left, walk beyond the bar and you will find our podcast studio in the corner.
                </p>
              </div>
            <div className="bg-slate-100 h-80 rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.5!2d-0.125!3d51.535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b5a1234567890%3A0x1234567890abcdef!2sLewis%20Cubitt%20Walk%2C%20London%20N1C%204DY%2C%20UK!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Voices Studio Location - Lewis Cubitt Walk, King's Cross"
                className="w-full h-full"
              ></iframe>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2 md:pr-8">
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-2xl font-bold">Voices Studio</span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed max-w-md">
                Podcast Studio in Kings Cross. Professional podcast recording 
                with state-of-the-art equipment and flexible booking options.
              </p>
              <div className="flex space-x-4 mb-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="text-slate-400 hover:text-accent transition-colors duration-200 transform hover:scale-110"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="text-slate-300">
                <a 
                  href="mailto:podcast@voicesradio.co.uk"
                  className="hover:text-accent transition-colors duration-200"
                >
                  podcast@voicesradio.co.uk
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:ml-auto">
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['Home', 'About', 'Studio', 'Services', 'Technology', 'Contact'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="text-slate-300 hover:text-accent transition-colors duration-200"
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
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm mb-4 md:mb-0">
                © {currentYear} Studio London. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-slate-400 hover:text-accent transition-colors duration-200">
                  Privacy Policy
                </a>
                <a href="#" className="text-slate-400 hover:text-accent transition-colors duration-200">
                  Terms of Service
                </a>
                <a href="#" className="text-slate-400 hover:text-accent transition-colors duration-200">
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
