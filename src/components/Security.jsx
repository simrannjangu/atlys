import { useEffect, useRef } from "react";
import "./Security.css";
import Logo from "./Logo";

const documents = [
  {
    title: "Payment",
    subtitle: "information",
    icon: "▤",
    color: "blue",
  },
  {
    title: "Photos",
    subtitle: "",
    icon: "▧",
    color: "light",
  },
  {
    title: "Bank",
    subtitle: "statements",
    icon: "▥",
    color: "cyan",
  },
  {
    title: "Past visas",
    subtitle: "",
    icon: "▣",
    color: "blue",
  },
  {
    title: "Passport",
    subtitle: "",
    icon: "▤",
    color: "purple",
  },
];

const features = [
  {
    title: "Data Minimization and Anonymization",
    text: "Collect only the necessary data required for providing services and anonymize data wherever possible.",
    point: "Reduces the risk of unnecessary exposure of sensitive information.",
  },
  {
    title: "Secure Payments",
    text: "VYZITS is designed to use secure payment practices and appropriate safeguards when handling payment transactions.",
    point: "Helps protect financial information during transactions.",
  },
  {
    title: "Encryption at Rest",
    text: "Sensitive information should be protected while stored and accessed by authorized systems.",
    point: "Provides an additional layer of protection for stored information.",
  },
  {
    title: "End-to-End Encryption",
    text: "Data transmitted between users and VYZITS should travel through protected connections to help prevent unauthorized access.",
    point: "Helps protect information during transmission.",
  },
  {
    title: "Regular Security Audits",
    text: "Security practices should be reviewed regularly to identify potential weaknesses and improve protection against emerging threats.",
    point: "Keeps security practices up to date.",
  },
  {
    title: "Secure Access Controls",
    text: "Access controls should help ensure that sensitive information is available only to authorized personnel and systems.",
    point: "Helps prevent unauthorized access to user information.",
  },
  {
    title: "User Education and Awareness",
    text: "VYZITS encourages users to understand how to protect their information and recognize potential security threats.",
    point: "Helps users take an active role in protecting personal information.",
  },
];

function Security() {
  const pageRef = useRef(null);

  useEffect(() => {
    const items = pageRef.current?.querySelectorAll(".security-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    items?.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="security-page" ref={pageRef}>
      <header className="security-topbar">
       <div className="security-brand"><Logo size="sm" to={null} /></div>

        <div className="security-nav-title">
          <span></span>
          SECURITY
        </div>

        <button
          className="security-back"
          onClick={() => window.history.back()}
        >
          Back
        </button>
      </header>

      <main>
        <section className="security-hero">
          <div className="hero-gradient"></div>

          <div className="hero-copy security-reveal">
            <h1>
              Private.
              <br />
              Transparent.
              <br />
              Secure.
            </h1>

            <p>
              Customers worldwide trust VYZITS to look after
              sensitive documents throughout their visa journey.
            </p>
          </div>

          <div className="passport-scene">
            <div className="passport-glow"></div>

            <div className="passport">
              <div className="passport-top">PASSPORT</div>
              <div className="passport-symbol">✦</div>
              <div className="passport-line"></div>
              <div className="passport-line short"></div>
              <div className="passport-bottom">
                VISA DOCUMENT
              </div>
            </div>

            <div className="floating-dot dot-one"></div>
            <div className="floating-dot dot-two"></div>
            <div className="floating-dot dot-three"></div>
          </div>

          <div className="hero-scroll">
            <span>SCROLL TO EXPLORE</span>
            <span className="scroll-line"></span>
          </div>
        </section>

        <section className="documents-section">
          <button className="section-pill">
            Documents we collect
          </button>

          <div className="documents-grid">
            {documents.map((document, index) => (
              <div
                className={`document-card document-${document.color} security-reveal`}
                key={document.title}
                style={{
                  transitionDelay: `${index * 70}ms`,
                }}
              >
                <div className="document-icon">
                  {document.icon}
                </div>

                <div className="document-name">
                  {document.title}
                  {document.subtitle && (
                    <>
                      <br />
                      {document.subtitle}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="features-section">
          <h2 className="features-title security-reveal">
            Key Features
          </h2>

          <div className="features-layout">
            <div className="feature-large security-reveal">
              <div>
                <span className="feature-label">01</span>

                <h3>
                  {features[3].title}
                </h3>

                <p>
                  {features[3].text}
                </p>
              </div>

              <div className="feature-bottom">
                <span className="check">✓</span>
                <span>{features[3].point}</span>
              </div>

              <div className="encryption-animation">
                <div className="encryption-rays"></div>

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="feature-small-grid">
              {features.slice(4, 7).map((feature, index) => (
                <div
                  className="feature-small security-reveal"
                  key={feature.title}
                  style={{
                    transitionDelay: `${index * 100}ms`,
                  }}
                >
                  <span className="feature-label">
                    0{index + 2}
                  </span>

                  <h3>{feature.title}</h3>

                  <p>{feature.text}</p>

                  <div className="feature-bottom">
                    <span className="check">✓</span>
                    <span>{feature.point}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="feature-row-section">
          {features.slice(0, 3).map((feature, index) => (
            <div
              className="feature-row-card security-reveal"
              key={feature.title}
            >
              <span className="feature-label">
                0{index + 5}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>

              <div className="feature-bottom">
                <span className="check">✓</span>
                <span>{feature.point}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="disclosure-section">
          <div className="disclosure-heading security-reveal">
            <span>
              RESPONSIBLE VULNERABILITY DISCLOSURE PROGRAM
            </span>

            <h2>
              Help us keep
              <br />
              VYZITS secure.
            </h2>
          </div>

          <div className="disclosure-intro security-reveal">
            <p>
              At VYZITS, the security of our users and partners
              is important to us. We welcome reports of genuine
              security issues and appreciate the efforts of the
              security research community in helping us maintain
              a safe platform.
            </p>

            <p>
              If you believe you have identified a potential
              security vulnerability affecting VYZITS services,
              we encourage you to report it responsibly following
              the guidelines below.
            </p>

            <a href="mailto:security@vyzits.com">
              security@vyzits.com
              <span>↗</span>
            </a>
          </div>

          <div className="disclosure-grid">
            <div className="disclosure-box security-reveal">
              <h3>How to Report a Security Issue</h3>

              <ul>
                <li>
                  Type of issue such as authentication,
                  access control or injection
                </li>

                <li>
                  Affected URL, feature or service
                </li>

                <li>
                  Clear steps to reproduce the issue
                </li>

                <li>
                  Potential security impact
                </li>

                <li>
                  Any proof-of-concept, including screenshots
                  or videos
                </li>
              </ul>
            </div>

            <div className="disclosure-box security-reveal">
              <h3>Please do not send</h3>

              <ul>
                <li>
                  Passwords or authentication tokens
                </li>

                <li>
                  Raw malware data or stealer logs
                </li>

                <li>
                  Large automated scan reports
                </li>

                <li>
                  Customer personal data or documents
                </li>
              </ul>
            </div>
          </div>

          <div className="disclosure-columns">
            <div className="disclosure-text security-reveal">
              <h3>Scope</h3>

              <p>
                This program covers security vulnerabilities
                affecting VYZITS web applications, APIs and
                VYZITS-owned infrastructure and services.
              </p>

              <p>
                This program does not cover issues resulting
                from compromised user devices or credentials,
                social engineering or phishing attacks,
                third-party services or integrations not operated
                by VYZITS, automated scanner findings without
                demonstrated impact, or missing security
                recommendations without exploitability.
              </p>
            </div>

            <div className="disclosure-text security-reveal">
              <h3>Responsible Disclosure Guidelines</h3>

              <p>
                By submitting a report, you agree to act in good
                faith and avoid privacy violations or service
                disruption.
              </p>

              <p>
                Do not exploit an issue beyond what is necessary
                for validation. Keep vulnerability details
                confidential until the issue is resolved and do
                not publicly disclose findings without prior
                written consent from VYZITS.
              </p>

              <p>
                VYZITS will review valid reports, communicate
                respectfully with reporters and take appropriate
                remediation actions where required.
              </p>
            </div>
          </div>

          <div className="safe-harbor security-reveal">
            <h2>Legal Safe Harbor</h2>

            <p>
              If you follow this policy in good faith, VYZITS
              will not initiate legal action against you for
              accidental or unintentional violations related to
              your security research.
            </p>

            <p>
              You are expected to comply with all applicable laws
              and regulations.
            </p>
          </div>

          <div className="safe-harbor security-reveal">
            <h2>Rewards and Bug Bounty</h2>

            <p>
              VYZITS does not currently operate a public bug
              bounty program.
            </p>

            <p>
              In some cases, VYZITS may offer a token of
              appreciation at its discretion for valid and
              responsibly reported issues. Such tokens are not
              guaranteed and are evaluated based on impact and
              relevance.
            </p>
          </div>

          <div className="safe-harbor security-reveal">
            <h2>Program Updates</h2>

            <p>
              VYZITS reserves the right to modify or terminate
              this program at any time without prior notice.
            </p>

            <p>
              If you are unsure whether your research aligns
              with this policy, please contact us at
              <a href="mailto:security@vyzits.com">
                {" "}security@vyzits.com
              </a>
              {" "}before proceeding.
            </p>
          </div>
        </section>

        <section className="security-footer-section">
          <div className="footer-word security-reveal">
            VYZITS
          </div>

          <div className="footer-security-line">
            PRIVATE · TRANSPARENT · SECURE
          </div>
        </section>
      </main>

      <footer className="security-footer">
        <span>VYZITS</span>
        <span>SECURITY</span>
        <span>
          © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

export default Security;