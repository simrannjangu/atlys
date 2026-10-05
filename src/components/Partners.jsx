import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Partners.css";

const PARTNERS_API = "https://atlys-backend-cr9i.onrender.com/api/partners";

function normalizePartners(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.partners)) {
    return response.partners;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getLogo(partner) {
  return partner?.logo || "";
}

function getCategory(partner) {
  return partner?.partnerType?.name || "Other";
}

function formatCategory(category) {
  return String(category)
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPartners() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(PARTNERS_API);

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message || `Partners API returned ${response.status}`
          );
        }

        const apiPartners = normalizePartners(data);

        if (!cancelled) {
          setPartners(apiPartners);
        }
      } catch (err) {
        console.error("PARTNERS API ERROR:", err);

        if (!cancelled) {
          setPartners([]);
          setError(
            err?.message || "Unable to load partners right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPartners();

    return () => {
      cancelled = true;
    };
  }, []);

  const groupedPartners = useMemo(() => {
    const groups = {};

    partners
      .filter((partner) => {
        // Only show active partners
        if (partner?.active === false) {
          return false;
        }

        // Also ignore inactive partner types
        if (partner?.partnerType?.active === false) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          (Number(a?.displayOrder) || 0) -
          (Number(b?.displayOrder) || 0)
      )
      .forEach((partner) => {
        const category = getCategory(partner);

        if (!groups[category]) {
          groups[category] = [];
        }

        groups[category].push(partner);
      });

    return Object.entries(groups);
  }, [partners]);

  return (
    <div className="partners-page">
      <Navbar />

      <main className="partners-main">

        {/* HERO */}
        <section className="partners-hero">
          <div className="partners-hero-title">
            <h1>
              The brands
              <br />
              we travel with.
            </h1>
          </div>

          <div className="partners-hero-description">
            Airlines, banks, fintech, study, lifestyle. The companies that
            trust VisaGo with their customers.
          </div>
        </section>

        {/* PARTNER SECTIONS */}
        <section className="partners-content">

          {/* LOADING */}
          {loading && (
            <div className="partners-state">
              <div className="partners-loader"></div>
              <p>Loading partners...</p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="partners-state partners-error">
              <p>{error}</p>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            groupedPartners.length === 0 && (
              <div className="partners-state">
                <p>No partners available.</p>
              </div>
            )}

          {/* DYNAMIC CATEGORIES */}
          {!loading &&
            !error &&
            groupedPartners.map(([category, categoryPartners]) => (
              <section
                className="partner-category"
                key={category}
              >

                {/* CATEGORY NAME */}
                <div className="partner-category-title">
                  <h2>{formatCategory(category)}</h2>
                </div>

                {/* PARTNER CARDS */}
                <div className="partner-grid">

                  {categoryPartners.map((partner, index) => {
                    const logo = getLogo(partner);
                    const website = partner?.website?.trim();

                    const cardKey =
                      partner?._id ||
                      partner?.id ||
                      `${category}-${index}`;

                    const cardContent = (
                      <>
                        <div className="partner-logo-box">

                          {logo ? (
                            <img
                              src={logo}
                              alt={
                                partner?.companyName ||
                                "Partner"
                              }
                              className="partner-logo"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";

                                const fallback =
                                  event.currentTarget
                                    .nextElementSibling;

                                if (fallback) {
                                  fallback.style.display =
                                    "flex";
                                }
                              }}
                            />
                          ) : null}

                          {/* FALLBACK WHEN LOGO IS EMPTY */}
                          <div
                            className="partner-logo-fallback"
                            style={{
                              display: logo
                                ? "none"
                                : "flex",
                            }}
                          >
                            {partner?.companyName
                              ? partner.companyName
                                  .charAt(0)
                                  .toUpperCase()
                              : "P"}
                          </div>

                        </div>

                        {/* COMPANY NAME */}
                        <div className="partner-name">
                          {partner?.companyName ||
                            "Partner"}
                        </div>
                      </>
                    );

                    // CLICKABLE CARD WHEN WEBSITE EXISTS
                    if (website) {
                      return (
                        <a
                          key={cardKey}
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="partner-card"
                          aria-label={`Visit ${partner?.companyName || "partner"} website`}
                        >
                          {cardContent}
                        </a>
                      );
                    }

                    // NORMAL CARD WHEN WEBSITE IS EMPTY
                    return (
                      <div
                        key={cardKey}
                        className="partner-card partner-card-disabled"
                      >
                        {cardContent}
                      </div>
                    );
                  })}

                </div>
              </section>
            ))}
        </section>

        {/* CTA */}
        <section className="partners-cta">

          <div className="partners-cta-content">
            <h2>
              Want to be on
              <br />
              this page?
            </h2>

            <p>
              We work with brands whose audiences travel.
              If that's you,
              <strong> partnerships@visago.com</strong> is the
              way in.
            </p>
          </div>

          <Link
            to="/contact"
            className="partners-cta-button"
          >
            Get in touch
          </Link>

        </section>

        {/* BOTTOM LINE */}
        <div className="partners-bottom-line"></div>

      </main>

      <Footer />
    </div>
  );
}

export default Partners;