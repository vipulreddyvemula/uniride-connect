export const DESTINATIONS = {
  kochi_airport: {
    label: "Kochi Airport",
    icon: "✈️",
    estimatedCost: 2500,
  },
  kottayam_railway: {
    label: "Kottayam Railway Station",
    icon: "🚂",
    estimatedCost: 800,
  },
  bus_stand: {
    label: "Bus Stand",
    icon: "🚌",
    estimatedCost: 400,
  },
} as const;

export const LUGGAGE_SIZES = {
  light: {
    label: "Light",
    description: "Small bag or backpack",
    icon: "🎒",
  },
  medium: {
    label: "Medium",
    description: "1-2 suitcases",
    icon: "🧳",
  },
  heavy: {
    label: "Heavy",
    description: "Multiple large bags",
    icon: "📦",
  },
} as const;

export type DestinationType = keyof typeof DESTINATIONS;
export type LuggageSize = keyof typeof LUGGAGE_SIZES;
