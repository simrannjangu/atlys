import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Events() {
  /*
    Current date:
    September 2026

    We start from the current month and continue
    through the upcoming months.
  */

  const allMonths = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  const currentMonthIndex = new Date().getMonth();

  const visibleMonths = allMonths.slice(currentMonthIndex);

  const [activeMonth, setActiveMonth] = useState(
    visibleMonths[0]
  );

  const monthRefs = useRef({});

  /*
  =====================================================
  SCROLL DETECTION
  =====================================================
  */

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );

        if (visible.length > 0) {
          const month =
            visible[0].target.getAttribute(
              "data-month"
            );

          if (month) {
            setActiveMonth(month);
          }
        }
      },
      {
        root: null,
        threshold: 0.05,
        rootMargin: "-35% 0px -50% 0px",
      }
    );

    Object.values(monthRefs.current).forEach(
      (section) => {
        if (section) {
          observer.observe(section);
        }
      }
    );

    return () => observer.disconnect();
  }, []);

  /*
  =====================================================
  CLICK MONTH
  =====================================================
  */

  const scrollToMonth = (month) => {
    const section =
      monthRefs.current[month];

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="events-page">

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

        .events-page {
          width: 100%;
          min-height: 100vh;

          background: #ffffff;
          color: #111111;

          overflow-x: hidden;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }


        /* =================================================
           TOP CATEGORY BAR
        ================================================= */

        .events-top {
          padding:
            70px
            20px
            0;

          text-align: center;
        }

        .events-category-bar {
          display: inline-flex;

          align-items: center;

          background: #ffffff;

          border:
            1px solid
            #dfe2e5;

          border-radius: 999px;

          box-shadow:
            0 10px 28px
            rgba(0,0,0,0.07);

          overflow: hidden;

          max-width: calc(100vw - 30px);
        }

        .events-category {
          min-height: 62px;

          padding:
            10px
            22px;

          display: flex;
          align-items: center;

          gap: 9px;

          border: none;

          background: transparent;

          color: #767d86;

          font-size: 14px;

          font-weight: 700;

          white-space: nowrap;
        }

        .events-category + .events-category {
          border-left:
            1px solid
            #e4e6e8;
        }

        .events-category-active {
          color: #111111;

          position: relative;
        }

        .events-category-active::after {
          content: "";

          position: absolute;

          left: 50%;
          bottom: 0;

          width: 54px;
          height: 3px;

          border-radius: 999px;

          background: #111111;

          transform:
            translateX(-50%);
        }

        .events-category-icon {
          width: 28px;
          height: 28px;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #ffffff;

          font-size: 12px;
        }


        /* =================================================
           YEAR
        ================================================= */

        .events-year {
          margin-top: 70px;

          font-size: 35px;

          font-weight: 500;

          letter-spacing:
            -0.045em;
        }

        .events-year-muted {
          color: #737a84;
        }

        .events-year-dot {
          display: inline-block;

          width: 8px;
          height: 8px;

          margin:
            0
            9px
            5px;

          background: #707781;

          border-radius: 50%;
        }


        /* =================================================
           EVENTS WRAPPER
        ================================================= */

        .events-wrapper {
          position: relative;

          width: 100%;

          margin-top: 72px;
        }


        /* =================================================
           LEFT TIMELINE RAIL
        ================================================= */

        .events-rail {
          position: absolute;

          left: 0;

          top: 0;
          bottom: 0;

          width: 100%;

          pointer-events: none;
        }

        .events-rail-line {
          position: absolute;

          left: 25px;

          top: 0;
          bottom: 0;

          width: 1px;

          background:
            #e0e2e5;
        }

        /*
          Small horizontal ticks,
          similar to the reference page.
        */

        .events-rail-tick {
          position: absolute;

          left: 0;

          width: 56px;

          height: 1px;

          background:
            #e5e7e9;
        }


        /* =================================================
           ACTIVE MONTH MARKER
        ================================================= */

        .events-active-month {
          position: sticky;

          top: 50%;

          z-index: 30;

          width: 0;

          margin-left: 0;

          pointer-events: none;
        }

        .events-active-month-label {
          position: absolute;

          left: 0;

          top: 0;

          transform:
            translateY(-50%);

          display: flex;

          align-items: center;

          height: 29px;

          min-width: 67px;

          padding:
            0
            13px;

          border-radius: 999px;

          background:
            #111111;

          color:
            #ffffff;

          font-size: 13px;

          font-weight: 800;

          letter-spacing:
            0.02em;

          white-space: nowrap;

          box-shadow:
            0
            3px
            10px
            rgba(0,0,0,.08);
        }

        .events-active-month-line {
          position: absolute;

          left: 0;

          top: 0;

          width:
            calc(
              18vw
            );

          max-width:
            285px;

          height: 1px;

          background:
            #ef5757;
        }

        .events-active-month-line::after {
          content: "";

          position: absolute;

          right: -3px;

          top: -2px;

          width: 5px;
          height: 5px;

          border-radius: 50%;

          background:
            #ef5757;
        }


        /* =================================================
           EVENT CONTENT
        ================================================= */

        .events-content {
          width:
            min(
              1018px,
              calc(100% - 350px)
            );

          margin-left:
            clamp(
              250px,
              18vw,
              345px
            );

          margin-right:
            auto;
        }


        /* =================================================
           MONTH SECTION
        ================================================= */

        .events-month-section {
          position: relative;

          scroll-margin-top:
            120px;

          padding-bottom:
            70px;
        }

        /*
          We don't show a second large month heading.
          The moving left marker is the month heading.
        */

        .events-month-space {
          height: 0;
        }


        /* =================================================
           CARD GRID
        ================================================= */

        .events-grid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap:
            42px
            27px;
        }


        /* =================================================
           EVENT CARD
        ================================================= */

        .event-item {
          min-width: 0;
        }

        .event-card {
          position: relative;

          width: 100%;

          height: 420px;

          border-radius: 33px;

          overflow: hidden;

          background:
            #eeeeef;

          border:
            1px solid
            #e6e7e9;

          text-decoration: none;

          display: block;
        }


        /* =================================================
           EMPTY CARD AREA
        ================================================= */

        .event-card-placeholder {
          position: absolute;

          inset: 0;

          background:
            #eeeeef;
        }


        /*
          Very subtle neutral placeholder.
          No fake photos, no fake data.
        */

        .event-placeholder-gradient {
          position: absolute;

          left: 0;
          right: 0;
          bottom: 0;

          height: 55%;

          background:
            linear-gradient(
              to bottom,
              rgba(255,255,255,0),
              rgba(20,20,24,.20) 35%,
              rgba(12,12,15,.88) 78%,
              rgba(8,8,10,.98) 100%
            );
        }


        /* =================================================
           EMPTY CONTENT SHAPES
        ================================================= */

        .event-placeholder-content {
          position: absolute;

          left: 22px;
          right: 22px;
          bottom: 22px;

          z-index: 4;

          display: flex;

          flex-direction: column;

          align-items: center;
        }

        .event-placeholder-country {
          width: 84px;
          height: 21px;

          border-radius: 999px;

          background:
            rgba(255,255,255,.13);

          margin-bottom: 15px;
        }

        .event-placeholder-title {
          width: 73%;
          height: 28px;

          border-radius: 5px;

          background:
            rgba(255,255,255,.12);

          margin-bottom: 9px;
        }

        .event-placeholder-title-2 {
          width: 51%;
          height: 11px;

          border-radius: 5px;

          background:
            rgba(255,255,255,.10);

          margin-bottom: 18px;
        }

        .event-placeholder-date {
          width: 40%;
          height: 11px;

          border-radius: 5px;

          background:
            rgba(255,255,255,.10);

          margin-bottom: 17px;
        }

        .event-placeholder-divider {
          width: 75%;

          height: 1px;

          background:
            rgba(255,255,255,.17);

          margin-bottom: 13px;
        }

        .event-placeholder-visa {
          width: 58%;
          height: 10px;

          border-radius: 5px;

          background:
            rgba(255,255,255,.10);
        }


        /* =================================================
           PEOPLE PLACEHOLDER
        ================================================= */

        .event-people-placeholder {
          height: 42px;

          display: flex;

          align-items: center;

          gap: 9px;

          padding:
            10px
            7px
            0;
        }

        .event-avatars-placeholder {
          display: flex;

          padding-left: 7px;
        }

        .event-avatar-placeholder {
          width: 28px;
          height: 28px;

          margin-left: -7px;

          border-radius: 50%;

          border:
            2px solid
            #ffffff;

          background:
            #e6e7e9;
        }

        .event-people-line-placeholder {
          width: 100px;
          height: 9px;

          border-radius: 6px;

          background:
            #e9eaec;
        }


        /* =================================================
           BOTTOM LINE
        ================================================= */

        .events-bottom-line {
          position: relative;

          width: 100%;

          height: 1px;

          background:
            #e1e3e5;

          margin:
            25px
            0
            110px;
        }

        .events-bottom-line::before,
        .events-bottom-line::after {
          content: "";

          position: absolute;

          top: -3px;

          width: 7px;
          height: 7px;

          border-radius: 50%;

          background:
            #e0e2e4;
        }

        .events-bottom-line::before {
          left: 0;
        }

        .events-bottom-line::after {
          right: 0;
        }


        /* =================================================
           DESKTOP TIMELINE TICKS
        ================================================= */

        .events-tick-1 {
          top: 120px;
        }

        .events-tick-2 {
          top: 260px;
        }

        .events-tick-3 {
          top: 420px;
        }

        .events-tick-4 {
          top: 590px;
        }

        .events-tick-5 {
          top: 780px;
        }

        .events-tick-6 {
          top: 1000px;
        }

        .events-tick-7 {
          top: 1230px;
        }

        .events-tick-8 {
          top: 1480px;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1200px) {

          .events-content {
            width:
              calc(
                100% - 270px
              );

            margin-left:
              220px;
          }

          .events-active-month-line {
            width: 190px;
          }

        }


        @media (max-width: 950px) {

          .events-top {
            padding-top: 50px;
          }

          .events-category-bar {
            overflow-x: auto;
          }

          .events-main {
            width: 100%;
          }

          .events-content {
            width:
              calc(
                100% - 155px
              );

            margin-left:
              145px;
          }

          .events-active-month-line {
            width: 105px;
          }

          .events-rail-line {
            left: 25px;
          }

          .events-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0,1fr)
              );
          }

        }


        @media (max-width: 700px) {

          .events-top {
            padding-top: 35px;
          }

          .events-year {
            margin-top: 45px;

            font-size: 29px;
          }

          /*
            Mobile gets a horizontal
            compact navigator.
          */

          .events-rail {
            position: sticky;

            top: 0;

            z-index: 80;

            height: auto;

            padding: 9px 15px;

            background:
              rgba(255,255,255,.95);

            backdrop-filter:
              blur(12px);
          }

          .events-rail-line,
          .events-rail-tick {
            display: none;
          }

          .events-active-month {
            display: none;
          }

          .events-content {
            width:
              calc(100% - 28px);

            margin:
              0
              14px;
          }

          .events-main {
            margin-top: 0;
          }

          .events-month-section {
            scroll-margin-top:
              90px;
          }

          .events-grid {
            grid-template-columns: 1fr;
          }

          .event-card {
            height: 430px;
          }

        }

      `}</style>


      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />


      {/* =================================================
          CATEGORY BAR
      ================================================= */}

      <section className="events-top">

        <div className="events-category-bar">

          <div
            className="
              events-category
              events-category-active
            "
          >
            <span
              className="events-category-icon"
              style={{
                background:
                  "#111111",
              }}
            >
              ✦
            </span>

            All Events
          </div>


          <div className="events-category">

            <span
              className="events-category-icon"
              style={{
                background:
                  "#e84d95",
              }}
            >
              ♫
            </span>

            Music
          </div>


          <div className="events-category">

            <span
              className="events-category-icon"
              style={{
                background:
                  "#1eae72",
              }}
            >
              ●
            </span>

            Sports
          </div>


          <div className="events-category">

            <span
              className="events-category-icon"
              style={{
                background:
                  "#ed9241",
              }}
            >
              ✦
            </span>

            Art & Culture
          </div>


          <div className="events-category">

            <span
              className="events-category-icon"
              style={{
                background:
                  "#596be8",
              }}
            >
              ◈
            </span>

            Business & Science
          </div>

        </div>


        <div className="events-year">

          2026

          <span
            className="events-year-dot"
          ></span>

          <span className="events-year-muted">
            Events
          </span>

        </div>

      </section>


      {/* =================================================
          EVENTS AREA
      ================================================= */}

      <div className="events-wrapper">


        {/* =================================================
            RAIL
        ================================================= */}

        <div className="events-rail">

          <div className="events-rail-line"></div>

          <span className="events-rail-tick events-tick-1"></span>
          <span className="events-rail-tick events-tick-2"></span>
          <span className="events-rail-tick events-tick-3"></span>
          <span className="events-rail-tick events-tick-4"></span>
          <span className="events-rail-tick events-tick-5"></span>
          <span className="events-rail-tick events-tick-6"></span>
          <span className="events-rail-tick events-tick-7"></span>
          <span className="events-rail-tick events-tick-8"></span>


          {/* CURRENT MONTH */}

          <div className="events-active-month">

            <div className="events-active-month-label">
              {activeMonth}
            </div>

            <div className="events-active-month-line"></div>

          </div>

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="events-content">

          {visibleMonths.map((month) => (

            <section
              key={month}
              data-month={month}
              ref={(element) => {
                monthRefs.current[month] =
                  element;
              }}
              className="events-month-section"
            >

              <div className="events-grid">


                {/* ============================
                    EMPTY CARD 1
                ============================= */}

                <div className="event-item">

                  <div className="event-card">

                    <div className="event-card-placeholder"></div>

                    <div className="event-placeholder-gradient"></div>

                    <div className="event-placeholder-content">

                      <div className="event-placeholder-country"></div>

                      <div className="event-placeholder-title"></div>

                      <div className="event-placeholder-title-2"></div>

                      <div className="event-placeholder-date"></div>

                      <div className="event-placeholder-divider"></div>

                      <div className="event-placeholder-visa"></div>

                    </div>

                  </div>


                  <div className="event-people-placeholder">

                    <div className="event-avatars-placeholder">

                      <div className="event-avatar-placeholder"></div>

                      <div className="event-avatar-placeholder"></div>

                      <div className="event-avatar-placeholder"></div>

                    </div>

                    <div className="event-people-line-placeholder"></div>

                  </div>

                </div>


                {/* ============================
                    EMPTY CARD 2
                ============================= */}

                <div className="event-item">

                  <div className="event-card">

                    <div className="event-card-placeholder"></div>

                    <div className="event-placeholder-gradient"></div>

                    <div className="event-placeholder-content">

                      <div className="event-placeholder-country"></div>

                      <div className="event-placeholder-title"></div>

                      <div className="event-placeholder-title-2"></div>

                      <div className="event-placeholder-date"></div>

                      <div className="event-placeholder-divider"></div>

                      <div className="event-placeholder-visa"></div>

                    </div>

                  </div>


                  <div className="event-people-placeholder">

                    <div className="event-avatars-placeholder">

                      <div className="event-avatar-placeholder"></div>

                      <div className="event-avatar-placeholder"></div>

                      <div className="event-avatar-placeholder"></div>

                    </div>

                    <div className="event-people-line-placeholder"></div>

                  </div>

                </div>


                {/* ============================
                    EMPTY CARD 3
                ============================= */}

                <div className="event-item">

                  <div className="event-card">

                    <div className="event-card-placeholder"></div>

                    <div className="event-placeholder-gradient"></div>

                    <div className="event-placeholder-content">

                      <div className="event-placeholder-country"></div>

                      <div className="event-placeholder-title"></div>

                      <div className="event-placeholder-title-2"></div>

                      <div className="event-placeholder-date"></div>

                      <div className="event-placeholder-divider"></div>

                      <div className="event-placeholder-visa"></div>

                    </div>

                  </div>


                  <div className="event-people-placeholder">

                    <div className="event-avatars-placeholder">

                      <div className="event-avatar-placeholder"></div>

                      <div className="event-avatar-placeholder"></div>

                      <div className="event-avatar-placeholder"></div>

                    </div>

                    <div className="event-people-line-placeholder"></div>

                  </div>

                </div>


              </div>

            </section>

          ))}


          <div className="events-bottom-line"></div>

        </main>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />

    </div>
  );
}

export default Events;