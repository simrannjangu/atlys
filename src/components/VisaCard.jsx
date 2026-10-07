import { Link } from "react-router-dom";

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FLAG_CODES = {
  "United States": "us", "United States of America": "us", USA: "us", Canada: "ca",
  Germany: "de", France: "fr", "United Kingdom": "gb", UK: "gb", Italy: "it",
  Spain: "es", Portugal: "pt", Switzerland: "ch", Netherlands: "nl", Belgium: "be",
  Austria: "at", Australia: "au", "New Zealand": "nz", Japan: "jp",
  "South Korea": "kr", Korea: "kr", China: "cn", Singapore: "sg", Thailand: "th",
  Malaysia: "my", Indonesia: "id", Vietnam: "vn", India: "in", Turkey: "tr",
  UAE: "ae", "United Arab Emirates": "ae", "Saudi Arabia": "sa", Qatar: "qa",
  Egypt: "eg", "South Africa": "za", Brazil: "br", Mexico: "mx", Argentina: "ar",
  Ireland: "ie", Greece: "gr", Malta: "mt", Croatia: "hr", Denmark: "dk",
  Sweden: "se", Norway: "no", Finland: "fi", Iceland: "is", Poland: "pl",
  "Czech Republic": "cz", Czechia: "cz", Hungary: "hu", Romania: "ro",
  Bulgaria: "bg", Luxembourg: "lu", Estonia: "ee", Latvia: "lv", Lithuania: "lt",
  Slovenia: "si", Slovakia: "sk", "Sri Lanka": "lk", Cambodia: "kh",
  Philippines: "ph", Maldives: "mv", Nepal: "np", Bhutan: "bt", Kenya: "ke",
  Morocco: "ma", Jordan: "jo", Oman: "om", Bahrain: "bh", Kuwait: "kw",
  Russia: "ru", "Hong Kong": "hk", Taiwan: "tw", Azerbaijan: "az", Georgia: "ge",
  Armenia: "am", Uzbekistan: "uz", Kazakhstan: "kz", Mauritius: "mu",
  Seychelles: "sc", Fiji: "fj", Cyprus: "cy", Serbia: "rs", Albania: "al",
  Laos: "la", Myanmar: "mm", Bangladesh: "bd", Pakistan: "pk", Israel: "il",
};

function VisaCard({ destination = {} }) {
  const visa = destination;

  const country =
    typeof visa.country === "string"
      ? visa.country
      : visa.country?.name ||
        visa.country?.countryName ||
        visa.country?.title ||
        "";

  const slug = visa.slug || visa.country?.slug || slugify(country);

  const image = visa.image || visa.country?.image || null;

  const backendFlag =
    visa.country?.flag ||
    visa.country?.flagUrl ||
    visa.flag ||
    visa.flagUrl ||
    visa.flagImage ||
    visa.flagImageUrl ||
    null;

  const countryCode = FLAG_CODES[country] || null;

  const flag =
    typeof backendFlag === "string" && backendFlag.startsWith("http")
      ? backendFlag
      : countryCode
      ? `https://flagcdn.com/w80/${countryCode}.png`
      : null;

  const type =
    visa.type || visa.visaType || visa.applicationType || visa.category || "";

  const validity = visa.validity || visa.validityPeriod || visa.duration || "";

  const rawFees =
    visa.totalFee ?? visa.fees ?? visa.fee ?? visa.price ?? visa.visaFee ?? "";

  const fees =
    rawFees !== "" && rawFees !== null && !isNaN(Number(rawFees)) && Number(rawFees) > 0
      ? Number(rawFees).toLocaleString("en-IN")
      : "";
    const docsRaw = Array.isArray(visa.documentsRequired)
  ? visa.documentsRequired
  : Array.isArray(visa.documents)
  ? visa.documents
  : [];

const docNames = docsRaw
  .map((d) => (typeof d === "string" ? d : d?.name || d?.title || ""))
  .filter(Boolean);

const docsLabel =
  docNames.length > 2
    ? `${docNames.slice(0, 2).join(", ")} +${docNames.length - 2}`
    : docNames.join(", ");
  return (
    <Link
      to={slug ? `/visa/${slug}` : "#"}
      state={{ visa }}
      className={`visa-card ${!country ? "visa-card-placeholder" : ""}`}
    >
      <div className="visa-card-image">
        {image ? (
          <img
            src={image}
            alt={country || "Destination"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span>VisaGo</span>
          </div>
        )}
      </div>

      <div className="visa-card-gradient"></div>

     <div className="visa-card-overlay">
  <div className="visa-country">
    <div className="country-flag-placeholder">
      {flag ? (
        <img
          src={flag}
          alt={`${country} flag`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{country ? country.charAt(0).toUpperCase() : "•"}</span>
      )}
    </div>

    <h3>{country || "Destination"}</h3>
  </div>

  <div className="visa-card-details">
    <div className="visa-detail">
      <span>TYPE</span>
      <strong>{type || "—"}</strong>
    </div>

    <div className="visa-detail">
      <span>VALID</span>
      <strong>{validity || "—"}</strong>
    </div>

    {fees && (
      <div className="visa-detail">
        <span>FEES</span>
        <strong>₹{fees}</strong>
      </div>
    )}
  </div>

  {/* REVEALED ON HOVER */}
  <div className="visa-card-extra">
    <div className="visa-card-extra-inner">
      <div className="visa-extra-docs">
        <span>DOCUMENTS NEEDED:</span>
        <strong>{docsLabel || "Passport"}</strong>
      </div>

      <div className="visa-extra-pill">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3">
          <circle cx="12" cy="12" r="9" />
        </svg>
        Get emergency assistance
      </div>
    </div>
  </div>
</div>
    </Link>
  );
}

export default VisaCard;