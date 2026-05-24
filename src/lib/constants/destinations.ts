export interface DestinationOption {
  country: string;
  city: string;
  region: 'ASIA' | 'EUROPE' | 'MIDDLE_EAST' | 'AFRICA' | 'AMERICAS' | 'OCEANIA' | 'DOMESTIC';
}

export const TOP_DESTINATIONS: DestinationOption[] = [
  // Asia — Southeast
  { country: 'Maldives',     city: 'Male',          region: 'ASIA' },
  { country: 'Thailand',     city: 'Bangkok',        region: 'ASIA' },
  { country: 'Thailand',     city: 'Phuket',         region: 'ASIA' },
  { country: 'Thailand',     city: 'Krabi',          region: 'ASIA' },
  { country: 'Singapore',    city: 'Singapore',      region: 'ASIA' },
  { country: 'Malaysia',     city: 'Kuala Lumpur',   region: 'ASIA' },
  { country: 'Malaysia',     city: 'Langkawi',       region: 'ASIA' },
  { country: 'Indonesia',    city: 'Bali',           region: 'ASIA' },
  { country: 'Vietnam',      city: 'Hanoi',          region: 'ASIA' },
  { country: 'Vietnam',      city: 'Ho Chi Minh City', region: 'ASIA' },
  { country: 'Cambodia',     city: 'Siem Reap',      region: 'ASIA' },
  { country: 'Sri Lanka',    city: 'Colombo',        region: 'ASIA' },
  { country: 'Nepal',        city: 'Kathmandu',      region: 'ASIA' },
  // Asia — East
  { country: 'Japan',        city: 'Tokyo',          region: 'ASIA' },
  { country: 'Japan',        city: 'Osaka',          region: 'ASIA' },
  { country: 'South Korea',  city: 'Seoul',          region: 'ASIA' },
  { country: 'China',        city: 'Beijing',        region: 'ASIA' },
  { country: 'China',        city: 'Shanghai',       region: 'ASIA' },
  { country: 'Hong Kong',    city: 'Hong Kong',      region: 'ASIA' },
  // Middle East
  { country: 'UAE',          city: 'Dubai',          region: 'MIDDLE_EAST' },
  { country: 'UAE',          city: 'Abu Dhabi',      region: 'MIDDLE_EAST' },
  { country: 'Qatar',        city: 'Doha',           region: 'MIDDLE_EAST' },
  { country: 'Saudi Arabia', city: 'Riyadh',         region: 'MIDDLE_EAST' },
  { country: 'Oman',         city: 'Muscat',         region: 'MIDDLE_EAST' },
  { country: 'Jordan',       city: 'Amman',          region: 'MIDDLE_EAST' },
  { country: 'Israel',       city: 'Jerusalem',      region: 'MIDDLE_EAST' },
  // Europe
  { country: 'France',       city: 'Paris',          region: 'EUROPE' },
  { country: 'Italy',        city: 'Rome',           region: 'EUROPE' },
  { country: 'Italy',        city: 'Venice',         region: 'EUROPE' },
  { country: 'Italy',        city: 'Milan',          region: 'EUROPE' },
  { country: 'Spain',        city: 'Barcelona',      region: 'EUROPE' },
  { country: 'Spain',        city: 'Madrid',         region: 'EUROPE' },
  { country: 'Switzerland',  city: 'Zurich',         region: 'EUROPE' },
  { country: 'Switzerland',  city: 'Geneva',         region: 'EUROPE' },
  { country: 'UK',           city: 'London',         region: 'EUROPE' },
  { country: 'Germany',      city: 'Frankfurt',      region: 'EUROPE' },
  { country: 'Netherlands',  city: 'Amsterdam',      region: 'EUROPE' },
  { country: 'Greece',       city: 'Athens',         region: 'EUROPE' },
  { country: 'Greece',       city: 'Santorini',      region: 'EUROPE' },
  { country: 'Austria',      city: 'Vienna',         region: 'EUROPE' },
  { country: 'Czech Republic', city: 'Prague',       region: 'EUROPE' },
  { country: 'Portugal',     city: 'Lisbon',         region: 'EUROPE' },
  // Africa
  { country: 'Kenya',        city: 'Nairobi',        region: 'AFRICA' },
  { country: 'Tanzania',     city: 'Serengeti',      region: 'AFRICA' },
  { country: 'South Africa', city: 'Cape Town',      region: 'AFRICA' },
  { country: 'Egypt',        city: 'Cairo',          region: 'AFRICA' },
  // Americas
  { country: 'USA',          city: 'New York',       region: 'AMERICAS' },
  { country: 'USA',          city: 'Las Vegas',      region: 'AMERICAS' },
  { country: 'Canada',       city: 'Toronto',        region: 'AMERICAS' },
  // Domestic India
  { country: 'India',        city: 'Goa',            region: 'DOMESTIC' },
  { country: 'India',        city: 'Kerala',         region: 'DOMESTIC' },
];
