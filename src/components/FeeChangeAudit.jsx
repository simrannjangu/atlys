import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./FeeChangeAudit.css";

const FEE_AUDIT_API =
  "https://atlys-backend-cr9i.onrender.com/api/price-changes";

/* =========================================================
   HELPERS
========================================================= */

function normalizeAuditResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.priceChanges)) {
    return response.priceChanges;
  }

  if (Array.isArray(response?.feeChanges)) {
    return response.feeChanges;
  }

  if (Array.isArray(response?.audits)) {
    return response.audits;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getCountryName(item = {}) {
  if (typeof item.country === "string") {
    return item.country;
  }

  return (
    item.country?.name ||
    item.country?.countryName ||
    item.countryName ||
    item.country?.title ||
    item.name ||
    ""
  );
}

function getCountryFlag(item = {}) {
  return (
    item.country?.flag ||
    item.country?.flagUrl ||
    item.flag ||
    item.flagUrl ||
    ""
  );
}

function getFeeType(item = {}) {
  const feeType = String(
    item.feeType ||
    item.type ||
    item.feeCategory ||
    item.category ||
    "Fee"
  );

  if (feeType.toLowerCase() === "governmentfee") {
    return "Government Fee";
  }

  if (feeType.toLowerCase() === "servicefee") {
    return "Service Fee";
  }

  return feeType;
}

function getFromAmount(item = {}) {
  if (item.oldAmount !== undefined && item.oldAmount !== null) {
    return item.oldAmount;
  }

  if (item.from !== undefined && item.from !== null) {
    return item.from;
  }

  if (item.oldFee !== undefined && item.oldFee !== null) {
    return item.oldFee;
  }

  if (item.previousFee !== undefined && item.previousFee !== null) {
    return item.previousFee;
  }

  return "";
}

function getToAmount(item = {}) {
  if (item.newAmount !== undefined && item.newAmount !== null) {
    return item.newAmount;
  }

  if (item.to !== undefined && item.to !== null) {
    return item.to;
  }

  if (item.newFee !== undefined && item.newFee !== null) {
    return item.newFee;
  }

  if (item.updatedFee !== undefined && item.updatedFee !== null) {
    return item.updatedFee;
  }

  return "";
}

function getDifference(item = {}) {
  if (
    item.differenceAmount !== undefined &&
    item.differenceAmount !== null &&
    item.differenceAmount !== ""
  ) {
    return item.differenceAmount;
  }

  if (
    item.difference !== undefined &&
    item.difference !== null &&
    item.difference !== ""
  ) {
    return item.difference;
  }

  const from = Number(getFromAmount(item));
  const to = Number(getToAmount(item));

  if (Number.isFinite(from) && Number.isFinite(to)) {
    return to - from;
  }

  return "";
}

function getReason(item = {}) {
  return (
    item.reason ||
    item.reasonForChange ||
    item.description ||
    item.notes ||
    ""
  );
}

function getDate(item = {}) {
  return (
    item.date ||
    item.changeDate ||
    item.effectiveDate ||
    item.createdAt ||
    ""
  );
}

function getCurrency(item = {}) {
  return item.currency || item.visa?.currency || "INR";
}

function isImageUrl(value) {
  return typeof value === "string" &&
    /^(https?:\/\/|data:image\/)/i.test(value.trim());
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(value, currency = "INR") {
  if (value === "" || value === null || value === undefined) {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch {
    return `${currency} ${numericValue}`;
  }
}

function formatDifference(value, currency = "INR") {
  if (value === "" || value === null || value === undefined) {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  const sign = numericValue > 0 ? "+" : "";

  return `${sign}${formatMoney(
    numericValue,
    currency
  )}`;
}

/* =========================================================
   COMPONENT
========================================================= */

function FeeChangeAudit() {
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCountry, setSelectedCountry] =
    useState("");

  const [activeCountry, setActiveCountry] =
    useState("");

  /* =======================================================
     FETCH API
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function fetchFeeAudit() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(FEE_AUDIT_API);

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Fee audit API returned ${response.status}`
          );
        }

        const list = normalizeAuditResponse(data);

        if (!cancelled) {
          setAuditData(list);

          const countries = [
            ...new Set(
              list
                .map((item) => getCountryName(item).trim())
                .filter(Boolean)
            ),
          ];

          if (countries.length > 0) {
            setSelectedCountry(countries[0]);
            setActiveCountry(countries[0]);
          }
        }
      } catch (err) {
        console.error("FEE AUDIT API ERROR:", err);

        if (!cancelled) {
          setAuditData([]);
          setError(
            err?.message ||
              "Unable to load fee change history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchFeeAudit();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     COUNTRIES
  ======================================================= */

  const countries = useMemo(() => {
    return [
      ...new Set(
        auditData
          .map((item) => getCountryName(item).trim())
          .filter(Boolean)
      ),
    ];
  }, [auditData]);

  /* =======================================================
     CURRENT COUNTRY DATA
  ======================================================= */

  const countryRows = useMemo(() => {
    if (!activeCountry) {
      return [];
    }

    return auditData
      .filter(
        (item) =>
          getCountryName(item).trim().toLowerCase() ===
          activeCountry.trim().toLowerCase()
      )
      .sort((a, b) => {
        const dateA = new Date(getDate(a)).getTime();
        const dateB = new Date(getDate(b)).getTime();

        if (
          Number.isFinite(dateA) &&
          Number.isFinite(dateB)
        ) {
          return dateB - dateA;
        }

        return 0;
      });
  }, [auditData, activeCountry]);

  const activeCountryFlag = useMemo(() => {
    const item = countryRows.find(
      (entry) => getCountryFlag(entry)
    );

    return item ? getCountryFlag(item) : "";
  }, [countryRows]);

  /* =======================================================
     HANDLE CHECK
  ======================================================= */

  const handleCheck = () => {
    setActiveCountry(selectedCountry);
  };

  return (
    <div className="fee-audit-page">
      <Navbar />

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="fee-audit-hero">
        <div className="fee-audit-hero-glow"></div>
        <div className="fee-audit-currency-pattern">
          <span>₹</span>
          <span>$</span>
          <span>€</span>
          <span>¥</span>
          <span>£</span>
          <span>₹</span>
          <span>$</span>
          <span>€</span>
          <span>¥</span>
          <span>£</span>
          <span>₹</span>
          <span>$</span>
          <span>€</span>
          <span>¥</span>
          <span>£</span>
        </div>

        <div className="fee-audit-hero-content">

          <div className="fee-audit-breadcrumb">
            <span>TRANSPARENCY</span>
            <span>&gt;</span>
            <strong>FEE CHANGE HISTORY</strong>
          </div>

          <h1>
            Every fee ever{" "}
            <span>changed</span>
            <br />
            is right here.
          </h1>

          <p>
            With time and reason. You never have to guess.
          </p>

          {/* COUNTRY SEARCH */}
          <div className="fee-audit-selector">

            <div className="fee-audit-selector-left">
              <div className="fee-audit-location-icon">
                ●
              </div>

              <div className="fee-audit-selector-text">
                <span>Where to</span>

                <select
                  value={selectedCountry}
                  onChange={(event) =>
                    setSelectedCountry(
                      event.target.value
                    )
                  }
                  disabled={loading || countries.length === 0}
                >
                  {countries.length === 0 ? (
                    <option value="">
                      No countries
                    </option>
                  ) : (
                    countries.map((country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="fee-audit-check-button"
              onClick={handleCheck}
              disabled={
                loading ||
                !selectedCountry
              }
            >
              Check
              <span>→</span>
            </button>

          </div>
        </div>
      </section>

      {/* ===================================================
          DATA SECTION
      =================================================== */}

      <main className="fee-audit-main">

        {loading && (
          <div className="fee-audit-state">
            <div className="fee-audit-loader"></div>
            <p>Loading fee change history...</p>
          </div>
        )}

        {!loading && error && (
          <div className="fee-audit-state fee-audit-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          activeCountry && (
            <section className="fee-audit-country-section">

              {/* COUNTRY HEADER */}
              <div className="fee-audit-country-header">

                <div className="fee-audit-country-icon">
                  {isImageUrl(activeCountryFlag) ? (
                    <img
                      src={activeCountryFlag}
                      alt={`${activeCountry} flag`}
                    />
                  ) : activeCountryFlag ? (
                    <span>{activeCountryFlag}</span>
                  ) : (
                    <span>◐</span>
                  )}
                </div>

                <h2>{activeCountry}</h2>

              </div>

              {/* TABLE */}
              {countryRows.length === 0 ? (
                <div className="fee-audit-empty">
                  No fee changes available for{" "}
                  {activeCountry}.
                </div>
              ) : (
                <div className="fee-audit-table-wrapper">

                  <table className="fee-audit-table">

                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Fee Type</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Difference</th>
                        <th>
                          Reason for Fee Change
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {countryRows.map(
                        (item, index) => {
                          const currency =
                            getCurrency(item);

                          const difference =
                            getDifference(item);

                          const numericDifference =
                            Number(difference);

                          let differenceClass =
                            "";

                          if (
                            Number.isFinite(
                              numericDifference
                            )
                          ) {
                            if (
                              numericDifference > 0
                            ) {
                              differenceClass =
                                "difference-positive";
                            } else if (
                              numericDifference < 0
                            ) {
                              differenceClass =
                                "difference-negative";
                            }
                          }

                          return (
                            <tr
                              key={
                                item?._id ||
                                item?.id ||
                                index
                              }
                            >
                              <td>
                                {formatDate(
                                  getDate(item)
                                )}
                              </td>

                              <td>
                                <span
                                  className={`fee-type-badge ${
                                    String(
                                      getFeeType(item)
                                    )
                                      .toLowerCase()
                                      .includes(
                                        "service"
                                      )
                                      ? "service"
                                      : "government"
                                  }`}
                                >
                                  {getFeeType(item)}
                                </span>
                              </td>

                              <td>
                                {formatMoney(
                                  getFromAmount(item),
                                  currency
                                )}
                              </td>

                              <td>
                                {formatMoney(
                                  getToAmount(item),
                                  currency
                                )}
                              </td>

                              <td
                                className={
                                  differenceClass
                                }
                              >
                                {formatDifference(
                                  difference,
                                  currency
                                )}
                              </td>

                              <td className="reason-cell">
                                {getReason(item) ||
                                  "—"}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>

                  </table>

                </div>
              )}

            </section>
          )}

      </main>

      <Footer />
    </div>
  );
}

export default FeeChangeAudit;