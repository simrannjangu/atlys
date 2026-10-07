import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";

const VISA_API = "https://atlys-backend-cr9i.onrender.com/api/visas";

/* Explore / Events tabs are shown ONLY on these pages */
const SHOW_NAV_PATHS = ["/", "/events"];

/* cached so the API is only called once per page load */
let visaCache = null;

const FLAG_CODES = {
  "United States": "us", USA: "us", Canada: "ca", Germany: "de", France: "fr",
  "United Kingdom": "gb", UK: "gb", Italy: "it", Spain: "es", Portugal: "pt",
  Switzerland: "ch", Netherlands: "nl", Belgium: "be", Austria: "at",
  Australia: "au", "New Zealand": "nz", Japan: "jp", "South Korea": "kr",
  China: "cn", Singapore: "sg", Thailand: "th", Malaysia: "my", Indonesia: "id",
  Vietnam: "vn", India: "in", Turkey: "tr", UAE: "ae",
  "United Arab Emirates": "ae", "Saudi Arabia": "sa", Qatar: "qa", Egypt: "eg",
  "South Africa": "za", Brazil: "br", Mexico: "mx", Argentina: "ar",
  Ireland: "ie", Greece: "gr", Malta: "mt", Croatia: "hr", Denmark: "dk",
  Sweden: "se", Norway: "no", Finland: "fi", Iceland: "is", Poland: "pl",
  Czechia: "cz", "Czech Republic": "cz", Hungary: "hu", Romania: "ro",
  "Sri Lanka": "lk", Cambodia: "kh", Philippines: "ph", Maldives: "mv",
  Nepal: "np", Bhutan: "bt", Kenya: "ke", Morocco: "ma", Jordan: "jo",
  Oman: "om", Bahrain: "bh", Kuwait: "kw", "Hong Kong": "hk", Taiwan: "tw",
  Azerbaijan: "az", Georgia: "ge", Armenia: "am", Mauritius: "mu",
  Cyprus: "cy", Laos: "la", Myanmar: "mm", Bangladesh: "bd", Israel: "il",
};

function slugify(value = "") {
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* Normalises one API item into what the search list needs */
function normalise(visa = {}) {
  const country =
    typeof visa.country === "string"
      ? visa.country
      : visa.country?.name ||
        visa.country?.countryName ||
        visa.country?.title ||
        "";

  const backendFlag =
    visa.country?.flag || visa.country?.flagUrl || visa.flag ||
    visa.flagUrl || visa.flagImage || visa.flagImageUrl || null;

  const code = FLAG_CODES[country];
  const flag =
    typeof backendFlag === "string" && backendFlag.startsWith("http")
      ? backendFlag
      : code
      ? `https://flagcdn.com/w80/${code}.png`
      : null;

  const rawFees =
    visa.totalFee ?? visa.fees ?? visa.fee ?? visa.price ?? visa.visaFee ?? "";
  const fees =
    rawFees !== "" && !isNaN(Number(rawFees)) && Number(rawFees) > 0
      ? Number(rawFees).toLocaleString("en-IN")
      : "";

  return {
    visa,
    country,
    slug: visa.slug || visa.country?.slug || slugify(country),
    flag,
    type: visa.type || visa.visaType || visa.applicationType || visa.category || "",
    validity: visa.validity || visa.validityPeriod || visa.duration || "",
    fees,
  };
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isExplore = location.pathname === "/";
  const isEvents = location.pathname === "/events";

  /* tabs visible only on home and events */
  const hideNav = !SHOW_NAV_PATHS.includes(location.pathname);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(visaCache || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  /* fetch visas once, when the search is first opened */
  useEffect(() => {
    if (!open || visaCache) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(VISA_API)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.visas)
          ? data.visas
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.countries)
          ? data.countries
          : [];

        const normalised = list.map(normalise).filter((i) => i.country);
        visaCache = normalised;
        if (!cancelled) setItems(normalised);
      })
      .catch((err) => {
        console.error("NAVBAR SEARCH ERROR:", err);
        if (!cancelled) setError("Unable to load countries.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  /* close on outside click / Esc */
  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* close when the page changes */
  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [location.pathname]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);

    return items
      .filter(
        (i) =>
          i.country.toLowerCase().includes(q) ||
          String(i.type).toLowerCase().includes(q) ||
          String(i.validity).toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const aStarts = a.country.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.country.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts;
      })
      .slice(0, 8);
  }, [items, query]);

  const goTo = (item) => {
    setOpen(false);
    setQuery("");
    navigate(`/visa/${item.slug}`, { state: { visa: item.visa } });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      goTo(results[0]);
    }
  };

  return (
    <header className={`atlys-navbar ${hideNav ? "no-nav" : ""}`}>
      {/* LEFT */}
      <div className="navbar-left">
        <Logo size="md" />

        <div className="navbar-divider"></div>

        <Link to="/on-time-guaranteed" className="on-time-badge">
          <div className="on-time-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm-1.2 14-3.3-3.3 1.4-1.4 1.9 1.9 4.5-4.5 1.4 1.4-5.9 5.9z" />
            </svg>
          </div>
          <div>
            <div className="tl">Visas On Time</div>
            <div className="tl">Guaranteed</div>
          </div>
        </Link>
      </div>

      {/* CENTER: only on home and events */}
      {hideNav ? (
        <div />
      ) : (
        <nav className="navbar-center">
          <Link to="/" className={`nav-main-item ${isExplore ? "active" : ""}`}>
            <div className="nav-round-icon passport-icon">🛂</div>
            <span>Explore</span>
          </Link>

          <Link to="/events" className={`nav-main-item ${isEvents ? "active" : ""}`}>
            <div className="nav-round-icon event-icon">🎟️</div>
            <span>Events</span>
          </Link>
        </nav>
      )}

      {/* RIGHT */}
      <div className="navbar-right">
        <div className="country-search-wrap" ref={wrapRef}>
          <div
            className={`country-search ${open ? "is-open" : ""}`}
            onClick={() => inputRef.current?.focus()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              placeholder="Search Country"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck="false"
            />

            {query && (
              <button
                type="button"
                className="country-search-clear"
                aria-label="Clear search"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                ×
              </button>
            )}
          </div>

          {open && (
            <div className="search-dropdown">
              {loading && <div className="search-state">Loading countries...</div>}

              {!loading && error && (
                <div className="search-state search-error">{error}</div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="search-state">
                  No countries found for “{query}”
                </div>
              )}

              {!loading &&
                !error &&
                results.map((item, index) => (
                  <button
                    type="button"
                    key={item.visa._id || item.visa.id || item.slug || index}
                    className="search-result"
                    onClick={() => goTo(item)}
                  >
                    <span className="search-result-flag">
                      {item.flag ? (
                        <img src={item.flag} alt="" />
                      ) : (
                        item.country.charAt(0)
                      )}
                    </span>

                    <span className="search-result-main">
                      <strong>{item.country}</strong>
                      <small>
                        {[item.type, item.validity].filter(Boolean).join(" · ") || "—"}
                      </small>
                    </span>

                    {item.fees && (
                      <span className="search-result-fee">₹{item.fees}</span>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>

        <Link to="/sign-in" className="profile-button" aria-label="Sign in">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
          </svg>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;