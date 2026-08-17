/**
 * Canonical Location Normalization Utilities
 * Ensures all user-facing location labels are standardized to English.
 */

export interface TravelLocation {
  displayName: string;
  name: string;
  city?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  latitude: number;
  longitude: number;
  nativeName?: string;
  imageUrl?: string;
}

/**
 * Normalizes any raw location object into a clean English-facing TravelLocation object.
 */
export function normalizeTravelLocation(raw: any, queryFallback = ''): TravelLocation {
  if (!raw) {
    const fallbackName = queryFallback.trim() || 'Dubai';
    return {
      displayName: fallbackName,
      name: fallbackName,
      latitude: 25.2048,
      longitude: 55.2708,
    };
  }

  // Determine English name with priority
  const englishName = (
    raw.name ||
    raw.displayName ||
    raw.city ||
    (raw.display_name ? raw.display_name.split(',')[0].trim() : '') ||
    queryFallback.trim() ||
    'Destination'
  );

  const country = raw.country || (raw.address && raw.address.country) || '';
  const countryCode = (raw.country_code || raw.countryCode || '').toUpperCase();
  const city = raw.city || englishName;
  const region = raw.region || raw.state || country;

  // Clean English display name formatted as "City, Country"
  let cleanDisplayName = raw.display_name || raw.displayName;
  if (!cleanDisplayName || cleanDisplayName.includes(',')) {
    if (englishName && country && englishName.toLowerCase() !== country.toLowerCase()) {
      cleanDisplayName = `${englishName}, ${country}`;
    } else {
      cleanDisplayName = englishName;
    }
  }

  return {
    displayName: cleanDisplayName,
    name: englishName,
    city,
    country,
    countryCode,
    region,
    latitude: Number(raw.latitude || raw.lat || 0),
    longitude: Number(raw.longitude || raw.lon || 0),
    nativeName: raw.native_name || raw.nativeName,
    imageUrl: raw.image_url || raw.imageUrl,
  };
}
