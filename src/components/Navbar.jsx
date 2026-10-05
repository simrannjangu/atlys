import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isExplore =
    location.pathname === "/" ||
    location.pathname.startsWith("/visa/");

  const isEvents = location.pathname === "/events";

  return (
    <header className="atlys-navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <Link to="/" className="atlys-logo">
          visa<span>go</span>
          <sup>→</sup>
        </Link>

        <div className="navbar-divider"></div>

        {/* ON TIME GUARANTEE */}
        <Link
          to="/on-time-guaranteed"
          className={`on-time-badge ${
            location.pathname === "/on-time-guaranteed"
              ? "on-time-active"
              : ""
          }`}
        >
          <div className="on-time-icon">✓</div>

          <div>
            <div>Visas On Time</div>

            <div className="guaranteed-text">
              Guaranteed
            </div>
          </div>
        </Link>
      </div>

      {/* CENTER */}
      <div className="navbar-center">
        <Link
          to="/"
          className={`nav-main-item ${
            isExplore ? "active" : ""
          }`}
        >
          <div className="nav-round-icon passport-icon">
            🛂
          </div>

          <span>Explore</span>
        </Link>

        <Link
          to="/events"
          className={`nav-main-item ${
            isEvents ? "active" : ""
          }`}
        >
          <div className="nav-round-icon event-icon">
            🎟️
          </div>

          <span>Events</span>
        </Link>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        <button
          type="button"
          className="country-search"
        >
          <span className="search-icon">⌕</span>

          <span>Search Country</span>
        </button>

        <Link
          to="/sign-in"
          className="profile-button"
          aria-label="Sign in"
        >
          ♟
        </Link>
      </div>
    </header>
  );
}

export default Navbar;