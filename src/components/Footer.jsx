import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-top">

          {/* =========================================
              BRAND
          ========================================= */}
          <div className="footer-brand">

            <Link to="/" className="footer-logo">
              Visa<span>Go</span>
            </Link>

            <p className="footer-description">
              VisaGo helps you plan, apply, and track visas
              seamlessly across the world.
            </p>

            <p className="footer-ai-title">
              Ask AI about VisaGo
            </p>

            <div className="footer-ai-icons">
              <div className="ai-icon">
                ✦
              </div>

              <div className="ai-icon">
                ◌
              </div>

              <div className="ai-icon">
                ✧
              </div>

              <div className="ai-icon">
                ✦
              </div>
            </div>

            <div className="footer-wall">
              <div>
                Wall Of Love ↗
              </div>

              <div className="footer-reviews">

                <span className="review-avatar avatar-one">
                  P
                </span>

                <span className="review-avatar avatar-two">
                  A
                </span>

                <span className="review-avatar avatar-three">
                  R
                </span>

                <span className="review-avatar avatar-four">
                  M
                </span>

                <span className="review-count">
                  20K+ reviews
                </span>

              </div>
            </div>

          </div>


          {/* =========================================
              COMPANY
          ========================================= */}
          <div className="footer-column">

            <h4>Company</h4>

            <Link to="/careers">
              Careers
            </Link>

            <Link to="/newsroom">
              Newsroom
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <Link to="/defence">
              Defence Personnel
            </Link>

            <Link to="/partners">
              Partners
            </Link>

            <Link to="/faultlines">
              Faultlines
            </Link>

            <Link to="/security">
              Security
            </Link>

            <Link to="/transparency">
              Transparency
            </Link>

            <Link to="/refunds-policy">
              Refunds Policy
            </Link>

            <Link to="/transparency/price-change-log">
              Fee Change Audit
            </Link>

            <Link to="/status">
              Status
            </Link>

            <Link to="/speed">
              Speed
            </Link>

          </div>


          {/* =========================================
              PRODUCTS
          ========================================= */}
          <div className="footer-column">

            <h4>Products</h4>

            <Link to="/schengen-appointment-checker">
              Schengen Appointment Checker
            </Link>

            <Link to="/visa-photo-creator">
              Visa Photo Creator
            </Link>

            <Link to="/emergency-care">
              VisaGo Emergency Helpline
            </Link>

            <Link to="/rejection-recovery">
              Rejection Recovery
            </Link>

            <Link to="/bible">
              Bible
            </Link>

            <Link to="/magazine">
              Magazine Library
            </Link>

            <Link to="/passport-index">
              VisaGo Passport Index
            </Link>

          </div>


          {/* =========================================
              OFFICES
          ========================================= */}
          <div className="footer-offices">

            <h4>Offices</h4>

            <div className="office">

              <span className="office-icon">
                ◉
              </span>

              <span>
                7 Khullar Farms,
                <br />
                New Delhi, India
              </span>

            </div>


            <div className="office">

              <span className="office-icon">
                ◉
              </span>

              <span>
                3rd Floor, Burjuman Mall,
                <br />
                Khalid Bin Al Waleed Rd -
                <br />
                Al Mankhool - Dubai
              </span>

            </div>


            <div className="office">

              <span className="office-icon">
                ◉
              </span>

              <span>
                447 Broadway STE 851,
                <br />
                New York, USA
              </span>

            </div>

          </div>

        </div>


        {/* =========================================
            STORE BUTTONS
        ========================================= */}
        <div className="footer-store-buttons">

          <div className="store-button">
             App Store
          </div>

          <div className="store-button">
            ▶ Google Play
          </div>

        </div>


        {/* =========================================
            BOTTOM
        ========================================= */}
        <div className="footer-bottom">

          <span>
            © 2026 VisaGo
          </span>

          <span>
            Visa information should be verified with the
            relevant official authority.
          </span>

        </div>

      </div>
    </footer>
  );
}

export default Footer;