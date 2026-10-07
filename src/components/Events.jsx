import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API = "https://atlys-backend-cr9i.onrender.com/api/events";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const CATEGORIES = [
  { key: "all", label: "All Events", color: "#111111", icon: "grid" },
  { key: "music", label: "Music", color: "#e84d95", icon: "music" },
  { key: "sports", label: "Sports", color: "#1eae72", icon: "sports" },
  { key: "art-culture", label: "Art & Culture", color: "#ed9241", icon: "art" },
  { key: "business-science", label: "Business & Science", color: "#596be8", icon: "biz" },
];

const FLAG_CODES = {
  India: "in", Thailand: "th", Vietnam: "vn", Malaysia: "my", Singapore: "sg",
  Indonesia: "id", Japan: "jp", "South Korea": "kr", China: "cn", "Sri Lanka": "lk",
  "United Arab Emirates": "ae", UAE: "ae", Turkey: "tr", Türkiye: "tr", Egypt: "eg",
  France: "fr", Germany: "de", Italy: "it", Spain: "es", Portugal: "pt",
  "United Kingdom": "gb", UK: "gb", "United States": "us", USA: "us", Canada: "ca",
  Australia: "au", "New Zealand": "nz", Brazil: "br", Mexico: "mx", Qatar: "qa",
  Oman: "om", Maldives: "mv", Nepal: "np", Bhutan: "bt", Cambodia: "kh",
  Philippines: "ph", Georgia: "ge", Greece: "gr", Switzerland: "ch", Netherlands: "nl",
  Austria: "at", Belgium: "be", Ireland: "ie", Russia: "ru", Kenya: "ke",
};

const slugify = (v = "") =>
  String(v).toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const pick = (obj, keys, fallback = "") => {
  for (const k of keys) if (obj?.[k]) return obj[k];
  return fallback;
};

const getTitle = (e) => pick(e, ["title", "name", "eventName", "eventTitle", "event_title"], "Untitled Event");
const getDate = (e) => pick(e, ["date", "eventDate", "event_date", "startDate", "start_date", "datetime", "dateTime"], null);
const getImage = (e) => pick(e, ["image", "imageUrl", "imageURL", "image_url", "banner", "bannerImage", "banner_image", "coverImage", "cover_image", "photo", "thumbnail"]);

const getCountry = (e) =>
  typeof e.country === "string" ? e.country : e.country?.name || e.country?.countryName || e.countryName || "";

const getLocation = (e) => {
  if (typeof e.location === "string") return e.location;
  return e.location?.name || e.location?.city || e.venue?.name || e.city || e.venue || e.place || getCountry(e) || "";
};

const getFlag = (e) => {
  const direct = e.flag || e.flagUrl || e.country?.flag || e.country?.flagUrl;
  if (typeof direct === "string" && direct.startsWith("http")) return direct;
  const code = (e.countryCode || e.country?.code || FLAG_CODES[getCountry(e)] || "").toString().toLowerCase();
  return code ? `https://flagcdn.com/w80/${code}.png` : null;
};

const getLink = (e) => pick(e, ["url", "link", "eventUrl", "event_url"], "");

const fmtDate = (d) => {
  const p = new Date(d);
  if (isNaN(p.getTime())) return String(d);
  return p.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

function CatIcon({ name }) {
  const common = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "#fff", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "grid")
    return (
      <svg {...common} fill="#fff" stroke="none">
        {[5, 12, 19].flatMap((x) => [5, 12, 19].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.9" />))}
      </svg>
    );
  if (name === "music")
    return (<svg {...common}><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></svg>);
  if (name === "sports")
    return (<svg {...common}><circle cx="12" cy="5" r="2" /><path d="M7 21l4-7 4 3 2-6M9 11l3-3 4 3" /></svg>);
  if (name === "art")
    return (<svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>);
  return (<svg {...common}><path d="M12 3l8 6-8 12L4 9z" /></svg>);
}

function EventCard({ event }) {
  const title = getTitle(event);
  const image = getImage(event);
  const date = getDate(event);
  const location = getLocation(event);
  const country = getCountry(event);
  const flag = getFlag(event);
  const link = getLink(event);
  const category = event.category || "";

  const inner = (
    <>
      {image ? (
        <img
          className="ev-img"
          src={image}
          alt={title}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : null}

      <div className="ev-grad" />

      <div className="ev-body">
        {flag && <img className="ev-flag" src={flag} alt="" />}
        <h3>{title}</h3>
        {date && <p className="ev-date">{fmtDate(date)}</p>}

        <div className="ev-meta">
          <div>
            <span>LOCATION</span>
            <strong>{location || "—"}</strong>
          </div>
          {category && (
            <div className="ev-meta-right">
              <span>CATEGORY</span>
              <strong>{String(category).replace(/-/g, " ")}</strong>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (link) {
    return (
      <a className="ev-card" href={link} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }

  if (country) {
    return (
      <Link className="ev-card" to={`/visa/${slugify(country)}`}>
        {inner}
      </Link>
    );
  }

  return <div className="ev-card">{inner}</div>;
}

function Events() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMonth, setActiveMonth] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const sectionRefs = useRef({});

  /* ---------- fetch ---------- */
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError("");

        const url = activeCategory === "all" ? API : `${API}?category=${activeCategory}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`API error ${res.status}`);

        const json = await res.json();
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json.data) ? json.data
          : Array.isArray(json.events) ? json.events
          : Array.isArray(json.data?.events) ? json.data.events
          : [];

        setEvents(list);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("EVENTS API ERROR:", err);
        setEvents([]);
        setError("Unable to load events. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [activeCategory, reloadKey]);

  /* ---------- group upcoming events by month ---------- */
  const groups = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const map = new Map();

    events
      .map((e) => ({ e, d: new Date(getDate(e)) }))
      .filter(({ d }) => !isNaN(d.getTime()) && d >= startOfMonth)
      .sort((a, b) => a.d - b.d)
      .forEach(({ e, d }) => {
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!map.has(key)) {
          map.set(key, {
            key,
            label: MONTHS[d.getMonth()] + (d.getFullYear() !== now.getFullYear() ? ` ${String(d.getFullYear()).slice(2)}` : ""),
            events: [],
          });
        }
        map.get(key).events.push(e);
      });

    return [...map.values()];
  }, [events]);

  const total = groups.reduce((n, g) => n + g.events.length, 0);

  /* ---------- active month follows scroll ---------- */
  useEffect(() => {
    if (groups.length === 0) {
      setActiveMonth("");
      return;
    }
    setActiveMonth(groups[0].label);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActiveMonth(visible[0].target.getAttribute("data-month"));
      },
      { threshold: 0.02, rootMargin: "-40% 0px -50% 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <div className="events-root">
      <style>{`
        .events-root {
          width: 100%;
          min-height: 100vh;
          background: #fff;
          color: #111;
          overflow-x: clip;
          font-family: Arial, Helvetica, sans-serif;
        }
        .events-root *, .events-root *::before, .events-root *::after { box-sizing: border-box; }

        /* ---------- category bar ---------- */
        .ev-top { padding: 40px 20px 0; text-align: center; }
        .ev-bar {
          display: inline-flex;
          align-items: stretch;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          background: #fff;
          border: 1px solid #ececec;
          border-radius: 999px;
          box-shadow: 0 10px 34px rgba(0,0,0,.07);
        }
        .ev-bar::-webkit-scrollbar { display: none; }

        .ev-cat {
          position: relative;
          height: 82px;
          padding: 0 38px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 0;
          background: transparent;
          color: #6f7580;
          font: inherit;
          font-size: 18px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: color .2s;
        }
        .ev-cat + .ev-cat::before {
          content: "";
          position: absolute;
          left: 0; top: 50%;
          height: 34px; width: 1px;
          transform: translateY(-50%);
          background: #e4e4e4;
        }
        .ev-cat:hover { color: #111; }
        .ev-cat.on { color: #111; }
        .ev-cat.on::after {
          content: "";
          position: absolute;
          left: 50%; bottom: 0;
          width: 64px; height: 3px;
          transform: translateX(-50%);
          border-radius: 3px;
          background: #111;
        }
        .ev-cat-icon {
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .ev-year {
          margin-top: 86px;
          font-size: 42px;
          font-weight: 500;
          letter-spacing: -.04em;
          color: #111;
        }
        .ev-year .muted { color: #737a84; }
        .ev-year .dot {
          display: inline-block;
          width: 9px; height: 9px;
          margin: 0 12px 6px;
          border-radius: 50%;
          background: #737a84;
        }

        /* ---------- layout with ruler + month label ---------- */
        .ev-wrap {
          position: relative;
          margin-top: 80px;
          padding-bottom: 40px;
        }
        .ev-ruler {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 66px;
          pointer-events: none;
          background:
            repeating-linear-gradient(to bottom, transparent 0 51px, #e6e6e6 51px 52px) 0 0 / 66px 100% no-repeat,
            repeating-linear-gradient(to bottom, transparent 0 25px, #ececec 25px 26px) 0 0 / 30px 100% no-repeat;
        }
        .ev-content {
          position: relative;
          width: min(1184px, calc(100% - 340px));
          margin: 0 auto;
        }
        .ev-label-col {
          position: absolute;
          left: -112px; top: 0; bottom: 0;
          width: 90px;
          pointer-events: none;
        }
        .ev-label {
          position: sticky;
          top: 52vh;
          text-align: right;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: .02em;
          color: #111;
        }

        .ev-section { padding-bottom: 56px; scroll-margin-top: 100px; }
        .ev-month-head { display: none; margin: 0 0 18px; font-size: 20px; font-weight: 600; }

        .ev-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 32px;
        }

        /* ---------- card ---------- */
        .ev-card {
          position: relative;
          display: block;
          height: 520px;
          border-radius: 38px;
          overflow: hidden;
          background: linear-gradient(160deg, #2b3550, #0b1226);
          color: #fff;
          text-decoration: none;
          isolation: isolate;
        }
        .ev-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .6s ease;
          z-index: 0;
        }
        .ev-card:hover .ev-img { transform: scale(1.06); }
        .ev-grad {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom,
            rgba(0,0,0,0) 38%,
            rgba(0,0,0,.45) 62%,
            rgba(0,0,0,.88) 82%,
            rgba(0,0,0,.97) 100%);
        }
        .ev-body {
          position: absolute; left: 0; right: 0; bottom: 0; z-index: 2;
          padding: 0 30px 28px;
          display: flex; flex-direction: column; align-items: center;
        }
        .ev-flag {
          width: 28px; height: 28px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 12px;
          background: #fff;
        }
        .ev-body h3 {
          margin: 0;
          text-align: center;
          font-family: "Playfair Display", Georgia, "Times New Roman", serif;
          font-size: 26px;
          font-weight: 600;
          line-height: 1.1;
          text-transform: uppercase;
        }
        .ev-date {
          margin: 10px 0 0;
          font-size: 14px;
          letter-spacing: .04em;
          color: rgba(255,255,255,.78);
        }
        .ev-meta {
          width: 100%;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,.18);
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .ev-meta div { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .ev-meta-right { text-align: right; align-items: flex-end; }
        .ev-meta span {
          font-size: 12px; font-weight: 700; letter-spacing: .1em;
          color: rgba(255,255,255,.6);
        }
        .ev-meta strong {
          font-size: 14px; font-weight: 800; letter-spacing: .04em;
          text-transform: uppercase;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ---------- states ---------- */
        .ev-skel {
          height: 520px;
          border-radius: 38px;
          background: linear-gradient(90deg, #f1f1f1 25%, #e8e8e8 50%, #f1f1f1 75%);
          background-size: 200% 100%;
          animation: evShimmer 1.4s linear infinite;
        }
        @keyframes evShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

        .ev-state {
          min-height: 320px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px; text-align: center; color: #777; font-size: 16px;
        }
        .ev-state h2 { margin: 0; color: #111; font-size: 28px; font-weight: 500; }
        .ev-state button {
          padding: 11px 22px;
          border: 1px solid #111; border-radius: 999px;
          background: #fff; font: inherit; font-weight: 600; cursor: pointer;
        }
        .ev-state button:hover { background: #111; color: #fff; }

        /* ---------- responsive ---------- */
        @media (max-width: 1300px) {
          .ev-content { width: calc(100% - 300px); }
          .ev-label-col { left: -100px; width: 80px; }
        }
        @media (max-width: 1000px) {
          .ev-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
          .ev-content { width: calc(100% - 48px); }
          .ev-label-col, .ev-ruler { display: none; }
          .ev-month-head { display: block; }
          .ev-cat { height: 68px; padding: 0 24px; font-size: 15px; }
          .ev-year { font-size: 32px; margin-top: 56px; }
          .ev-wrap { margin-top: 44px; }
        }
        @media (max-width: 620px) {
          .ev-grid { grid-template-columns: 1fr; }
          .ev-card, .ev-skel { height: 460px; border-radius: 28px; }
          .ev-top { padding-top: 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ev-skel { animation: none; }
          .ev-img { transition: none; }
        }
      `}</style>

      <Navbar />

      <section className="ev-top">
        <div className="ev-bar" role="tablist" aria-label="Event categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={activeCategory === c.key}
              className={`ev-cat ${activeCategory === c.key ? "on" : ""}`}
              onClick={() => setActiveCategory(c.key)}
            >
              <span className="ev-cat-icon" style={{ background: c.color }}>
                <CatIcon name={c.icon} />
              </span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="ev-year">
          {new Date().getFullYear()}
          <span className="dot" />
          <span className="muted">
            {loading || error ? "Events" : `${total} Events`}
          </span>
        </div>
      </section>

      <div className="ev-wrap">
        <div className="ev-ruler" />

        <main className="ev-content">
          {groups.length > 0 && (
            <div className="ev-label-col">
              <div className="ev-label">{activeMonth}</div>
            </div>
          )}

          {loading && (
            <div className="ev-grid">
              {[0, 1, 2].map((i) => (
                <div className="ev-skel" key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="ev-state">
              <span>{error}</span>
              <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="ev-state">
              <h2>No upcoming events</h2>
              <span>
                Nothing is scheduled in{" "}
                {CATEGORIES.find((c) => c.key === activeCategory)?.label.toLowerCase()} right now.
              </span>
            </div>
          )}

          {!loading &&
            !error &&
            groups.map((group) => (
              <section
                key={group.key}
                data-month={group.label}
                ref={(el) => (sectionRefs.current[group.key] = el)}
                className="ev-section"
              >
                <h2 className="ev-month-head">{group.label}</h2>

                <div className="ev-grid">
                  {group.events.map((event, i) => (
                    <EventCard key={event._id || event.id || `${group.key}-${i}`} event={event} />
                  ))}
                </div>
              </section>
            ))}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default Events;