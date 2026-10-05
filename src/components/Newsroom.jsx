import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   1. API CONFIG  – change these to match your news API
------------------------------------------------------------------ */
const NEWS_API_URL = "https://atlys-backend-cr9i.onrender.com/api/newsroom"; // <-- your endpoint

// Map whatever your API returns into the shape the UI needs.
// Adjust the field names on the right side to match your API response.
const normalizeStory = (item) => ({
  id: item.id ?? item._id ?? item.url,
  date: item.date ?? item.publishedAt ?? item.published_at,
  title: item.title ?? item.headline,
  source: item.source?.name ?? item.source ?? item.publisher,
  url: item.url ?? item.link ?? "#",
});

// Turns "2026-07-27T10:00:00Z" or a Date into "27-07-2026".
// If the API already sends "27-07-2026" it is returned as-is.
const formatDate = (value) => {
  if (!value) return "";
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
};

/* ------------------------------------------------------------------
   2. COMPONENT
------------------------------------------------------------------ */
function Newsroom() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadNews() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(NEWS_API_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = await res.json();

        // Handles both `[...]` and `{ data: [...] }` / `{ articles: [...] }`
        const list = Array.isArray(json)
          ? json
          : json.data ?? json.articles ?? json.results ?? [];

        setStories(list.map(normalizeStory));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("We couldn't load the news right now. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadNews();
    return () => controller.abort();
  }, []);

  return (
    <div className="nr-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .nr-page {
          min-height: 100vh;
          background: #ffffff;
          color: #0b0b0b;
          font-family: "Inter", Arial, Helvetica, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        /* ---------- Header ---------- */
        .nr-header {
          display: flex;
          align-items: center;
          height: 88px;
          padding: 0 60px;
          background: #fff;
          border-bottom: 1px solid #ececec;
        }

        .nr-logo {
          text-decoration: none;
          color: #0b0b0b;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: -1.5px;
        }

        .nr-logo span { color: #4f46e5; }

        /* ---------- Intro ---------- */
        .nr-intro {
          max-width: 1300px;
          margin: 0 auto;
          padding: 24px 24px 0 310px;
        }

        .nr-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 17px;
          color: #666;
        }

        .nr-breadcrumb a {
          color: #666;
          text-decoration: none;
        }

        .nr-breadcrumb a:hover { color: #111; }

        .nr-breadcrumb svg {
          width: 14px;
          height: 14px;
          stroke: #666;
        }

        .nr-title {
          margin: 28px 0 0;
          font-size: 48px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .nr-subtitle {
          margin: 44px 0 0;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .nr-email {
          margin: 10px 0 0;
          font-size: 18px;
          color: #666;
        }

        .nr-email a {
          color: inherit;
          text-decoration: none;
        }

        .nr-email a:hover { text-decoration: underline; }

        /* ---------- List ---------- */
        .nr-list {
          margin-top: 96px;
          padding-bottom: 80px;
        }

        .nr-row {
          display: grid;
          grid-template-columns: 280px 1fr 260px 56px;
          align-items: center;
          min-height: 81px;
          padding: 0 25px;
          border-bottom: 1px solid #e9e9e9;
          color: inherit;
          text-decoration: none;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .nr-row:first-child { border-top: 1px solid #e9e9e9; }

        .nr-date {
          font-size: 18px;
          color: #666;
          font-variant-numeric: tabular-nums;
        }

        .nr-story {
          font-size: 20px;
          line-height: 1.35;
          padding: 16px 24px 16px 0;
        }

        .nr-source {
          font-size: 18px;
          color: #666;
          text-align: right;
          padding-right: 12px;
        }

        .nr-arrow {
          display: flex;
          justify-content: center;
          color: #555;
        }

        .nr-arrow svg {
          width: 24px;
          height: 24px;
          stroke: currentColor;
        }

        /* Hover: indigo row with white text (matches reference) */
        .nr-row:hover,
        .nr-row:focus-visible {
          background: #5159e6;
          color: #fff;
          outline: none;
        }

        .nr-row:hover .nr-date,
        .nr-row:hover .nr-source,
        .nr-row:hover .nr-arrow,
        .nr-row:focus-visible .nr-date,
        .nr-row:focus-visible .nr-source,
        .nr-row:focus-visible .nr-arrow {
          color: #fff;
        }

        /* ---------- States ---------- */
        .nr-skeleton-row {
          display: grid;
          grid-template-columns: 280px 1fr 260px 56px;
          align-items: center;
          min-height: 81px;
          padding: 0 25px;
          border-bottom: 1px solid #e9e9e9;
        }

        .nr-skeleton-row:first-child { border-top: 1px solid #e9e9e9; }

        .nr-bar {
          height: 14px;
          border-radius: 7px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e6e6e6 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: nr-shimmer 1.4s infinite linear;
        }

        @keyframes nr-shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }

        .nr-message {
          padding: 40px 25px;
          font-size: 18px;
          color: #666;
          border-top: 1px solid #e9e9e9;
        }

        .nr-retry {
          margin-left: 12px;
          font: inherit;
          color: #4f46e5;
          background: none;
          border: 0;
          cursor: pointer;
          text-decoration: underline;
        }

        @media (prefers-reduced-motion: reduce) {
          .nr-bar { animation: none; }
          .nr-row { transition: none; }
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 1100px) {
          .nr-intro { padding-left: 25px; }
          .nr-row,
          .nr-skeleton-row { grid-template-columns: 160px 1fr 200px 48px; }
        }

        @media (max-width: 760px) {
          .nr-header { height: 72px; padding: 0 20px; }
          .nr-logo { font-size: 28px; }
          .nr-intro { padding: 20px 20px 0; }
          .nr-title { font-size: 38px; }
          .nr-subtitle { font-size: 24px; margin-top: 32px; }
          .nr-email { font-size: 16px; }
          .nr-list { margin-top: 48px; }

          .nr-row {
            grid-template-columns: 1fr 32px;
            padding: 18px 20px;
            gap: 6px 12px;
          }

          .nr-date   { grid-column: 1; grid-row: 1; font-size: 15px; }
          .nr-story  { grid-column: 1; grid-row: 2; font-size: 18px; padding: 0; }
          .nr-source { grid-column: 1; grid-row: 3; font-size: 15px; text-align: left; padding: 0; }
          .nr-arrow  { grid-column: 2; grid-row: 1 / span 3; align-self: center; }

          .nr-skeleton-row { grid-template-columns: 1fr; padding: 20px; gap: 10px; }
        }
      `}</style>

      {/* Header */}
      <header className="nr-header">
        <Link to="/" className="nr-logo" aria-label="VisaGo home">
          visa<span>go</span>
        </Link>
      </header>

      <main>
        {/* Intro */}
        <section className="nr-intro">
          <nav className="nr-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
            <span aria-current="page">Newsroom</span>
          </nav>

          <h1 className="nr-title">Newsroom</h1>

          <h2 className="nr-subtitle">Media Features and Company Announcements</h2>

          <p className="nr-email">
            Email: <a href="mailto:press@visago.com">press@visago.com</a>
          </p>
        </section>

        {/* Stories */}
        <section className="nr-list" aria-live="polite">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div className="nr-skeleton-row" key={i} aria-hidden="true">
                <div className="nr-bar" style={{ width: 110 }} />
                <div className="nr-bar" style={{ width: `${55 + ((i * 9) % 30)}%` }} />
                <div className="nr-bar" style={{ width: 110, justifySelf: "end" }} />
                <span />
              </div>
            ))}

          {!loading && error && (
            <div className="nr-message">
              {error}
              <button className="nr-retry" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && stories.length === 0 && (
            <div className="nr-message">No stories yet. Check back soon.</div>
          )}

          {!loading &&
            !error &&
            stories.map((story) => (
              <a
                key={story.id}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nr-row"
              >
                <div className="nr-date">{formatDate(story.date)}</div>
                <div className="nr-story">{story.title}</div>
                <div className="nr-source">{story.source}</div>
                <div className="nr-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h16M14 6l6 6-6 6" />
                  </svg>
                </div>
              </a>
            ))}
        </section>
      </main>
    </div>
  );
}

export default Newsroom;