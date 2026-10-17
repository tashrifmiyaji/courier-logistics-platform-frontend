export type AssistantTopic = {
  id: string;
  title: string;
  answer: string;
  keywords: string[];
  href: string;
  linkLabel: string;
};

export const assistantTopics: AssistantTopic[] = [
  {
    id: "book",
    title: "Book a shipment",
    answer:
      "Sign in or create a customer account, choose New shipment, enter both contact addresses, and select different active hubs. Calculate the live route quote before confirming your booking.",
    keywords: ["book", "booking", "create", "send", "shipment", "parcel", "pickup", "new"],
    href: "/login",
    linkLabel: "Open sign in",
  },
  {
    id: "track",
    title: "Track a parcel",
    answer:
      "Enter the tracking code shown in the booking confirmation on the public tracking page. It shows the latest status and recorded shipment events.",
    keywords: ["track", "tracking", "where", "status", "code", "location", "parcel"],
    href: "/track",
    linkLabel: "Track a parcel",
  },
  {
    id: "price",
    title: "Delivery price",
    answer:
      "Delivery charge is calculated from the configured pickup-to-delivery route and the weight you enter. The booking form requests a quote before the shipment is created.",
    keywords: ["price", "pricing", "cost", "charge", "fee", "quote", "weight", "pay", "payment"],
    href: "/services",
    linkLabel: "Explore delivery services",
  },
  {
    id: "payment",
    title: "Payment confirmation",
    answer:
      "bKash payment is confirmed only after the backend verifies the provider callback and marks the payment PAID. A return to the website by itself is not proof of payment.",
    keywords: ["bkash", "payment", "paid", "checkout", "receipt", "transaction"],
    href: "/help#payments",
    linkLabel: "Read payment help",
  },
  {
    id: "cancel",
    title: "Cancel a shipment",
    answer:
      "Open the shipment in your dashboard. The cancel action is available only before pickup when the backend says the shipment is eligible.",
    keywords: ["cancel", "cancellation", "stop", "return", "change"],
    href: "/dashboard?tab=shipments",
    linkLabel: "Open my shipments",
  },
  {
    id: "account",
    title: "Account and roles",
    answer:
      "Customers book and review parcels, couriers update their assigned deliveries, and admins manage the network. Sign in to open the workspace available to your role.",
    keywords: ["account", "login", "log", "sign", "courier", "admin", "profile", "role", "register"],
    href: "/login",
    linkLabel: "Open your account",
  },
  {
    id: "hubs",
    title: "Available hubs",
    answer:
      "Browse the live hub directory to see locations currently configured in the courier network. Only active hubs can be selected for new bookings.",
    keywords: ["hub", "hubs", "city", "location", "area", "zone", "branch"],
    href: "/explore",
    linkLabel: "Explore the hub network",
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

export function findAssistantTopic(question: string) {
  const words = new Set(normalize(question));
  if (words.size === 0) return undefined;

  const ranked = assistantTopics
    .map((topic) => {
      const keywordScore = topic.keywords.reduce(
        (score, keyword) => score + (words.has(keyword) ? 3 : 0),
        0,
      );
      const titleScore = normalize(topic.title).reduce(
        (score, word) => score + (words.has(word) ? 2 : 0),
        0,
      );
      return { topic, score: keywordScore + titleScore };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score ? ranked[0].topic : undefined;
}
