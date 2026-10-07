import "./App.css";
import "./home.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import VisaFilters from "./components/VisaFilters";
import PopularDestinations from "./components/PopularDestinations";
import VisaMap from "./components/VisaMap";
import VisaDetails from "./components/VisaDetails";
import Events from "./components/Events";
import SignIn from "./components/SignIn";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import OnTimeGuaranteed from "./components/OnTimeGuaranteed";
import Career from "./components/Career";
import TDAC from "./components/TDAC";
import Partners from "./components/Partners";
import FeeChangeAudit from "./components/FeeChangeAudit";
import InfoPage from "./components/InfoPage";
import Speed from "./components/Speed";
import SchengenAppointmentChecker from "./components/SchengenAppointmentChecker";
import Contact from "./components/Contact";
import Status from "./components/Status";
import Newsroom from "./components/Newsroom";
import Defence, { DefenceApply } from "./components/Defence";
import EmergencyCare from "./components/EmergencyCare";
import Security from "./components/Security";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function Home() {
  const [viewMode, setViewMode] = useState("list");

  const changeView = (mode) => {
    setViewMode(mode);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  return (
    <div
      className={`atlys-style-home ${viewMode === "map" ? "map-mode" : ""}`}
    >
      {/* Navbar and filters only on the list (home) view */}
      {viewMode === "list" && <Navbar />}

      <main>
        {viewMode === "list" && <VisaFilters />}

        <div className="home-content-area">
          {viewMode === "list" ? <PopularDestinations /> : <VisaMap />}

          <div className="floating-view-switcher">
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => changeView("list")}
              aria-label="List view"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="3" y="4" width="4" height="16" rx="1" />
                <rect x="10" y="4" width="4" height="16" rx="1" />
                <rect x="17" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>

            <span></span>

            <button
              type="button"
              className={viewMode === "map" ? "active" : ""}
              onClick={() => changeView("map")}
              aria-label="Map view"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
                <path d="M9 4v14M15 6v14" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/visa/:slug" element={<VisaDetails />} />

        <Route path="/events" element={<Events />} />

        <Route path="/tdac" element={<TDAC />} />

        <Route
          path="/on-time-guaranteed"
          element={<OnTimeGuaranteed />}
        />

        <Route path="/careers" element={<Career />} />

        <Route path="/partners" element={<Partners />} />

        <Route path="/security" element={<Security />} />

        <Route
          path="/transparency/price-change-log"
          element={<FeeChangeAudit />}
        />

        <Route
          path="/transparency/status"
          element={<Status />}
        />

        <Route path="/status" element={<Status />} />

        <Route path="/newsroom" element={<Newsroom />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/defence" element={<Defence />} />

        <Route
          path="/defence/apply"
          element={<DefenceApply />}
        />

        <Route path="/speed" element={<Speed />} />

        <Route
          path="/schengen-appointment-checker"
          element={<SchengenAppointmentChecker />}
        />

        <Route
          path="/emergency-care"
          element={<EmergencyCare />}
        />

        <Route path="/:page" element={<InfoPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;