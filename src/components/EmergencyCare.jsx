import React, { useEffect, useState } from "react";

const API_URL = "https://atlys-backend-cr9i.onrender.com/api/emergency-care";

const defaultData = {
  hero: {
    title: "Emergency visa? we're on it",
    description:
      "Crisis doesn't wait for paperwork. Talk to a visa specialist now and get your application moving.",
    buttonText: "Emergency Number",
    phone: "+91 99999 99999",
  },
  stats: [
    {
      value: "120+",
      label: "Countries Supported",
    },
    {
      value: "50+",
      label: "Government Partners",
    },
    {
      value: "24/7",
      label: "Active Call Support",
    },
  ],
  covered: [
    {
      title: "Medical Emergencies",
      description:
        "Urgent treatment or care for an ailing family member.",
    },
    {
      title: "Family Emergencies",
      description:
        "Sudden bereavement or critical family crises.",
    },
    {
      title: "Work Related Urgencies",
      description:
        "Mission-critical deadlines and unforeseen business travel.",
    },
    {
      title: "Time Sensitive Situations",
      description:
        "Essential life events where the standard process has stalled.",
    },
  ],
  notCovered: [
    {
      title: "Routine Travel",
      description:
        "Standard tourism or leisure trips planned weeks in advance.",
    },
    {
      title: "General Inquiries",
      description:
        "Questions about visa rules or document checklists for future trips.",
    },
    {
      title: "Standard Tracking",
      description:
        "Status updates for applications made through the standard visago app.",
    },
    {
      title: "Non-Urgent Changes",
      description:
        "Minor edits or updates to existing routine visas.",
    },
  ],
  testimonials: [
    {
      name: "Kunal D Mehta",
      category: "Time sensitive situation",
      quote:
        "Param from visago was on a call with my friend at 2:30 AM, helping resolve a Hong Kong visa situation. Going the extra mile well beyond business hours — exceptional service.",
      source: "LinkedIn",
    },
    {
      name: "Aakash Lahoti",
      category: "Emergency helpline support",
      quote:
        "I contacted the emergency helpline and was assisted by Simran. She handled every concern with professionalism, patience, and clarity.",
      source: "Google Play",
    },
    {
      name: "Swarup Mulay",
      category: "Time sensitive situation",
      quote:
        "I needed an emergency visa for a critical business meeting in Oman, and their team delivered it in just 2 hours after I called their emergency helpline.",
      source: "X",
    },
    {
      name: "Dr. Nandhini",
      category: "Stuck application rescued",
      quote:
        "I had an issue with my Hong Kong PAR and called the emergency helpline. The team went beyond their way to fix my stuck application and kept me updated.",
      source: "Trustpilot",
    },
    {
      name: "Deepali Salwan",
      category: "Work related urgency",
      quote:
        "I needed a visa in 24 hours. Their express option processed it in just a few hours — well ahead of the committed timeline.",
      source: "LinkedIn",
    },
  ],
  faqs: [
    {
      question: "What is the Emergency Visa Helpline?",
      answer:
        "The Emergency Visa Helpline is a dedicated phone line for travellers facing time-sensitive, exceptional visa situations. It is designed for moments when you have an urgent or imminent travel need that cannot wait for standard customer support channels.",
    },
    {
      question: "When should I call the Emergency Helpline?",
      answer:
        "Call when you have an urgent travel requirement and the standard visa process or support channels cannot meet your timeline.",
    },
    {
      question: "What kinds of situations qualify as an emergency?",
      answer:
        "Medical emergencies, family emergencies, critical work travel and other genuinely time-sensitive situations may qualify.",
    },
    {
      question: "What kinds of situations do NOT qualify as an emergency?",
      answer:
        "Routine holidays, general visa questions, standard application tracking and non-urgent changes should use the standard support channels.",
    },
    {
      question: "How does the helpline work?",
      answer:
        "Call the emergency number and explain your situation. A specialist reviews the urgency and guides you through the available next steps.",
    },
    {
      question: "What information should I have ready when I call?",
      answer:
        "Keep your passport details, destination, travel date, visa information and a brief explanation of the emergency ready.",
    },
    {
      question: "How quickly will I get a response?",
      answer:
        "Emergency requests are handled through the dedicated support channel based on the urgency and availability of the team.",
    },
    {
      question: "How is an emergency determined?",
      answer:
        "The support team evaluates the circumstances, travel timeline and nature of the request to determine whether it requires emergency handling.",
    },
    {
      question: "What happens if my case is not classified as an emergency?",
      answer:
        "You will be directed to the appropriate standard visa application or support process.",
    },
    {
      question: "Will I speak to a person when I call?",
      answer:
        "The emergency line is designed to connect travellers with specialist human support.",
    },
    {
      question: "Is there a fee for using the Emergency Helpline?",
      answer:
        "Any applicable service charges depend on the assistance required and the specific visa service.",
    },
    {
      question: "What if I have a regular visa question?",
      answer:
        "For routine visa questions, use the standard website or app support channels.",
    },
  ],
};

function normalizeData(data) {
  if (!data) return defaultData;

  return {
    hero: {
      ...defaultData.hero,
      ...(data.hero || {}),
    },
    stats:
      Array.isArray(data.stats) && data.stats.length
        ? data.stats
        : defaultData.stats,
    covered:
      Array.isArray(data.covered) && data.covered.length
        ? data.covered
        : defaultData.covered,
    notCovered:
      Array.isArray(data.notCovered) && data.notCovered.length
        ? data.notCovered
        : defaultData.notCovered,
    testimonials:
      Array.isArray(data.testimonials) && data.testimonials.length
        ? data.testimonials
        : defaultData.testimonials,
    faqs:
      Array.isArray(data.faqs) && data.faqs.length
        ? data.faqs
        : defaultData.faqs,
  };
}

export default function EmergencyCare() {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("API request failed");
        }
        return response.json();
      })
      .then((result) => {
        const apiData =
          result?.data ||
          result?.emergencyCare ||
          result?.emergency ||
          result;

        setData(normalizeData(apiData));
      })
      .catch(() => {
        setData(defaultData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="emergency-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #fff;
          color: #111;
          font-family: "DM Sans", sans-serif;
        }

        .emergency-page {
          min-height: 100vh;
          background: #fff;
          overflow: hidden;
        }

        .ec-nav {
          height: 76px;
          padding: 0 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
          background: rgba(255,255,255,.96);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(15px);
        }

        .ec-brand {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .ec-logo {
          font-size: 31px;
          font-weight: 700;
          letter-spacing: -2px;
        }

        .ec-divider {
          width: 1px;
          height: 27px;
          background: #ddd;
        }

        .ec-nav-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -.2px;
        }

        .ec-nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .ec-guaranteed {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .ec-shield {
          width: 25px;
          height: 25px;
          border: 1.5px solid #111;
          border-radius: 8px 8px 11px 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .ec-user {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid #ddd;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .ec-hero {
          min-height: 590px;
          max-width: 1180px;
          margin: auto;
          padding: 125px 40px 110px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 80px;
          position: relative;
        }

        .ec-hero-content {
          animation: heroIn .9s ease both;
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(35px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .ec-hero h1 {
          margin: 0 0 28px;
          font-family: "DM Serif Display", serif;
          font-size: clamp(58px, 6vw, 88px);
          font-weight: 400;
          line-height: .95;
          letter-spacing: -4px;
          max-width: 680px;
        }

        .ec-hero p {
          max-width: 570px;
          margin: 0 0 34px;
          font-size: 18px;
          line-height: 1.55;
          color: #555;
        }

        .ec-call {
          border: 0;
          background: #111;
          color: white;
          padding: 16px 24px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 11px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: .25s ease;
        }

        .ec-call:hover {
          transform: translateY(-3px);
          background: #272727;
          box-shadow: 0 12px 30px rgba(0,0,0,.15);
        }

        .ec-call-icon {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: white;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ec-visual {
          height: 380px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: visualIn 1.2s ease both;
        }

        @keyframes visualIn {
          from {
            opacity: 0;
            transform: scale(.85) rotate(-5deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        .ec-orbit {
          width: 290px;
          height: 290px;
          border: 1px solid #b8e6bd;
          border-radius: 50%;
          position: absolute;
          animation: rotateOrbit 15s linear infinite;
        }

        .ec-orbit:before,
        .ec-orbit:after {
          content: "";
          position: absolute;
          width: 10px;
          height: 10px;
          background: #9bd6a1;
          border-radius: 50%;
        }

        .ec-orbit:before {
          top: 18px;
          left: 45px;
        }

        .ec-orbit:after {
          bottom: 30px;
          right: 35px;
        }

        @keyframes rotateOrbit {
          to {
            transform: rotate(360deg);
          }
        }

        .ec-gradient {
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 30% 30%, #d8f6dc, transparent 55%),
            radial-gradient(circle at 70% 70%, #82c98d, transparent 60%),
            #edf9ee;
          filter: blur(2px);
          opacity: .9;
        }

        .ec-arrow {
          position: absolute;
          width: 180px;
          height: 100px;
          border-top: 2px solid #111;
          border-right: 2px solid #111;
          transform: rotate(-24deg);
          opacity: .75;
        }

        .ec-arrow:after {
          content: "";
          position: absolute;
          right: -7px;
          top: -7px;
          width: 13px;
          height: 13px;
          border-top: 2px solid #111;
          border-right: 2px solid #111;
        }

        .ec-stats {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 40px 130px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .ec-stat {
          min-height: 220px;
          background: #f3f3f1;
          border-radius: 24px;
          padding: 34px;
          position: relative;
          overflow: hidden;
          transition: .3s ease;
        }

        .ec-stat:hover {
          transform: translateY(-7px);
          background: #ededeb;
        }

        .ec-stat-value {
          font-family: "DM Serif Display", serif;
          font-size: 54px;
          font-weight: 400;
          letter-spacing: -2px;
        }

        .ec-stat-label {
          margin-top: 8px;
          max-width: 150px;
          font-size: 16px;
          line-height: 1.3;
          color: #444;
        }

        .ec-stat-art {
          position: absolute;
          right: -20px;
          bottom: -35px;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          background: linear-gradient(135deg,#ddd,#aaa);
          opacity: .35;
        }

        .ec-section {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 40px 120px;
        }

        .ec-section-heading {
          display: flex;
          align-items: center;
          gap: 17px;
          margin-bottom: 48px;
        }

        .ec-heading-icon {
          width: 46px;
          height: 46px;
          border: 1px solid #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .ec-section-heading h2 {
          margin: 0;
          font-family: "DM Serif Display", serif;
          font-size: 45px;
          font-weight: 400;
          letter-spacing: -1.5px;
        }

        .ec-covered-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }

        .ec-covered-card {
          min-height: 270px;
          padding: 34px;
          border-radius: 24px;
          background: linear-gradient(135deg,#f3f4f1,#e9ece8);
          position: relative;
          overflow: hidden;
          transition: .35s ease;
        }

        .ec-covered-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,.08);
        }

        .ec-covered-card h3 {
          margin: 0 0 15px;
          font-size: 21px;
          font-weight: 600;
          max-width: 250px;
        }

        .ec-covered-card p {
          margin: 0;
          max-width: 310px;
          color: #666;
          line-height: 1.5;
          font-size: 15px;
        }

        .ec-card-shape {
          position: absolute;
          width: 170px;
          height: 170px;
          right: -35px;
          bottom: -45px;
          border-radius: 50%;
          background:
            radial-gradient(circle at 35% 35%,#fff,transparent 35%),
            linear-gradient(135deg,#c9d3ca,#9faea1);
          opacity: .48;
        }

        .ec-divider-line {
          max-width: 1180px;
          height: 1px;
          background: #e5e5e5;
          margin: 0 auto 120px;
        }

        .ec-not-note {
          background: #f4f4f2;
          border-radius: 999px;
          padding: 15px 22px;
          margin: -18px 0 42px;
          color: #555;
          font-size: 14px;
          display: inline-block;
        }

        .ec-not-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          column-gap: 90px;
        }

        .ec-not-item {
          padding: 27px 0;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          gap: 18px;
        }

        .ec-not-icon {
          flex-shrink: 0;
          width: 39px;
          height: 39px;
          border-radius: 50%;
          background: #111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ec-not-item h3 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .ec-not-item p {
          margin: 0;
          color: #777;
          line-height: 1.5;
          font-size: 14px;
        }

        .ec-testimonial-section {
          background: #f5f5f3;
          padding: 115px 0;
        }

        .ec-testimonial-inner {
          max-width: 1180px;
          margin: auto;
          padding: 0 40px;
        }

        .ec-testimonial-heading {
          text-align: center;
          margin-bottom: 55px;
        }

        .ec-testimonial-heading h2 {
          margin: 0 0 13px;
          font-family: "DM Serif Display", serif;
          font-weight: 400;
          font-size: 50px;
          letter-spacing: -1.8px;
        }

        .ec-testimonial-heading p {
          margin: 0;
          color: #666;
          font-size: 16px;
        }

        .ec-testimonials {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          padding: 10px 2px 25px;
          scrollbar-width: none;
        }

        .ec-testimonials::-webkit-scrollbar {
          display: none;
        }

        .ec-testimonial {
          flex: 0 0 350px;
          min-height: 290px;
          background: white;
          border-radius: 22px;
          padding: 27px;
          display: flex;
          flex-direction: column;
          transition: .3s ease;
        }

        .ec-testimonial:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 40px rgba(0,0,0,.08);
        }

        .ec-person {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .ec-avatar {
          width: 43px;
          height: 43px;
          border-radius: 50%;
          background: #111;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
        }

        .ec-person-name {
          font-size: 14px;
          font-weight: 600;
        }

        .ec-person-category {
          color: #888;
          font-size: 12px;
          margin-top: 3px;
        }

        .ec-quote {
          font-size: 15px;
          line-height: 1.6;
          color: #444;
          flex: 1;
        }

        .ec-source {
          font-size: 13px;
          font-weight: 600;
          color: #111;
        }

        .ec-faq {
          max-width: 900px;
          margin: 0 auto;
        }

        .ec-faq-heading {
          text-align: center;
          margin-bottom: 60px;
        }

        .ec-faq-heading h2 {
          font-family: "DM Serif Display", serif;
          font-size: 53px;
          font-weight: 400;
          margin: 0;
          letter-spacing: -2px;
        }

        .ec-faq-item {
          border-bottom: 1px solid #ddd;
        }

        .ec-faq-question {
          width: 100%;
          border: 0;
          background: none;
          padding: 25px 5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          cursor: pointer;
          font-size: 17px;
          font-family: inherit;
        }

        .ec-faq-plus {
          width: 32px;
          height: 32px;
          border: 1px solid #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: .25s ease;
        }

        .ec-faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height .35s ease;
        }

        .ec-faq-answer.open {
          max-height: 300px;
        }

        .ec-faq-answer p {
          padding: 0 55px 25px 5px;
          margin: 0;
          color: #666;
          line-height: 1.65;
          font-size: 15px;
        }

        .ec-footer {
          background: #111;
          color: white;
          padding: 80px 40px 35px;
        }

        .ec-footer-inner {
          max-width: 1180px;
          margin: auto;
        }

        .ec-footer-top {
          display: grid;
          grid-template-columns: 1.4fr 2fr;
          gap: 80px;
          padding-bottom: 70px;
        }

        .ec-footer-logo {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -2px;
          margin-bottom: 18px;
        }

        .ec-footer-desc {
          max-width: 330px;
          color: #aaa;
          line-height: 1.5;
          font-size: 14px;
        }

        .ec-footer-columns {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 45px;
        }

        .ec-footer-column h4 {
          margin: 0 0 20px;
          font-size: 13px;
          color: #888;
          font-weight: 500;
        }

        .ec-footer-column a {
          display: block;
          color: #eee;
          text-decoration: none;
          margin-bottom: 13px;
          font-size: 14px;
        }

        .ec-footer-column a:hover {
          color: #aaa;
        }

        .ec-footer-bottom {
          border-top: 1px solid #333;
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          color: #777;
          font-size: 12px;
        }

        .ec-help {
          position: fixed;
          right: 25px;
          bottom: 25px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: 0;
          background: #111;
          color: white;
          z-index: 100;
          box-shadow: 0 10px 30px rgba(0,0,0,.2);
          cursor: pointer;
          font-size: 21px;
          transition: .25s ease;
        }

        .ec-help:hover {
          transform: scale(1.08);
        }

        .ec-loading {
          position: fixed;
          inset: 0;
          background: white;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ec-loader {
          width: 42px;
          height: 42px;
          border: 3px solid #eee;
          border-top-color: #111;
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 850px) {
          .ec-nav {
            padding: 0 20px;
          }

          .ec-nav-label,
          .ec-guaranteed {
            display: none;
          }

          .ec-hero {
            grid-template-columns: 1fr;
            padding: 90px 25px 80px;
            gap: 20px;
          }

          .ec-hero h1 {
            font-size: 58px;
          }

          .ec-visual {
            height: 280px;
          }

          .ec-stats {
            grid-template-columns: 1fr;
            padding: 0 25px 90px;
          }

          .ec-section {
            padding: 0 25px 90px;
          }

          .ec-covered-grid,
          .ec-not-grid {
            grid-template-columns: 1fr;
          }

          .ec-section-heading h2 {
            font-size: 37px;
          }

          .ec-divider-line {
            margin-bottom: 90px;
          }

          .ec-testimonial-section {
            padding: 90px 0;
          }

          .ec-testimonial-inner {
            padding: 0 25px;
          }

          .ec-testimonial-heading h2,
          .ec-faq-heading h2 {
            font-size: 40px;
          }

          .ec-footer {
            padding: 60px 25px 30px;
          }

          .ec-footer-top {
            grid-template-columns: 1fr;
            gap: 50px;
          }
        }

        @media (max-width: 520px) {
          .ec-hero h1 {
            font-size: 50px;
          }

          .ec-hero p {
            font-size: 16px;
          }

          .ec-covered-card {
            min-height: 240px;
          }

          .ec-testimonial {
            flex-basis: 310px;
          }

          .ec-footer-columns {
            grid-template-columns: 1fr;
          }

          .ec-footer-bottom {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      {loading && (
        <div className="ec-loading">
          <div className="ec-loader"></div>
        </div>
      )}

      <nav className="ec-nav">
        <div className="ec-brand">
          <div className="ec-logo">visago</div>
          <div className="ec-divider"></div>
          <div className="ec-nav-label">VISAS ON TIME</div>
        </div>

        <div className="ec-nav-right">
          <div className="ec-guaranteed">
            <span className="ec-shield">✓</span>
            On Time Guaranteed
          </div>
          <button className="ec-user">♙</button>
        </div>
      </nav>

      <main>
        <section className="ec-hero">
          <div className="ec-hero-content">
            <h1>{data.hero.title}</h1>

            <p>{data.hero.description}</p>

            <button
              className="ec-call"
              onClick={() =>
                window.open(`tel:${data.hero.phone}`, "_self")
              }
            >
              <span className="ec-call-icon">☎</span>
              {data.hero.buttonText}
            </button>
          </div>

          <div className="ec-visual">
            <div className="ec-gradient"></div>
            <div className="ec-orbit"></div>
            <div className="ec-arrow"></div>
          </div>
        </section>

        <section className="ec-stats">
          {data.stats.map((stat, index) => (
            <div className="ec-stat" key={index}>
              <div className="ec-stat-value">{stat.value}</div>
              <div className="ec-stat-label">{stat.label}</div>
              <div className="ec-stat-art"></div>
            </div>
          ))}
        </section>

        <section className="ec-section">
          <div className="ec-section-heading">
            <div className="ec-heading-icon">✓</div>
            <h2>What's covered</h2>
          </div>

          <div className="ec-covered-grid">
            {data.covered.map((item, index) => (
              <div className="ec-covered-card" key={index}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="ec-card-shape"></div>
              </div>
            ))}
          </div>
        </section>

        <div className="ec-divider-line"></div>

        <section className="ec-section">
          <div className="ec-section-heading">
            <div className="ec-heading-icon">×</div>
            <h2>What's not covered</h2>
          </div>

          <div className="ec-not-note">
            To keep this line open for immediate crises, please use our
            website or app for standard applications.
          </div>

          <div className="ec-not-grid">
            {data.notCovered.map((item, index) => (
              <div className="ec-not-item" key={index}>
                <div className="ec-not-icon">×</div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ec-testimonial-section">
          <div className="ec-testimonial-inner">
            <div className="ec-testimonial-heading">
              <h2>Visas on time, especially in a crisis</h2>
              <p>
                Real stories from travelers who couldn't afford to wait
                for the standard process.
              </p>
            </div>

            <div className="ec-testimonials">
              {data.testimonials.map((item, index) => {
                const initials = item.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <article className="ec-testimonial" key={index}>
                    <div className="ec-person">
                      <div className="ec-avatar">{initials}</div>

                      <div>
                        <div className="ec-person-name">
                          {item.name}
                        </div>

                        <div className="ec-person-category">
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <div className="ec-quote">
                      "{item.quote}"
                    </div>

                    <div className="ec-source">
                      Read {item.source} ↗
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="ec-section">
          <div className="ec-faq">
            <div className="ec-faq-heading">
              <h2>Frequently Asked Questions</h2>
            </div>

            {data.faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div className="ec-faq-item" key={index}>
                  <button
                    className="ec-faq-question"
                    onClick={() =>
                      setOpenFaq(isOpen ? -1 : index)
                    }
                  >
                    <span>{faq.question}</span>

                    <span className="ec-faq-plus">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    className={`ec-faq-answer ${
                      isOpen ? "open" : ""
                    }`}
                  >
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="ec-footer">
        <div className="ec-footer-inner">
          <div className="ec-footer-top">
            <div>
              <div className="ec-footer-logo">visago</div>

              <div className="ec-footer-desc">
                visago helps you plan, apply, and track visas seamlessly
                across the world.
              </div>
            </div>

            <div className="ec-footer-columns">
              <div className="ec-footer-column">
                <h4>Company</h4>
                <a href="/careers">Careers</a>
                <a href="/newsroom">Newsroom</a>
                <a href="/contact">Contact</a>
                <a href="/defence">Defense Personnel</a>
                <a href="/partners">Partners</a>
                <a href="/engineering">Engineering</a>
                <a href="/security">Security</a>
                <a href="/transparency">Transparency</a>
                <a href="/status">Status</a>
                <a href="/speed">Speed</a>
              </div>

              <div className="ec-footer-column">
                <h4>Products</h4>
                <a href="/schengen-appointment-checker">
                  Schengen Appointment Checker
                </a>
                <a href="/visa-photo-creator">
                  Visa Photo Creator
                </a>
                <a href="/emergency-care">
                  Emergency Visa Helpline
                </a>
                <a href="/rejection-recovery">
                  Rejection Recovery
                </a>
                <a href="/passport-index">
                  visago Passport Index
                </a>
              </div>
            </div>
          </div>

          <div className="ec-footer-bottom">
            <span>© visago, All rights reserved</span>

            <span>
              Privacy &nbsp;•&nbsp; Terms
            </span>
          </div>
        </div>
      </footer>

      <button className="ec-help">?</button>
    </div>
  );
}