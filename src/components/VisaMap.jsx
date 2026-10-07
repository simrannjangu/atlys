import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./VisaMap.css";

const MAP_API = "https://atlys-backend-cr9i.onrender.com/api/visas/map";
const VISA_API = "https://atlys-backend-cr9i.onrender.com/api/visas";

/* Labels are hidden below this zoom level so pills don't pile up */
const LABEL_MIN_ZOOM = 4;

/* Used only when the API item has no coordinates: [lat, lng, ISO code] */
const FALLBACK = {
  Thailand: [15.87, 100.99, "TH"], Vietnam: [14.06, 108.28, "VN"],
  Malaysia: [4.21, 101.98, "MY"], Singapore: [1.35, 103.82, "SG"],
  Indonesia: [-0.79, 113.92, "ID"], Philippines: [12.88, 121.77, "PH"],
  Cambodia: [12.57, 104.99, "KH"], Laos: [19.86, 102.5, "LA"],
  Myanmar: [21.91, 95.96, "MM"], Japan: [36.2, 138.25, "JP"],
  "South Korea": [35.91, 127.77, "KR"], China: [35.86, 104.2, "CN"],
  Taiwan: [23.7, 120.96, "TW"], "Hong Kong": [22.32, 114.17, "HK"],
  India: [20.59, 78.96, "IN"], "Sri Lanka": [7.87, 80.77, "LK"],
  Maldives: [3.2, 73.22, "MV"], Nepal: [28.39, 84.12, "NP"],
  Bhutan: [27.51, 90.43, "BT"], Bangladesh: [23.68, 90.36, "BD"],
  "United Arab Emirates": [23.42, 53.85, "AE"], UAE: [23.42, 53.85, "AE"],
  Oman: [21.51, 55.92, "OM"], Qatar: [25.35, 51.18, "QA"],
  Bahrain: [26.07, 50.56, "BH"], Kuwait: [29.31, 47.48, "KW"],
  "Saudi Arabia": [23.89, 45.08, "SA"], Jordan: [30.59, 36.24, "JO"],
  Israel: [31.05, 34.85, "IL"], Egypt: [26.82, 30.8, "EG"],
  Türkiye: [38.96, 35.24, "TR"], Turkey: [38.96, 35.24, "TR"],
  Georgia: [42.32, 43.36, "GE"], Armenia: [40.07, 45.04, "AM"],
  Azerbaijan: [40.14, 47.58, "AZ"], Kyrgyzstan: [41.2, 74.77, "KG"],
  Kazakhstan: [48.02, 66.92, "KZ"], Uzbekistan: [41.38, 64.59, "UZ"],
  Australia: [-25.27, 133.78, "AU"], "New Zealand": [-40.9, 174.89, "NZ"],
  Kenya: [-0.02, 37.91, "KE"], Tanzania: [-6.37, 34.89, "TZ"],
  Mauritius: [-20.35, 57.55, "MU"], France: [46.23, 2.21, "FR"],
  Germany: [51.17, 10.45, "DE"], Italy: [41.87, 12.57, "IT"],
  Spain: [40.46, -3.75, "ES"], "United Kingdom": [55.38, -3.44, "GB"],
  Canada: [56.13, -106.35, "CA"], "United States": [37.09, -95.71, "US"],
};

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const slugify = (v = "") =>
  v.toString().toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const norm = (v = "") => String(v).toLowerCase().trim();

function getList(data) {
  if (Array.isArray(data)) return data;
  for (const key of ["markers", "visas", "data", "countries", "content", "results", "features"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

function getName(item) {
  return (
    (typeof item.country === "string" ? item.country : item.country?.name || item.country?.countryName) ||
    item.name || item.countryName || item.title || ""
  );
}

/* Finds the full visa object (same shape the homepage cards use) */
function findFullVisa(list, item, name, slug) {
  const id = item._id || item.visaId || item.id;

  return (
    list.find((v) => id && (v._id === id || v.id === id)) ||
    list.find((v) => {
      const s = v.slug || v.country?.slug;
      return s && norm(s) === norm(slug);
    }) ||
    list.find((v) => norm(getName(v)) === norm(name)) ||
    null
  );
}

function getCoords(item, name) {
  const src = item.geometry?.coordinates || item.coordinates || item.coords || item.location ||
    item.position || item.latlng || item.country?.coordinates || item.country?.location;

  let lat = item.latitude ?? item.lat ?? item.country?.latitude ?? item.country?.lat;
  let lng = item.longitude ?? item.lng ?? item.lon ?? item.long ?? item.country?.longitude ?? item.country?.lng;

  if ((lat == null || lng == null) && src) {
    if (Array.isArray(src)) {
      [lng, lat] = src; // GeoJSON order: [lng, lat]
    } else {
      lat = src.lat ?? src.latitude;
      lng = src.lng ?? src.lon ?? src.longitude;
    }
  }

  lat = Number(lat);
  lng = Number(lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0)) return [lat, lng];

  const fb = FALLBACK[name];
  return fb ? [fb[0], fb[1]] : null;
}

function getCode(item, name) {
  const c = item.code || item.countryCode || item.iso || item.iso2 || item.country?.code || item.country?.iso2;
  return String(c || FALLBACK[name]?.[2] || name.slice(0, 2)).toUpperCase();
}

function getDateText(item) {
  const raw =
    item.deliveryDate || item.date || item.availableFrom || item.nextAvailable ||
    item.earliestDate || item.visaDate || item.status || "";
  if (!raw) return "AVAILABLE";
  const d = new Date(raw);
  if (!isNaN(d.getTime()) && /\d{4}|\d{1,2}[-/]/.test(String(raw))) {
    const day = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return `${day} ${mon} ${String(d.getFullYear()).slice(2)}`;
  }
  return String(raw).toUpperCase();
}

function VisaMap() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const visasRef = useRef([]);
  const navigateRef = useRef(navigate);

  const [status, setStatus] = useState("loading"); // loading | ready | error | empty
  const [count, setCount] = useState(0);

  /* keep the latest navigate without re-running the marker effect */
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  /* create the map once */
  useEffect(() => {
    const map = L.map(containerRef.current, {
      center: [22, 80],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      worldCopyJump: true,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    const syncZoom = () =>
      map.getContainer().classList.toggle("vm-zoom-low", map.getZoom() < LABEL_MIN_ZOOM);
    map.on("zoomend", syncZoom);
    syncZoom();

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* preload the full visa list so a marker click can open the detail page instantly */
  useEffect(() => {
    const controller = new AbortController();

    fetch(VISA_API, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        visasRef.current = getList(data);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  /* load markers from the API */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(MAP_API, { signal: controller.signal });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        console.log("MAP API:", data);

        const list = getList(data);
        const layer = layerRef.current;
        if (!layer) return;
        layer.clearLayers();

        const points = [];

        list.forEach((raw) => {
          const item = raw.properties ? { ...raw.properties, geometry: raw.geometry } : raw;
          const name = getName(item);
          if (!name) return;

          const coords = getCoords(item, name);
          if (!coords) {
            console.warn("MAP: no coordinates for", name, item);
            return;
          }

          const icon = L.divIcon({
            className: "vm-marker",
            iconSize: [0, 0],
            html: `
              <div class="vm-pill">
                <span class="vm-code">${esc(getCode(item, name))}</span>
                <span class="vm-text">
                  <strong>${esc(name)}</strong>
                  <small>${esc(getDateText(item))}</small>
                </span>
              </div>`,
          });

          const slug = item.slug || item.country?.slug || slugify(name);

          L.marker(coords, { icon, riseOnHover: true })
            .on("click", () => {
              const full = findFullVisa(visasRef.current, item, name, slug);

              const finalSlug = full
                ? full.slug || full.country?.slug || slugify(getName(full))
                : slug;

              navigateRef.current(`/visa/${finalSlug}`, {
                state: full ? { visa: full } : undefined,
              });
            })
            .addTo(layer);

          points.push(coords);
        });

        setCount(points.length);

        if (points.length === 0) {
          setStatus("empty");
          return;
        }

        mapRef.current?.fitBounds(points, { padding: [60, 60], maxZoom: 4 });
        setStatus("ready");
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("MAP API ERROR:", err);
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <section className="vm-wrap">
      <div className="vm-badge">
        <i></i> GUARANTEED APPROVAL
      </div>

      <div ref={containerRef} className="vm-map"></div>

      {status === "loading" && <div className="vm-state">Loading map...</div>}
      {status === "error" && (
        <div className="vm-state vm-error">
          Couldn’t load the map. Check that the API is running at {MAP_API}
        </div>
      )}
      {status === "empty" && (
        <div className="vm-state">
          No map locations found{count === 0 ? "." : ""}
        </div>
      )}
    </section>
  );
}

export default VisaMap;