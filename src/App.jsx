import "./App.css";
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

  return (
    <div className="atlys-style-home">
      <Navbar />

      <main>
        <VisaFilters />

        <div className="home-content-area">
          {viewMode === "list" ? (
            <PopularDestinations />
          ) : (
            <VisaMap />
          )}

          <div className="floating-view-switcher">
            <button
              type="button"
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              ☷
            </button>

            <span></span>

            <button
              type="button"
              className={viewMode === "map" ? "active" : ""}
              onClick={() => setViewMode("map")}
              aria-label="Map view"
            >
              ◈
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