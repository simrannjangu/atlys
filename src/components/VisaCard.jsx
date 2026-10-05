import { Link } from "react-router-dom";

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function VisaCard({ destination = {} }) {
 
  const visa = destination;

  const country =
    typeof visa.country === "string"
      ? visa.country
      : visa.country?.name ||
        visa.country?.countryName ||
        visa.country?.title ||
        "";

  const countryName =
    typeof visa.country === "string"
      ? visa.country
      : visa.country?.name ||
        visa.country?.countryName ||
        visa.country?.title ||
        "";

  const slug =
    visa.slug ||
    visa.country?.slug ||
    slugify(countryName);

 
  const image = visa.country?.image || visa.image || null;

  const backendFlag =
    visa.country?.flag ||
    visa.country?.flagUrl ||
    visa.flag ||
    visa.flagUrl ||
    visa.flagImage ||
    visa.flagImageUrl ||
    null;

 
  const flagCodes = {
    "United States": "us",
    "United States of America": "us",
    USA: "us",
    Canada: "ca",
    Germany: "de",
    France: "fr",
    "United Kingdom": "gb",
    UK: "gb",
    Italy: "it",
    Spain: "es",
    Portugal: "pt",
    Switzerland: "ch",
    Netherlands: "nl",
    Belgium: "be",
    Austria: "at",
    Australia: "au",
    "New Zealand": "nz",
    Japan: "jp",
    "South Korea": "kr",
    Korea: "kr",
    China: "cn",
    Singapore: "sg",
    Thailand: "th",
    Malaysia: "my",
    Indonesia: "id",
    Vietnam: "vn",
    India: "in",
    Turkey: "tr",
    UAE: "ae",
    "United Arab Emirates": "ae",
    "Saudi Arabia": "sa",
    Qatar: "qa",
    Egypt: "eg",
    "South Africa": "za",
    Brazil: "br",
    Mexico: "mx",
    Argentina: "ar",
    Ireland: "ie",
    Greece: "gr",
    Malta: "mt",
    Croatia: "hr",
    Denmark: "dk",
    Sweden: "se",
    Norway: "no",
    Finland: "fi",
    Iceland: "is",
    Poland: "pl",
    "Czech Republic": "cz",
    Czechia: "cz",
    Hungary: "hu",
    Romania: "ro",
    Bulgaria: "bg",
    Luxembourg: "lu",
    Estonia: "ee",
    Latvia: "lv",
    Lithuania: "lt",
    Slovenia: "si",
    Slovakia: "sk",
  };

  const countryCode = flagCodes[country] || null;

  const flag =
    typeof backendFlag === "string" &&
    backendFlag.startsWith("http")
      ? backendFlag
      : countryCode
      ? `https://flagcdn.com/w80/${countryCode}.png`
      : null;


  const type =
    visa.type ||
    visa.visaType ||
    visa.applicationType ||
    visa.category ||
    "";


  const validity =
    visa.validity ||
    visa.validityPeriod ||
    visa.duration ||
    "";


  const fees =
    visa.totalFee ??
    visa.fees ??
    visa.fee ??
    visa.price ??
    visa.visaFee ??
    "";

  return (
    <Link
      to={slug ? `/visa/${slug}` : "#"}
      state={{ visa }}
      className={`visa-card ${
        !country ? "visa-card-placeholder" : ""
      }`}
    >
      {/* COUNTRY IMAGE */}
      <div className="visa-card-image">
        {image ? (
          <img
            src={image}
            alt={country || "Destination"}
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

      {/* DARK GRADIENT */}
      <div className="visa-card-gradient"></div>

      {/* CONTENT */}
      <div className="visa-card-overlay">
        {/* COUNTRY */}
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
              <span>
                {country
                  ? country.charAt(0).toUpperCase()
                  : "•"}
              </span>
            )}
          </div>

          <h3>{country || "Destination"}</h3>
        </div>

        {/* DETAILS */}
        <div className="visa-card-details">
          <div className="visa-detail">
            <span>TYPE</span>
            <strong>{type || "—"}</strong>
          </div>

          <div className="visa-detail">
            <span>VALID</span>
            <strong>{validity || "—"}</strong>
          </div>

          <div className="visa-detail">
            <span>FEES</span>
            <strong>
              {fees !== "" ? `₹${fees}` : "—"}
            </strong>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default VisaCard;