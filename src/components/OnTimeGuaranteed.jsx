import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import Logo from "./Logo";

function OnTimeGuaranteed() {
  const delaySection = useRef(null);
  const refundSection = useRef(null);
  const timeframeSection = useRef(null);
  const statusSection = useRef(null);

  const delayYellow = useRef(null);

  const refundPink = useRef(null);
  const refundYellow = useRef(null);

  const timeframeCyan = useRef(null);
  const timeframePink = useRef(null);
  const timeframeYellow = useRef(null);

  const statusCyan = useRef(null);
  const statusPink = useRef(null);
  const statusYellow = useRef(null);

  useEffect(() => {
    let animationFrame;

    const clamp = (value) => Math.max(0, Math.min(1, value));

    const ease = (value) => {
      value = clamp(value);
      return value * value * (3 - 2 * value);
    };

    const sectionProgress = (section) => {
      if (!section) return 0;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      return clamp(
        (viewportHeight - rect.top) /
          (viewportHeight + rect.height)
      );
    };

    /*
      This creates the exact effect we want:

      1. Circle starts very small in the CENTER.
      2. It expands outward.
      3. The next circle starts AFTER the previous one.
      4. NO left/right movement.
    */

    const revealCircle = (
      element,
      progress,
      start,
      end,
      minimumScale = 0.02
    ) => {
      if (!element) return;

      const raw =
        (progress - start) /
        (end - start);

      const p = ease(raw);

      const scale =
        minimumScale +
        p * (1 - minimumScale);

      element.style.transform =
        `translate(-50%, -50%) scale(${scale})`;
    };

    const animate = () => {

      /* =====================================================
         DELAY SECTION
      ===================================================== */

      const delayProgress =
        sectionProgress(delaySection.current);

      revealCircle(
        delayYellow.current,
        delayProgress,
        0.05,
        0.70,
        0.05
      );


      /* =====================================================
         REFUND SECTION

         Pink grows first.
         Yellow emerges from its CENTER afterwards.
      ===================================================== */

      const refundProgress =
        sectionProgress(refundSection.current);

      revealCircle(
        refundPink.current,
        refundProgress,
        0.02,
        0.72,
        0.03
      );

      revealCircle(
        refundYellow.current,
        refundProgress,
        0.30,
        0.88,
        0.04
      );


      /* =====================================================
         TIMEFRAME

         Cyan first
         ↓
         Pink emerges from the center
         ↓
         Yellow emerges from the center
      ===================================================== */

      const timeframeProgress =
        sectionProgress(timeframeSection.current);

      revealCircle(
        timeframeCyan.current,
        timeframeProgress,
        0.00,
        0.72,
        0.02
      );

      revealCircle(
        timeframePink.current,
        timeframeProgress,
        0.20,
        0.83,
        0.02
      );

      revealCircle(
        timeframeYellow.current,
        timeframeProgress,
        0.42,
        0.94,
        0.02
      );


      /* =====================================================
         STATUS

         Outer cyan appears
         ↓
         pink comes from middle
         ↓
         yellow comes from middle
      ===================================================== */

      const statusProgress =
        sectionProgress(statusSection.current);

      revealCircle(
        statusCyan.current,
        statusProgress,
        0.00,
        0.75,
        0.02
      );

      revealCircle(
        statusPink.current,
        statusProgress,
        0.20,
        0.85,
        0.02
      );

      revealCircle(
        statusYellow.current,
        statusProgress,
        0.45,
        1.00,
        0.02
      );


      animationFrame =
        requestAnimationFrame(animate);
    };

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
        }

        .otg-page {
          width: 100%;
          min-height: 100vh;
          background: #fff3e4;
          color: #2161f6;
          font-family: Arial, Helvetica, sans-serif;
          overflow-x: hidden;
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .otg-header {
          width: 100%;
          height: 82px;
          padding: 0 12%;
          background: #ffffff;

          display: flex;
          align-items: center;
          justify-content: space-between;

          position: relative;
          z-index: 100;
        }

    

        .otg-header-right {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .otg-guarantee-link {
          display: flex;
          align-items: center;
          gap: 9px;

          color: #2161f6;
          text-decoration: none;

          font-size: 13px;
          line-height: 1;
        }

        .otg-shield-small {
          width: 28px;
          height: 31px;

          border: 2px solid #2161f6;
          border-radius: 8px 8px 11px 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 12px;
        }

        .otg-profile {
          color: #2161f6;
          text-decoration: none;
          font-size: 30px;
        }


        /* =====================================================
           HERO
        ===================================================== */

        .otg-hero {
          width: 100%;
          height: 820px;

          background: #2161f6;
          color: #ffffff;

          position: relative;
          overflow: hidden;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .otg-mini-logo {
          position: absolute;
          top: 185px;

          display: flex;
          align-items: flex-start;

          color: white;

          font-size: 30px;
          font-weight: 800;
          letter-spacing: -2px;

          z-index: 5;
        }

        .otg-mini-logo small {
          margin-left: 5px;
          margin-top: 2px;

          font-size: 10px;
          line-height: .9;

          text-align: left;
        }

        .otg-hero h1 {
          position: relative;
          z-index: 5;

          margin: 110px 0 0;

          color: white;

          font-size: clamp(100px, 10.8vw, 205px);
          line-height: .78;
          letter-spacing: -10px;

          font-weight: 800;
        }


        /* =====================================================
           INTRO
        ===================================================== */

        .otg-intro {
          width: 100%;
          min-height: 300px;

          background: #2161f6;
          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 65px 18%;
        }

        .otg-intro p {
          max-width: 1050px;

          margin: 0;

          color: white;

          text-align: center;

          font-size: 27px;
          line-height: 1.25;

          font-weight: 600;
        }


        /* =====================================================
           DELAY
        ===================================================== */

        .otg-delay {
          width: 100%;
          height: 850px;

          position: relative;
          overflow: hidden;

          background: #fff3e4;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .otg-delay-circle {
          width: 340px;
          height: 340px;

          border-radius: 50%;

          background: #ffe27b;

          position: absolute;

          left: 50%;
          top: 50%;

          transform:
            translate(-50%, -50%)
            scale(.02);

          transform-origin: center center;

          will-change: transform;
        }

        .otg-delay h2 {
          position: relative;
          z-index: 10;

          margin: 170px 0 0;

          color: #2161f6;

          text-align: center;

          font-size: clamp(80px, 8vw, 150px);
          line-height: .84;
          letter-spacing: -7px;

          font-weight: 800;
        }


        /* =====================================================
           REFUND
        ===================================================== */

        .otg-refund {
          width: 100%;
          height: 850px;

          position: relative;
          overflow: hidden;

          background: #fff3e4;

          padding-top: 70px;

          display: flex;
          justify-content: center;
        }

        .otg-refund-text {
          width: min(1000px, 85%);

          margin: 0;

          position: relative;
          z-index: 20;

          color: #2161f6;

          text-align: center;

          font-size: 28px;
          line-height: 1.25;

          font-weight: 600;
        }

        .otg-refund-pink {
          position: absolute;

          width: 670px;
          height: 670px;

          border-radius: 50%;

          background: #ffa8ad;

          left: 50%;
          top: 500px;

          transform:
            translate(-50%, -50%)
            scale(.03);

          transform-origin: center center;

          will-change: transform;
        }

        .otg-refund-yellow {
          position: absolute;

          width: 340px;
          height: 340px;

          border-radius: 50%;

          background: #ffe27b;

          left: 50%;
          top: 500px;

          transform:
            translate(-50%, -50%)
            scale(.03);

          transform-origin: center center;

          will-change: transform;
        }


        /* =====================================================
           TIMEFRAME
        ===================================================== */

        .otg-timeframe {
          width: 100%;
          height: 1000px;

          position: relative;
          overflow: hidden;

          background: #fff3e4;

          display: flex;
          justify-content: center;
          align-items: flex-start;

          padding-top: 45px;
        }

        .otg-time-cyan {
          position: absolute;

          width: 1000px;
          height: 1000px;

          border-radius: 50%;

          background: #94e6f3;

          left: 50%;
          top: 500px;

          transform:
            translate(-50%, -50%)
            scale(.02);

          transform-origin: center center;

          will-change: transform;
        }

        .otg-time-pink {
          position: absolute;

          width: 590px;
          height: 590px;

          border-radius: 50%;

          background: #ffa8ad;

          left: 50%;
          top: 500px;

          transform:
            translate(-50%, -50%)
            scale(.02);

          transform-origin: center center;

          will-change: transform;
        }

        .otg-time-yellow {
          position: absolute;

          width: 230px;
          height: 230px;

          border-radius: 50%;

          background: #ffe27b;

          left: 50%;
          top: 500px;

          transform:
            translate(-50%, -50%)
            scale(.02);

          transform-origin: center center;

          will-change: transform;
        }

        .otg-timeframe h2 {
          position: relative;
          z-index: 20;

          margin: 0;

          color: #2161f6;

          text-align: center;

          font-size: clamp(75px, 8vw, 145px);
          line-height: .84;
          letter-spacing: -7px;

          font-weight: 800;
        }

        .otg-timeframe p {
          width: min(1100px, 82%);

          position: absolute;

          top: 410px;
          left: 50%;

          transform: translateX(-50%);

          z-index: 25;

          margin: 0;

          color: #2161f6;

          text-align: center;

          font-size: 28px;
          line-height: 1.25;

          font-weight: 600;
        }


        /* =====================================================
           STATUS
        ===================================================== */

        .otg-status {
          width: 100%;
          height: 1050px;

          position: relative;
          overflow: hidden;

          background: #ffffff;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .otg-status-outer {
          width: 1250px;
          height: 1250px;

          border-radius: 50%;

          background: white;

          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .otg-status-cyan {
          width: 920px;
          height: 920px;

          border-radius: 50%;

          background: #94e6f3;

          position: absolute;

          left: 50%;
          top: 50%;

          transform:
            translate(-50%, -50%)
            scale(.02);

          will-change: transform;
        }

        .otg-status-pink {
          width: 520px;
          height: 520px;

          border-radius: 50%;

          background: #ffa8ad;

          position: absolute;

          left: 50%;
          top: 50%;

          transform:
            translate(-50%, -50%)
            scale(.02);

          will-change: transform;
        }

        .otg-status-yellow {
          width: 190px;
          height: 190px;

          border-radius: 50%;

          background: #ffe27b;

          position: absolute;

          left: 50%;
          top: 50%;

          transform:
            translate(-50%, -50%)
            scale(.02);

          will-change: transform;
        }

        .otg-status-content {
          position: absolute;

          left: 50%;
          top: 50%;

          transform: translate(-50%, -50%);

          width: 1050px;

          z-index: 30;

          text-align: center;
        }

        .otg-status-content h2 {
          margin: 0 0 60px;

          color: #2161f6;

          font-size: clamp(78px, 8vw, 145px);
          line-height: .84;
          letter-spacing: -7px;

          font-weight: 800;
        }

        .otg-status-content p {
          width: 850px;
          max-width: 90%;

          margin: 0 auto;

          color: #2161f6;

          font-size: 28px;
          line-height: 1.25;

          font-weight: 600;
        }


        /* =====================================================
           MISSED COMMITMENTS
        ===================================================== */

        .otg-missed {
          width: 100%;
          min-height: 1080px;

          background: #fff3e4;

          padding: 125px 10% 120px;

          position: relative;
          overflow: hidden;
        }

        .otg-missed-heading {
          width: min(1100px, 100%);

          margin: 0 auto;

          text-align: center;
        }

        .otg-missed-heading h2 {
          margin: 0;

          color: #2161f6;

          font-size: clamp(80px, 8vw, 150px);
          line-height: .82;
          letter-spacing: -7px;

          font-weight: 800;
        }

        .otg-missed-heading p {
          width: min(1060px, 100%);

          margin: 55px auto 0;

          color: #2161f6;

          font-size: 27px;
          line-height: 1.25;

          font-weight: 600;
        }

        .otg-missed-heading p + p {
          margin-top: 45px;
        }

        .otg-card-stack {
          width: 480px;
          max-width: 90%;

          margin: 100px auto 0;
        }

        .otg-missed-card {
          width: 100%;
          min-height: 103px;

          margin-bottom: 12px;

          padding: 17px;

          border-radius: 19px;

          background: #2e7ff6;
          color: white;

          display: flex;
          align-items: center;
        }

        .otg-missed-avatar {
          width: 48px;
          height: 48px;

          flex-shrink: 0;

          border-radius: 10px;

          background: white;
          color: #2e7ff6;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 800;
        }

        .otg-missed-info {
          margin-left: 15px;

          display: flex;
          flex-direction: column;

          gap: 8px;
        }

        .otg-missed-info strong {
          color: white;
          font-size: 16px;
        }

        .otg-missed-info span {
          color: white;
          font-size: 14px;
        }

        .otg-missed-time {
          margin-left: auto;
          align-self: flex-start;
          margin-top: 10px;

          color: white;

          font-size: 14px;

          white-space: nowrap;
        }


        /* =====================================================
           FINAL BLUE
        ===================================================== */

        .otg-final {
          width: 100%;
          min-height: 850px;

          background: #2e7ff6;

          color: white;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          position: relative;
          overflow: hidden;
        }

        .otg-final-shield {
          width: 180px;
          height: 205px;

          border: 8px solid white;

          clip-path: polygon(
            50% 0%,
            88% 18%,
            88% 60%,
            50% 100%,
            12% 60%,
            12% 18%
          );

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 72px;
          font-weight: 800;

          margin-bottom: 60px;
        }

        .otg-final h2 {
          margin: 0;

          color: white;

          font-size: clamp(80px, 8vw, 145px);
          line-height: .82;
          letter-spacing: -7px;

          font-weight: 800;
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .otg-footer {
          width: 100%;
          min-height: 640px;

          padding: 95px 9% 55px;

          background: white;

          display: grid;

          grid-template-columns:
            1.4fr 1fr 1.2fr 1fr;

          gap: 75px;

          color: #444;
        }

        .otg-footer-brand {
          max-width: 350px;
        }

        .otg-footer-logo {
          display: inline-block;

          margin-bottom: 24px;

          color: #111;

          text-decoration: none;

          font-size: 30px;
          font-weight: 800;

          letter-spacing: -2px;
        }

        .otg-footer-logo span {
          color: #2161f6;
        }

        .otg-footer-brand p {
          margin: 0;

          color: #626262;

          font-size: 15px;
          line-height: 1.65;
        }

        .otg-footer-ai-title {
          margin-top: 28px !important;
          margin-bottom: 13px !important;
          font-weight: 600;
        }

        .otg-ai-icons {
          display: flex;
          gap: 9px;
        }

        .otg-ai-icons span {
          width: 44px;
          height: 44px;

          border-radius: 12px;

          background: #f4f4f4;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 20px;
        }

        .otg-wall {
          margin-top: 26px;
        }

        .otg-review-row {
          display: flex;
          align-items: center;
        }

        .otg-review-avatar {
          width: 30px;
          height: 30px;

          margin-left: -4px;

          border: 2px solid white;
          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 11px;
          font-weight: 700;
        }

        .otg-review-avatar:first-child {
          margin-left: 0;
        }

        .otg-a1 { background: #f2b9c4; }
        .otg-a2 { background: #c8bce7; }
        .otg-a3 { background: #bedbc5; }
        .otg-a4 { background: #e4cf9f; }

        .otg-review-count {
          margin-left: 11px;

          color: #555;

          font-size: 14px;
        }

        .otg-store-buttons {
          display: flex;
          gap: 10px;

          margin-top: 36px;
        }

        .otg-store {
          min-width: 105px;
          height: 36px;

          padding: 5px 10px;

          border-radius: 5px;

          background: #050505;
          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 10px;
        }

        .otg-footer-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .otg-footer-column h4 {
          margin: 0 0 25px;

          color: #707070;

          font-size: 16px;
        }

        .otg-footer-column a {
          margin-bottom: 17px;

          color: #4e4e4e;

          text-decoration: none;

          font-size: 15px;
        }

        .otg-footer-column a:hover {
          color: #2161f6;
        }

        .otg-office {
          display: flex;
          align-items: flex-start;

          gap: 10px;

          margin-bottom: 20px;

          color: #4e4e4e;

          font-size: 15px;
          line-height: 1.45;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 900px) {

          .otg-header {
            padding: 0 6%;
          }

          .otg-hero {
            height: 720px;
          }

          .otg-intro {
            padding-left: 8%;
            padding-right: 8%;
          }

          .otg-intro p,
          .otg-refund-text,
          .otg-timeframe p,
          .otg-status-content p,
          .otg-missed-heading p {
            font-size: 21px;
          }

          .otg-status-outer {
            width: 900px;
            height: 900px;
          }

          .otg-status-cyan {
            width: 680px;
            height: 680px;
          }

          .otg-status-pink {
            width: 390px;
            height: 390px;
          }

          .otg-status-yellow {
            width: 150px;
            height: 150px;
          }

          .otg-status-content {
            width: 800px;
          }

          .otg-footer {
            grid-template-columns: 1fr 1fr;
          }
        }


        @media (max-width: 650px) {

          .otg-header {
            height: 70px;
            padding: 0 18px;
          }

          .otg-guarantee-link {
            display: none;
          }

          .otg-hero {
            height: 650px;
          }

          .otg-mini-logo {
            top: 100px;
            font-size: 22px;
          }

          .otg-hero h1 {
            margin-top: 80px;
            font-size: 72px;
            letter-spacing: -4px;
          }

          .otg-intro {
            min-height: 300px;
            padding: 50px 24px;
          }

          .otg-intro p,
          .otg-refund-text,
          .otg-timeframe p,
          .otg-status-content p,
          .otg-missed-heading p {
            font-size: 17px;
          }

          .otg-delay {
            height: 650px;
          }

          .otg-delay-circle {
            width: 220px;
            height: 220px;
          }

          .otg-delay h2 {
            font-size: 60px;
            letter-spacing: -4px;
          }

          .otg-refund {
            height: 700px;
          }

          .otg-refund-pink {
            width: 420px;
            height: 420px;
          }

          .otg-refund-yellow {
            width: 220px;
            height: 220px;
          }

          .otg-timeframe {
            height: 750px;
          }

          .otg-time-cyan {
            width: 600px;
            height: 600px;
          }

          .otg-time-pink {
            width: 390px;
            height: 390px;
          }

          .otg-time-yellow {
            width: 145px;
            height: 145px;
          }

          .otg-timeframe h2 {
            font-size: 60px;
            letter-spacing: -4px;
          }

          .otg-timeframe p {
            top: 350px;
            width: 88%;
          }

          .otg-status {
            height: 730px;
          }

          .otg-status-outer {
            width: 700px;
            height: 700px;
          }

          .otg-status-cyan {
            width: 520px;
            height: 520px;
          }

          .otg-status-pink {
            width: 290px;
            height: 290px;
          }

          .otg-status-yellow {
            width: 120px;
            height: 120px;
          }

          .otg-status-content {
            width: 92%;
          }

          .otg-status-content h2 {
            margin-bottom: 40px;
            font-size: 60px;
            letter-spacing: -4px;
          }

          .otg-status-content p {
            width: 88%;
          }

          .otg-missed {
            min-height: 900px;
            padding: 85px 18px;
          }

          .otg-missed-heading h2 {
            font-size: 61px;
            letter-spacing: -4px;
          }

          .otg-card-stack {
            max-width: 100%;
            margin-top: 70px;
          }

          .otg-missed-card {
            min-height: 90px;
            padding: 12px;
          }

          .otg-missed-avatar {
            width: 42px;
            height: 42px;
          }

          .otg-missed-info {
            margin-left: 10px;
            gap: 6px;
          }

          .otg-missed-info strong {
            font-size: 12px;
          }

          .otg-missed-info span {
            font-size: 10px;
          }

          .otg-missed-time {
            font-size: 9px;
          }

          .otg-final {
            min-height: 650px;
          }

          .otg-final-shield {
            width: 125px;
            height: 145px;
            font-size: 50px;
          }

          .otg-final h2 {
            font-size: 65px;
            letter-spacing: -4px;
          }

          .otg-footer {
            grid-template-columns: 1fr;
            gap: 45px;
            padding: 70px 24px 50px;
          }
        }
      `}</style>


      <div className="otg-page">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="otg-header">

         <Logo size="sm" />
          <div className="otg-header-right">

            <Link
              to="/on-time-guaranteed"
              className="otg-guarantee-link"
            >

              <span className="otg-shield-small">
                ✓
              </span>

              <span>
                <strong>On Time</strong>
                <br />
                <u>Guaranteed</u>
              </span>

            </Link>

            <Link
              to="/sign-in"
              className="otg-profile"
            >
              ♙
            </Link>

          </div>

        </header>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="otg-hero">

          <div className="otg-mini-logo">

           VYZITS

            <small>
              VISAS ON
              <br />
              TIME
            </small>

          </div>

          <h1>
            On Time
            <br />
            Guaranteed
          </h1>

        </section>


        {/* =====================================================
            INTRO
        ===================================================== */}

        <section className="otg-intro">

          <p>
            VisaGo is built by people who understand the anxiety
            of the visa process. That is why we are committed to
            making your visa journey clearer, more predictable,
            and easier to track from application to delivery.
          </p>

        </section>


        {/* =====================================================
            DELAY
        ===================================================== */}

        <section
          className="otg-delay"
          ref={delaySection}
        >

          <div
            ref={delayYellow}
            className="otg-delay-circle"
          />

          <h2>
            What happens on
            <br />
            delay?
          </h2>

        </section>


        {/* =====================================================
            REFUND
        ===================================================== */}

        <section
          className="otg-refund"
          ref={refundSection}
        >

          <p className="otg-refund-text">
            If VisaGo is unable to deliver an eligible visa
            within the committed timeframe, our applicable
            guarantee policy applies. We keep you informed
            and provide the relevant benefit under that policy.
          </p>

          <div
            ref={refundPink}
            className="otg-refund-pink"
          />

          <div
            ref={refundYellow}
            className="otg-refund-yellow"
          />

        </section>


        {/* =====================================================
            TIMEFRAME
        ===================================================== */}

        <section
          className="otg-timeframe"
          ref={timeframeSection}
        >

          <div
            ref={timeframeCyan}
            className="otg-time-cyan"
          />

          <div
            ref={timeframePink}
            className="otg-time-pink"
          />

          <div
            ref={timeframeYellow}
            className="otg-time-yellow"
          />

          <h2>
            How do we calculate
            <br />
            the timeframe?
          </h2>

          <p>
            We use information from previous visa timelines,
            destination-specific processing patterns, seasonal
            changes and embassy holidays to estimate a realistic
            delivery timeframe for your application.
          </p>

        </section>


        {/* =====================================================
            STATUS
        ===================================================== */}

        <section
          className="otg-status"
          ref={statusSection}
        >

          <div className="otg-status-outer">

            <div
              ref={statusCyan}
              className="otg-status-cyan"
            />

            <div
              ref={statusPink}
              className="otg-status-pink"
            />

            <div
              ref={statusYellow}
              className="otg-status-yellow"
            />

            <div className="otg-status-content">

              <h2>
                Checking status of
                <br />
                visa
              </h2>

              <p>
                Track the live status of your VisaGo
                application while we work toward timely
                delivery. Updates help you see where your
                application is in the process.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            MISSED COMMITMENTS
        ===================================================== */}

        <section className="otg-missed">

          <div className="otg-missed-heading">

            <h2>
              The time
              <br />
              commitments we
              <br />
              missed
            </h2>

            <p>
              Our reasons for missing a delivery commitment
              can vary. Public holidays, document corrections,
              processing issues and coordination with external
              authorities can affect timelines.
            </p>

            <p>
              When a commitment is missed, we believe in
              taking responsibility and explaining what happened.
            </p>

          </div>


          <div className="otg-card-stack">

            <div className="otg-missed-card">

              <div className="otg-missed-avatar">
                V
              </div>

              <div className="otg-missed-info">

                <strong>
                  PRIYA SHARMA
                </strong>

                <span>
                  Singapore Passport Pickup Delay
                </span>

              </div>

              <strong className="otg-missed-time">
                Missed by 2 days
              </strong>

            </div>


            <div className="otg-missed-card">

              <div className="otg-missed-avatar">
                V
              </div>

              <div className="otg-missed-info">

                <strong>
                  ADITYA GUPTA
                </strong>

                <span>
                  Vietnam Visa Correction
                </span>

              </div>

              <strong className="otg-missed-time">
                Missed by 4 hrs
              </strong>

            </div>


            <div className="otg-missed-card">

              <div className="otg-missed-avatar">
                V
              </div>

              <div className="otg-missed-info">

                <strong>
                  ALOK JOSHI
                </strong>

                <span>
                  Oman Visa Public Holiday
                </span>

              </div>

              <strong className="otg-missed-time">
                Missed by 23 min
              </strong>

            </div>

          </div>

        </section>


        {/* =====================================================
            FINAL BLUE
        ===================================================== */}

        <section className="otg-final">

          <div className="otg-final-shield">
            ✓
          </div>

          <h2>
            On Time
            <br />
            Guaranteed!
          </h2>

        </section>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="otg-footer">

          <div className="otg-footer-brand">

           <Logo size="md" />

            <p>
              VisaGo helps you plan, apply, and track visas
              seamlessly across the world.
            </p>

            <p className="otg-footer-ai-title">
              Ask AI about VisaGo
            </p>

            <div className="otg-ai-icons">

              <span>◉</span>
              <span>✦</span>
              <span>◇</span>
              <span>✧</span>

            </div>


            <div className="otg-wall">

              <div className="otg-review-row">

                <span className="otg-review-avatar otg-a1">
                  P
                </span>

                <span className="otg-review-avatar otg-a2">
                  A
                </span>

                <span className="otg-review-avatar otg-a3">
                  R
                </span>

                <span className="otg-review-avatar otg-a4">
                  M
                </span>

                <span className="otg-review-count">
                  20K+ reviews
                </span>

              </div>

            </div>


            <div className="otg-store-buttons">

              <div className="otg-store">
                 App Store
              </div>

              <div className="otg-store">
                ▶ Google Play
              </div>

            </div>

          </div>


          <div className="otg-footer-column">

            <h4>
              Company
            </h4>

            <Link to="#">Careers</Link>
            <Link to="#">Newsroom</Link>
            <Link to="#">Contact</Link>
            <Link to="#">Partners</Link>
            <Link to="#">Engineering</Link>
            <Link to="#">Security</Link>
            <Link to="#">Transparency</Link>
            <Link to="#">Refunds Policy</Link>
            <Link to="#">Fee Change Audit</Link>
            <Link to="#">Status</Link>
            <Link to="#">Speed</Link>

          </div>


          <div className="otg-footer-column">

            <h4>
              Products
            </h4>

            <Link to="#">
              Schengen Appointment Checker
            </Link>

            <Link to="#">
              Visa Photo Creator
            </Link>

            <Link to="#">
              VisaGo Emergency Helpline
            </Link>

            <Link to="#">
              Rejection Recovery
            </Link>

            <Link to="#">
              VisaGo Passport Index
            </Link>

          </div>


          <div className="otg-footer-column">

            <h4>
              Offices
            </h4>

            <div className="otg-office">
              <span>⌖</span>
              <span>Chandigarh, India</span>
            </div>

            <div className="otg-office">
              <span>⌖</span>
              <span>Mohali, Punjab, India</span>
            </div>

            <div className="otg-office">
              <span>⌖</span>
              <span>New Delhi, India</span>
            </div>

          </div>

        </footer>

      </div>
    </>
  );
}

export default OnTimeGuaranteed;