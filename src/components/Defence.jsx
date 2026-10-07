import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const API_URL = "https://atlys-backend-cr9i.onrender.com/api/defence/applications";

const STEPS = [
  "Upload your official Defence ID",
  "Upload your Passport No.",
  "Share your contact details",
];

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      .df{
        font-family:"Inter",Arial,sans-serif;
        color:#111;
        background:#fff;
        min-height:100vh;
        -webkit-font-smoothing:antialiased;
        overflow-x:hidden;
      }

      .df *{
        box-sizing:border-box;
      }

      .df h1,
      .df h2,
      .df h3,
      .df h4,
      .df p{
        margin:0;
      }

      .df button{
        font-family:inherit;
        cursor:pointer;
      }

      .df :focus-visible{
        outline:2px solid #6c63ff;
        outline-offset:4px;
      }

      .df-nav{
        position:absolute;
        inset:0 0 auto 0;
        z-index:10;
        display:flex;
        justify-content:space-between;
        align-items:center;
        padding:26px 52px;
      }

      .df-nav.solid{
        position:static;
        background:#fff;
        border-bottom:1px solid #eeeeef;
      }

      .df-nav a.link{
        color:#fff;
        font-weight:600;
        font-size:14px;
        text-decoration:none;
        border:1px solid rgba(255,255,255,.28);
        padding:10px 19px;
        border-radius:999px;
        transition:.25s ease;
        backdrop-filter:blur(10px);
      }

      .df-nav a.link:hover{
        background:#fff;
        color:#111;
      }

      .solid a.link{
        color:#111;
        border-color:#dedee3;
      }

      .solid a.link:hover{
        background:#111;
        color:#fff;
        border-color:#111;
      }

      .df-hero{
        position:relative;
        min-height:92vh;
        display:grid;
        place-items:center;
        text-align:center;
        padding:140px 24px 110px;
        color:#fff;
        overflow:hidden;
        background:
          radial-gradient(
            700px 420px at 50% 10%,
            rgba(86,91,180,.38),
            transparent 70%
          ),
          radial-gradient(
            500px 300px at 15% 70%,
            rgba(70,82,150,.18),
            transparent 70%
          ),
          #08090d;
      }

      .df-hero::after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:
          linear-gradient(
            180deg,
            transparent 60%,
            rgba(0,0,0,.35)
          );
      }

      .df-hero::before{
        content:"";
        position:absolute;
        inset:auto 0 0 0;
        height:4px;
        background:linear-gradient(
          90deg,
          #ff9933 33.3%,
          #fff 33.3% 66.6%,
          #138808 66.6%
        );
      }

      .df-star{
        position:absolute;
        border-radius:50%;
        background:#fff;
        opacity:.38;
        animation:df-tw 4s ease-in-out infinite;
      }

      @keyframes df-tw{
        50%{
          opacity:.06;
        }
      }

      .df-hero-in{
        position:relative;
        z-index:2;
        max-width:920px;
      }

      .df-hero h1{
        font-size:clamp(42px,7vw,88px);
        font-weight:700;
        line-height:1;
        letter-spacing:-.055em;
      }

      .df-hero h2{
        margin-top:18px!important;
        font-size:clamp(34px,5.4vw,70px);
        font-weight:700;
        letter-spacing:-.055em;
        line-height:1.04;
        background:linear-gradient(
          90deg,
          #ff9933,
          #ffd39d 48%,
          #87df8a
        );
        -webkit-background-clip:text;
        background-clip:text;
        color:transparent;
      }

      .df-hero p{
        margin:32px auto 0!important;
        max-width:570px;
        font-size:clamp(16px,1.8vw,20px);
        line-height:1.65;
        color:#bfc2ce;
      }

      .df-down{
        display:inline-grid;
        place-items:center;
        width:52px;
        height:52px;
        margin-top:48px;
        border-radius:50%;
        border:1px solid rgba(255,255,255,.25);
        color:#fff;
        text-decoration:none;
        font-size:20px;
        transition:.25s ease;
        background:rgba(255,255,255,.03);
      }

      .df-down:hover{
        background:#fff;
        color:#111;
        transform:translateY(5px);
      }

      .df-sec{
        max-width:1160px;
        margin:0 auto;
        padding:105px 28px 115px;
        display:grid;
        grid-template-columns:1.08fr .92fr;
        gap:90px;
        align-items:center;
      }

      .df-sec h3{
        font-size:clamp(38px,4.5vw,62px);
        font-weight:700;
        letter-spacing:-.055em;
        line-height:1.02;
        max-width:600px;
      }

      .df-sec .lead{
        margin-top:26px!important;
        font-size:18px;
        line-height:1.7;
        color:#666;
        max-width:540px;
      }

      .df-cta{
        display:inline-flex;
        margin-top:30px;
        align-items:center;
        justify-content:center;
        gap:11px;
        background:#565be8;
        color:#fff;
        text-decoration:none;
        font-weight:600;
        font-size:16px;
        padding:16px 25px;
        border-radius:999px;
        border:0;
        box-shadow:0 12px 30px rgba(86,91,232,.20);
        transition:.25s ease;
      }

      .df-cta:hover{
        background:#454ad3;
        transform:translateY(-2px);
        box-shadow:0 16px 34px rgba(86,91,232,.28);
      }

      .df-cta:disabled{
        opacity:.55;
        cursor:not-allowed;
        transform:none;
      }

      .df-note{
        margin-top:15px!important;
        font-size:13px;
        color:#8a8a91;
        max-width:450px;
        line-height:1.55;
      }

      .df-card{
        position:relative;
        background:#f7f7f9;
        border:1px solid #ededf0;
        border-radius:30px;
        padding:38px;
        box-shadow:0 20px 60px rgba(0,0,0,.05);
      }

      .df-card::before{
        content:"";
        position:absolute;
        top:0;
        left:38px;
        right:38px;
        height:1px;
        background:linear-gradient(
          90deg,
          transparent,
          #d8d8df,
          transparent
        );
      }

      .df-card h4{
        margin:0 0 27px;
        font-size:12px;
        font-weight:700;
        letter-spacing:.14em;
        text-transform:uppercase;
        color:#85858d;
      }

      .df-steps{
        list-style:none;
        margin:0;
        padding:0;
        display:grid;
        gap:22px;
      }

      .df-steps li{
        display:flex;
        gap:16px;
        align-items:center;
        font-size:17px;
        font-weight:600;
        color:#202025;
      }

      .df-steps b{
        flex:none;
        width:40px;
        height:40px;
        border-radius:50%;
        background:#111;
        color:#fff;
        display:grid;
        place-items:center;
        font-size:14px;
      }

      .df-meta{
        margin-top:30px;
        padding-top:25px;
        border-top:1px solid #e2e2e6;
        display:grid;
        gap:12px;
        color:#666;
        font-size:14px;
        line-height:1.55;
      }

      .df-meta strong{
        color:#171717;
      }

      .df-foot{
        border-top:1px solid #eeeeef;
        padding:26px 52px;
        display:flex;
        justify-content:space-between;
        gap:16px;
        flex-wrap:wrap;
        color:#929299;
        font-size:13px;
      }

      .df-form-wrap{
        max-width:720px;
        margin:0 auto;
        padding:70px 24px 110px;
      }

      .df-form-wrap h1{
        font-size:clamp(36px,5vw,54px);
        font-weight:700;
        letter-spacing:-.045em;
        line-height:1.04;
      }

      .df-form-wrap>p{
        margin-top:16px!important;
        color:#666;
        font-size:17px;
        line-height:1.6;
      }

      .df-form{
        margin-top:38px;
        display:grid;
        gap:21px;
      }

      .df-two{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:18px;
      }

      .df-f label{
        display:block;
        font-size:13px;
        font-weight:600;
        margin-bottom:8px;
        color:#333;
      }

      .df-f .df-in{
        width:100%;
        min-width:0;
      }

      .df-in{
        height:54px;
        border:1px solid #dedee3;
        border-radius:14px;
        padding:0 17px;
        font:inherit;
        font-size:15px;
        background:#fff;
        transition:.2s ease;
      }

      .df-in:focus{
        border-color:#565be8;
        outline:none;
        box-shadow:0 0 0 4px rgba(86,91,232,.10);
      }

      .df-f small{
        display:block;
        margin-top:6px;
        color:#c13232;
        font-size:12px;
      }

      .df-drop{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:7px;
        text-align:center;
        border:1.5px dashed #cfcfd7;
        border-radius:20px;
        padding:34px 20px;
        cursor:pointer;
        transition:.25s ease;
        background:#fafafc;
      }

      .df-drop:hover,
      .df-drop.on{
        border-color:#565be8;
        background:#f5f5ff;
      }

      .df-drop input{
        display:none;
      }

      .df-drop b{
        font-size:15px;
      }

      .df-drop span{
        font-size:12px;
        color:#85858d;
      }

      .df-prev{
        max-height:150px;
        max-width:100%;
        border-radius:12px;
        margin-top:10px;
      }

      .df-ok{
        text-align:center;
        padding:80px 0;
      }

      .df-ok .tick{
        width:72px;
        height:72px;
        margin:0 auto 24px;
        border-radius:50%;
        background:#e1f5e3;
        color:#247a31;
        display:grid;
        place-items:center;
        font-size:34px;
      }

      .df-err{
        margin-top:14px!important;
        color:#b42318;
        font-size:14px;
      }

      @media(max-width:860px){
        .df-nav{
          padding:20px 22px;
        }

        .df-hero{
          min-height:82vh;
          padding:120px 22px 90px;
        }

        .df-sec{
          grid-template-columns:1fr;
          gap:48px;
          padding:75px 22px 85px;
        }

        .df-sec h3{
          max-width:650px;
        }

        .df-card{
          padding:30px;
        }

        .df-two{
          grid-template-columns:1fr;
        }

        .df-foot{
          padding:24px 22px;
        }
      }

      @media(max-width:520px){
        .df-nav a.link{
          padding:8px 14px;
          font-size:13px;
        }

        .df-hero h1{
          font-size:43px;
        }

        .df-hero h2{
          font-size:35px;
        }

        .df-sec h3{
          font-size:40px;
        }

        .df-card{
          border-radius:24px;
          padding:25px;
        }

        .df-steps li{
          font-size:15px;
        }

        .df-steps b{
          width:36px;
          height:36px;
        }

        .df-cta{
          width:100%;
        }
      }

      @media(prefers-reduced-motion:reduce){
        .df-star{
          animation:none;
        }

        .df-down,
        .df-cta,
        .df-nav a.link{
          transition:none;
        }
      }
    `}</style>
  );
}

const Nav = ({ solid }) => (
  <header className={`df-nav ${solid ? "solid" : ""}`}>
   <Logo size="sm" />

    <Link to="/sign-in" className="link">
      Sign in
    </Link>
  </header>
);

const Footer = () => (
  <footer className="df-foot">
    <span>© VisaGo, All rights reserved</span>
    <span>Privacy • Terms</span>
  </footer>
);

const STARS = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 88}%`,
  s: 2 + (i % 3),
  d: `${(i % 7) * 0.6}s`,
}));

export default function Defence() {
  return (
    <div className="df">
      <Styles />

      <Nav />

      <section className="df-hero">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="df-star"
            style={{
              left: s.left,
              top: s.top,
              width: s.s,
              height: s.s,
              animationDelay: s.d,
            }}
          />
        ))}

        <div className="df-hero-in">
          <h1>They don't ask to be remembered.</h1>

          <h2>We refuse to forget.</h2>

          <p>
            For every soldier who's stood post at 2AM, missed festivals or
            skipped goodbyes — it's the least we could do.
          </p>

          <a
            href="#section2"
            className="df-down"
            aria-label="Scroll down"
          >
            ↓
          </a>
        </div>
      </section>

      <section className="df-sec" id="section2">
        <div>
          <h3>VisaGo waives its service fee, forever</h3>

          <p className="lead">
            For every active member of the Indian Army, Navy, Air Force, Coast
            Guard and paramilitary forces. A small system-level shift that
            honours those who never asked to be thanked.
          </p>

          <Link to="/defence/apply" className="df-cta">
            Upload ID &amp; Claim Waiver →
          </Link>

          <p className="df-note">
            We need it to ascertain eligibility. Your ID will be deleted from
            our system after verification.
          </p>
        </div>

        <div className="df-card">
          <h4>How it works</h4>

          <ol className="df-steps">
            {STEPS.map((step, index) => (
              <li key={step}>
                <b>{index + 1}</b>
                {step}
              </li>
            ))}
          </ol>

          <div className="df-meta">
            <p>
              We'll verify your credentials{" "}
              <strong>(within 48 hours)</strong>
            </p>

            <p>
              Once verified, your email is tagged <strong>for life</strong>
            </p>

            <p>
              Every visa booked through VisaGo ={" "}
              <strong>0 service fee. Always.</strong>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  passportNumber: "",
  defenceId: "",
};

export function DefenceApply() {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState("");
  const [done, setDone] = useState(false);

  const set = (key) => (e) => {
    setForm({
      ...form,
      [key]: e.target.value,
    });
  };

  const pick = (selectedFile) => {
    if (!selectedFile) return;

    const validType =
      /^image\/|application\/pdf/.test(selectedFile.type);

    if (!validType || selectedFile.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        file: "Upload a JPG, PNG or PDF under 5 MB.",
      }));
      return;
    }

    setErrors((current) => ({
      ...current,
      file: "",
    }));

    setFile(selectedFile);

    setPreview(
      selectedFile.type.startsWith("image/")
        ? URL.createObjectURL(selectedFile)
        : ""
    );
  };

  const validate = () => {
    const validationErrors = {};

    if (!form.firstName.trim()) {
      validationErrors.firstName = "Required";
    }

    if (!form.lastName.trim()) {
      validationErrors.lastName = "Required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      validationErrors.email = "Enter a valid email";
    }

    if (form.phone.replace(/\D/g, "").length < 10) {
      validationErrors.phone = "Enter a 10-digit number";
    }

    if (
      !/^[A-Z0-9]{6,9}$/i.test(
        form.passportNumber.trim()
      )
    ) {
      validationErrors.passportNumber =
        "Enter a valid passport number";
    }

    if (!form.defenceId.trim()) {
      validationErrors.defenceId = "Required";
    }

    if (!file) {
      validationErrors.file = "Upload your Defence ID";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setBusy(true);
    setApiError("");

    try {
      const body = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        body.append(key, value.trim());
      });

      body.append("defenceIdDocument", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || json.success === false) {
        throw new Error(
          json.message || "Something went wrong"
        );
      }

      setDone(true);
    } catch (error) {
      setApiError(
        error.message ||
          "We couldn't submit your application. Please try again."
      );
    }

    setBusy(false);
  };

  const field = (key, label, props = {}) => (
    <div className="df-f">
      <label htmlFor={key}>{label}</label>

      <input
        id={key}
        className="df-in"
        value={form[key]}
        onChange={set(key)}
        {...props}
      />

      {errors[key] && <small>{errors[key]}</small>}
    </div>
  );

  return (
    <div className="df">
      <Styles />

      <Nav solid />

      <main className="df-form-wrap">
        {done ? (
          <div className="df-ok">
            <div className="tick">✓</div>

            <h1>Application received</h1>

            <p>
              We'll verify your credentials within 48 hours and
              update you at {form.email}.
            </p>

            <Link to="/defence" className="df-cta">
              Back to Defence page
            </Link>
          </div>
        ) : (
          <>
            <h1>Claim your service fee waiver</h1>

            <p>
              Share a few details so we can verify your eligibility.
              It takes under two minutes.
            </p>

            <form
              className="df-form"
              onSubmit={submit}
              noValidate
            >
              <div className="df-two">
                {field("firstName", "First name", {
                  autoComplete: "given-name",
                })}

                {field("lastName", "Last name", {
                  autoComplete: "family-name",
                })}
              </div>

              {field("email", "Email", {
                type: "email",
                autoComplete: "email",
              })}

              {field("phone", "Phone number", {
                type: "tel",
                inputMode: "tel",
                autoComplete: "tel",
              })}

              <div className="df-two">
                {field("passportNumber", "Passport number", {
                  style: {
                    textTransform: "uppercase",
                  },
                })}

                {field("defenceId", "Defence ID number")}
              </div>

              <div className="df-f">
                <label>Defence ID document</label>

                <label
                  className={`df-drop ${drag ? "on" : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDrag(false);
                    pick(event.dataTransfer.files[0]);
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(event) =>
                      pick(event.target.files[0])
                    }
                  />

                  <b>
                    {file
                      ? file.name
                      : "Click to upload or drag & drop"}
                  </b>

                  <span>
                    JPG, PNG or PDF, up to 5 MB
                  </span>

                  {preview && (
                    <img
                      className="df-prev"
                      src={preview}
                      alt="ID preview"
                    />
                  )}
                </label>

                {errors.file && <small>{errors.file}</small>}
              </div>

              {apiError && (
                <p className="df-err" role="alert">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                className="df-cta"
                disabled={busy}
                style={{
                  justifyContent: "center",
                }}
              >
                {busy
                  ? "Submitting…"
                  : "Submit application"}
              </button>

              <p className="df-note">
                We need it to ascertain eligibility. Your ID will be
                deleted from our system after verification.
              </p>
            </form>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}