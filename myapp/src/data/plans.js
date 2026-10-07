export const PLANS = [
  {
    id: "weekly",
    name: "Weekly",
    price: 250,
    currency: "₹",
    duration: 7,
    durationLabel: "7 days",
    recommended: false,
    badge: null,
    features: [
      "Chat with everyone",
      "Premium badge",
      "Advanced filters",
      "Priority discovery",
      "See who liked you"
    ]
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 500,
    currency: "₹",
    duration: 30,
    durationLabel: "30 days",
    recommended: true,
    badge: "Most Popular",
    features: [
      "Chat with everyone",
      "Premium badge",
      "Advanced filters",
      "Priority discovery",
      "See who liked you",
      "Profile insights"
    ]
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 1800,
    currency: "₹",
    duration: 365,
    durationLabel: "365 days",
    recommended: false,
    badge: "Best Value",
    features: [
      "Chat with everyone",
      "Premium badge",
      "Advanced filters",
      "Priority discovery",
      "See who liked you",
      "Profile insights",
      "Boost your profile",
      "Undo last action"
    ]
  }
];
