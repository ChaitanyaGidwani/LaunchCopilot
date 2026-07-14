export const CHANNELS = [
  { key: "aso", label: "App Store / Play Store", icon: "🏪" },
  { key: "twitter", label: "Twitter / X", icon: "🐦" },
  { key: "linkedin", label: "LinkedIn", icon: "💼" },
  { key: "product_hunt", label: "Product Hunt", icon: "🐱" },
  { key: "reddit", label: "Reddit", icon: "👽" },
];

export const CHANNEL_LABELS = Object.fromEntries(
  CHANNELS.map((c) => [c.key, c.label])
);
