/* =====================================================================
   RevAlpha — Shared data module
   Illustrative datasets for charts and structured content used across
   the site. All figures are illustrative unless labelled otherwise.
   ===================================================================== */
window.RevAlphaData = (function () {
  "use strict";

  /* ---- Illustrative chart series (indexed 0-100 style) ---- */
  const charts = {
    heroAdr: [38, 42, 40, 47, 52, 49, 58, 63, 60, 68, 74, 79, 76, 84],
    heroOcc: [52, 55, 58, 57, 62, 66, 64, 70, 73, 71, 78, 82, 85, 88],
    heroRevpar: [30, 34, 33, 39, 44, 42, 50, 55, 53, 61, 67, 72, 70, 79],

    adr: [40, 44, 43, 49, 54, 52, 60, 66, 63, 71, 77, 82],
    occupancy: [48, 52, 50, 56, 61, 59, 66, 70, 68, 75, 80, 84],
    revpar: [32, 36, 35, 41, 46, 44, 52, 57, 55, 63, 69, 74],
    pickup: [22, 34, 28, 46, 40, 58, 52, 70, 64, 82, 76, 90],
    competitor: [58, 62, 60, 66, 71, 69, 74, 78, 76, 82, 86, 90],
    channel: [
      { label: "Direct", value: 28, color: "#EAD06A" },
      { label: "OTA", value: 44, color: "#8FD4B3" },
      { label: "Corporate", value: 18, color: "#082B50" },
      { label: "Walk-in", value: 10, color: "#E98972" }
    ],
    weekly: [46, 58, 52, 66, 72, 88, 80]
  };

  /* ---- Hotel types (verified positioning from source content) ---- */
  const hotelTypes = [
    {
      id: "resort-leisure",
      abbr: "RL",
      name: "Resort & Leisure Hotel",
      tagline: "Seasonal demand, priced ahead of the calendar.",
      short: "Pricing that moves with school holidays, festivals and long weekends, plus OTA management that keeps your resort visible when leisure demand peaks.",
      image: "img/hotel-resort.webp",
      url: "hotel-type-resort-leisure.html"
    },
    {
      id: "business",
      abbr: "BH",
      name: "Business Hotel",
      tagline: "Weekday demand, held all week.",
      short: "Weekday corporate demand, city events and OTA visibility managed together, so your business hotel stays full from Monday to Sunday.",
      image: "img/hotel-business.webp",
      url: "hotel-type-business-hotels.html"
    },
    {
      id: "boutique",
      abbr: "BQ",
      name: "Boutique Hotel",
      tagline: "Protect your rate and your story.",
      short: "Protect your rate and your story. Premium pricing without losing room nights, and a stronger share of direct bookings.",
      image: "img/hotel-boutique.webp",
      url: "hotel-type-boutique-hotels.html"
    },
    {
      id: "premium-luxury",
      abbr: "LX",
      name: "Premium & Luxury Hotel",
      tagline: "Rate integrity, ADR and RevPAR.",
      short: "Rate integrity and revenue strategy that protect your brand position while growing ADR and RevPAR.",
      image: "img/hotel-luxury.webp",
      url: "hotel-type-premium-luxury.html"
    },
    {
      id: "serviced-apartments",
      abbr: "SA",
      name: "Serviced Apartment",
      tagline: "Priced by length of stay.",
      short: "Length-of-stay pricing across daily, weekly and monthly guests, with OTA listing management for extended stays.",
      image: "img/hotel-serviced-apartment.webp",
      url: "hotel-type-serviced-apartments.html"
    },
    {
      id: "villas-homestays",
      abbr: "VH",
      name: "Villas & Homestays",
      tagline: "Listed, ranked and booking-ready.",
      short: "Get listed and ranked on Airbnb, Booking.com and other OTAs with smart pricing that fills your calendar.",
      image: "img/hotel-villa.webp",
      url: "hotel-type-villas-homestays.html"
    },
    {
      id: "budget",
      abbr: "BG",
      name: "Budget Hotel",
      tagline: "Simple setup, steady occupancy.",
      short: "Built for 10- to 20-room hotels and guest houses: OTA listing, rate setup and simple promotions, handled for you.",
      image: "img/hotel-budget.webp",
      url: "hotel-type-budget-hotels.html"
    },
    {
      id: "hotel-groups",
      abbr: "GR",
      name: "Group of Hotels",
      tagline: "One strategy, many properties.",
      short: "One revenue strategy across multiple properties, with portfolio reporting and OTA management for hotel groups and chains.",
      image: "img/hotel-group.webp",
      url: "hotel-type-hotel-groups.html"
    }
  ];

  /* ---- Plans (verified pricing from source content) ---- */
  const plans = [
    {
      id: "express-setup",
      name: "Express Setup",
      use: "For initial setup and baseline work.",
      price: "\u20B915,000",
      period: "One-time",
      featured: false,
      features: [
        "Access collection and property review",
        "Baseline analysis",
        "Initial competitor validation",
        "Revenue setup recommendations",
        "Structured onboarding plan"
      ]
    },
    {
      id: "amc",
      name: "AMC",
      use: "For ongoing listing, setup and monthly optimisation.",
      price: "\u20B930,000",
      period: "For 3 months",
      featured: false,
      features: [
        "Get listed on OTAs",
        "Channel manager integration and setup",
        "Monthly rates and offer optimisation",
        "Monthly report"
      ]
    },
    {
      id: "standard",
      name: "Standard",
      use: "For essential revenue monitoring and regular recommendations.",
      price: "\u20B920,000",
      period: "Per month",
      featured: true,
      features: [
        "Get listed on OTAs and optimise existing listings",
        "Dynamic pricing",
        "Day-to-day rate management based on availability",
        "Biweekly revenue updates",
        "Monthly report",
        "Weekly review replies across OTAs",
        "Dedicated RM"
      ]
    },
    {
      id: "gold",
      name: "Gold",
      use: "For broader revenue management support, reviews and proactive opportunities.",
      price: "\u20B930,000",
      period: "Per month",
      featured: false,
      features: [
        "Dynamic pricing based on demand and availability",
        "Weekly compset vs 2 competitors",
        "Weekly and monthly revenue reports",
        "Demand forecasting",
        "ORM report",
        "Biweekly and monthly review meet",
        "Dedicated RM"
      ]
    },
    {
      id: "platinum",
      name: "Platinum",
      use: "For deeper strategic support, more frequent analysis and complex properties.",
      price: "\u20B950,000",
      period: "Per month",
      featured: false,
      features: [
        "Dynamic pricing based on demand and availability",
        "Weekly compset with our AI-powered internal tool",
        "Weekly and monthly revenue reports",
        "Demand forecasting with our internal AI-powered tool",
        "ORM report with deep insights and competitor set comparison",
        "Automated review replies within an hour",
        "Weekly and monthly review meet",
        "Dedicated RM + RM Head"
      ]
    }
  ];

  /* ---- Operating rhythm (verified table) ---- */
  const rhythm = [
    { activity: "Rate review", standard: "Daily on working days, more often when the scope requires" },
    { activity: "Pickup review", standard: "Daily" },
    { activity: "Competitor rate review", standard: "Daily for priority dates, regular for the wider calendar" },
    { activity: "Critical revenue issue", standard: "Priority attention" },
    { activity: "Weekly update", standard: "Fixed day for Performance plan and above" },
    { activity: "Monthly review", standard: "Scheduled revenue strategy meeting" },
    { activity: "Action items", standard: "Every action gets an owner and a deadline" },
    { activity: "Revenue opportunities", standard: "Proactive alert before the hotel has to ask" }
  ];

  /* ---- FAQs (verified answers) ---- */
  const faqs = [
    {
      q: "Will RevAlpha guarantee my revenue?",
      a: "No. Revenue depends on demand, product quality, reputation, operations, inventory and market conditions. We provide professional hotel revenue management services: strategy, execution and daily monitoring, not unrealistic promises."
    },
    {
      q: "Do you manage OTAs?",
      a: "Yes, within the agreed scope. RevAlpha is also an OTA management company for hotels, but OTAs are one part of your wider pricing and distribution strategy, not the whole job."
    },
    {
      q: "Do I need an in-house revenue manager too?",
      a: "For most independent hotels, no. Our plans are designed to work as your outsourced revenue department. Larger hotels may use RevAlpha alongside an internal team."
    },
    {
      q: "Can you work with my PMS or channel manager?",
      a: "Usually yes, subject to access and your technology setup. Third-party software fees stay separate unless specifically included."
    },
    {
      q: "Do you also provide marketing?",
      a: "RevAlpha focuses on revenue. Social media, SEO, websites and paid campaigns are handled by our parent company, Hospitality Minds, which has worked with 800+ hotels across 48 cities in India."
    },
    {
      q: "How quickly can we start?",
      a: "After commercial confirmation, we begin with access collection, baseline analysis, competitor validation and a structured onboarding plan."
    }
  ];

  /* ---- Contact form options ---- */
  const propertyTypes = [
    "Resort & Leisure Hotel", "Business Hotel", "Boutique Hotel", "Premium & Luxury Hotel",
    "Serviced Apartment", "Villas & Homestays", "Budget Hotel", "Group of Hotels"
  ];
  const challenges = [
    "Weak occupancy on selected dates", "Rates are not changing confidently",
    "OTA performance needs improvement", "Need better pickup visibility",
    "ADR or RevPAR needs improvement", "No in-house revenue manager",
    "Need portfolio-level reporting", "Other"
  ];

  return { charts, hotelTypes, plans, rhythm, faqs, propertyTypes, challenges };
})();
