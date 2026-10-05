import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./VisaMap.css";

const visaDestinations = [
  {
    country: "Türkiye",
    slug: "turkey",
    date: "05 OCT 26",
    lat: 39.0,
    lng: 35.0,
    flag: "🇹🇷",
  },
  {
    country: "Georgia",
    slug: "georgia",
    date: "22 OCT 26",
    lat: 42.0,
    lng: 43.5,
    flag: "🇬🇪",
  },
  {
    country: "Armenia",
    slug: "armenia",
    date: "22 OCT 26",
    lat: 40.2,
    lng: 44.5,
    flag: "🇦🇲",
  },
  {
    country: "Uzbekistan",
    slug: "uzbekistan",
    date: "14 OCT 26",
    lat: 41.4,
    lng: 64.6,
    flag: "🇺🇿",
  },
  {
    country: "Kyrgyzstan",
    slug: "kyrgyzstan",
    date: "01 OCT 26",
    lat: 41.2,
    lng: 74.7,
    flag: "🇰🇬",
  },
  {
    country: "Israel",
    slug: "israel",
    date: "27 OCT 26",
    lat: 31.5,
    lng: 34.8,
    flag: "🇮🇱",
  },
  {
    country: "Jordan",
    slug: "jordan",
    date: "08 OCT 26",
    lat: 30.6,
    lng: 36.2,
    flag: "🇯🇴",
  },
  {
    country: "Egypt",
    slug: "egypt",
    date: "15 OCT 26",
    lat: 26.8,
    lng: 30.8,
    flag: "🇪🇬",
  },
  {
    country: "Saudi Arabia",
    slug: "saudi-arabia",
    date: "16 OCT 26",
    lat: 23.8,
    lng: 45.1,
    flag: "🇸🇦",
  },
  {
    country: "Oman",
    slug: "oman",
    date: "07 OCT 26",
    lat: 21.5,
    lng: 56.0,
    flag: "🇴🇲",
  },
  {
    country: "India",
    slug: "india",
    date: "AVAILABLE",
    lat: 22.0,
    lng: 79.0,
    flag: "🇮🇳",
  },
  {
    country: "Nepal",
    slug: "nepal",
    date: "12 OCT 26",
    lat: 28.4,
    lng: 84.1,
    flag: "🇳🇵",
  },
  {
    country: "Bhutan",
    slug: "bhutan",
    date: "12 OCT 26",
    lat: 27.5,
    lng: 90.4,
    flag: "🇧🇹",
  },
  {
    country: "Bangladesh",
    slug: "bangladesh",
    date: "24 OCT 26",
    lat: 23.7,
    lng: 90.4,
    flag: "🇧🇩",
  },
  {
    country: "Sri Lanka",
    slug: "sri-lanka",
    date: "06 OCT 26",
    lat: 7.9,
    lng: 80.7,
    flag: "🇱🇰",
  },
  {
    country: "Maldives",
    slug: "maldives",
    date: "05 OCT 26",
    lat: 3.2,
    lng: 73.2,
    flag: "🇲🇻",
  },
  {
    country: "Thailand",
    slug: "thailand",
    date: "05 OCT 26",
    lat: 15.8,
    lng: 100.9,
    flag: "🇹🇭",
  },
  {
    country: "Laos",
    slug: "laos",
    date: "09 OCT 26",
    lat: 18.0,
    lng: 103.0,
    flag: "🇱🇦",
  },
  {
    country: "Vietnam",
    slug: "vietnam",
    date: "12 OCT 26",
    lat: 16.0,
    lng: 108.0,
    flag: "🇻🇳",
  },
  {
    country: "Cambodia",
    slug: "cambodia",
    date: "19 OCT 26",
    lat: 12.6,
    lng: 104.9,
    flag: "🇰🇭",
  },
  {
    country: "Myanmar",
    slug: "myanmar",
    date: "19 OCT 26",
    lat: 21.0,
    lng: 96.0,
    flag: "🇲🇲",
  },
  {
    country: "China",
    slug: "china",
    date: "25 NOV 26",
    lat: 35.8,
    lng: 104.1,
    flag: "🇨🇳",
  },
  {
    country: "South Korea",
    slug: "south-korea",
    date: "29 OCT 26",
    lat: 36.5,
    lng: 127.9,
    flag: "🇰🇷",
  },
  {
    country: "Japan",
    slug: "japan",
    date: "22 OCT 26",
    lat: 36.2,
    lng: 138.2,
    flag: "🇯🇵",
  },
  {
    country: "Taiwan",
    slug: "taiwan",
    date: "06 OCT 26",
    lat: 23.7,
    lng: 120.9,
    flag: "🇹🇼",
  },
  {
    country: "Philippines",
    slug: "philippines",
    date: "19 OCT 26",
    lat: 12.9,
    lng: 121.8,
    flag: "🇵🇭",
  },
  {
    country: "Malaysia",
    slug: "malaysia",
    date: "05 OCT 26",
    lat: 4.2,
    lng: 101.9,
    flag: "🇲🇾",
  },
  {
    country: "Singapore",
    slug: "singapore",
    date: "05 OCT 26",
    lat: 1.35,
    lng: 103.8,
    flag: "🇸🇬",
  },
  {
    country: "Indonesia",
    slug: "indonesia",
    date: "19 OCT 26",
    lat: -2.5,
    lng: 118.0,
    flag: "🇮🇩",
  },
  {
    country: "Australia",
    slug: "australia",
    date: "AVAILABLE",
    lat: -25.3,
    lng: 133.8,
    flag: "🇦🇺",
  },
];

function createVisaIcon(destination) {
  return L.divIcon({
    className: "visa-map-marker-wrapper",
    html: `
      <div class="visa-map-marker">
        <div class="visa-map-flag">${destination.flag}</div>
        <div class="visa-map-marker-info">
          <strong>${destination.country}</strong>
          <span>${destination.date}</span>
        </div>
      </div>
    `,
    iconSize: [150, 48],
    iconAnchor: [75, 24],
    popupAnchor: [0, -20],
  });
}

function VisaMap() {
  const navigate = useNavigate();

  const handleViewVisa = (slug) => {
    navigate(`/visa/${slug}`);
  };

  return (
    <section className="visa-map-section">
      <div className="visa-map-container">
        <MapContainer
          center={[20, 82]}
          zoom={3}
          minZoom={2}
          maxZoom={7}
          scrollWheelZoom={true}
          zoomControl={false}
          worldCopyJump={true}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomControl position="bottomright" />

          {visaDestinations.map((destination) => (
            <Marker
              key={destination.country}
              position={[destination.lat, destination.lng]}
              icon={createVisaIcon(destination)}
            >
              <Popup>
                <div className="visa-popup">
                  <div className="visa-popup-flag">
                    {destination.flag}
                  </div>

                  <strong>{destination.country}</strong>

                  <span>
                    Visa date: {destination.date}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleViewVisa(destination.slug)}
                  >
                    View Visa
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div className="map-guaranteed">
          <span></span>
          GUARANTEED APPROVAL
        </div>
      </div>
    </section>
  );
}

export default VisaMap;