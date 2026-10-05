import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const STATUS_URL = import.meta.env.VITE_STATUS_API_URL || "";
const INCIDENTS_URL = import.meta.env.VITE_INCIDENTS_API_URL || "";
const SUBSCRIBE_URL = import.meta.env.VITE_SUBSCRIBE_API_URL || "";

const STATUS_META = {
  operational: {
    label: "Operational",
    bar: "#7dc383",
    bg: "#dff3e0",
    fg: "#1b6e2b",
  },
  degraded: {
    label: "Degraded",
    bar: "#e6c43b",
    bg: "#f6f0c9",
    fg: "#7a6a10",
  },
  partial: {
    label: "Partial outage",
    bar: "#f2a28f",
    bg: "#fde3dc",
    fg: "#a4452f",
  },
  outage: {
    label: "Major outage",
    bar: "#e5645f",
    bg: "#fcdcdc",
    fg: "#a12a2a",
  },
  nodata: {
    label: "No data",
    bar: "#e4e4e4",
    bg: "#eee",
    fg: "#666",
  },
};

const toKey = (value = "") => {
  const v = String(value).toLowerCase();

  if (/operational|^up$|normal/.test(v)) return "operational";
  if (/degrad|slow|minor/.test(v)) return "degraded";
  if (/partial/.test(v)) return "partial";
  if (/outage|down|major/.test(v)) return "outage";

  return "nodata";
};

const normalizeHistory = (history = []) => {
  const list = Array.isArray(history)
    ? history.slice(-90).map((item) =>
        typeof item === "string"
          ? { status: toKey(item) }
          : {
              date: item?.date,
              status: toKey(item?.status),
            }
      )
    : [];

  return [
    ...Array(Math.max(0, 90 - list.length)).fill({ status: "nodata" }),
    ...list,
  ];
};

const normalizeEntity = (item = {}) => ({
  id: item.id ?? item.code ?? item.country ?? item.name,
  name: item.country ?? item.name ?? "Unknown",
  code: String(item.code ?? item.countryCode ?? "").toLowerCase(),
  status: toKey(item.status),
  uptime: Number(item.uptime ?? 0),
  history: normalizeHistory(item.history ?? item.days),
});

const normalizeStatus = (json = {}) => {
  const source = json?.data && !json.atlys && !json.portals ? json.data : json;

  return {
    atlys: source?.atlys
      ? normalizeEntity({
          name: "VisaGo",
          ...source.atlys,
        })
      : null,
    portals: Array.isArray(source?.portals)
      ? source.portals.map(normalizeEntity)
      : Array.isArray(source)
      ? source.map(normalizeEntity)
      : [],
  };
};

const normalizeIncidents = (json = {}) => {
  const source = Array.isArray(json) ? json : json?.data ?? [];

  if (!Array.isArray(source)) return [];

  return source.map((day) => ({
    date: day?.date,
    countries: Array.isArray(day?.countries)
      ? day.countries.map((country) => ({
          name: country?.country ?? country?.name ?? "Unknown",
          code: String(country?.code ?? "").toLowerCase(),
          updates: Array.isArray(country?.updates)
            ? country.updates.map((update) => ({
                time: update?.time ?? update?.timestamp,
                status: String(update?.status ?? ""),
                message: update?.message ?? update?.description ?? "",
              }))
            : [],
        }))
      : [],
  }));
};

function useApi(url, normalize) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: "",
  });

  const load = useCallback(async () => {
    if (!url) {
      setState({
        data: null,
        loading: false,
        error: "API endpoint is not configured.",
      });
      return;
    }

    setState({
      data: null,
      loading: true,
      error: "",
    });

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();

      setState({
        data: normalize(json),
        loading: false,
        error: "",
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: "We couldn't load this data. Please try again.",
      });
    }
  }, [url, normalize]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    reload: load,
  };
}

const Flag = ({ code, size = 40 }) =>
  code ? (
    <img
      className="sp-flag"
      style={{ width: size, height: size }}
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      loading="lazy"
    />
  ) : (
    <span
      className="sp-flag"
      style={{ width: size, height: size }}
    />
  );

const Icon = ({ d, size = 20, sw = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d.map((path, index) => (
      <path key={index} d={path} />
    ))}
  </svg>
);

const ICONS = {
  search: [
    "M11 19a8 8 0 100-16 8 8 0 000 16z",
    "M21 21l-4.3-4.3",
  ],
  chevron: ["M6 9l6 6 6-6"],
  check: ["M5 12l5 5L20 7"],
  user: [
    "M12 12a4 4 0 100-8 4 4 0 000 8z",
    "M4 21a8 8 0 0116 0",
  ],
  shield: [
    "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z",
    "M8.5 12l2.5 2.5 4.5-5",
  ],
};

const fmtDay = (date) => {
  if (!date) return "Unknown date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const fmtTime = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const uptimeTone = (uptime) => {
  if (uptime >= 95) return "operational";
  if (uptime >= 75) return "degraded";
  return "outage";
};

function UptimeCard({ entity, brand = false }) {
  if (!entity) return null;

  const meta = STATUS_META[entity.status] || STATUS_META.nodata;
  const tone =
    STATUS_META[uptimeTone(Number(entity.uptime) || 0)] ||
    STATUS_META.nodata;

  return (
    <article className="sp-card">
      <div className="sp-card-top">
        <div className="sp-card-name">
          {brand ? (
            <span className="sp-brand-dot">
              <Icon
                d={["M5 12h14", "M13 6l6 6-6 6"]}
                size={16}
              />
            </span>
          ) : (
            <Flag code={entity.code} />
          )}

          <h3>{entity.name}</h3>
        </div>

        <span
          className="sp-pill"
          style={{
            background: meta.bg,
            color: meta.fg,
          }}
        >
          {entity.status === "operational" && (
            <Icon d={ICONS.check} size={15} />
          )}
          {meta.label}
        </span>
      </div>

      <div
        className="sp-bars"
        role="img"
        aria-label={`${entity.name} status over the last 90 days`}
      >
        {(entity.history || []).map((item, index) => {
          const status = STATUS_META[item.status] || STATUS_META.nodata;

          return (
            <span
              key={index}
              className="sp-bar"
              style={{
                background: brand ? "#4f56e0" : status.bar,
              }}
              title={`${
                item.date ? `${fmtDay(item.date)} – ` : ""
              }${status.label}`}
            />
          );
        })}
      </div>

      <div className="sp-card-foot">
        <span>90 days ago</span>
        <i />
        <b
          className="sp-pill"
          style={{
            background: tone.bg,
            color: tone.fg,
          }}
        >
          {Number(entity.uptime).toFixed(1)}% uptime
        </b>
        <i />
        <span>Today</span>
      </div>
    </article>
  );
}

const DIAL = [
  ["in", "+91"],
  ["ae", "+971"],
  ["us", "+1"],
  ["gb", "+44"],
  ["sg", "+65"],
  ["au", "+61"],
];

function Subscribe({ portals }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState([]);
  const [dial, setDial] = useState(DIAL[0]);
  const [dialOpen, setDialOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const matches = query
    ? portals.filter(
        (portal) =>
          portal.name
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          !picked.includes(portal.code)
      )
    : [];

  const valid =
    phone.replace(/\D/g, "").length >= 7 &&
    picked.length > 0 &&
    !busy &&
    Boolean(SUBSCRIBE_URL);

  const submit = async () => {
    if (!valid) return;

    setBusy(true);
    setMsg("");

    try {
      const response = await fetch(SUBSCRIBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          phone:
            dial[1] + phone.replace(/\D/g, ""),
          countries: picked,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setMsg("ok");
      setPhone("");
      setPicked([]);
      setQuery("");
    } catch {
      setMsg("err");
    }

    setBusy(false);
  };

  return (
    <div className="sp-sub" ref={ref}>
      <button
        className="sp-sub-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        Subscribe to Updates
        <span className={`sp-chev ${open ? "up" : ""}`}>
          <Icon d={ICONS.chevron} size={17} />
        </span>
      </button>

      {open && (
        <div className="sp-sub-panel">
          <h4>WhatsApp</h4>

          <p>
            Get notified whenever your visa may experience
            delays due to a government portal issue.
          </p>

          <div className="sp-field">
            <span className="sp-field-icon">
              <Icon d={ICONS.search} size={17} />
            </span>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for countries"
            />
          </div>

          {matches.length > 0 && (
            <ul className="sp-suggest">
              {matches.map((portal) => (
                <li key={portal.id}>
                  <button
                    onClick={() => {
                      setPicked([...picked, portal.code]);
                      setQuery("");
                    }}
                  >
                    <Flag code={portal.code} size={20} />
                    {portal.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {picked.length > 0 && (
            <div className="sp-chips">
              {picked.map((code) => {
                const portal = portals.find(
                  (item) => item.code === code
                );

                return (
                  <button
                    key={code}
                    onClick={() =>
                      setPicked(
                        picked.filter((item) => item !== code)
                      )
                    }
                    title="Remove"
                  >
                    <Flag code={code} size={16} />
                    {portal?.name ?? code} ×
                  </button>
                );
              })}
            </div>
          )}

          <div className="sp-field sp-phone">
            <button
              className="sp-dial"
              onClick={() => setDialOpen((value) => !value)}
              aria-label="Country code"
            >
              <Flag code={dial[0]} size={18} />
              <Icon d={ICONS.chevron} size={12} />
            </button>

            {dialOpen && (
              <ul className="sp-dial-list">
                {DIAL.map((item) => (
                  <li key={item[0]}>
                    <button
                      onClick={() => {
                        setDial(item);
                        setDialOpen(false);
                      }}
                    >
                      <Flag code={item[0]} size={18} />
                      {item[1]}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Enter your phone number"
            />
          </div>

          <button
            className="sp-submit"
            disabled={!valid}
            onClick={submit}
          >
            {busy ? "Subscribing..." : "Subscribe To Updates"}
          </button>

          {msg === "ok" && (
            <p className="sp-note ok">
              You're subscribed. We'll message you on WhatsApp.
            </p>
          )}

          {msg === "err" && (
            <p className="sp-note err">
              Couldn't subscribe. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function IncidentCountry({ country }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="sp-inc">
      <button
        className="sp-inc-head"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span>
          <Flag code={country.code} size={30} />
          {country.name}
        </span>

        <span className={`sp-chev ${open ? "up" : ""}`}>
          <Icon d={ICONS.chevron} size={20} />
        </span>
      </button>

      {open &&
        (country.updates || []).map((update, index) => (
          <div className="sp-upd" key={index}>
            <div className="sp-upd-top">
              <b>{fmtTime(update.time)}</b>

              <span
                className={`sp-tag ${
                  /resolved/i.test(update.status)
                    ? "done"
                    : ""
                }`}
              >
                {update.status || "Update"}
              </span>
            </div>

            <p>{update.message}</p>
          </div>
        ))}
    </div>
  );
}

function HeroArt() {
  const bars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => {
        const height =
          90 +
          65 * Math.sin(index / 7) +
          (index > 24 ? (index - 24) * 3 : 0);

        const opacity =
          index < 28
            ? Math.pow(index / 28, 1.4)
            : Math.max(0, 1 - (index - 28) / 22) * 0.45;

        return {
          x: index * 14,
          height: Math.max(25, height),
          opacity,
        };
      }),
    []
  );

  return (
    <svg
      className="sp-art"
      viewBox="0 0 672 360"
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="spg"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#2f6bff" />
          <stop offset="1" stopColor="#0a3fd6" />
        </linearGradient>
      </defs>

      {bars.map((bar, index) => (
        <rect
          key={index}
          x={bar.x}
          y={360 - bar.height}
          width="8"
          height={bar.height}
          fill="url(#spg)"
          opacity={bar.opacity}
        />
      ))}

      <path
        d="M0 245 C80 205,150 175,245 190 S390 230,420 200 S480 55,672 25"
        fill="none"
        stroke="#3b6cff"
        strokeWidth="2"
        opacity="0.7"
      />

      <circle
        cx="418"
        cy="200"
        r="13"
        fill="#cfe0ff"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function StatusTracker() {
  const [tab, setTab] = useState("status");
  const [search, setSearch] = useState("");

  const status = useApi(STATUS_URL, normalizeStatus);
  const incidents = useApi(
    INCIDENTS_URL,
    normalizeIncidents
  );

  const q = search.trim().toLowerCase();

  const portals = (status.data?.portals ?? []).filter(
    (portal) =>
      portal.name?.toLowerCase().includes(q)
  );

  const days = (incidents.data ?? [])
    .map((day) => ({
      ...day,
      countries: (day.countries ?? []).filter((country) =>
        country.name?.toLowerCase().includes(q)
      ),
    }))
    .filter((day) => day.countries.length > 0);

  const Skeleton = ({ count = 3, height = 170 }) => (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="sp-skel"
          style={{ height }}
        />
      ))}
    </>
  );

  const ErrorState = ({ onRetry }) => (
    <div className="sp-empty">
      <span>We couldn't load this data.</span>
      <button onClick={onRetry}>Try again</button>
    </div>
  );

  return (
    <div className="sp-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .sp-page{
          min-height:100vh;
          background:#fff;
          color:#0b0b0b;
          font-family:"Inter",Arial,sans-serif;
          -webkit-font-smoothing:antialiased;
        }

        .sp-page *{
          box-sizing:border-box;
        }

        .sp-page button{
          font-family:inherit;
          cursor:pointer;
        }

        .sp-page h1,
        .sp-page h2,
        .sp-page h3,
        .sp-page h4,
        .sp-page p{
          margin:0;
        }

        .sp-hero{
          position:relative;
          background:#f4f4f4;
          overflow:hidden;
        }

        .sp-nav{
          max-width:1180px;
          margin:0 auto;
          padding:0 20px;
          height:72px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          position:relative;
          z-index:2;
        }

        .sp-logo{
          font-size:28px;
          font-weight:700;
          letter-spacing:-1.3px;
          color:#0b0b0b;
          text-decoration:none;
        }

        .sp-logo span{
          color:#4f46e5;
        }

        .sp-nav-r{
          display:flex;
          align-items:center;
          gap:14px;
        }

        .sp-guarantee{
          display:flex;
          align-items:center;
          gap:6px;
          color:#4f46e5;
          font-size:12px;
          font-weight:500;
          line-height:1.1;
          text-decoration:underline;
          max-width:82px;
        }

        .sp-user{
          width:36px;
          height:36px;
          border-radius:9px;
          background:#fff;
          border:0;
          display:grid;
          place-items:center;
        }

        .sp-hero-in{
          max-width:1180px;
          margin:0 auto;
          padding:76px 20px 82px;
          position:relative;
          z-index:2;
        }

        .sp-crumb{
          font-size:13px;
          font-weight:600;
          letter-spacing:.04em;
          text-transform:uppercase;
          color:#777;
        }

        .sp-crumb b{
          color:#4f56e0;
          font-weight:600;
        }

        .sp-title{
          margin-top:26px!important;
          font-size:clamp(36px,4vw,52px);
          font-weight:700;
          line-height:1.04;
          letter-spacing:-.025em;
          max-width:720px;
        }

        .sp-title span{
          display:block;
          color:#0b5cc4;
        }

        .sp-desc{
          margin-top:22px!important;
          font-size:17px;
          line-height:1.5;
          max-width:680px;
          color:#1a1a1a;
        }

        .sp-art{
          position:absolute;
          right:0;
          bottom:0;
          height:72%;
          width:auto;
          max-width:48%;
          z-index:1;
          pointer-events:none;
        }

        .sp-main{
          max-width:1180px;
          margin:0 auto;
          padding:0 20px 70px;
        }

        .sp-tabs{
          display:flex;
          gap:30px;
          border-bottom:1px solid #e6e6e6;
          padding-top:30px;
        }

        .sp-tab{
          background:none;
          border:0;
          padding:0 0 13px;
          font-size:16px;
          font-weight:600;
          color:#6b7280;
          position:relative;
        }

        .sp-tab.on{
          color:#0b0b0b;
        }

        .sp-tab.on::after{
          content:"";
          position:absolute;
          left:0;
          right:0;
          bottom:-1px;
          height:2px;
          background:#2f5fe0;
        }

        .sp-tools{
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:14px;
          margin:26px 0 28px;
          flex-wrap:wrap;
        }

        .sp-search{
          display:flex;
          align-items:center;
          gap:11px;
          width:min(400px,100%);
          height:48px;
          padding:0 18px;
          background:#fff;
          border-radius:999px;
          box-shadow:0 3px 15px rgba(0,0,0,.07);
          color:#8a8f98;
        }

        .sp-search input{
          flex:1;
          border:0;
          outline:0;
          background:none;
          font:inherit;
          font-size:15px;
          color:#111;
        }

        .sp-sub{
          position:relative;
        }

        .sp-sub-btn{
          height:48px;
          padding:0 22px;
          border-radius:999px;
          border:0;
          background:#050505;
          color:#fff;
          font-size:15px;
          font-weight:600;
          display:flex;
          align-items:center;
          gap:8px;
        }

        .sp-chev{
          display:inline-flex;
          transition:transform .2s;
        }

        .sp-chev.up{
          transform:rotate(180deg);
        }

        .sp-sub-panel{
          position:absolute;
          right:0;
          top:58px;
          z-index:20;
          width:360px;
          max-width:calc(100vw - 40px);
          background:#fff;
          border-radius:16px;
          padding:18px;
          box-shadow:0 12px 40px rgba(0,0,0,.14);
        }

        .sp-sub-panel h4{
          color:#17803d;
          font-size:16px;
          font-weight:600;
        }

        .sp-sub-panel p{
          margin:7px 0 12px!important;
          font-size:14px;
          line-height:1.4;
          color:#222;
        }

        .sp-field{
          display:flex;
          align-items:center;
          gap:9px;
          height:48px;
          padding:0 13px;
          background:#fff;
          border-radius:9px;
          box-shadow:0 2px 10px rgba(0,0,0,.07);
          position:relative;
        }

        .sp-field-icon{
          color:#4f46e5;
          display:flex;
        }

        .sp-field input{
          flex:1;
          min-width:0;
          border:0;
          outline:0;
          background:none;
          font:inherit;
          font-size:14px;
        }

        .sp-phone{
          margin-top:9px;
        }

        .sp-dial{
          display:flex;
          align-items:center;
          gap:3px;
          border:0;
          background:none;
          padding:0;
        }

        .sp-dial-list,
        .sp-suggest{
          list-style:none;
          margin:0;
          padding:5px;
          position:absolute;
          left:0;
          top:calc(100% + 5px);
          z-index:5;
          min-width:135px;
          max-height:190px;
          overflow:auto;
          background:#fff;
          border-radius:9px;
          box-shadow:0 8px 28px rgba(0,0,0,.15);
        }

        .sp-suggest{
          position:static;
          box-shadow:none;
          border:1px solid #eee;
          margin-top:6px;
          min-width:0;
        }

        .sp-dial-list button,
        .sp-suggest button{
          width:100%;
          display:flex;
          align-items:center;
          gap:8px;
          padding:7px 9px;
          border:0;
          background:none;
          border-radius:7px;
          font-size:14px;
          text-align:left;
        }

        .sp-dial-list button:hover,
        .sp-suggest button:hover{
          background:#f3f4ff;
        }

        .sp-chips{
          display:flex;
          flex-wrap:wrap;
          gap:5px;
          margin-top:7px;
        }

        .sp-chips button{
          display:flex;
          align-items:center;
          gap:5px;
          border:0;
          background:#eef0ff;
          color:#3a3fb5;
          border-radius:999px;
          padding:4px 8px;
          font-size:12px;
        }

        .sp-submit{
          width:100%;
          height:40px;
          margin-top:11px;
          border:0;
          border-radius:6px;
          background:#4f56e0;
          color:#fff;
          font-size:14px;
          font-weight:600;
        }

        .sp-submit:disabled{
          background:#b5b8f2;
          cursor:not-allowed;
        }

        .sp-note{
          margin:9px 0 0!important;
          font-size:13px!important;
        }

        .sp-note.ok{
          color:#17803d;
        }

        .sp-note.err{
          color:#b42318;
        }

        .sp-card{
          background:#fff;
          border-radius:16px;
          padding:22px;
          box-shadow:0 4px 20px rgba(0,0,0,.065);
        }

        .sp-card-top{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
        }

        .sp-card-name{
          display:flex;
          align-items:center;
          gap:12px;
        }

        .sp-card-name h3{
          font-size:20px;
          font-weight:500;
        }

        .sp-flag{
          border-radius:50%;
          object-fit:cover;
          border:1px solid #e5e5e5;
          background:#f0f0f0;
          display:inline-block;
          flex:none;
        }

        .sp-brand-dot{
          width:38px;
          height:38px;
          border-radius:50%;
          border:1px solid #dcdcf7;
          display:grid;
          place-items:center;
        }

        .sp-brand-dot svg{
          background:#4f56e0;
          color:#fff;
          border-radius:50%;
          padding:5px;
          width:27px;
          height:27px;
        }

        .sp-pill{
          display:inline-flex;
          align-items:center;
          gap:5px;
          padding:6px 11px;
          border-radius:999px;
          font-size:14px;
          font-weight:500;
          white-space:nowrap;
        }

        .sp-bars{
          display:flex;
          gap:3px;
          height:34px;
          margin:22px 0 18px;
          padding:0 4px;
        }

        .sp-bar{
          flex:1;
          min-width:2px;
          border-radius:3px;
        }

        .sp-card-foot{
          display:flex;
          align-items:center;
          gap:10px;
          color:#666;
          font-size:14px;
        }

        .sp-card-foot i{
          flex:1;
          height:1px;
          background:#e2e2e2;
        }

        .sp-card-foot b{
          font-weight:500;
          font-size:14px;
        }

        .sp-divider{
          display:flex;
          align-items:center;
          gap:14px;
          margin:28px 0;
          color:#7a7a7a;
          font-size:13px;
          font-weight:600;
          letter-spacing:.06em;
        }

        .sp-divider::before,
        .sp-divider::after{
          content:"";
          flex:1;
          border-top:1.5px dotted #bbb;
        }

        .sp-stack{
          display:grid;
          gap:20px;
        }

        .sp-day{
          padding:0 8px;
          margin-bottom:42px;
        }

        .sp-day-head{
          display:flex;
          justify-content:space-between;
          align-items:baseline;
          gap:12px;
          padding-bottom:16px;
          border-bottom:1px solid #e6e6e6;
        }

        .sp-day-head h3{
          font-size:22px;
          font-weight:600;
        }

        .sp-day-head span{
          font-size:14px;
          color:#222;
        }

        .sp-inc{
          padding-top:18px;
        }

        .sp-inc-head{
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          background:none;
          border:0;
          padding:0;
          font-size:17px;
          font-weight:500;
          color:#0b0b0b;
        }

        .sp-inc-head>span:first-child{
          display:flex;
          align-items:center;
          gap:12px;
        }

        .sp-upd{
          margin-top:16px;
        }

        .sp-upd-top{
          display:flex;
          align-items:center;
          gap:11px;
          font-size:15px;
        }

        .sp-upd-top b{
          font-weight:600;
        }

        .sp-tag{
          background:#e8e8e8;
          padding:4px 10px;
          border-radius:999px;
          font-size:13px;
          font-weight:500;
        }

        .sp-tag.done{
          background:#d3f0d6;
          color:#17803d;
        }

        .sp-upd p{
          margin-top:9px!important;
          font-size:15px;
          line-height:1.5;
          color:#555;
        }

        .sp-skel{
          border-radius:16px;
          background:linear-gradient(
            90deg,
            #f1f1f1 25%,
            #e8e8e8 50%,
            #f1f1f1 75%
          );
          background-size:200% 100%;
          animation:sp-sh 1.4s linear infinite;
          margin-bottom:20px;
        }

        @keyframes sp-sh{
          from{
            background-position:200% 0;
          }
          to{
            background-position:-200% 0;
          }
        }

        .sp-empty{
          padding:45px 0;
          text-align:center;
          font-size:15px;
          color:#666;
        }

        .sp-empty button{
          border:0;
          background:none;
          color:#4f46e5;
          font-size:inherit;
          text-decoration:underline;
          margin-left:5px;
        }

        .sp-page button:focus-visible,
        .sp-page input:focus-visible{
          outline:2px solid #4f56e0;
          outline-offset:2px;
        }

        @media (prefers-reduced-motion:reduce){
          .sp-skel{
            animation:none;
          }

          .sp-chev{
            transition:none;
          }
        }

        @media (max-width:900px){
          .sp-nav{
            height:68px;
          }

          .sp-logo{
            font-size:26px;
          }

          .sp-hero-in{
            padding:62px 20px 70px;
          }

          .sp-art{
            opacity:.3;
            max-width:75%;
          }

          .sp-desc{
            font-size:16px;
          }

          .sp-tabs{
            gap:24px;
            overflow-x:auto;
          }

          .sp-tab{
            font-size:15px;
            white-space:nowrap;
          }

          .sp-card{
            padding:18px;
          }

          .sp-card-name h3{
            font-size:18px;
          }

          .sp-pill{
            font-size:13px;
          }

          .sp-bars{
            gap:2px;
            height:32px;
            padding:0;
          }

          .sp-card-foot{
            font-size:12px;
            gap:7px;
          }

          .sp-card-foot b{
            font-size:12px;
          }

          .sp-day{
            padding:0;
          }

          .sp-day-head h3{
            font-size:20px;
          }

          .sp-day-head span{
            font-size:13px;
          }

          .sp-sub-panel{
            right:auto;
            left:0;
          }
        }

        @media (max-width:600px){
          .sp-guarantee{
            display:none;
          }

          .sp-title{
            font-size:36px;
          }

          .sp-desc{
            max-width:100%;
          }

          .sp-tools{
            align-items:stretch;
          }

          .sp-search{
            width:100%;
          }

          .sp-sub{
            width:100%;
          }

          .sp-sub-btn{
            width:100%;
            justify-content:center;
          }

          .sp-card-top{
            align-items:flex-start;
          }

          .sp-card-name h3{
            font-size:17px;
          }

          .sp-card-foot{
            font-size:11px;
          }

          .sp-card-foot b{
            font-size:11px;
          }

          .sp-art{
            opacity:.2;
            max-width:100%;
          }
        }
      `}</style>

      <section className="sp-hero">
        <header className="sp-nav">
          <Link
            to="/"
            className="sp-logo"
            aria-label="VisaGo home"
          >
            visa<span>go</span>
          </Link>

          <div className="sp-nav-r">
            <a
              href="#guarantee"
              className="sp-guarantee"
            >
              <Icon
                d={ICONS.shield}
                size={30}
                sw={1.5}
              />
              On Time Guaranteed
            </a>

            <button
              className="sp-user"
              aria-label="Account"
            >
              <Icon d={ICONS.user} size={19} />
            </button>
          </div>
        </header>

        <div className="sp-hero-in">
          <div className="sp-crumb">
            Transparency &gt;{" "}
            <b>Government Portal Status</b>
          </div>

          <h1 className="sp-title">
            VisaGo &amp; Government Portal
            <span>Systems Tracker</span>
          </h1>

          <p className="sp-desc">
            A real-time dashboard showing whether
            VisaGo and government visa portals are
            operational or experiencing issues.
          </p>
        </div>

        <HeroArt />
      </section>

      <main className="sp-main">
        <div
          className="sp-tabs"
          role="tablist"
        >
          {[
            ["status", "Government Portal Statuses"],
            ["incidents", "Past Incidents"],
          ].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={tab === key}
              className={`sp-tab ${
                tab === key ? "on" : ""
              }`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="sp-tools">
          <label className="sp-search">
            <Icon d={ICONS.search} size={19} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search for countries"
            />
          </label>

          <Subscribe
            portals={status.data?.portals ?? []}
          />
        </div>

        {tab === "status" && (
          <>
            {status.loading && <Skeleton />}

            {status.error && (
              <ErrorState onRetry={status.reload} />
            )}

            {status.data && (
              <>
                {status.data.atlys && (
                  <UptimeCard
                    entity={status.data.atlys}
                    brand
                  />
                )}

                <div className="sp-divider">
                  GOVERNMENT PORTALS
                </div>

                <div className="sp-stack">
                  {portals.map((portal) => (
                    <UptimeCard
                      key={portal.id}
                      entity={portal}
                    />
                  ))}

                  {portals.length === 0 && (
                    <div className="sp-empty">
                      {q
                        ? `No countries match "${search}".`
                        : "No government portal data available."}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === "incidents" && (
          <>
            {incidents.loading && (
              <Skeleton count={2} height={180} />
            )}

            {incidents.error && (
              <ErrorState onRetry={incidents.reload} />
            )}

            {incidents.data &&
              days.length === 0 && (
                <div className="sp-empty">
                  {q
                    ? `No incidents for "${search}".`
                    : "No incidents available."}
                </div>
              )}

            {days.map((day) => (
              <section
                className="sp-day"
                key={day.date}
              >
                <div className="sp-day-head">
                  <h3>{fmtDay(day.date)}</h3>

                  <span>
                    {day.countries.length}{" "}
                    {day.countries.length === 1
                      ? "country"
                      : "countries"}{" "}
                    faced performance issues
                  </span>
                </div>

                {day.countries.map((country) => (
                  <IncidentCountry
                    key={`${day.date}-${country.name}`}
                    country={country}
                  />
                ))}
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}