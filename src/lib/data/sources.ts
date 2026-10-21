/**
 * Simulated connected sources. In production these are HubSpot, TRC's past
 * reports database and Gemini; here they are static fixtures so the
 * prototype runs with no API keys and no database.
 */
import type { HubspotCompany, HubspotContact, ResearchSource, TrcItem } from "@/lib/types";

const P = "/images/people";
const C = "/images/covers";

export const HUBSPOT_COMPANIES: HubspotCompany[] = [
  {
    id: "HS-CO-1001",
    name: "Northstar Technologies",
    domain: "northstartechnologies.com",
    industry: "Technology",
    city: "London",
    country: "United Kingdom",
    employees: "2,400",
    founded: "2004",
    markets: "30+ countries",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["UK Technology & Innovation 2023", "Global Technology and Innovation Report 2025"],
    description:
      "Northstar Technologies develops digital infrastructure and business technology for organisations around the world. The company focuses on secure, reliable platforms that help organisations modernise their operations and connect with customers. Its work spans cloud services, data solutions and enterprise software.",
    descriptor: "a London-based provider of digital infrastructure and enterprise technology",
    updatedAt: "2026-09-12",
  },
  {
    id: "HS-CO-1002",
    name: "Gulfstream Logistics Group",
    domain: "gulfstreamlogistics.ae",
    industry: "Logistics & Transport",
    city: "Dubai",
    country: "United Arab Emirates",
    employees: "6,800",
    founded: "1996",
    markets: "40+ countries",
    lifecycle: "Customer",
    pastAdvertiser: ["UAE: Connecting Continents 2024"],
    description:
      "Gulfstream Logistics Group operates integrated freight, warehousing and port-side services linking the Gulf with markets across Africa, Asia and Europe. The group manages multimodal corridors that combine sea, air and road freight on a single digital platform.",
    descriptor: "an integrated logistics group connecting the Gulf with Africa, Asia and Europe",
    updatedAt: "2026-08-30",
  },
  {
    id: "HS-CO-1003",
    name: "Volta Power Holdings",
    domain: "voltapower.com.gh",
    industry: "Energy",
    city: "Accra",
    country: "Ghana",
    employees: "1,150",
    founded: "2008",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["Ghana: Gateway to West Africa 2024"],
    description:
      "Volta Power Holdings develops and operates power generation assets serving industrial and residential customers in Ghana. Its portfolio combines gas-fired capacity with a growing pipeline of solar projects.",
    descriptor: "a Ghanaian independent power producer",
    updatedAt: "2026-07-18",
  },
  {
    id: "HS-CO-1004",
    name: "Meridian Digital Payments",
    domain: "meridianpay.in",
    industry: "Financial Services",
    city: "Mumbai",
    country: "India",
    employees: "900",
    founded: "2014",
    lifecycle: "Customer",
    pastAdvertiser: ["India: The Digital Decade 2025"],
    description:
      "Meridian Digital Payments provides payment infrastructure for merchants, banks and public programmes across India. Its platforms process real-time transactions for small businesses in more than 600 cities.",
    descriptor: "an Indian payments infrastructure company",
    updatedAt: "2026-09-02",
  },
  {
    id: "HS-CO-1005",
    name: "Savanna Agritech",
    domain: "savanna-agritech.co.ke",
    industry: "Agriculture & Food",
    city: "Nairobi",
    country: "Kenya",
    employees: "420",
    founded: "2016",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["Kenya: Africa's Innovation Hub 2024"],
    description:
      "Savanna Agritech connects smallholder farmers with finance, inputs and buyers through a mobile-first platform. The company works with farming cooperatives across East Africa to improve yields and incomes.",
    descriptor: "a Kenyan agricultural technology company",
    updatedAt: "2026-06-21",
  },
  {
    id: "HS-CO-1006",
    name: "Atlas Maritime Authority",
    domain: "atlasmaritime.ma",
    industry: "Logistics & Transport",
    city: "Tangier",
    country: "Morocco",
    employees: "1,900",
    founded: "2002",
    lifecycle: "Customer",
    pastAdvertiser: ["Morocco: Bridging Europe and Africa 2025"],
    description:
      "Atlas Maritime Authority oversees the development and operation of a major port and logistics complex on the Strait of Gibraltar. The authority manages concessions, industrial zones and maritime services that connect Morocco to more than 180 ports worldwide.",
    descriptor: "the authority responsible for a major port and logistics complex on the Strait of Gibraltar",
    updatedAt: "2026-09-08",
  },
  {
    id: "HS-CO-1007",
    name: "Cordillera Minerals",
    domain: "cordilleraminerals.pe",
    industry: "Mining & Metals",
    city: "Lima",
    country: "Peru",
    employees: "3,200",
    founded: "1989",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["Peru: Building on Strong Foundations 2024"],
    description:
      "Cordillera Minerals is a copper and silver producer with operations in the Peruvian Andes. The company has invested in water recycling and community development programmes around its mine sites.",
    descriptor: "a Peruvian copper and silver producer",
    updatedAt: "2026-05-14",
  },
  {
    id: "HS-CO-1008",
    name: "Nordvik Renewables",
    domain: "nordvik.se",
    industry: "Energy",
    city: "Gothenburg",
    country: "Sweden",
    employees: "1,300",
    founded: "2011",
    lifecycle: "Lead",
    description:
      "Nordvik Renewables develops offshore wind and energy storage projects in Northern Europe. The company partners with utilities and industrial customers to supply long-term renewable power.",
    descriptor: "a Swedish offshore wind and storage developer",
    updatedAt: "2026-08-04",
  },
  {
    id: "HS-CO-1009",
    name: "Thames Advisory Partners",
    domain: "thamesadvisory.co.uk",
    industry: "Professional Services",
    city: "London",
    country: "United Kingdom",
    employees: "310",
    founded: "2001",
    lifecycle: "Customer",
    pastAdvertiser: ["UK: Global Britain in Focus 2025"],
    description:
      "Thames Advisory Partners advises governments, investors and companies on cross-border investment, infrastructure finance and public-private partnerships. The firm has supported transactions in more than 50 countries.",
    descriptor: "a London advisory firm specialising in cross-border investment",
    updatedAt: "2026-09-19",
  },
  {
    id: "HS-CO-1010",
    name: "Verde Agro Brasil",
    domain: "verdeagro.com.br",
    industry: "Agriculture & Food",
    city: "São Paulo",
    country: "Brazil",
    employees: "5,400",
    founded: "1994",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["Brazil: Agribusiness Powerhouse 2025"],
    description:
      "Verde Agro Brasil produces and exports grains, coffee and sugar from farms across four Brazilian states. The company has expanded into precision agriculture and low-carbon farming practices.",
    descriptor: "a Brazilian agribusiness and export group",
    updatedAt: "2026-09-25",
  },
  {
    id: "HS-CO-1011",
    name: "Mekong Textiles",
    domain: "mekongtextiles.vn",
    industry: "Manufacturing",
    city: "Ho Chi Minh City",
    country: "Vietnam",
    employees: "7,200",
    founded: "1999",
    lifecycle: "Customer",
    pastAdvertiser: ["Vietnam: Rising Manufacturing Hub 2025"],
    description:
      "Mekong Textiles manufactures garments and technical fabrics for international apparel brands. The company operates five factories in southern Vietnam and has invested in water-efficient dyeing technology.",
    descriptor: "a Vietnamese garment and technical fabrics manufacturer",
    updatedAt: "2026-10-02",
  },
  {
    id: "HS-CO-1012",
    name: "Sahel Health Partners",
    domain: "sahelhealth.ng",
    industry: "Healthcare & Life Sciences",
    city: "Abuja",
    country: "Nigeria",
    employees: "1,050",
    founded: "2012",
    lifecycle: "Customer",
    pastAdvertiser: ["Nigeria: Unlocking Potential 2026"],
    description:
      "Sahel Health Partners operates diagnostic centres and specialist clinics across northern and central Nigeria. The group is expanding telemedicine services to reach patients in rural communities.",
    descriptor: "a Nigerian diagnostics and specialist care group",
    updatedAt: "2026-10-10",
  },
  {
    id: "HS-CO-1013",
    name: "Rheinwerk Industrial",
    domain: "rheinwerk.de",
    industry: "Manufacturing",
    city: "Düsseldorf",
    country: "Germany",
    employees: "4,600",
    founded: "1952",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["Germany: Engineering the Future 2024"],
    description:
      "Rheinwerk Industrial manufactures precision components and automation systems for the automotive and energy sectors. The family-founded company exports to more than 40 countries.",
    descriptor: "a German precision engineering and automation manufacturer",
    updatedAt: "2026-07-09",
  },
  {
    id: "HS-CO-1014",
    name: "Pacífica Capital",
    domain: "pacificacapital.mx",
    industry: "Financial Services",
    city: "Mexico City",
    country: "Mexico",
    employees: "640",
    founded: "2006",
    lifecycle: "Prospect",
    description:
      "Pacífica Capital provides corporate lending, trade finance and investment banking services to mid-sized companies in Mexico and Central America.",
    descriptor: "a Mexican corporate and investment bank",
    updatedAt: "2026-09-27",
  },
  {
    id: "HS-CO-1015",
    name: "Ubuntu Telecoms",
    domain: "ubuntutelecoms.co.za",
    industry: "Telecommunications",
    city: "Johannesburg",
    country: "South Africa",
    employees: "2,700",
    founded: "2003",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["South Africa: A Nation Renewed 2023"],
    description: "Ubuntu Telecoms provides mobile, fibre and enterprise connectivity services across South Africa.",
    descriptor: "a South African mobile and fibre operator",
    updatedAt: "2023-11-03",
  },
  {
    id: "HS-CO-1016",
    name: "Hollandia Water Technologies",
    domain: "hollandiawater.nl",
    industry: "Water & Environment",
    city: "Rotterdam",
    country: "Netherlands",
    employees: "780",
    founded: "1978",
    lifecycle: "Customer",
    description:
      "Hollandia Water Technologies designs water treatment, desalination and flood-management systems for cities and industry. Its engineers have delivered projects on five continents.",
    descriptor: "a Dutch water technology company",
    updatedAt: "2026-06-11",
  },
  {
    id: "HS-CO-1017",
    name: "Archipelago Power Corporation",
    domain: "archipelagopower.ph",
    industry: "Energy",
    city: "Manila",
    country: "Philippines",
    employees: "3,900",
    founded: "1997",
    lifecycle: "Past advertiser",
    pastAdvertiser: ["Philippines: Powering Growth 2025"],
    description:
      "Archipelago Power Corporation generates and distributes electricity across Luzon and the Visayas. The company is investing in grid modernisation and new solar and wind capacity to meet rising demand.",
    descriptor: "a Philippine power generation and distribution company",
    updatedAt: "2026-09-29",
  },
  {
    id: "HS-CO-1018",
    name: "Okafor Pharmaceuticals",
    domain: "okaforpharma.ng",
    industry: "Healthcare & Life Sciences",
    city: "Lagos",
    country: "Nigeria",
    employees: "1,600",
    founded: "1985",
    lifecycle: "Customer",
    pastAdvertiser: ["Nigeria: Unlocking Potential 2026"],
    description:
      "Okafor Pharmaceuticals manufactures generic medicines and over-the-counter products for markets across West Africa. The company operates two production facilities in Lagos State.",
    descriptor: "a Nigerian pharmaceutical manufacturer",
    updatedAt: "2026-04-17",
  },
];

export const HUBSPOT_CONTACTS: HubspotContact[] = [
  { id: "48213", name: "Alex Morgan", title: "Chief Executive Officer", email: "alex.morgan@northstartechnologies.com", phone: "+44 20 7946 0321", companyId: "HS-CO-1001", owner: "Sarah Whitfield", lastActivity: "2026-09-12" },
  { id: "51007", name: "Layla Al-Mansouri", title: "Group Chief Executive Officer", email: "l.almansouri@gulfstreamlogistics.ae", companyId: "HS-CO-1002", owner: "James Okoro", lastActivity: "2026-08-30" },
  { id: "39922", name: "Kwame Mensah", title: "Managing Director & CEO", email: "kwame.mensah@voltapower.com.gh", companyId: "HS-CO-1003", owner: "Elena Petrova", lastActivity: "2026-07-18" },
  { id: "44120", name: "Rahul Mehta", title: "Founder & Chief Executive Officer", email: "rahul@meridianpay.in", companyId: "HS-CO-1004", owner: "Sarah Whitfield", lastActivity: "2026-09-02" },
  { id: "40311", name: "Grace Wanjiru", title: "Chief Executive Officer", email: "grace.wanjiru@savanna-agritech.co.ke", companyId: "HS-CO-1005", owner: "James Okoro", lastActivity: "2026-06-21" },
  { id: "45876", name: "Omar Haddad", title: "Director General", email: "o.haddad@atlasmaritime.ma", companyId: "HS-CO-1006", owner: "Elena Petrova", lastActivity: "2026-09-08" },
  { id: "37754", name: "Mateo Fernández", title: "Chief Executive Officer", email: "mfernandez@cordilleraminerals.pe", companyId: "HS-CO-1007", owner: "Sarah Whitfield", lastActivity: "2026-05-14" },
  { id: "46102", name: "James Whitaker", title: "Chief Executive", email: "j.whitaker@thamesadvisory.co.uk", companyId: "HS-CO-1009", owner: "Sarah Whitfield", lastActivity: "2026-09-19" },
  { id: "47731", name: "Mariana Costa", title: "Chief Executive Officer", email: "mariana.costa@verdeagro.com.br", companyId: "HS-CO-1010", owner: "Elena Petrova", lastActivity: "2026-09-25" },
  { id: "48890", name: "Nguyen Thi Lan", title: "General Director", email: "lan.nguyen@mekongtextiles.vn", companyId: "HS-CO-1011", owner: "James Okoro", lastActivity: "2026-10-02" },
  { id: "49015", name: "Aisha Bello", title: "Chief Executive Officer", email: "a.bello@sahelhealth.ng", companyId: "HS-CO-1012", owner: "Sarah Whitfield", lastActivity: "2026-10-10" },
  { id: "42260", name: "Hannah Schmidt", title: "Chief Executive Officer", email: "h.schmidt@rheinwerk.de", companyId: "HS-CO-1013", owner: "Elena Petrova", lastActivity: "2026-07-09" },
  { id: "48555", name: "Carlos Mendoza", title: "Director General", email: "cmendoza@pacificacapital.mx", companyId: "HS-CO-1014", owner: "James Okoro", lastActivity: "2026-09-27" },
  { id: "31408", name: "Thabo Nkosi", title: "Chief Operating Officer", email: "thabo.nkosi@ubuntutelecoms.co.za", companyId: "HS-CO-1015", owner: "Sarah Whitfield", lastActivity: "2023-11-03" },
  { id: "43377", name: "Pieter de Vries", title: "Chief Executive Officer", email: "p.devries@hollandiawater.nl", companyId: "HS-CO-1016", owner: "Elena Petrova", lastActivity: "2026-06-11" },
  { id: "49981", name: "Daniel Reyes", title: "President & Chief Executive Officer", email: "daniel.reyes@archipelagopower.ph", companyId: "HS-CO-1017", owner: "Sarah Whitfield", lastActivity: "2026-09-29" },
  { id: "41204", name: "Amara Okafor", title: "Executive Director", email: "amara.okafor@okaforpharma.ng", companyId: "HS-CO-1018", owner: "James Okoro", lastActivity: "2026-04-17" },
];

const item = (x: TrcItem) => x;

export const TRC_REPORTS: TrcItem[] = [
  item({ id: "trc-1001", type: "article", title: "Building the Next Generation of Global Technology", excerpt: "Alex Morgan discusses how innovation, talent and cross-border collaboration are shaping a more connected and sustainable future.", date: "2025-03-18", image: `${C}/london.jpg`, url: "https://trc.com/articles/next-generation-global-technology", publication: "UK Technology & Innovation", entities: ["Alex Morgan", "Northstar Technologies"] }),
  item({ id: "trc-1002", type: "profile", title: "Leadership Profile: Alex Morgan", excerpt: "An in-depth look at Alex Morgan's leadership journey, approach to building high-performing teams and vision for the future of technology.", date: "2024-11-05", image: `${P}/alex-morgan.jpg`, url: "https://trc.com/profiles/alex-morgan", publication: "TRC Leadership Series", entities: ["Alex Morgan", "Northstar Technologies"] }),
  item({ id: "trc-1003", type: "report", title: "Global Technology and Innovation Report", excerpt: "A comprehensive analysis of the trends, opportunities and challenges shaping the global technology landscape, featuring insights from industry leaders including Alex Morgan.", date: "2025-06-10", image: `${C}/mountains-clouds.jpg`, url: "https://trc.com/reports/global-technology-innovation", publication: "Special report", entities: ["Northstar Technologies", "Alex Morgan", "Meridian Digital Payments"] }),
  item({ id: "trc-1004", type: "article", title: "The Gulf's New Trade Corridors", excerpt: "How integrated logistics is turning the Gulf into a bridge between Africa, Asia and Europe.", date: "2024-09-12", image: `${C}/dubai.jpg`, url: "https://trc.com/articles/gulf-trade-corridors", publication: "UAE: Connecting Continents", entities: ["Layla Al-Mansouri", "Gulfstream Logistics Group"] }),
  item({ id: "trc-1005", type: "report", title: "UAE: Connecting Continents", excerpt: "TRC's report on the investment, infrastructure and leadership behind the UAE's role in global trade.", date: "2024-09-01", image: `${C}/container-ship.jpg`, url: "https://trc.com/reports/uae-connecting-continents", publication: "Country report", entities: ["Gulfstream Logistics Group", "Layla Al-Mansouri"] }),
  item({ id: "trc-1006", type: "article", title: "Powering Ghana's Industrial Future", excerpt: "Kwame Mensah on reliable generation, solar investment and the energy needs of a growing economy.", date: "2024-05-21", image: `${C}/power-lines.jpg`, url: "https://trc.com/articles/powering-ghana", publication: "Ghana: Gateway to West Africa", entities: ["Kwame Mensah", "Volta Power Holdings"] }),
  item({ id: "trc-1007", type: "report", title: "Ghana: Gateway to West Africa", excerpt: "Investment opportunities across energy, agriculture and finance in one of the region's most stable economies.", date: "2024-05-02", image: `${C}/solar.jpg`, url: "https://trc.com/reports/ghana-gateway", publication: "Country report", entities: ["Volta Power Holdings", "Kwame Mensah"] }),
  item({ id: "trc-1008", type: "article", title: "Reaching India's Next 500 Million Digital Customers", excerpt: "Rahul Mehta explains how real-time payments are bringing small businesses into the formal economy.", date: "2025-02-14", image: `${C}/analytics.jpg`, url: "https://trc.com/articles/india-digital-payments", publication: "India: The Digital Decade", entities: ["Rahul Mehta", "Meridian Digital Payments"] }),
  item({ id: "trc-1009", type: "article", title: "Kenya's Agritech Pioneers", excerpt: "Grace Wanjiru on connecting smallholder farmers with finance, inputs and new markets.", date: "2024-07-08", image: `${C}/farmland.jpg`, url: "https://trc.com/articles/kenya-agritech", publication: "Kenya: Africa's Innovation Hub", entities: ["Grace Wanjiru", "Savanna Agritech"] }),
  item({ id: "trc-1010", type: "report", title: "Kenya: Africa's Innovation Hub", excerpt: "How technology, finance and agriculture are combining to drive East Africa's next phase of growth.", date: "2024-06-24", image: `${C}/earth-network.jpg`, url: "https://trc.com/reports/kenya-innovation-hub", publication: "Country report", entities: ["Savanna Agritech", "Grace Wanjiru"] }),
  item({ id: "trc-1011", type: "article", title: "A Blueprint for Port-Led Growth", excerpt: "Omar Haddad on industrial zones, maritime services and Morocco's position between two continents.", date: "2025-04-29", image: `${C}/port.jpg`, url: "https://trc.com/articles/port-led-growth", publication: "Morocco: Bridging Europe and Africa", entities: ["Omar Haddad", "Atlas Maritime Authority"] }),
  item({ id: "trc-1012", type: "report", title: "Morocco: Bridging Europe and Africa", excerpt: "Infrastructure, renewable energy and manufacturing at the meeting point of two continents.", date: "2025-04-15", image: `${C}/construction.jpg`, url: "https://trc.com/reports/morocco-bridging", publication: "Country report", entities: ["Atlas Maritime Authority", "Omar Haddad", "Maghreb Green Hydrogen"] }),
  item({ id: "trc-1013", type: "article", title: "Responsible Mining in the Andes", excerpt: "Mateo Fernández on water recycling, community partnerships and copper's role in the energy transition.", date: "2024-10-03", image: `${C}/andes.jpg`, url: "https://trc.com/articles/responsible-mining-andes", publication: "Peru: Building on Strong Foundations", entities: ["Mateo Fernández", "Cordillera Minerals"] }),
  item({ id: "trc-1014", type: "profile", title: "Leadership Profile: Sofia Lindqvist", excerpt: "Building offshore wind at scale — and the partnerships that make it bankable.", date: "2025-08-19", image: `${C}/offshore-wind.jpg`, url: "https://trc.com/profiles/sofia-lindqvist", publication: "Nordic Energy Transition", entities: ["Sofia Lindqvist", "Nordvik Renewables"] }),
  item({ id: "trc-1015", type: "article", title: "Modernising the Grid for a Growing Economy", excerpt: "Daniel Reyes on grid investment, renewables and meeting rising demand across the islands.", date: "2025-05-27", image: `${C}/wind-sunset.jpg`, url: "https://trc.com/articles/philippines-grid", publication: "Philippines: Powering Growth", entities: ["Daniel Reyes", "Archipelago Power Corporation"] }),
  item({ id: "trc-1016", type: "report", title: "Philippines: Powering Growth", excerpt: "Energy, infrastructure and the investment needed to sustain one of Asia's fastest-growing economies.", date: "2025-05-12", image: `${C}/solar.jpg`, url: "https://trc.com/reports/philippines-powering-growth", publication: "Country report", entities: ["Archipelago Power Corporation", "Daniel Reyes"] }),
  item({ id: "trc-1017", type: "article", title: "Expanding Diagnostics Beyond the Cities", excerpt: "Aisha Bello on telemedicine, specialist care and reaching patients in rural Nigeria.", date: "2026-02-10", image: `${C}/healthcare.jpg`, url: "https://trc.com/articles/nigeria-diagnostics", publication: "Nigeria: Unlocking Potential", entities: ["Aisha Bello", "Sahel Health Partners"] }),
  item({ id: "trc-1018", type: "article", title: "Inside the Smart Factory", excerpt: "How a 70-year-old engineering company is using automation to compete globally.", date: "2024-03-26", image: `${C}/manufacturing.jpg`, url: "https://trc.com/articles/inside-smart-factory", publication: "Germany: Engineering the Future", entities: ["Hannah Schmidt", "Rheinwerk Industrial"] }),
  item({ id: "trc-1019", type: "article", title: "Capital Without Borders", excerpt: "James Whitaker on infrastructure finance and the partnerships behind cross-border investment.", date: "2025-09-30", image: `${C}/skyline-night.jpg`, url: "https://trc.com/articles/capital-without-borders", publication: "UK: Global Britain in Focus", entities: ["James Whitaker", "Thames Advisory Partners"] }),
  item({ id: "trc-1020", type: "report", title: "Brazil: Agribusiness Powerhouse", excerpt: "Precision farming, exports and sustainability in the world's agricultural heartland.", date: "2025-10-14", image: `${C}/farmland.jpg`, url: "https://trc.com/reports/brazil-agribusiness", publication: "Country report", entities: ["Verde Agro Brasil", "Mariana Costa"] }),
  item({ id: "trc-1021", type: "article", title: "Connecting South Africa", excerpt: "Fibre, mobile data and the race to connect every community.", date: "2023-08-17", image: `${C}/circuit.jpg`, url: "https://trc.com/articles/connecting-south-africa", publication: "South Africa: A Nation Renewed", entities: ["Ubuntu Telecoms"] }),
  item({ id: "trc-1022", type: "article", title: "Making Medicines Locally", excerpt: "How West African manufacturers are building pharmaceutical self-reliance.", date: "2026-02-24", image: `${C}/lab.jpg`, url: "https://trc.com/articles/making-medicines-locally", publication: "Nigeria: Unlocking Potential", entities: ["Okafor Pharmaceuticals", "Amara Okafor"] }),
  item({ id: "trc-1023", type: "report", title: "Nigeria: Unlocking Potential", excerpt: "Healthcare, manufacturing and finance in Africa's largest economy.", date: "2026-02-01", image: `${C}/city-aerial.jpg`, url: "https://trc.com/reports/nigeria-unlocking-potential", publication: "Country report", entities: ["Sahel Health Partners", "Okafor Pharmaceuticals", "Aisha Bello"] }),
  item({ id: "trc-1024", type: "article", title: "Weaving Sustainability into Growth", excerpt: "Water-efficient dyeing and the future of Vietnam's textile exports.", date: "2025-07-22", image: `${C}/warehouse.jpg`, url: "https://trc.com/articles/weaving-sustainability", publication: "Vietnam: Rising Manufacturing Hub", entities: ["Nguyen Thi Lan", "Mekong Textiles"] }),
  item({ id: "trc-1025", type: "article", title: "Engineering for a Wetter World", excerpt: "Flood resilience, desalination and the export of Dutch water expertise.", date: "2025-01-28", image: `${C}/ocean.jpg`, url: "https://trc.com/articles/engineering-wetter-world", publication: "Netherlands: Innovation Delta", entities: ["Pieter de Vries", "Hollandia Water Technologies"] }),
  item({ id: "trc-1026", type: "article", title: "Harvesting Brazil's Precision Advantage", excerpt: "Mariana Costa on data-driven farming and low-carbon agriculture.", date: "2025-10-20", image: `${C}/farmland.jpg`, url: "https://trc.com/articles/brazil-precision-advantage", publication: "Brazil: Agribusiness Powerhouse", entities: ["Mariana Costa", "Verde Agro Brasil"] }),
];

/** Approved photographs held in TRC's files, keyed by normalised name. */
export const TRC_PHOTOS: Record<string, string> = {
  "alex morgan": `${P}/alex-morgan.jpg`,
  "layla al mansouri": `${P}/layla-al-mansouri.jpg`,
  "grace wanjiru": `${P}/grace-wanjiru.jpg`,
  "kwame mensah": `${P}/kwame-mensah.jpg`,
  "rahul mehta": `${P}/rahul-mehta.jpg`,
  "omar haddad": `${P}/omar-haddad.jpg`,
  "mateo fernandez": `${P}/mateo-fernandez.jpg`,
  "aisha bello": `${P}/aisha-bello.jpg`,
  "carlos mendoza": `${P}/carlos-mendoza.jpg`,
  "pieter de vries": `${P}/pieter-de-vries.jpg`,
  "james whitaker": `${P}/james-whitaker.jpg`,
  "sofia lindqvist": `${P}/sofia-lindqvist.jpg`,
  "mariana costa": `${P}/mariana-costa.jpg`,
  "hannah schmidt": `${P}/hannah-schmidt.jpg`,
  "daniel reyes": `${P}/daniel-reyes.jpg`,
};

export interface GeminiEntry {
  about: string;
  descriptor: string;
  website: string;
  industry: string;
  facts: { label: string; value: string }[];
  findings: string[];
  sources: ResearchSource[];
  /** When the research confirms the person's current role. */
  roleCheck?: { title: string; note: string };
}

/** What a Gemini research pass returns for known entities (simulated). */
export const GEMINI_KB: Record<string, GeminiEntry> = {
  "nusantara agro": {
    about:
      "Nusantara Agro is an agribusiness group producing coffee, cocoa and spices from plantations in Sumatra and Sulawesi. The company supplies food manufacturers in Asia and Europe and runs traceability programmes with smallholder partners.",
    descriptor: "an Indonesian coffee, cocoa and spice producer",
    website: "nusantaraagro.co.id",
    industry: "Agriculture & Food",
    facts: [
      { label: "Headquarters", value: "Jakarta, Indonesia" },
      { label: "Founded", value: "2001" },
      { label: "Employees", value: "2,100" },
    ],
    findings: ["Company overview and operating regions", "Headquarters and founding year", "Current leadership listing"],
    sources: [
      { title: "Nusantara Agro — About us", url: "https://nusantaraagro.co.id/about" },
      { title: "Nusantara Agro — Leadership", url: "https://nusantaraagro.co.id/leadership" },
      { title: "Annual report 2025", url: "https://nusantaraagro.co.id/investors/annual-report-2025" },
    ],
  },
  "ubuntu telecoms": {
    about:
      "Ubuntu Telecoms provides mobile, fibre and enterprise connectivity services across South Africa. The operator serves more than 14 million mobile customers and is extending its fibre network to underserved townships and rural areas.",
    descriptor: "a South African mobile and fibre operator",
    website: "ubuntutelecoms.co.za",
    industry: "Telecommunications",
    facts: [
      { label: "Customers", value: "14 million+ mobile customers" },
      { label: "Headquarters", value: "Johannesburg, South Africa" },
    ],
    findings: ["Appointed Chief Executive Officer in January 2026 (previously Chief Operating Officer)", "Current customer numbers and network footprint"],
    sources: [
      { title: "Ubuntu Telecoms — Leadership appointment announcement", url: "https://ubuntutelecoms.co.za/news/ceo-appointment" },
      { title: "Ubuntu Telecoms — Integrated annual report 2025", url: "https://ubuntutelecoms.co.za/investors" },
    ],
    roleCheck: { title: "Chief Executive Officer", note: "Official announcement confirms appointment as CEO in January 2026." },
  },
  "okafor pharmaceuticals": {
    about:
      "Okafor Pharmaceuticals manufactures generic medicines and over-the-counter products for markets across West Africa. The company operates two production facilities in Lagos State and is expanding into vaccines and sterile injectables.",
    descriptor: "a Nigerian pharmaceutical manufacturer",
    website: "okaforpharma.ng",
    industry: "Healthcare & Life Sciences",
    facts: [{ label: "Facilities", value: "2 production sites in Lagos State" }],
    findings: ["Appointed Managing Director in March 2026", "New sterile injectables line announced"],
    sources: [
      { title: "Okafor Pharmaceuticals — Board changes", url: "https://okaforpharma.ng/news/board-changes-2026" },
      { title: "Okafor Pharmaceuticals — Our facilities", url: "https://okaforpharma.ng/facilities" },
    ],
    roleCheck: { title: "Managing Director", note: "Company announcement confirms appointment as Managing Director in March 2026." },
  },
  "maghreb green hydrogen": {
    about:
      "Maghreb Green Hydrogen is developing renewable-powered hydrogen and green ammonia projects on Morocco's Atlantic coast. The company aims to supply low-carbon fuels to industrial customers in Morocco and Europe.",
    descriptor: "a Moroccan green hydrogen developer",
    website: "maghrebh2.ma",
    industry: "Energy",
    facts: [
      { label: "Headquarters", value: "Rabat, Morocco" },
      { label: "Founded", value: "2021" },
      { label: "Pipeline", value: "2 GW electrolysis in development" },
    ],
    findings: ["Company overview and project pipeline", "Headquarters and founding year", "Leadership confirmed on company website"],
    sources: [
      { title: "Maghreb Green Hydrogen — Company", url: "https://maghrebh2.ma/company" },
      { title: "Maghreb Green Hydrogen — Projects", url: "https://maghrebh2.ma/projects" },
      { title: "Ministry of Energy Transition — project register", url: "https://energy.gov.ma/projects" },
    ],
  },
  "nordvik renewables": {
    about:
      "Nordvik Renewables develops offshore wind and energy storage projects in Northern Europe. The company partners with utilities and industrial customers to supply long-term renewable power.",
    descriptor: "a Swedish offshore wind and storage developer",
    website: "nordvik.se",
    industry: "Energy",
    facts: [
      { label: "Headquarters", value: "Gothenburg, Sweden" },
      { label: "Portfolio", value: "3.4 GW in operation and development" },
    ],
    findings: ["Current portfolio size"],
    sources: [{ title: "Nordvik Renewables — Portfolio", url: "https://nordvik.se/portfolio" }],
  },
};
