import { describe, expect, it } from 'vitest';
import { centroidOf, unplacedCountries } from '@/lib/geo/centroids';
import { globeMarkers } from '@/lib/geo/globe-markers';

type Seat = { country: string; status: 'available' | 'assigned' | 'reserved' };
const committee = (...countryList: Seat[]) => ({ countryList });

// The 193 UN member states, as the UN lists them (short forms).
const UN_MEMBERS = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei Darussalam', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
  "Côte d'Ivoire", 'Croatia', 'Cuba', 'Cyprus', 'Czechia', "Democratic People's Republic of Korea", 'Democratic Republic of the Congo',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran (Islamic Republic of)',
  'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  "Lao People's Democratic Republic", 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia (Federated States of)', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Republic of Korea',
  'Republic of Moldova', 'Romania', 'Russian Federation', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles',
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain', 'Sri Lanka',
  'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syrian Arab Republic', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Türkiye', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
  'United Kingdom of Great Britain and Northern Ireland', 'United Republic of Tanzania', 'United States of America', 'Uruguay',
  'Uzbekistan', 'Vanuatu', 'Venezuela (Bolivarian Republic of)', 'Viet Nam', 'Yemen', 'Zambia', 'Zimbabwe',
];

describe('committee globe', () => {
  it('places every UN member state, the observer states, Kosovo and Taiwan', () => {
    expect(UN_MEMBERS).toHaveLength(193);
    expect(unplacedCountries([...UN_MEMBERS, 'State of Palestine', 'Holy See', 'Kosovo', 'Taiwan'])).toEqual([]);
  });

  it('reads names the way editors type them', () => {
    const us = centroidOf('United States');
    for (const name of ['USA', 'united states of america', '  The United States ', 'US']) expect(centroidOf(name)).toEqual(us);
    expect(centroidOf('Cote d’Ivoire')).toEqual(centroidOf("Côte d'Ivoire"));
    expect(centroidOf('Turkey')).toEqual(centroidOf('Türkiye'));
    expect(centroidOf('Bosnia & Herzegovina')).toEqual(centroidOf('Bosnia and Herzegovina'));
    expect(centroidOf('UK')).toEqual(centroidOf('United Kingdom'));
    expect(centroidOf('Delegate of the Press')).toBeUndefined();
  });

  it('keeps every centre on the globe', () => {
    for (const name of UN_MEMBERS) {
      const [lat, lon] = centroidOf(name)!;
      expect(Math.abs(lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(lon)).toBeLessThanOrEqual(180);
    }
  });

  it('shows open, allocated and reserved seats once a country list exists', () => {
    const markers = globeMarkers([
      committee({ country: 'France', status: 'assigned' }, { country: 'Brazil', status: 'available' }, { country: 'Chile', status: 'reserved' }),
    ]);
    expect(Object.fromEntries(markers.map((m) => [m.country, m.status]))).toEqual({ France: 'assigned', Brazil: 'available', Chile: 'reserved' });
  });

  it('shows a country seated in several committees by its most open seat, once', () => {
    const markers = globeMarkers([
      committee({ country: 'USA', status: 'assigned' }),
      committee({ country: 'United States of America', status: 'available' }),
      committee({ country: 'United States', status: 'reserved' }),
    ]);
    expect(markers).toHaveLength(1);
    expect(markers[0].status).toBe('available');
  });

  it('skips names it cannot place and draws nothing for empty lists', () => {
    expect(globeMarkers([committee({ country: 'Prime Minister', status: 'assigned' })])).toEqual([]);
    expect(globeMarkers([{ countryList: [] }, {} as { countryList: Seat[] }])).toEqual([]);
  });
});
