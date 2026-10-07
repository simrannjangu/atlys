import { useEffect, useRef, useState } from "react";

const OPTIONS = {
  delivery: ["Any Time", "Fastest", "Standard"],
  type: ["All Visa Types", "e-Visa", "Sticker", "Visa on Arrival", "No Visa Required"],
  documents: ["Any Documents", "Passport", "Photo", "Bank Statements", "Income Tax Returns"],
};

function Chevron({ open }) {
  return (
    <svg
      className={`af-chevron ${open ? "open" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function VisaFilters() {
  const [visaDelivery, setVisaDelivery] = useState("Any Time");
  const [visaType, setVisaType] = useState("All Visa Types");
  const [documents, setDocuments] = useState("Any Documents");
  const [travelDate, setTravelDate] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const barRef = useRef(null);

  const today = new Date();
  const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  useEffect(() => {
    const handleClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name));

  const dateLabel = travelDate
    ? new Date(travelDate + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select Dates";

  const filters = [
    {
      key: "delivery",
      label: "Visa delivery:",
      icon: "⚡",
      iconClass: "delivery-icon",
      value: visaDelivery,
      set: setVisaDelivery,
      options: OPTIONS.delivery,
    },
    {
      key: "type",
      label: "Type:",
      icon: "✈",
      iconClass: "type-icon",
      value: visaType,
      set: setVisaType,
      options: OPTIONS.type,
    },
    {
      key: "documents",
      label: "Documents:",
      icon: "▤",
      iconClass: "documents-icon",
      value: documents,
      set: setDocuments,
      options: OPTIONS.documents,
    },
  ];

  return (
    <section className="atlys-filter-section">
      <div className="atlys-filters" ref={barRef}>
        {filters.map((f) => (
          <div className="atlys-filter" key={f.key}>
            <button
              type="button"
              className="atlys-filter-btn"
              onClick={() => toggle(f.key)}
            >
              <span className={`filter-icon ${f.iconClass}`}>{f.icon}</span>
              <span className="filter-text">
                <span className="filter-label">{f.label}</span>
                <span className="filter-value">
                  {f.value}
                  <Chevron open={openMenu === f.key} />
                </span>
              </span>
            </button>

            {openMenu === f.key && (
              <ul className="atlys-menu">
                {f.options.map((opt) => (
                  <li key={opt}>
                    <button
                      type="button"
                      className={opt === f.value ? "selected" : ""}
                      onClick={() => {
                        f.set(opt);
                        setOpenMenu(null);
                      }}
                    >
                      {opt}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="atlys-filter holiday-filter">
          <button
            type="button"
            className="atlys-filter-btn"
            onClick={() => toggle("dates")}
          >
            <span className="filter-icon holiday-icon">✈</span>
            <span className="filter-text">
              <span className="filter-label">Holidays:</span>
              <span className="filter-value">
                {dateLabel}
                <Chevron open={openMenu === "dates"} />
              </span>
            </span>
          </button>

          {openMenu === "dates" && (
            <div className="atlys-menu atlys-date-menu">
              <input
                type="date"
                value={travelDate}
                min={todayString}
                autoFocus
                onChange={(e) => {
                  setTravelDate(e.target.value);
                  setOpenMenu(null);
                }}
              />
              {travelDate && (
                <button
                  type="button"
                  className="atlys-date-clear"
                  onClick={() => {
                    setTravelDate("");
                    setOpenMenu(null);
                  }}
                >
                  Clear date
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default VisaFilters;