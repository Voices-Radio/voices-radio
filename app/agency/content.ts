// Copy and structured content for the Voices Agency page.
// Kept separate from the section components so copy edits don't require
// touching JSX, and so page.tsx / _components stay small and focused.

export const briefHref =
  "mailto:bookings@voicesradio.co.uk?subject=Voices%20Agency%20Brief";

// Feature flags for sections whose content isn't launch-ready yet.
// Flip to true once the underlying content is signed off - see the
// TODO comments next to each flag's usage for what's outstanding.
export const SHOW_TESTIMONIALS = false; // TODO: needs client sign-off on quotes/attributions
export const SHOW_CONTACT_BLOCK = false; // TODO: needs name, role and photo for the contact block

export const navItems = [
  { label: "Offer", href: "#offer" },
  { label: "Formats", href: "#formats" },
  { label: "Who we work with", href: "#who-we-work-with" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Questions", href: "#questions" },
  { label: "Brief", href: "#brief" },
];

export const clientStrip = [
  "Hackney Bridge",
  "The Standard",
  "Two Tribes Campfire",
  "Tate Modern",
  "Dr. Martens",
  "Aperol",
  "Mercato Metropolitano",
  "Kensington Roof Gardens",
  "Coal Drops Yard",
  "Mare Street Market",
  "Flat Iron Square",
  "HOKA",
  "MOTH Drinks",
  "Moju Drinks",
];

export const services = [
  {
    title: "Venue music programming",
    description:
      "Music strategy, talent curation and fully managed calendars for hospitality venues, destinations and cultural spaces, including multi-space sites running different programmes in different rooms on the same night.",
  },
  {
    title: "Talent bookings",
    description:
      "DJs, live artists and creative talent chosen around your audience, setting, atmosphere and budget, drawn from a curated roster of talent we work with every week on air rather than a database of people looking for gigs.",
  },
  {
    title: "Brand activations",
    description:
      "Culturally credible talent, workshops, panels and music-led experiences for brands, retail and public programmes.",
  },
  {
    title: "Production and content",
    description:
      "Optional event, broadcast, podcast and content support through the wider Voices platform.",
  },
];

export const formats = [
  {
    label: "Single date",
    description: "Launches, parties, private events and individual dates.",
  },
  {
    label: "Residency",
    description:
      "Weekly or monthly programming with a consistent identity and a returning audience.",
  },
  {
    label: "Fully managed calendar",
    description:
      "Venues, groups and multi-space sites that need a whole programme sourced, booked and delivered.",
  },
  {
    label: "Cultural activation",
    description:
      "Brands and institutions building a larger concept, audience experience or content moment.",
  },
];

export const whoWeWorkWith = [
  {
    title: "Venues and hospitality groups",
    description:
      "Multi-space sites, taprooms, market halls, bars and destinations that need a calendar of programming, rather than one busy night.",
  },
  {
    title: "Hotels and members' clubs",
    description:
      "Long-running residencies that hold an identity across different rooms and different times of night.",
  },
  {
    title: "Brands and retail",
    description:
      "Activations, residencies, in-store programmes and campaigns that need music with real credibility behind it.",
  },
  {
    title: "Cultural institutions",
    description:
      "Museums, galleries and public programmes looking for a proper link to London's music communities.",
  },
  {
    title: "Developments and meanwhile spaces",
    description:
      "New sites building an audience and a reason to visit before the tenants arrive via placemaking activities.",
  },
];

export type CaseStudy = {
  index: string;
  title: string;
  type: string;
  location: string;
  headline: string;
  brief: string;
  delivered: string;
  scale: string;
  proof?: string;
};

export const caseStudies: CaseStudy[] = [
  {
    index: "01",
    title: "Hackney Bridge",
    type: "Venue programme",
    location: "Hackney Wick",
    headline: "A three-space programme, 150 to 2,000 capacity",
    brief:
      "Build and manage a sustainable music and events programme across Hackney Bridge's venue spaces: a canal-side cocktail bar, a 400-capacity warehouse room and a large outdoor garden. One retained programming partner, a consistent cultural offer, and a calendar that holds up across the whole year.",
    delivered:
      "Voices programmes all three spaces: Nico's, Block C and the Garden. That covers programme development, promoter sourcing and outreach, booking coordination, calendar management across the three rooms, and marketing liaison. At Nico's, Voices creates the DJ line-ups for live music dates, weekly DJ sets and day parties. In Block C and the Garden, Voices sources and manages the promoters behind larger takeovers, split-site events and headline weekends, with spaces regularly running two separate programmes on the same night.",
    scale:
      "A formal retained promoter arrangement started in January 2025 and continues into its second year. Between February and July 2026, Voices programmed 33 promoted events across the three spaces.",
    proof:
      "Hackney Bridge publicly credits Voices with creating Nico's DJ line-ups, and the weekly programme continued to be advertised as curated by Voices in 2026. Maria Hanlon presents: Soul Satisfaction was recently selected as a Resident Advisor Pick - an editorial selection showcasing the best events in London.",
  },
  {
    index: "02",
    title: "The Standard, London",
    type: "Hotel residency",
    location: "King's Cross",
    headline: "Four years of monthly residency across two very different rooms",
    brief:
      "Hold a recurring music programme for one of London's most music-literate hotels, across a ground floor lounge that runs from breakfast to 2am and a tenth floor rooftop bar that opens as a discotheque. Two rooms, two crowds, one identity, month after month.",
    delivered:
      "Voices has programmed a monthly residency at The Standard, London for four years, moving between the Library Lounge and the Sweeties rooftop. Each night Voices curates the talent for both rooms, holds the musical identity consistent from month to month, and manages artist liaison and delivery.",
    // VERIFY: confirm exact start date and residency date count before launch
    scale:
      "Monthly since July 2022, ongoing. More than 40 residency dates delivered.",
    proof:
      "Now in its fourth year, making it the longest continuous music residency Voices holds.",
  },
  {
    index: "03",
    title: "Two Tribes Campfire",
    type: "Venue and cultural programme",
    location: "Tileyard, King's Cross",
    headline:
      "Four years of year-round programming, and a talent pipeline to go with it",
    brief:
      "Develop Campfire as a music destination as well as a brewery and taproom, increasing drink and event sales, combining regular trading-night programming with larger headline events and cultural moments.",
    delivered:
      "As Campfire's retained promoter, Voices curates and promotes the ongoing music programme: regular DJ programming across Thursday, Friday and Saturday trading, artist and collective sourcing, headline-led day parties, guest takeovers, record fairs, showcases and the annual Voices birthday events. Voices also runs a DJ workshop programme for aspiring underrepresented artists that ends with participants playing their first live club set at Campfire.",
    scale:
      "The documented partnership runs from at least June 2022 to the present. Campfire's public venue information describes Voices DJs performing regularly on Thursday, Friday and Saturday evenings.",
  },
  {
    index: "04",
    title: "Tate Modern",
    type: "Cultural programme",
    location: "Tate Corner",
    headline: "A monthly live improvisation series inside a national museum",
    brief:
      "Programme a recurring, free-to-attend evening series for Tate Modern's Corner Bar that brings real London jazz credibility into a national institution and gives the space its own identity after hours, featured in Time Out London.",
    delivered:
      "Voices curates the artist roster and programmes the series in partnership with Tate, bringing together players from the London jazz scene for unrehearsed live improvisation, with vinyl DJ sets between performances.",
    scale:
      "Natural Jazz x Voices Radio runs monthly on first Fridays at Tate Modern's Corner Bar, free to attend.",
  },
  {
    index: "05",
    title: "Dr. Martens",
    type: "Brand and retail programme",
    location: "Camden",
    headline: "DJs for a flagship store's in-store programme",
    brief:
      "Provide music for in-store activations at Dr. Martens' Camden flagship and Oxford St stores, a retail space built around a permanent stage, where the music has to hold a crowd in a shop rather than a club.",
    delivered:
      "Voices supplies DJs for in-store events, sourcing and booking talent that suits the brand's heritage and the store's audience, as well as supplying full AV and production, and managing delivery on the day.",
    scale: "Ongoing, across the in-store events programme.",
  },
  {
    index: "06",
    title: "Aperol",
    type: "Brand activation",
    location: "Hackney Wick",
    headline: "Music programming for a three-week brand residency",
    brief:
      "Support Aperol Spritz's Aperidisco residency at Hackney Bridge: a three-week takeover combining DJ programming with supper clubs, masterclasses and BBQ weekends, needing a sound that carried a brand campaign without feeling like one.",
    delivered:
      "Voices programmed DJ talent across all three weeks of the residency, and ran DJ mixing masterclasses drawing on the station's existing education programme. This was the second year Voices collaborated on the activation, previously working on the same project at Battersea Power Station.",
    scale:
      "Aperidisco ran at Hackney Bridge from 13 to 29 June 2025, combining DJ programming, supper clubs with chef Robin Gill, masterclasses and BBQ days.",
    proof:
      "Voices Radio is credited by Aperol in the campaign's public event programme.",
  },
];

export const whyVoices = [
  {
    title: "A working radio station, not an agency database",
    description:
      "Voices is a working radio station with a studio, a schedule and three hundred-plus resident DJs, presenters and guests through the door every month. This is where our insight comes from. We're in contact with DJs, broadcasters, musicians and producers continuously, so we know who's improving, who delivers on a difficult night, and who's about to be the next big thing.",
  },
  {
    title: "We understand what a venue has to solve",
    description:
      "Licensing, capacity, noise conditions, trading patterns and staffing all shape what a programme can be. We build around them rather than discovering them on the night.",
  },
  {
    title: "Clients keep us around",
    description:
      "Four years of monthly residency at The Standard. Four years programming Campfire. A second year retained at Hackney Bridge. We are judged on whether the programme still works in year three, not by the first party.",
  },
  {
    title: "A talent pipeline of our own",
    description:
      "Our workshop programmes have taken people from a first lesson to their first paid club and festival sets. That pipeline feeds the roster our clients book from.",
  },
  {
    title: "One accountable point of contact",
    description:
      "Every brief runs through one person, from first conversation to delivery on the night, rather than being split across a rotating team.",
  },
];

export const process = [
  {
    title: "Brief",
    description:
      "We look at the space, the audience, the trading pattern, the dates and the budget.",
  },
  {
    title: "Curate",
    description:
      "We shape the musical direction and recommend the talent to deliver it.",
  },
  {
    title: "Confirm",
    description:
      "We agree the programme, the commercial terms and what's needed to run it: production, licensing, staffing.",
  },
  {
    title: "Deliver",
    description:
      "We manage artist communication and delivery, and we're contactable on the night.",
  },
  {
    title: "Refine",
    description:
      "For recurring programmes, we review what worked and build the calendar around it.",
  },
];

export const testimonials = [
  {
    quote:
      "It was an absolute pleasure working with Toby and Kit from Voices last year at The Standard, London. The love and energy they put into their ground floor Summer residency and NYE party demonstrated their drive to create accessible and positive spaces for their community, which is at the heart of everything Voices Radio does.",
    name: "Riya",
    role: "Head of Programming, The Standard Hotel",
  },
  {
    quote:
      "Working with Voices Radio has been an absolute pleasure. The team have established a rich community network, enabling them to curate exceptional events giving a diverse mix of artists an opportunity to perform and share their music. They are passionate and professional, and they know how to throw a great party!",
    name: "Dylan",
    role: "Marketing Manager, Two Tribes Brewery",
  },
  {
    quote:
      "The people over at Voices Radio are easily up there with the best I've worked with - great communication in the run up to events, as well as post event, with everything running smoothly. They always bring the best DJs to 1001 who fit the venue's setting perfectly, and our staff always have a great time working their events here.",
    name: "Leo",
    role: "Head of Programming, Cafe 1001",
  },
];

export const faq = [
  {
    question: "Do you only work with venues?",
    answer:
      "No. We work with brands, cultural institutions and developments as well as hospitality.",
  },
  {
    question: "What size of space do you programme?",
    answer:
      "Anywhere from a 150-capacity bar to a 2,000-capacity site. We regularly run several at once on the same site.",
  },
  {
    question: "Can you take on a whole calendar?",
    answer:
      "Yes, and that's most of what we do. We work with venues on an ongoing retained basis as well as on individual dates.",
  },
  {
    question: "Do you handle production and licensing?",
    answer:
      "We work alongside your operations team on what the programme needs, including production, sound, staffing and licensing conditions, so the calendar is deliverable rather than just designed.",
  },
  {
    question: "Do you do one-off private events?",
    answer: "Yes, though our strength is programmes that recur.",
  },
  {
    question: "How quickly can you start?",
    answer:
      "Single dates can move quickly. A managed calendar usually needs four to six weeks to build properly.",
  },
];

// TODO: fill in before launch and flip SHOW_CONTACT_BLOCK to true
export const contactPerson = {
  name: "[NAME]",
  role: "[ROLE]",
  line: "Every brief comes to one person, from first conversation through to delivery.",
  photoSrc: null as string | null,
};
