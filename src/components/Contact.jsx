import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Contact.css";

function Contact() {
  return (
    <div className="contact-page">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="contact-hero">
          <div className="contact-hero-inner">
            <div className="contact-eyebrow">CONTACT</div>

            <h1>Get in touch</h1>

            <p>
              Have a question about VisaGo? We&apos;re here to help.
              Choose the right channel and we&apos;ll get back to you.
            </p>
          </div>
        </section>

        {/* SUPPORT */}
        <section className="contact-section">
          <div className="contact-section-inner">

            <div className="contact-section-heading">
              <span>01</span>
              <div>
                <h2>Customer Support</h2>
                <p>
                  Get help with applications, documents, payments,
                  account questions, and application status.
                </p>
              </div>
            </div>

            <div className="contact-support-grid">

              <a
                href="mailto:support@visago.com"
                className="contact-card"
              >
                <div className="contact-card-top">
                  <span className="contact-card-label">
                    CUSTOMER SUPPORT
                  </span>

                  <span className="contact-arrow">↗</span>
                </div>

                <div className="contact-card-icon">
                  @
                </div>

                <h3>support@visago.com</h3>

                <p>
                  Application help, document questions,
                  account support and general assistance.
                </p>

                <span className="contact-card-link">
                  Email support
                </span>
              </a>

              <a
                href="mailto:hello@visago.com"
                className="contact-card"
              >
                <div className="contact-card-top">
                  <span className="contact-card-label">
                    GENERAL QUERIES
                  </span>

                  <span className="contact-arrow">↗</span>
                </div>

                <div className="contact-card-icon">
                  ?
                </div>

                <h3>hello@visago.com</h3>

                <p>
                  Questions about VisaGo, partnerships,
                  products, or anything else.
                </p>

                <span className="contact-card-link">
                  Send an enquiry
                </span>
              </a>

              <a
                href="tel:+918031149395"
                className="contact-card contact-card-dark"
              >
                <div className="contact-card-top">
                  <span className="contact-card-label">
                    APPLICATION ISSUES
                  </span>

                  <span className="contact-arrow">↗</span>
                </div>

                <div className="contact-card-icon">
                  ☎
                </div>

                <h3>+91 80 3114 9395</h3>

                <p>
                  For urgent questions related to an
                  active application.
                </p>

                <span className="contact-card-link">
                  Call VisaGo
                </span>
              </a>

            </div>

            <div className="contact-response-note">
              <span className="contact-note-dot"></span>

              <span>
                We aim to respond to support requests within 48 hours.
              </span>
            </div>

          </div>
        </section>

        {/* OFFICES */}
        <section className="contact-offices-section">
          <div className="contact-section-inner">

            <div className="contact-section-heading">
              <span>02</span>

              <div>
                <h2>Our offices</h2>

                <p>
                  Find VisaGo across our offices and support hubs.
                </p>
              </div>
            </div>

            <div className="contact-office-grid">

              <article className="contact-office-card">
                <div className="contact-office-number">
                  01
                </div>

                <div className="contact-office-pin">
                  ⌖
                </div>

                <h3>New Delhi</h3>

                <p>
                  7 Khullar Farms,
                  <br />
                  New Delhi, India
                </p>
              </article>

              <article className="contact-office-card">
                <div className="contact-office-number">
                  02
                </div>

                <div className="contact-office-pin">
                  ⌖
                </div>

                <h3>Dubai</h3>

                <p>
                  3rd Floor, Burjuman Mall,
                  <br />
                  Khalid Bin Al Waleed Rd -
                  <br />
                  Al Mankhool - Dubai
                </p>
              </article>

              <article className="contact-office-card">
                <div className="contact-office-number">
                  03
                </div>

                <div className="contact-office-pin">
                  ⌖
                </div>

                <h3>New York</h3>

                <p>
                  447 Broadway STE 851,
                  <br />
                  New York, USA
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* GRIEVANCE */}
        <section className="contact-grievance-section">
          <div className="contact-section-inner">

            <div className="contact-grievance">

              <div className="contact-grievance-copy">
                <span className="contact-grievance-label">
                  03 · GRIEVANCE REDRESSAL
                </span>

                <h2>
                  Need to raise a formal concern?
                </h2>

                <p>
                  Use the grievance channel for formal complaints
                  and escalation related to VisaGo services.
                </p>
              </div>

              <div className="contact-grievance-details">

                <div>
                  <span>EMAIL</span>
                  <a href="mailto:grievance@visago.com">
                    grievance@visago.com
                  </a>
                </div>

                <div>
                  <span>PHONE</span>
                  <a href="tel:+918031149395">
                    +91 80 3114 9395
                  </a>
                </div>

                <div>
                  <span>ADDRESS</span>
                  <p>
                    7 Khullar Farms,
                    <br />
                    New Delhi, India
                  </p>
                </div>

              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />        
    </div>
  );
}

export default Contact;
