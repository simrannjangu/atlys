import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const FAQ_API = "https://atlys-backend-cr9i.onrender.com/api/faqs/admin/all";

/* =========================================================
   HELPERS
========================================================= */

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCountryName(item = {}) {
  if (typeof item.country === "string") {
    return item.country;
  }

  return (
    item.country?.name ||
    item.country?.countryName ||
    item.country?.title ||
    item.name ||
    item.countryName ||
    ""
  );
}

/*
=========================================================
IMPORTANT

ONLY USE THE ROOT LEVEL:

visa.image

DO NOT USE:

visa.country.image
=========================================================
*/

function getVisaImage(item = {}) {
  return item.image || null;
}

/*
=========================================================
FLAG

Use country.flag from the API
=========================================================
*/

function getFlag(item = {}) {
  return (
    item.country?.flag ||
    item.flag ||
    item.flagUrl ||
    item.flagImage ||
    item.flagImageUrl ||
    null
  );
}

function getType(item = {}) {
  return (
    item.visaType ||
    item.type ||
    item.applicationType ||
    item.category ||
    ""
  );
}

function getValidity(item = {}) {
  return (
    item.validity ||
    item.validityPeriod ||
    item.duration ||
    ""
  );
}

function getStay(item = {}) {
  return (
    item.stayDuration ||
    item.stay ||
    item.maxStay ||
    ""
  );
}

function getProcessing(item = {}) {
  return (
    item.processingTime ||
    item.processing ||
    ""
  );
}

function getFees(item = {}) {
  return (
    item.totalFee ||
    item.fees ||
    item.fee ||
    item.price ||
    item.visaFee ||
    ""
  );
}

function getDocuments(item = {}) {
  if (Array.isArray(item.documentsRequired)) {
    return item.documentsRequired;
  }

  if (Array.isArray(item.documents)) {
    return item.documents;
  }

  return [];
}

/* =========================================================
   COMPONENT
========================================================= */

function ApplicationButton({ visa, className, children, style }) {
  return (
    <Link
      to="/tdac"
      state={{ visa }}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}

function VisaDetails() {
  const { slug } = useParams();
  const location = useLocation();

  const [visa, setVisa] = useState(location.state?.visa || null);
  const [allVisas, setAllVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visaFaqData, setVisaFaqData] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  /* =======================================================
     FETCH VISA API
  ======================================================= */

  useEffect(() => {
    if (location.state?.visa) {
      setVisa(location.state.visa);
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch("http://192.168.1.12:5000/api/visas")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `API returned ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        console.log("VISA DETAILS API:", data);

        /*
        API can return:

        [
          {...},
          {...}
        ]

        OR:

        {
          visas: [...]
        }

        OR:

        {
          data: [...]
        }
        */

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

        console.log("VISA LIST:", list);

        setAllVisas(list);

        /*
        Match URL:

        /visa/south-korea

        with:

        country.name = South Korea
        */

        const matchedVisa = list.find((item) => {
          const countryName =
            getCountryName(item);

          const itemSlug =
            item.slug ||
            item.country?.slug ||
            slugify(countryName);

          return itemSlug === slug;
        });

        console.log("MATCHED VISA:", matchedVisa);

        setVisa(matchedVisa || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "VISA DETAILS API ERROR:",
          error
        );

        setVisa(null);
        setLoading(false);
      });
  }, [slug, location.state]);

  /* =======================================================
     RELATED VISAS
  ======================================================= */

  const relatedVisas = useMemo(() => {
    if (!visa) {
      return [];
    }

    return allVisas
      .filter((item) => {
        const name =
          getCountryName(item);

        const itemSlug =
          item.slug ||
          item.country?.slug ||
          slugify(name);

        return itemSlug !== slug;
      })
      .slice(0, 4);
  }, [allVisas, slug, visa]);

  /* =======================================================
     CURRENT COUNTRY + VISA FAQs
  ======================================================= */

  const country = getCountryName(visa || {});

  /* =======================================================
     FETCH VISA FAQs
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const fetchFaqs = async () => {
      if (!visa) {
        setVisaFaqData([]);
        setFaqLoading(false);
        setFaqError("");
        return;
      }

      setFaqLoading(true);
      setFaqError("");
      setVisaFaqData([]);
      setOpenFaq(null);

      try {
        const token = localStorage.getItem("visagoToken");

        const response = await fetch(FAQ_API, {
          method: "GET",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        console.log("FAQ API STATUS:", response.status);
        console.log("FAQ API RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data?.message || `FAQ API returned ${response.status}`
          );
        }

        const allFaqs = Array.isArray(data?.faqs)
          ? data.faqs
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

        const currentCountryId = String(
          visa?.country?._id || ""
        );

        const currentCountryName = String(
          visa?.country?.name ||
            visa?.country?.countryName ||
            country ||
            ""
        )
          .trim()
          .toLowerCase();

        const currentVisaId = String(visa?._id || "");

        const matchesCountry = (faq) => {
          const faqCountryId = String(
            faq?.country?._id || ""
          );

          const faqCountryName = String(
            faq?.country?.name ||
              faq?.country?.countryName ||
              ""
          )
            .trim()
            .toLowerCase();

          if (currentCountryId && faqCountryId) {
            return faqCountryId === currentCountryId;
          }

          return (
            !currentCountryId &&
            !!currentCountryName &&
            faqCountryName === currentCountryName
          );
        };

        /*
         * VISA FAQs:
         * type = "visa"
         * active = true
         * country-specific FAQs match the current country
         * country-less FAQs are treated as general visa FAQs
         * exact current-visa FAQs appear first
         */
        const visaFaqs = allFaqs
          .filter((faq) => {
            if (
              String(faq?.type || "").trim().toLowerCase() !==
              "visa"
            ) {
              return false;
            }

            if (faq?.active !== true) {
              return false;
            }

            if (!faq?.country) {
              return true;
            }

            return matchesCountry(faq);
          })
          .sort((a, b) => {
            const aExactVisa =
              currentVisaId &&
              String(a?.visa?._id || "") === currentVisaId;

            const bExactVisa =
              currentVisaId &&
              String(b?.visa?._id || "") === currentVisaId;

            if (aExactVisa !== bExactVisa) {
              return aExactVisa ? -1 : 1;
            }

            return (
              (Number(a?.order) || 0) -
              (Number(b?.order) || 0)
            );
          });

        console.log(
          "CURRENT VISA:",
          visa?._id,
          "CURRENT COUNTRY:",
          currentCountryId,
          country
        );

        console.log(
          "VISA FAQS FOR CURRENT COUNTRY:",
          visaFaqs
        );

        if (!cancelled) {
          setVisaFaqData(visaFaqs);
          setOpenFaq(null);
        }
      } catch (error) {
        console.error("FAQ API ERROR:", error);

        if (!cancelled) {
          setVisaFaqData([]);
            setFaqError(
            error?.message ||
              "Unable to load FAQs right now."
          );
        }
      } finally {
        if (!cancelled) {
          setFaqLoading(false);
        }
      }
    };

    fetchFaqs();

    return () => {
      cancelled = true;
    };
  }, [visa, country]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="visa-details-loading">
        <div className="visa-loader"></div>

        <p>
          Loading visa information...
        </p>

        <style>{`
          .visa-details-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: #f8f9fa;
            color: #555;
            font-family: Arial, Helvetica, sans-serif;
          }

          .visa-loader {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 3px solid #dedfff;
            border-top-color: #4f51e8;
            animation: visaSpin .7s linear infinite;
          }

          @keyframes visaSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!visa) {
    return (
      <div className="visa-not-found">

        <h1>
          Destination not found
        </h1>

        <p>
          We couldn't find visa information
          for this destination.
        </p>

        <Link
          to="/"
          className="visa-main-button"
        >
          ← Back to destinations
        </Link>

        <style>{`
          .visa-not-found {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            background: #f8f9fa;
            font-family: Arial, Helvetica, sans-serif;
            text-align: center;
          }

          .visa-not-found h1 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 50px;
            font-weight: 500;
          }

          .visa-not-found p {
            color: #666;
          }

          .visa-main-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-top: 15px;
            padding: 15px 26px;
            border-radius: 999px;
            background: #4f51e8;
            color: white;
            text-decoration: none;
            font-weight: 700;
          }
        `}</style>
      </div>
    );
  }

  /* =======================================================
     API DATA
  ======================================================= */

  /*
  VERY IMPORTANT:
  THIS IS THE ROOT-LEVEL IMAGE

  visa.image
  */

  const image =
    typeof visa.image === "string" &&
    visa.image.trim() !== ""
      ? visa.image.trim()
      : null;

  /*
  THIS IS THE COUNTRY FLAG

  visa.country.flag
  */

  const backendFlag =
    getFlag(visa);

  const type =
    getType(visa);

  const validity =
    getValidity(visa);

  const stay =
    getStay(visa);

  const processing =
    getProcessing(visa);

  const fees =
    getFees(visa);

  const documents =
    getDocuments(visa);

  const governmentFee =
    visa.governmentFee || "";

  const serviceFee =
    visa.serviceFee || "";

  const description =
    visa.description ||
    visa.shortDescription ||
    `Explore visa requirements, documents, processing information and application details for travelling to ${country}.`;

  /* =======================================================
     DEBUG
  ======================================================= */

  console.log(
    "COUNTRY:",
    country
  );

  console.log(
    "ROOT VISA IMAGE:",
    image
  );

  console.log(
    "COUNTRY FLAG:",
    backendFlag
  );

  console.log(
    "FULL VISA OBJECT:",
    visa
  );

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="visa-details-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .visa-details-page {
          min-height: 100vh;
          background: #f8f9fa;
          color: #111;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        /* =============================================
           NAVBAR
        ============================================= */

        .visa-detail-nav {
          position: sticky;
          top: 0;
          z-index: 1000;

          height: 78px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 7vw;

          background:
            rgba(255,255,255,.94);

          backdrop-filter:
            blur(16px);

          border-bottom:
            1px solid #e4e6e8;
        }

        .visa-detail-logo {
          color: #111;
          text-decoration: none;

          font-size: 29px;
          font-weight: 800;

          letter-spacing:
            -1.8px;
        }

        .visa-detail-logo span {
          color: #4f51e8;
        }

        .visa-detail-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .visa-nav-search {
          width: 46px;
          height: 46px;

          border:
            1px solid #d9dce0;

          border-radius: 50%;

          background: white;

          font-size: 20px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visa-back-button {
          text-decoration: none;

          color: #111;

          border:
            1px solid #d7dade;

          border-radius: 999px;

          padding: 11px 17px;

          font-size: 14px;
          font-weight: 600;

          background: white;

          transition: .25s ease;
        }

        .visa-back-button:hover {
          background: #111;
          color: white;
        }


        /* =============================================
           HERO
        ============================================= */

        .visa-detail-hero {
          position: relative;

          min-height: 660px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          background: #18242c;
        }

        /*
          FULL HERO IMAGE
        */

        .visa-detail-hero-image {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;
        }

        .visa-detail-hero-image img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          object-position: center center;

          opacity: 1;
        }

        .visa-detail-hero-overlay {
          position: absolute;
          inset: 0;

          z-index: 1;

          background:
            linear-gradient(
              to bottom,
              rgba(0,0,0,.08),
              rgba(0,0,0,.35)
            ),
            linear-gradient(
              to top,
              rgba(5,10,18,.88),
              rgba(5,10,18,.04) 72%
            );
        }

        .visa-detail-hero-content {
          position: relative;

          z-index: 3;

          width:
            min(900px,90%);

          padding-top: 70px;

          text-align: center;

          color: white;
        }

        .visa-detail-location {
          display: inline-flex;

          align-items: center;

          gap: 9px;

          padding:
            9px 15px;

          border-radius:
            999px;

          background:
            rgba(0,0,0,.43);

          backdrop-filter:
            blur(12px);

          font-size: 13px;

          font-weight: 600;

          margin-bottom: 25px;
        }

        .visa-detail-flag {
          width: 25px;
          height: 25px;

          overflow: hidden;

          border-radius: 50%;

          background: white;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;
        }

        .visa-detail-flag img {
          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;
        }

        .visa-detail-hero h1 {
          max-width: 850px;

          margin: 0 auto;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(52px,7vw,96px);

          line-height: .95;

          letter-spacing: -.065em;

          font-weight: 500;
        }

        .visa-detail-hero-description {
          max-width: 680px;

          margin: 28px auto 0;

          color:
            rgba(255,255,255,.88);

          font-size: 18px;

          line-height: 1.5;
        }

        .visa-main-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          text-decoration: none;

          margin-top: 32px;

          min-width: 220px;

          padding: 16px 26px;

          border-radius: 999px;

          background: #4f51e8;

          color: white;

          font-size: 15px;

          font-weight: 700;

          box-shadow:
            0 12px 30px
            rgba(79,81,232,.25);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .visa-main-button:hover {
          transform:
            translateY(-3px);

          box-shadow:
            0 18px 36px
            rgba(79,81,232,.36);
        }

        .visa-location-chip {
          position: absolute;

          z-index: 5;

          left: 28px;
          bottom: 28px;

          padding: 10px 15px;

          border-radius: 999px;

          background:
            rgba(0,0,0,.48);

          backdrop-filter:
            blur(12px);

          color: white;

          font-size: 13px;

          font-weight: 600;
        }


        /* =============================================
           QUICK NAV
        ============================================= */

        .visa-quick-nav {
          position: sticky;

          top: 78px;

          z-index: 80;

          min-height: 88px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 38px;

          padding: 15px 20px;

          background: #eff2f4;

          border-bottom:
            1px solid #dce0e4;
        }

        .visa-quick-nav a {
          color: #116277;

          text-decoration: none;

          font-size: 13px;

          font-weight: 800;

          letter-spacing: .11em;

          text-transform: uppercase;
        }

        .visa-quick-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #9fc7d4;
        }

        .visa-quick-button {
          text-decoration: none;

          background: #4f51e8;

          color: white;

          border-radius: 999px;

          padding: 13px 32px;

          font-size: 14px;

          font-weight: 700;

          box-shadow:
            0 8px 18px
            rgba(79,81,232,.22);
        }


        /* =============================================
           MAIN
        ============================================= */

        .visa-detail-main {
          width:
            min(1020px,92%);

          margin: 0 auto;

          padding:
            85px 0 120px;
        }


        /* =============================================
           SECTION HEADING
        ============================================= */

        .visa-section-heading {
          max-width: 760px;

          margin:
            0 auto 45px;

          text-align: center;
        }

        .visa-section-heading h2 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(38px,5vw,58px);

          line-height: 1.02;

          letter-spacing: -.055em;

          font-weight: 500;
        }

        .visa-section-heading p {
          margin-top: 18px;

          color: #62676d;

          font-size: 17px;

          line-height: 1.5;
        }


        /* =============================================
           FACTS
        ============================================= */

        .visa-facts {
          display: flex;

          justify-content: center;

          flex-wrap: wrap;

          gap: 12px;

          margin-bottom: 45px;
        }

        .visa-fact {
          min-width: 180px;

          padding: 22px;

          background: white;

          border:
            1px solid #d9dde1;

          border-radius: 15px;
        }

        .visa-fact span {
          display: block;

          color: #858a90;

          font-size: 13px;

          margin-bottom: 8px;
        }

        .visa-fact strong {
          display: block;

          font-size: 15px;

          letter-spacing: .06em;

          text-transform: uppercase;
        }


        /* =============================================
           WHITE CARD
        ============================================= */

        .visa-white-card {
          padding: 38px;

          background: white;

          border-radius: 28px;

          border:
            1px solid #edf0f2;

          box-shadow:
            0 14px 35px
            rgba(20,25,30,.07);
        }


        /* =============================================
           STEPS
        ============================================= */

        .visa-steps {
          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 14px;
        }

        .visa-step {
          min-height: 230px;

          display: flex;

          flex-direction: column;

          padding: 25px;

          border:
            1px solid #dce0e3;

          border-radius: 18px;
        }

        .visa-step-number {
          align-self: flex-end;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: .08em;

          color: #777;
        }

        .visa-step-icon {
          width: 40px;
          height: 40px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 22px;

          border-radius: 50%;

          background: #eff0ff;

          color: #4f51e8;

          font-size: 18px;
        }

        .visa-step h3 {
          margin: 0;

          font-size: 19px;
        }

        .visa-step p {
          margin:
            11px 0 20px;

          color: #72777c;

          font-size: 14px;

          line-height: 1.5;
        }

        .visa-step strong {
          margin-top: auto;

          font-size: 14px;
        }


        /* =============================================
           GUARANTEE
        ============================================= */

        .visa-guarantee {
          margin-top: 22px;

          padding: 35px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 25px;

          border-radius: 22px;

          background:
            linear-gradient(
              110deg,
              #d8e4ff,
              #a8e1ef
            );
        }

        .visa-guarantee-left {
          display: flex;

          align-items: flex-start;

          gap: 18px;
        }

        .visa-guarantee-icon {
          width: 48px;
          height: 48px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 14px;

          background: #4f51e8;

          color: white;

          font-size: 21px;
        }

        .visa-guarantee h3 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 28px;

          line-height: 1;
        }

        .visa-guarantee p {
          max-width: 620px;

          margin:
            12px 0 0;

          color: #39434b;

          line-height: 1.5;
        }


        /* =============================================
           BENEFITS
        ============================================= */

        .visa-benefits {
          margin-top: 95px;
        }

        .visa-benefits-grid {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 18px;
        }

        .visa-benefit {
          min-height: 245px;

          padding: 30px;

          background: white;

          border:
            1px solid #e0e3e5;

          border-radius: 25px;

          box-shadow:
            0 10px 28px
            rgba(20,25,30,.05);
        }

        .visa-benefit-icon {
          width: 52px;
          height: 52px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 22px;

          border-radius: 50%;

          background: #edf4ff;

          color: #4f51e8;

          font-size: 22px;
        }

        .visa-benefit h3 {
          margin: 0;

          font-size: 22px;

          line-height: 1.12;
        }

        .visa-benefit p {
          max-width: 500px;

          margin:
            13px 0 0;

          color: #686d72;

          line-height: 1.5;
        }


        /* =============================================
           DOCUMENTS
        ============================================= */

        .visa-documents {
          margin-top: 95px;
        }

        .visa-document-list {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 12px;
        }

        .visa-document {
          display: flex;

          align-items: center;

          gap: 13px;

          padding:
            17px 18px;

          border:
            1px solid #dfe2e5;

          border-radius: 14px;

          background: white;

          font-size: 15px;
        }

        .visa-document-check {
          width: 28px;
          height: 28px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #e8f5ef;

          color: #16815c;

          font-size: 13px;
        }


        /* =============================================
           RELATED
        ============================================= */

        .visa-related {
          margin-top: 100px;
        }

        .visa-related-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 14px;
        }

        .visa-related-card {
          position: relative;

          height: 260px;

          overflow: hidden;

          display: block;

          background: #222;

          color: white;

          border-radius: 20px;

          text-decoration: none;
        }

        .visa-related-card img {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .5s ease;
        }

        .visa-related-card:hover img {
          transform:
            scale(1.06);
        }

        .visa-related-card::after {
          content: "";

          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              to top,
              rgba(5,5,10,.92),
              rgba(5,5,10,.03)
            );
        }

        .visa-related-name {
          position: absolute;

          z-index: 2;

          left: 18px;

          bottom: 18px;

          font-size: 18px;

          font-weight: 700;
        }


        /* =============================================
           FAQ
        ============================================= */

        .visa-faq {
          margin-top: 110px;
        }

        .visa-faq-list {
          border-top:
            1px solid #d9dde1;
        }

        .visa-faq-item {
          border-bottom:
            1px solid #d9dde1;
        }

        .visa-faq-question {
          width: 100%;

          padding:
            25px 0;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          border: 0;

          background: transparent;

          color: #111;

          cursor: pointer;

          text-align: left;

          font-size: 18px;
        }

        .visa-faq-plus {
          color: #4f51e8;

          font-size: 28px;

          font-weight: 300;

          transition:
            transform .25s ease;
        }

        .visa-faq-plus.open {
          transform:
            rotate(45deg);
        }

        .visa-faq-answer {
          max-width: 850px;

          padding:
            0 50px 25px 0;

          color: #686d72;

          font-size: 15px;

          line-height: 1.6;
        }

        .visa-faq-state {
          padding: 28px 0;
          color: #686d72;
          font-size: 15px;
          border-bottom: 1px solid #d9dde1;
        }

        .visa-faq-error {
          color: #b42318;
        }


        .visa-faq-group-title {
          margin: 0 0 18px;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 30px;
          line-height: 1.05;
          letter-spacing: -.04em;
          font-weight: 500;
        }

        .visa-faq-application-group {
          margin-top: 55px;
        }

        /* =============================================
           FINAL CTA
        ============================================= */

        .visa-final-cta {
          margin-top: 110px;

          text-align: center;
        }

        .visa-final-cta h2 {
          max-width: 750px;

          margin: 0 auto;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(42px,6vw,70px);

          line-height: .98;

          letter-spacing: -.055em;

          font-weight: 500;
        }


        /* =============================================
           FOOTER
        ============================================= */

        .visa-detail-footer {
          margin-top: 90px;

          padding:
            45px 7vw;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          background: white;

          border-top:
            1px solid #e1e3e5;

          color: #70757a;

          font-size: 13px;
        }

        .visa-detail-footer-logo {
          color: #111;

          font-size: 23px;

          font-weight: 800;

          letter-spacing: -1.3px;
        }

        .visa-detail-footer-logo span {
          color: #4f51e8;
        }


        /* =============================================
           MOBILE
        ============================================= */

        @media (max-width: 900px) {

          .visa-quick-nav {
            justify-content:
              flex-start;

            gap: 15px;

            overflow-x: auto;
          }

          .visa-quick-nav a {
            white-space: nowrap;
          }

          .visa-quick-dot {
            display: none;
          }

          .visa-steps,
          .visa-benefits-grid {
            grid-template-columns: 1fr;
          }

          .visa-related-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .visa-document-list {
            grid-template-columns: 1fr;
          }
        }


        @media (max-width: 600px) {

          .visa-detail-nav {
            height: 68px;

            padding: 0 18px;
          }

          .visa-detail-logo {
            font-size: 24px;
          }

          .visa-back-button {
            padding:
              9px 12px;

            font-size: 12px;
          }

          .visa-detail-hero {
            min-height: 580px;
          }

          .visa-detail-main {
            padding:
              60px 0 80px;
          }

          .visa-white-card {
            padding: 20px;

            border-radius: 22px;
          }

          .visa-facts {
            flex-direction: column;
          }

          .visa-fact {
            width: 100%;
          }

          .visa-guarantee {
            flex-direction: column;

            align-items:
              flex-start;

            padding: 25px;
          }

          .visa-related-grid {
            grid-template-columns: 1fr;
          }

          .visa-detail-footer {
            flex-direction: column;

            align-items:
              flex-start;
          }
        }

      `}</style>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="visa-detail-nav">

        <Link
          to="/"
          className="visa-detail-logo"
        >
          visa<span>go</span>→
        </Link>

        <div className="visa-detail-nav-right">

          <button
            type="button"
            className="visa-nav-search"
          >
            ⌕
          </button>

          <Link
            to="/"
            className="visa-back-button"
          >
            ← Explore
          </Link>

        </div>

      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <section className="visa-detail-hero">

        {image ? (

          <div className="visa-detail-hero-image">

            <img
              src={image}
              alt={country}
              loading="eager"
              referrerPolicy="no-referrer"
              onLoad={() => {
                console.log(
                  "VISA HERO IMAGE LOADED:",
                  image
                );
              }}
              onError={(event) => {
                console.error(
                  "VISA HERO IMAGE FAILED:",
                  image
                );

                /*
                  DON'T hide the element completely.
                  Keep the dark hero background visible.
                */

                event.currentTarget.style.opacity = "0";
              }}
            />

          </div>

        ) : (

          <div
            className="visa-detail-hero-image"
            style={{
              background:
                "linear-gradient(135deg,#5067a8,#18263b)"
            }}
          />

        )}


        <div
          className="visa-detail-hero-overlay"
        ></div>


        <div className="visa-detail-hero-content">

          <div
            className="visa-detail-location"
          >

            <div
              className="visa-detail-flag"
            >

              {backendFlag ? (

                <img
                  src={backendFlag}
                  alt={`${country} flag`}
                  referrerPolicy="no-referrer"
                />

              ) : (

                "•"

              )}

            </div>

            {country}

          </div>


          <h1>
            {visa.title ||
              visa.headline ||
              `${country} visa made simple.`}
          </h1>


          <p className="visa-detail-hero-description">
            {description}
          </p>


          <ApplicationButton
            visa={visa}
            className="visa-main-button"
          >
            Start your application
          </ApplicationButton>

        </div>


        <div className="visa-location-chip">
          ● {country}
        </div>

      </section>


      {/* =================================================
          QUICK NAV
      ================================================= */}

      <nav className="visa-quick-nav">

        <a href="#overview">
          Overview
        </a>

        <span className="visa-quick-dot"></span>

        <a href="#documents">
          Documents
        </a>

        <span className="visa-quick-dot"></span>

        <a href="#apply">
          How to Apply
        </a>

        <span className="visa-quick-dot"></span>

        <a href="#faq">
          FAQs
        </a>

        <ApplicationButton
          visa={visa}
          className="visa-quick-button"
        >
          Start Application
        </ApplicationButton>

      </nav>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="visa-detail-main">


        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section id="overview">

          <div
            className="visa-section-heading"
          >

            <h2>
              {country} visa information
            </h2>

            <p>
              {visa.shortDescription ||
                `Everything you need to understand the application journey for ${country}.`}
            </p>

          </div>


          <div className="visa-facts">


            <div className="visa-fact">

              <span>
                Purpose
              </span>

              <strong>
                {visa.purpose ||
                  type ||
                  "—"}
              </strong>

            </div>


            <div className="visa-fact">

              <span>
                Valid for
              </span>

              <strong>
                {validity || "—"}
              </strong>

            </div>


            <div className="visa-fact">

              <span>
                Stay
              </span>

              <strong>
                {stay || "—"}
              </strong>

            </div>


            <div className="visa-fact">

              <span>
                Processing
              </span>

              <strong>
                {processing || "—"}
              </strong>

            </div>


            <div className="visa-fact">

              <span>
                Total fee
              </span>

              <strong>
                {fees
                  ? `${visa.currency || "INR"} ${fees}`
                  : "—"}
              </strong>

            </div>


          </div>

        </section>


        {/* =================================================
            APPLICATION
        ================================================= */}

        <section id="apply">

          <div className="visa-white-card">

            <div
              className="visa-section-heading"
            >

              <h2>
                How to apply online
              </h2>

              <p>
                Follow the application journey
                from preparing your documents
                to receiving your visa.
              </p>

            </div>


            <div className="visa-steps">


              <div className="visa-step">

                <div className="visa-step-number">
                  STEP 1
                </div>

                <div className="visa-step-icon">
                  ☷
                </div>

                <h3>
                  Prepare
                </h3>

                <p>
                  Review the requirements
                  and collect the required
                  supporting documents.
                </p>

                <strong>
                  {documents.length > 0
                    ? `${documents.length} document${documents.length > 1 ? "s" : ""} required`
                    : "Check documents"}
                </strong>

              </div>


              <div className="visa-step">

                <div className="visa-step-number">
                  STEP 2
                </div>

                <div className="visa-step-icon">
                  ◷
                </div>

                <h3>
                  Submit
                </h3>

                <p>
                  Complete the application
                  and provide the required
                  information.
                </p>

                <strong>
                  {processing ||
                    "Application processing"}
                </strong>

              </div>


              <div
                className="visa-step"
                style={{
                  borderColor:
                    "#dfe0ff"
                }}
              >

                <div className="visa-step-number">
                  STEP 3
                </div>

                <div className="visa-step-icon">
                  ✓
                </div>

                <h3
                  style={{
                    color:
                      "#4f51e8"
                  }}
                >
                  Receive
                </h3>

                <p>
                  Track your application
                  and follow the instructions
                  when your decision is available.
                </p>

                <strong>
                  Track your application
                </strong>

              </div>

            </div>


            <div className="visa-guarantee">

              <div className="visa-guarantee-left">

                <div className="visa-guarantee-icon">
                  ✓
                </div>

                <div>

                  <h3>
                    VisaGo application support
                  </h3>

                  <p>
                    Keep your destination,
                    visa information,
                    processing details and
                    application requirements
                    together in one place.
                  </p>

                </div>

              </div>


              <a
                href="#documents"
                className="visa-main-button"
                style={{
                  marginTop: 0
                }}
              >
                View requirements
              </a>

            </div>

          </div>

        </section>


        {/* =================================================
            BENEFITS
        ================================================= */}

        <section className="visa-benefits">

          <div
            className="visa-section-heading"
          >

            <h2>
              Travel information,
              all in one place
            </h2>

            <p>
              Important information for
              your application and trip.
            </p>

          </div>


          <div className="visa-benefits-grid">


            <div className="visa-benefit">

              <div className="visa-benefit-icon">
                🛡
              </div>

              <h3>
                Application clarity
              </h3>

              <p>
                View your visa type,
                validity, stay duration,
                fees and processing time
                together.
              </p>

            </div>


            <div className="visa-benefit">

              <div
                className="visa-benefit-icon"
                style={{
                  background: "#e9f7f1",
                  color: "#15815f"
                }}
              >
                ☎
              </div>

              <h3>
                Support when you need it
              </h3>

              <p>
                Follow a structured
                application journey from
                preparation through submission.
              </p>

            </div>


            <div className="visa-benefit">

              <div
                className="visa-benefit-icon"
                style={{
                  background: "#fff0ee",
                  color: "#c83a2d"
                }}
              >
                +
              </div>

              <h3>
                Document checklist
              </h3>

              <p>
                Review the documents supplied
                by the visa information API
                before applying.
              </p>

            </div>


            <div className="visa-benefit">

              <div
                className="visa-benefit-icon"
                style={{
                  background: "#f1eaff",
                  color: "#6d45d9"
                }}
              >
                ◉
              </div>

              <h3>
                Destination details
              </h3>

              <p>
                Access your country-specific
                visa information in one
                dedicated destination page.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            DOCUMENTS
        ================================================= */}

        <section
          id="documents"
          className="visa-documents"
        >

          <div
            className="visa-section-heading"
          >

            <h2>
              Documents required
            </h2>

            <p>
              Documents returned by your
              visa information API.
            </p>

          </div>


          <div className="visa-document-list">

            {documents.length > 0 ? (

              documents.map(
                (document, index) => {

                  const documentName =
                    typeof document === "string"
                      ? document
                      : document.name ||
                        document.title ||
                        "Required document";

                  return (
                    <div
                      className="visa-document"
                      key={
                        document._id ||
                        index
                      }
                    >

                      <div
                        className="visa-document-check"
                      >
                        ✓
                      </div>

                      <span>
                        {documentName}
                      </span>

                    </div>
                  );
                }
              )

            ) : (

              <div className="visa-document">

                <div
                  className="visa-document-check"
                >
                  ✓
                </div>

                <span>
                  No documents provided by API
                </span>

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            FEE BREAKDOWN
        ================================================= */}

        {(governmentFee ||
          serviceFee ||
          fees) && (

          <section
            className="visa-documents"
          >

            <div
              className="visa-section-heading"
            >

              <h2>
                Fee breakdown
              </h2>

              <p>
                Available fee information
                for this destination.
              </p>

            </div>


            <div className="visa-facts">

              {governmentFee && (

                <div className="visa-fact">

                  <span>
                    Government fee
                  </span>

                  <strong>
                    {visa.currency || "INR"}{" "}
                    {governmentFee}
                  </strong>

                </div>

              )}


              {serviceFee && (

                <div className="visa-fact">

                  <span>
                    Service fee
                  </span>

                  <strong>
                    {visa.currency || "INR"}{" "}
                    {serviceFee}
                  </strong>

                </div>

              )}


              {fees && (

                <div className="visa-fact">

                  <span>
                    Total fee
                  </span>

                  <strong>
                    {visa.currency || "INR"}{" "}
                    {fees}
                  </strong>

                </div>

              )}

            </div>

          </section>

        )}


        {/* =================================================
            RELATED DESTINATIONS
        ================================================= */}

        {relatedVisas.length > 0 && (

          <section
            className="visa-related"
          >

            <div
              className="visa-section-heading"
            >

              <h2>
                Explore more destinations
              </h2>

            </div>


            <div className="visa-related-grid">

              {relatedVisas.map(
                (item, index) => {

                  const name =
                    getCountryName(item);

                  const relatedImage =
                    getVisaImage(item);

                  const relatedSlug =
                    item.slug ||
                    item.country?.slug ||
                    slugify(name);

                  return (

                    <Link
                      key={
                        item._id ||
                        item.id ||
                        relatedSlug ||
                        index
                      }
                      to={`/visa/${relatedSlug}`}
                      className="visa-related-card"
                    >

                      {relatedImage ? (

                        <img
                          src={relatedImage}
                          alt={name}
                          referrerPolicy="no-referrer"
                        />

                      ) : (

                        <div
                          style={{
                            position:
                              "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(135deg,#5c6f97,#222)"
                          }}
                        />

                      )}

                      <div
                        className="visa-related-name"
                      >
                        {name}
                      </div>

                    </Link>

                  );
                }
              )}

            </div>

          </section>

        )}


        {/* =================================================
            FAQ
        ================================================= */}

        <section
          id="faq"
          className="visa-faq"
        >

          <div
            className="visa-section-heading"
          >

            <h2>
              Visa FAQs
            </h2>

          </div>


          {faqLoading && (
            <div className="visa-faq-state">
              Loading FAQs...
            </div>
          )}


          {!faqLoading && faqError && (
            <div className="visa-faq-state visa-faq-error">
              {faqError}
            </div>
          )}


          {!faqLoading && !faqError && (
            <>


              <div className="visa-faq-group">

                <h3 className="visa-faq-group-title">
                  Visa FAQs
                </h3>

                <div className="visa-faq-list">

                  {visaFaqData.length === 0 ? (
                    <div className="visa-faq-state">
                      No visa FAQs available for {country}.
                    </div>
                  ) : (
                    visaFaqData.map((faq) => {
                      const faqKey = `visa-${faq._id}`;
                      const isOpen = openFaq === faqKey;

                      return (
                        <div
                          key={faq._id || faqKey}
                          className="visa-faq-item"
                        >

                          <button
                            type="button"
                            className="visa-faq-question"
                            onClick={() =>
                              setOpenFaq(
                                isOpen ? null : faqKey
                              )
                            }
                          >

                            <span>
                              {faq.question}
                            </span>

                            <span
                              className={`visa-faq-plus ${
                                isOpen ? "open" : ""
                              }`}
                            >
                              +
                            </span>

                          </button>


                          {isOpen && (
                            <div className="visa-faq-answer">
                              {faq.answer}
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}

                </div>

              </div>



            </>
          )}

        </section>



        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section
          className="visa-final-cta"
        >

          <h2>
            Ready to start your{" "}
            {country} application?
          </h2>

          <ApplicationButton
            visa={visa}
            className="visa-main-button"
          >
            Start your application
          </ApplicationButton>

        </section>


      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer
        className="visa-detail-footer"
      >

        <div
          className="visa-detail-footer-logo"
        >
          visa<span>go</span>→
        </div>

        <div>
          © 2026 VisaGo
        </div>

        <Link
          to="/"
          style={{
            color: "#555",
            textDecoration: "none"
          }}
        >
          Back to VisaGo
        </Link>

      </footer>

    </div>
  );
}

export default VisaDetails;