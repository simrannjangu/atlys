import dotenv from "dotenv";
dotenv.config();

import fs from "fs";

const destinations = [
  "Thailand",
  "United Arab Emirates",
  "Sri Lanka",
  "Malaysia",
  "Vietnam",
  "Indonesia",
  "Egypt",
  "Hong Kong",
  "United States",
  "Japan",
  "Oman",
  "Maldives",
  "Mauritius",
  "Georgia",
  "Switzerland",
  "South Africa",
  "United Kingdom",
  "Uzbekistan",
  "Qatar",
  "Türkiye",
  "Australia",
  "Kenya",
  "South Korea",
  "China",
  "France",
  "Taiwan",
  "Jordan",
  "Azerbaijan",
  "Czechia",
  "Russia",
  "Saudi Arabia",
  "Netherlands",
  "Philippines",
  "New Zealand",
  "Spain",
  "Bangladesh",
  "Kyrgyzstan",
  "Laos",
  "Morocco",
  "Bahrain",
  "Tanzania",
  "Canada",
  "Israel",
  "Armenia",
  "Germany",
  "Cambodia",
  "Sweden",
  "Seychelles",
  "Mexico",
  "Austria",
  "Greece",
  "Ireland",
  "Finland",
  "Tajikistan",
  "Brazil",
  "Mongolia",
  "Ethiopia",
  "Zimbabwe",
  "Estonia",
  "Namibia",
  "Zambia",
  "Brunei",
  "Uganda",
  "Slovenia",
  "Tunisia",
  "Italy",
  "Argentina",
  "Belgium",
  "Hungary",
  "Iceland",
  "Croatia",
  "Bhutan",
  "Norway",
  "Portugal",
  "Poland",
  "Bulgaria",
  "Malta",
  "Kuwait",
  "Antigua & Barbuda",
  "Slovakia",
  "Madagascar",
  "Colombia",
  "Luxembourg",
  "Cuba",
  "Latvia",
  "Benin",
  "Burkina Faso",
  "Lebanon",
  "Algeria",
  "Lithuania",
  "Anguilla",
  "Cameroon",
  "Malawi",
  "Congo - Brazzaville",
  "Papua New Guinea",
  "Ghana",
  "Myanmar",
  "Mozambique",
  "Gabon",
  "Ecuador",
  "Togo",
  "South Sudan",
  "Guinea",
  "Congo - Kinshasa",
  "Equatorial Guinea",
  "Nigeria",
  "Sierra Leone",
  "Somalia",
  "Solomon Islands",
  "Côte d’Ivoire",
  "Djibouti",
  "Liberia",
  "Venezuela",
  "Chad",
  "Dominican Republic",
  "Bahamas",
  "Eritrea",
  "São Tomé & Príncipe",
  "Belarus",
  "Macao",
  "Nepal",
  "Fiji",
  "St. Lucia",
  "British Virgin Islands",
  "Palau",
  "Barbados",
  "Samoa",
  "Jamaica",
  "Micronesia",
  "Burundi",
  "Cook Islands",
  "El Salvador",
  "Mauritania",
  "Turks & Caicos Islands",
  "Montserrat",
  "Marshall Islands",
  "Trinidad & Tobago",
  "Dominica",
  "Comoros",
  "Senegal",
  "Réunion",
  "St. Kitts & Nevis",
  "St. Vincent & Grenadines",
  "Guinea-Bissau",
  "Niue",
  "Haiti",
  "Gambia"
];

async function getImage(country) {
  const query = `${country} travel`;

  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=landscape`,
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Pexels error for ${country}: ${response.status} ${errorText}`
    );
  }

  const data = await response.json();

  if (!data.photos || data.photos.length === 0) {
    return null;
  }

  return data.photos[0].src.large2x;
}

async function main() {
  const results = [];

  for (const country of destinations) {
    console.log(`Searching: ${country}`);

    try {
      const image = await getImage(country);

      results.push({
        country,
        image
      });

      console.log(
        image ? "✓ Found" : "✗ No image found"
      );

    } catch (error) {
      console.log("✗ Error:", error.message);

      results.push({
        country,
        image: null
      });
    }

    // Small delay between requests
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );
  }

  fs.writeFileSync(
    "destination-images.json",
    JSON.stringify(results, null, 2)
  );

  console.log("\nDONE!");
  console.log(
    "Created destination-images.json"
  );
}
getImage("Thailand")
  .then((image) => console.log("TEST IMAGE:", image))
  .catch((error) => console.error("TEST ERROR:", error.message));
main();