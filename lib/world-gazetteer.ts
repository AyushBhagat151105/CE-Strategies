import type { GeoCoordinate } from "./types";

export interface WorldRegion {
  name: string;
  aliases: string[];
  coordinates: GeoCoordinate;
}

// Country/region centroids (approximate capital or population-center coordinates)
// plus common demonym and hashtag aliases, used to resolve a free-text tweet to
// a place for the bonus world flood map. Not exhaustive — tuned for global news
// disaster coverage rather than full ISO country coverage.
export const WORLD_REGIONS: readonly WorldRegion[] = [
  { name: "Philippines", aliases: ["philippines", "philippine", "filipino", "manila", "rescueph", "phflood", "pabloph", "yolandaph", "haiyanph", "habagat", "comval"], coordinates: { latitude: 14.5995, longitude: 120.9842 } },
  { name: "Indonesia", aliases: ["indonesia", "indonesian", "jakarta"], coordinates: { latitude: -6.2088, longitude: 106.8456 } },
  { name: "India", aliases: ["india", "indian", "mumbai", "chennai", "kerala", "delhi"], coordinates: { latitude: 28.6139, longitude: 77.209 } },
  { name: "Pakistan", aliases: ["pakistan", "pakistani", "karachi", "lahore"], coordinates: { latitude: 33.6844, longitude: 73.0479 } },
  { name: "Bangladesh", aliases: ["bangladesh", "bangladeshi", "dhaka"], coordinates: { latitude: 23.8103, longitude: 90.4125 } },
  { name: "Thailand", aliases: ["thailand", "thai", "bangkok"], coordinates: { latitude: 13.7563, longitude: 100.5018 } },
  { name: "Vietnam", aliases: ["vietnam", "vietnamese", "hanoi"], coordinates: { latitude: 21.0278, longitude: 105.8342 } },
  { name: "China", aliases: ["china", "chinese", "beijing", "shanghai"], coordinates: { latitude: 39.9042, longitude: 116.4074 } },
  { name: "Japan", aliases: ["japan", "japanese", "tokyo"], coordinates: { latitude: 35.6762, longitude: 139.6503 } },
  { name: "South Korea", aliases: ["south korea", "korea", "korean", "seoul"], coordinates: { latitude: 37.5665, longitude: 126.978 } },
  { name: "Malaysia", aliases: ["malaysia", "malaysian", "kuala lumpur"], coordinates: { latitude: 3.139, longitude: 101.6869 } },
  { name: "Singapore", aliases: ["singapore", "sghaze", "sgflood"], coordinates: { latitude: 1.3521, longitude: 103.8198 } },
  { name: "Sri Lanka", aliases: ["sri lanka", "sri lankan", "colombo"], coordinates: { latitude: 6.9271, longitude: 79.8612 } },
  { name: "Myanmar", aliases: ["myanmar", "burma", "yangon"], coordinates: { latitude: 16.8409, longitude: 96.1735 } },
  { name: "Nepal", aliases: ["nepal", "nepali", "kathmandu"], coordinates: { latitude: 27.7172, longitude: 85.324 } },
  { name: "Australia", aliases: ["australia", "australian", "sydney", "queensland", "brisbane", "qldfloods", "bundaberg", "qld"], coordinates: { latitude: -33.8688, longitude: 151.2093 } },
  { name: "New Zealand", aliases: ["new zealand", "kiwi", "auckland"], coordinates: { latitude: -36.8485, longitude: 174.7633 } },
  { name: "United Kingdom", aliases: ["united kingdom", "uk flood", "britain", "british", "england", "scotland", "glasgow", "london", "wales"], coordinates: { latitude: 51.5072, longitude: -0.1276 } },
  { name: "Ireland", aliases: ["ireland", "irish", "dublin"], coordinates: { latitude: 53.3498, longitude: -6.2603 } },
  { name: "Germany", aliases: ["germany", "german", "berlin"], coordinates: { latitude: 52.52, longitude: 13.405 } },
  { name: "France", aliases: ["france", "french", "paris"], coordinates: { latitude: 48.8566, longitude: 2.3522 } },
  { name: "Spain", aliases: ["spain", "spanish", "madrid"], coordinates: { latitude: 40.4168, longitude: -3.7038 } },
  { name: "Italy", aliases: ["italy", "italian", "rome"], coordinates: { latitude: 41.9028, longitude: 12.4964 } },
  { name: "Netherlands", aliases: ["netherlands", "dutch", "amsterdam"], coordinates: { latitude: 52.3676, longitude: 4.9041 } },
  { name: "Poland", aliases: ["poland", "polish", "warsaw"], coordinates: { latitude: 52.2297, longitude: 21.0122 } },
  { name: "Russia", aliases: ["russia", "russian", "moscow"], coordinates: { latitude: 55.7558, longitude: 37.6173 } },
  { name: "Turkey", aliases: ["turkey", "turkish", "istanbul", "ankara"], coordinates: { latitude: 39.9334, longitude: 32.8597 } },
  { name: "Greece", aliases: ["greece", "greek", "athens"], coordinates: { latitude: 37.9838, longitude: 23.7275 } },
  { name: "Egypt", aliases: ["egypt", "egyptian", "cairo"], coordinates: { latitude: 30.0444, longitude: 31.2357 } },
  { name: "Nigeria", aliases: ["nigeria", "nigerian", "lagos"], coordinates: { latitude: 9.082, longitude: 8.6753 } },
  { name: "South Africa", aliases: ["south africa", "south african", "johannesburg", "cape town"], coordinates: { latitude: -25.7479, longitude: 28.2293 } },
  { name: "Kenya", aliases: ["kenya", "kenyan", "nairobi"], coordinates: { latitude: -1.2921, longitude: 36.8219 } },
  { name: "Mozambique", aliases: ["mozambique", "maputo"], coordinates: { latitude: -25.9692, longitude: 32.5732 } },
  { name: "Ghana", aliases: ["ghana", "ghanaian", "accra"], coordinates: { latitude: 5.6037, longitude: -0.187 } },
  { name: "Saudi Arabia", aliases: ["saudi arabia", "saudi", "riyadh", "jeddah"], coordinates: { latitude: 24.7136, longitude: 46.6753 } },
  { name: "United Arab Emirates", aliases: ["united arab emirates", "uae", "dubai", "abu dhabi"], coordinates: { latitude: 25.2048, longitude: 55.2708 } },
  { name: "Israel", aliases: ["israel", "israeli", "tel aviv"], coordinates: { latitude: 32.0853, longitude: 34.7818 } },
  { name: "Brazil", aliases: ["brazil", "brazilian", "rio de janeiro", "sao paulo"], coordinates: { latitude: -15.7975, longitude: -47.8919 } },
  { name: "Colombia", aliases: ["colombia", "colombian", "bogota"], coordinates: { latitude: 4.711, longitude: -74.0721 } },
  { name: "Mexico", aliases: ["mexico", "mexican", "mexico city"], coordinates: { latitude: 19.4326, longitude: -99.1332 } },
  { name: "Argentina", aliases: ["argentina", "argentinian", "buenos aires"], coordinates: { latitude: -34.6037, longitude: -58.3816 } },
  { name: "Chile", aliases: ["chile", "chilean", "santiago"], coordinates: { latitude: -33.4489, longitude: -70.6693 } },
  { name: "Peru", aliases: ["peru", "peruvian", "lima"], coordinates: { latitude: -12.0464, longitude: -77.0428 } },
  { name: "Venezuela", aliases: ["venezuela", "venezuelan", "caracas"], coordinates: { latitude: 10.4806, longitude: -66.9036 } },
  { name: "Haiti", aliases: ["haiti", "haitian", "port-au-prince"], coordinates: { latitude: 18.5944, longitude: -72.3074 } },
  { name: "Cuba", aliases: ["cuba", "cuban", "havana"], coordinates: { latitude: 23.1136, longitude: -82.3666 } },
  { name: "Canada", aliases: ["canada", "canadian", "quebec", "toronto", "calgary", "vancouver", "alberta", "ontario"], coordinates: { latitude: 45.4215, longitude: -75.6972 } },
  { name: "United States", aliases: ["united states", "usa", "u.s.", "america", "american", "boston", "oklahoma", "texas", "california", "hawaii", "new york", "florida", "colorado", "coflood", "larimer", "lax", "los angeles"], coordinates: { latitude: 38.9072, longitude: -77.0369 } },
  { name: "Costa Rica", aliases: ["costa rica", "costarica"], coordinates: { latitude: 9.9281, longitude: -84.0907 } },
  { name: "Nicaragua", aliases: ["nicaragua"], coordinates: { latitude: 12.1364, longitude: -86.2514 } },
  { name: "Panama", aliases: ["panama"], coordinates: { latitude: 8.9824, longitude: -79.5199 } },
  { name: "Guatemala", aliases: ["guatemala"], coordinates: { latitude: 14.6349, longitude: -90.5069 } },
] as const;

const SORTED_REGIONS = [...WORLD_REGIONS].sort(
  (a, b) => Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length))
);

export function extractWorldRegion(text: string): { name: string; coordinates: GeoCoordinate } | null {
  const lower = text.toLowerCase();
  for (const region of SORTED_REGIONS) {
    for (const alias of region.aliases) {
      const pattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (pattern.test(lower)) {
        return { name: region.name, coordinates: region.coordinates };
      }
    }
  }
  return null;
}
