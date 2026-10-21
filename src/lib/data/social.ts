/** Demo-only content for the future social features (not part of the MVP). */

export interface Post {
  id: string;
  authorSlug: string;
  at: string;
  text: string;
  linkId?: string;
  reactions: number;
  comments: number;
  reacted?: boolean;
}

export interface Thread {
  id: string;
  withSlug: string;
  messages: { from: "me" | "them"; text: string; at: string }[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  cover: string;
  memberSlugs: string[];
  private: boolean;
}

export function seedPosts(now: number): Post[] {
  const h = 3_600_000;
  return [
    {
      id: "post_1",
      authorSlug: "layla-al-mansouri-q8vd",
      at: new Date(now - 3 * h).toISOString(),
      text: "Delighted to see TRC publish our conversation on the next phase of Gulf trade. The corridors linking Africa, Asia and Europe are being built by partnerships — several of them with leaders in this network.",
      linkId: "trc-2001",
      reactions: 24,
      comments: 6,
    },
    {
      id: "post_2",
      authorSlug: "grace-wanjiru-h7pw",
      at: new Date(now - 20 * h).toISOString(),
      text: "We have just passed 120,000 smallholder farmers on our platform. Keen to compare notes with anyone working on rural finance or cold-chain logistics — East Africa needs both.",
      reactions: 41,
      comments: 12,
    },
    {
      id: "post_3",
      authorSlug: "james-whitaker-t6jy",
      at: new Date(now - 2 * 24 * h).toISOString(),
      text: "Infrastructure finance is increasingly about blended structures. If you are planning a cross-border project in 2027, I am happy to share what we are seeing from investors.",
      reactions: 18,
      comments: 4,
    },
    {
      id: "post_4",
      authorSlug: "kwame-mensah-m3xt",
      at: new Date(now - 4 * 24 * h).toISOString(),
      text: "Reliable power is the foundation of industrial growth. Our new solar pipeline in the Ashanti region moves to construction next quarter.",
      reactions: 33,
      comments: 9,
    },
  ];
}

export function seedThreads(now: number): Thread[] {
  const h = 3_600_000;
  return [
    {
      id: "th_1",
      withSlug: "layla-al-mansouri-q8vd",
      messages: [
        { from: "them", text: "Good to connect here. I enjoyed your comments in the TRC report on trade finance.", at: new Date(now - 26 * h).toISOString() },
        { from: "me", text: "Thank you, Layla. Would be glad to compare notes on the corridor projects.", at: new Date(now - 25 * h).toISOString() },
        { from: "them", text: "Let's find time when you are next in Dubai.", at: new Date(now - 2 * h).toISOString() },
      ],
    },
    {
      id: "th_2",
      withSlug: "rahul-mehta-z2kc",
      messages: [{ from: "them", text: "Are you attending the TRC leaders' roundtable in London next month?", at: new Date(now - 30 * h).toISOString() }],
    },
    {
      id: "th_3",
      withSlug: "sofia-lindqvist-w4bs",
      messages: [
        { from: "me", text: "Congratulations on the new offshore wind partnership.", at: new Date(now - 4 * 24 * h).toISOString() },
        { from: "them", text: "Thank you! It took two years to get the structure right.", at: new Date(now - 4 * 24 * h + h).toISOString() },
      ],
    },
  ];
}

export const GROUPS: Group[] = [
  {
    id: "g_africa",
    name: "Africa Infrastructure Leaders",
    description: "Power, ports, logistics and the finance behind them — a private forum for CEOs building Africa's infrastructure.",
    members: 38,
    cover: "/images/covers/construction.jpg",
    memberSlugs: ["kwame-mensah-m3xt", "grace-wanjiru-h7pw", "omar-haddad-r9fn"],
    private: true,
  },
  {
    id: "g_energy",
    name: "Energy Transition Forum",
    description: "Generation, grids, storage and green fuels. Members share what is working in their markets.",
    members: 52,
    cover: "/images/covers/offshore-wind.jpg",
    memberSlugs: ["sofia-lindqvist-w4bs", "kwame-mensah-m3xt"],
    private: false,
  },
  {
    id: "g_trade",
    name: "Global Trade & Logistics",
    description: "Corridors, customs and supply-chain resilience across continents.",
    members: 44,
    cover: "/images/covers/port.jpg",
    memberSlugs: ["layla-al-mansouri-q8vd", "omar-haddad-r9fn"],
    private: false,
  },
  {
    id: "g_digital",
    name: "Digital Economy Circle",
    description: "Payments, connectivity and the platforms reshaping how emerging markets do business.",
    members: 61,
    cover: "/images/covers/analytics.jpg",
    memberSlugs: ["rahul-mehta-z2kc", "james-whitaker-t6jy"],
    private: false,
  },
  {
    id: "g_food",
    name: "Food Security Roundtable",
    description: "Agribusiness leaders working on productivity, finance and sustainable supply chains.",
    members: 27,
    cover: "/images/covers/farmland.jpg",
    memberSlugs: ["grace-wanjiru-h7pw", "mariana-costa-f7wq"],
    private: true,
  },
  {
    id: "g_women",
    name: "Women CEOs Circle",
    description: "A closed peer circle for women chief executives across the network.",
    members: 19,
    cover: "/images/covers/meeting.jpg",
    memberSlugs: ["layla-al-mansouri-q8vd", "grace-wanjiru-h7pw", "sofia-lindqvist-w4bs"],
    private: true,
  },
];

export const CANNED_REPLIES = [
  "Thanks — that's helpful. Let me check my diary and come back to you.",
  "Agreed. Shall we set up a call next week?",
  "Good to hear from you. I'll ask my office to coordinate.",
];
