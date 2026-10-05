import { useEffect, useMemo, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import { Link, useLocation, useNavigate } from "react-router-dom";

const APPLICATION_API = "https://atlys-backend-cr9i.onrender.com/api/applications";
const FAQ_API = "https://atlys-backend-cr9i.onrender.com/api/faqs";

function getCountryName(item = {}) {
  if (typeof item.country === "string") return item.country;
  return (
    item.country?.name ||
    item.country?.countryName ||
    item.country?.title ||
    item.name ||
    item.countryName ||
    "Thailand"
  );
}

function getVisaImage(item = {}) {
  return item.image || null;
}

function getFlag(item = {}) {
  return (
    item.country?.flag ||
    item.flag ||
    item.flagUrl ||
    item.flagImage ||
    item.flagImageUrl ||
    null
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="tdac-field">
      <span className="tdac-label">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({ icon, iconClass = "blue", title, description }) {
  return (
    <div className="tdac-section-title">
      <div className={`tdac-section-icon ${iconClass}`}>{icon}</div>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  );
}

function TDAC() {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo || "/";

  // The selected visa is passed from VisaDetails through React Router state.
  // No visa/application GET API is needed on this page.
  const visa = location.state?.visa || null;

  const [travelerCount, setTravelerCount] = useState(1);
  const [arrivalFlightType, setArrivalFlightType] = useState("direct");
  const [returnFlightType, setReturnFlightType] = useState("direct");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const passportInputRef = useRef(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");

  const [faqOpen, setFaqOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [faqError, setFaqError] = useState("");
  const [openFaqId, setOpenFaqId] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    nationality: "Indian",
    passportNumber: "",
    passportValidTill: "",
    passportPlaceOfIssue: "",
    occupation: "",
    flightNumber: "",
    arrivalDate: "",
    returnFlightNumber: "",
    departureDate: "",
    hotelName: "",
    province: "",
    email: "",
    phone: "",
    purposeOfTravel: "Tourism",
    accommodation: "hotel",
  });

  const country = getCountryName(visa || {});
  const image = getVisaImage(visa || {});
  const flag = getFlag(visa || {});

  useEffect(() => {
    if (!faqOpen || faqs.length > 0 || faqLoading || faqError) return;

    const fetchFaqs = async () => {
      setFaqLoading(true);
      setFaqError("");

      try {
        const response = await fetch(FAQ_API);
        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message || `FAQ request failed (${response.status})`
          );
        }

        const activeFaqs = (Array.isArray(data?.faqs) ? data.faqs : [])
          .filter(
            (faq) =>
              faq?.active !== false &&
              String(faq?.type || "").trim().toLowerCase() === "application"
          )
          .sort((a, b) => {
            const aMatches =
              Boolean(visa?._id && a?.visa?._id === visa._id) ||
              Boolean(visa?.country?._id && a?.country?._id === visa.country._id);

            const bMatches =
              Boolean(visa?._id && b?.visa?._id === visa._id) ||
              Boolean(visa?.country?._id && b?.country?._id === visa.country._id);

            if (aMatches !== bMatches) return aMatches ? -1 : 1;

            return (Number(a?.order) || 0) - (Number(b?.order) || 0);
          });

        setFaqs(activeFaqs);
        setOpenFaqId(activeFaqs[0]?._id || null);
      } catch (error) {
        console.error("FAQ API ERROR:", error);
        setFaqError(
          error?.message || "Unable to load FAQs. Please try again."
        );
      } finally {
        setFaqLoading(false);
      }
    };

    fetchFaqs();
  }, [faqOpen, faqs.length, faqLoading, faqError, visa]);

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const canSubmit = useMemo(() => {
    return Boolean(
      visa?._id &&
        visa?.country?._id &&
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.dob &&
        form.gender &&
        form.nationality.trim() &&
        form.passportNumber.trim() &&
        form.passportValidTill &&
        form.passportPlaceOfIssue.trim() &&
        form.flightNumber.trim() &&
        form.arrivalDate &&
        form.hotelName.trim() &&
        form.province &&
        form.email.trim() &&
        form.phone.trim()
    );
  }, [form, visa]);

  const cleanPassportText = (text = "") => {
    return text
      .toUpperCase()
      .replace(/[“”"']/g, "")
      .replace(/\r/g, "")
      .replace(/\t/g, " ");
  };

  const normalizeMrzLine = (line = "") => {
    return line
      .toUpperCase()
      .replace(/[«‹›]/g, "<")
      .replace(/[ ]+/g, "")
      .replace(/[^A-Z0-9<]/g, "")
      .replace(/I(?=\d)/g, "1")
      .replace(/O(?=\d)/g, "0");
  };

  const normalizeMrzForPosition = (value = "") => {
    return value
      .toUpperCase()
      .replace(/[«‹›]/g, "<")
      .replace(/[^A-Z0-9<]/g, "");
  };

  const mrzDateToISO = (value = "") => {
    if (!/^\d{6}$/.test(value)) return "";

    const yy = Number(value.slice(0, 2));
    const mm = value.slice(2, 4);
    const dd = value.slice(4, 6);

    const month = Number(mm);
    const day = Number(dd);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return "";
    }

    const currentYear = new Date().getFullYear();
    const currentYY = currentYear % 100;
    const year = yy <= currentYY ? 2000 + yy : 1900 + yy;

    return `${year}-${mm}-${dd}`;
  };

  const nationalityFromMrz = (code = "") => {
    const nationalityMap = {
      IND: "Indian",
      USA: "American",
      CAN: "Canadian",
      GBR: "British",
      AUS: "Australian",
    };

    return nationalityMap[code] || "";
  };

  const extractMrzPassportData = (rawText = "") => {
    const text = cleanPassportText(rawText);

    const rawLines = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const lines = rawLines.map(normalizeMrzLine);

    // TD3 passport MRZ normally has two lines of 44 characters.
    // OCR can split a line, so also inspect adjacent lines joined together.
    const candidates = [...lines];

    for (let i = 0; i < lines.length - 1; i += 1) {
      candidates.push(`${lines[i]}${lines[i + 1]}`);
    }

    let nameLine = candidates.find(
      (line) =>
        line.startsWith("P<") &&
        line.includes("<<") &&
        line.length >= 35
    );

    let secondLine = candidates.find(
      (line) =>
        line.length >= 35 &&
        !line.startsWith("P<") &&
        /\d{6}/.test(line) &&
        /[A-Z]{3}/.test(line)
    );

    // Some OCR engines return 'P<' as 'P4', 'PI', or 'P1'.
    if (!nameLine) {
      nameLine = candidates.find(
        (line) =>
          /^P[<41LI]/.test(line) &&
          line.includes("<<") &&
          line.length >= 35
      );
    }

    if (!secondLine) {
      secondLine = candidates.find(
        (line) =>
          line.length >= 40 &&
          /^.{9}[<A-Z0-9]{1}[A-Z0-9<]{3}\d{6}[MF<]\d{7}/.test(line)
      );
    }

    let firstName = "";
    let lastName = "";
    let passportNumber = "";
    let nationality = "";
    let dob = "";
    let gender = "";
    let passportValidTill = "";

    if (nameLine) {
      const cleanedNameLine = normalizeMrzForPosition(nameLine);
      const namePart = cleanedNameLine.replace(/^P[<41LI]/, "");
      const nameParts = namePart.split("<<");

      lastName = (nameParts[0] || "")
        .replace(/</g, " ")
        .replace(/\s+/g, " ")
        .trim();

      firstName = (nameParts[1] || "")
        .replace(/</g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Ignore any repeated filler or extra given-name fragments only when
      // they are clearly empty/filler; otherwise preserve the full given name.
      if (firstName.includes("  ")) {
        firstName = firstName.replace(/\s+/g, " ").trim();
      }
    }

    if (secondLine) {
      const line = normalizeMrzForPosition(secondLine);

      // Passport number is positions 1-9 in a TD3 MRZ line.
      const possiblePassportNumber = line
        .slice(0, 9)
        .replace(/</g, "")
        .trim();

      if (/^[A-Z0-9]{5,9}$/.test(possiblePassportNumber)) {
        passportNumber = possiblePassportNumber;
      }

      const possibleNationality = line.slice(10, 13);
      nationality = nationalityFromMrz(possibleNationality);

      // Standard TD3 positions:
      // 14-19 DOB, 21 sex, 22-27 expiry (1-based).
      const possibleDob = line.slice(13, 19);
      const possibleSex = line.slice(20, 21);
      const possibleExpiry = line.slice(21, 27);

      dob = mrzDateToISO(possibleDob);

      if (possibleSex === "M") gender = "Male";
      if (possibleSex === "F") gender = "Female";
      if (possibleSex === "X") gender = "Other";

      passportValidTill = mrzDateToISO(possibleExpiry);
    }

    return {
      firstName,
      lastName,
      passportNumber,
      nationality,
      dob,
      gender,
      passportValidTill,
    };
  };

  const preprocessPassportImage = (file) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        try {
          const maxWidth = 1800;
          const scale = Math.min(2, maxWidth / image.naturalWidth);
          const safeScale = Math.max(scale, 1);

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.naturalWidth * safeScale);
          canvas.height = Math.round(image.naturalHeight * safeScale);

          const ctx = canvas.getContext("2d", {
            willReadFrequently: true,
          });

          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Could not prepare passport image."));
            return;
          }

          ctx.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Slight contrast boost + grayscale for clearer OCR.
          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            let gray =
              0.299 * r +
              0.587 * g +
              0.114 * b;

            gray = (gray - 128) * 1.25 + 128;
            gray = Math.max(0, Math.min(255, gray));

            imageData.data[i] = gray;
            imageData.data[i + 1] = gray;
            imageData.data[i + 2] = gray;
          }

          ctx.putImageData(imageData, 0, 0);

          URL.revokeObjectURL(objectUrl);
          resolve(canvas);
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Unable to read the passport image."));
      };

      image.src = objectUrl;
    });
  };

  const handlePassportUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setOcrMessage("");
    setSubmitError("");
    setSubmitSuccess("");

    if (!file.type.startsWith("image/")) {
      setOcrMessage(
        "Please upload a JPG, PNG, or WEBP passport image."
      );
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setOcrMessage(
        "Please upload a passport image smaller than 10 MB."
      );
      event.target.value = "";
      return;
    }

    setOcrLoading(true);
    setOcrMessage("Reading passport... Please wait.");

    let worker;

    try {
      const processedImage = await preprocessPassportImage(file);

      worker = await createWorker("eng");

      try {
        await worker.setParameters({
          tessedit_pageseg_mode: "6",
        });
      } catch {
        // Older/newer Tesseract versions may handle page segmentation
        // differently. OCR can still proceed without this setting.
      }

      const result = await worker.recognize(processedImage);
      const text = result?.data?.text || "";

      console.log("PASSPORT OCR TEXT:", text);

      const extracted = extractMrzPassportData(text);

      console.log(
        "EXTRACTED PASSPORT DATA:",
        extracted
      );

      setForm((previous) => ({
        ...previous,
        ...(extracted.firstName && {
          firstName: extracted.firstName,
        }),
        ...(extracted.lastName && {
          lastName: extracted.lastName,
        }),
        ...(extracted.dob && {
          dob: extracted.dob,
        }),
        ...(extracted.gender && {
          gender: extracted.gender,
        }),
        ...(extracted.nationality && {
          nationality: extracted.nationality,
        }),
        ...(extracted.passportNumber && {
          passportNumber: extracted.passportNumber,
        }),
        ...(extracted.passportValidTill && {
          passportValidTill: extracted.passportValidTill,
        }),
      }));

      const filledFields = [
        extracted.firstName,
        extracted.lastName,
        extracted.dob,
        extracted.gender,
        extracted.nationality,
        extracted.passportNumber,
        extracted.passportValidTill,
      ].filter(Boolean).length;

      if (filledFields >= 4) {
        setOcrMessage(
          `Passport scanned successfully. ${filledFields} fields were filled automatically. Please verify all details before submitting.`
        );
      } else if (filledFields > 0) {
        setOcrMessage(
          `Passport scan completed, but only ${filledFields} fields could be read. Please verify and complete the remaining fields manually.`
        );
      } else {
        setOcrMessage(
          "Could not read the passport clearly. Upload a straight, well-lit photo showing the entire passport front page, including the two MRZ lines at the bottom."
        );
      }
    } catch (error) {
      console.error("PASSPORT OCR ERROR:", error);

      setOcrMessage(
        "Could not read this passport. Please upload a clear JPG, PNG, or WEBP image of the passport front page."
      );
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch {
          // Ignore OCR worker cleanup errors.
        }
      }

      setOcrLoading(false);

      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    // Your backend expects multipart/form-data, exactly like the cURL you provided.
    // Do NOT manually set Content-Type; the browser adds the multipart boundary.
    const payload = new FormData();

    payload.append("visa", visa._id);
    payload.append("country", visa.country._id);

    payload.append("firstName", form.firstName.trim());
    payload.append("lastName", form.lastName.trim());
    payload.append("dateOfBirth", form.dob);
    payload.append("gender", form.gender);
    payload.append("maritalStatus", form.maritalStatus);
    payload.append("nationality", form.nationality.trim());
    payload.append("passportNumber", form.passportNumber.trim());
    payload.append("passportExpiry", form.passportValidTill);
    payload.append(
      "passportPlaceOfIssue",
      form.passportPlaceOfIssue.trim()
    );
    payload.append("occupation", form.occupation);

    payload.append("arrivalFlightType", arrivalFlightType);
    payload.append("returnFlightType", returnFlightType);

    payload.append("hotelName", form.hotelName.trim());
    payload.append("thailandProvince", form.province);

    payload.append("email", form.email.trim());
    payload.append("phone", form.phone.trim());

    payload.append("travelDate", form.arrivalDate);
    payload.append("returnDate", form.departureDate);

    payload.append(
      "purposeOfTravel",
      form.purposeOfTravel
    );

    payload.append(
      "accommodation",
      form.accommodation
    );

    payload.append(
      "arrivalFlights",
      JSON.stringify([
        {
          flightNumber: form.flightNumber.trim(),
          arrivalDate: form.arrivalDate,
        },
      ])
    );

    payload.append(
      "returnFlights",
      JSON.stringify(
        form.returnFlightNumber.trim() || form.departureDate
          ? [
              {
                flightNumber: form.returnFlightNumber.trim(),
                departureDate: form.departureDate,
              },
            ]
          : []
      )
    );

    console.log("APPLICATION FORM DATA READY");

    try {
      const token = localStorage.getItem("visagoToken");

      if (!token) {
        throw new Error(
          "Please sign in before submitting your application."
        );
      }

      const response = await fetch(
        APPLICATION_API,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log("APPLICATION API RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Application submission failed (${response.status})`
        );
      }

      setSubmitSuccess(
        data?.message ||
          "Application submitted successfully."
      );
    } catch (error) {
      console.error(
        "APPLICATION SUBMIT ERROR:",
        error
      );

      setSubmitError(
        error?.message ||
          "Unable to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!visa) {
    return (
      <div className="tdac-loading-page">
        <p>
          No visa application was selected.
        </p>

        <Link to="/" className="tdac-back-inline">
          ← Back to destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="tdac-page">
      <div
        className="tdac-background"
        style={
          image
            ? {
                backgroundImage: `url(${image})`,
              }
            : undefined
        }
      />

      <div className="tdac-background-wash" />

     <button
    type="button"
    className="tdac-back"
    onClick={() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }}
>
  ← Back
</button>

      <Link to="/" className="tdac-home-button" aria-label="Home">
        ⌂
      </Link>

      <main className="tdac-shell">
        <form className="tdac-card" onSubmit={handleSubmit}>
          <div className="tdac-card-header">
            <div className="tdac-brand-block">
              <div className="tdac-flag">
                {flag ? (
                  <img src={flag} alt={`${country} flag`} />
                ) : (
                  <span>🇹🇭</span>
                )}
              </div>

              <div>
                <div className="tdac-kicker">{country.toUpperCase()} APPLICATION</div>
                <div className="tdac-title">
                  No waiting, get your arrival card instantly.
                  <span className="tdac-verified">✓</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="tdac-faq-button"
              onClick={() => {
                setFaqOpen(true);
                setFaqError("");
              }}
            >
              ? FAQ's
            </button>
          </div>

          <div className="tdac-form-scroll">
            <SectionTitle icon="●" title="Personal Information" />

            <input
              ref={passportInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePassportUpload}
              style={{ display: "none" }}
            />

            <button
              type="button"
              className="tdac-passport-button"
              onClick={() => passportInputRef.current?.click()}
              disabled={ocrLoading}
            >
              {ocrLoading
                ? "Reading passport..."
                : "Upload passport front to auto-fill"}
            </button>

            {ocrMessage && (
              <div className="tdac-ocr-message">
                {ocrMessage}
              </div>
            )}

            <div className="tdac-or">
              <span />
              <em>OR</em>
              <span />
            </div>

            <div className="tdac-grid two">
              <Field label="FIRST NAME" required>
                <input
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="First Name"
                />
              </Field>

              <Field label="LAST NAME" required>
                <input
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Last Name"
                />
              </Field>

              <Field label="DATE OF BIRTH" required>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                />
              </Field>

              <Field label="GENDER">
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="MARITAL STATUS">
                <select
                  value={form.maritalStatus}
                  onChange={(e) =>
                    updateField("maritalStatus", e.target.value)
                  }
                >
                  <option value="">Select marital status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </Field>

              <Field label="NATIONALITY" required>
                <select
                  value={form.nationality}
                  onChange={(e) =>
                    updateField("nationality", e.target.value)
                  }
                >
                  <option value="">Select nationality</option>
                  <option value="Indian">Indian</option>
                  <option value="American">American</option>
                  <option value="Canadian">Canadian</option>
                  <option value="British">British</option>
                  <option value="Australian">Australian</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="PASSPORT NUMBER" required>
                <input
                  value={form.passportNumber}
                  onChange={(e) =>
                    updateField("passportNumber", e.target.value)
                  }
                  placeholder="Passport Number"
                />
              </Field>

              <Field label="PASSPORT VALID TILL" required>
                <input
                  type="date"
                  value={form.passportValidTill}
                  onChange={(e) =>
                    updateField("passportValidTill", e.target.value)
                  }
                />
              </Field>

              <Field label="PASSPORT PLACE OF ISSUE" required>
                <input
                  value={form.passportPlaceOfIssue}
                  onChange={(e) =>
                    updateField("passportPlaceOfIssue", e.target.value)
                  }
                  placeholder="Passport place of issue"
                />
              </Field>
            </div>

            <div className="tdac-grid one">
              <Field label="OCCUPATION">
                <select
                  value={form.occupation}
                  onChange={(e) => updateField("occupation", e.target.value)}
                >
                  <option value="">Select occupation</option>
                  <option>Student</option>
                  <option>Employed</option>
                  <option>Self Employed</option>
                  <option>Business Owner</option>
                  <option>Retired</option>
                  <option>Homemaker</option>
                </select>
              </Field>
            </div>

            <SectionTitle
              icon="✈"
              iconClass="green"
              title="Arrival Flight Details"
            />

            <div className="tdac-toggle">
              <button
                type="button"
                className={arrivalFlightType === "direct" ? "selected" : ""}
                onClick={() => setArrivalFlightType("direct")}
              >
                Direct Flight
              </button>
              <button
                type="button"
                className={arrivalFlightType === "multi-stop" ? "selected" : ""}
                onClick={() => setArrivalFlightType("multi-stop")}
              >
                Multi-Stop
              </button>
            </div>

            <div className="tdac-grid two">
              <Field label="FLIGHT NUMBER" required>
                <input
                  value={form.flightNumber}
                  onChange={(e) => updateField("flightNumber", e.target.value)}
                  placeholder="e.g. AI 1234"
                />
              </Field>

              <Field label="ARRIVAL DATE" required>
                <input
                  type="date"
                  value={form.arrivalDate}
                  onChange={(e) => updateField("arrivalDate", e.target.value)}
                />
              </Field>
            </div>

            <SectionTitle
              icon="✈"
              iconClass="green"
              title="Return Flight Details"
            />

            <div className="tdac-toggle">
              <button
                type="button"
                className={returnFlightType === "direct" ? "selected" : ""}
                onClick={() => setReturnFlightType("direct")}
              >
                Direct Flight
              </button>
              <button
                type="button"
                className={returnFlightType === "multi-stop" ? "selected" : ""}
                onClick={() => setReturnFlightType("multi-stop")}
              >
                Multi-Stop
              </button>
            </div>

            <div className="tdac-grid two">
              <Field label="FLIGHT NUMBER">
                <input
                  value={form.returnFlightNumber}
                  onChange={(e) =>
                    updateField("returnFlightNumber", e.target.value)
                  }
                  placeholder="e.g. AI 1234"
                />
              </Field>

              <Field label="DEPARTURE DATE">
                <input
                  type="date"
                  value={form.departureDate}
                  onChange={(e) =>
                    updateField("departureDate", e.target.value)
                  }
                />
              </Field>
            </div>

            <SectionTitle icon="⌂" iconClass="purple" title="Hotel Details" />

            <div className="tdac-grid two">
              <Field label="HOTEL NAME" required>
                <input
                  value={form.hotelName}
                  onChange={(e) => updateField("hotelName", e.target.value)}
                  placeholder="Hotel Name"
                />
              </Field>

              <Field label="LOCATION IN THAILAND">
                <select
                  value={form.province}
                  onChange={(e) => updateField("province", e.target.value)}
                >
                  <option value="">Select province</option>
                  <option>Bangkok</option>
                  <option>Phuket</option>
                  <option>Krabi</option>
                  <option>Chiang Mai</option>
                  <option>Pattaya</option>
                </select>
              </Field>
            </div>

            <div className="tdac-grid two">
              <Field label="PURPOSE OF TRAVEL" required>
                <select
                  value={form.purposeOfTravel}
                  onChange={(e) =>
                    updateField("purposeOfTravel", e.target.value)
                  }
                >
                  <option value="Tourism">Tourism</option>
                  <option value="Business">Business</option>
                  <option value="Study">Study</option>
                  <option value="Visit Family">Visit Family</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="ACCOMMODATION" required>
                <select
                  value={form.accommodation}
                  onChange={(e) =>
                    updateField("accommodation", e.target.value)
                  }
                >
                  <option value="hotel">Hotel</option>
                  <option value="hostel">Hostel</option>
                  <option value="friend-family">Friend / Family</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>

            <SectionTitle
              icon="✉"
              iconClass="cyan"
              title="Contact Details"
              description="Required for sharing essential visa updates."
            />

            <div className="tdac-grid two">
              <Field label="EMAIL" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </Field>

              <Field label="PHONE NUMBER" required>
                <div className="tdac-phone">
                  <span>🇮🇳</span>
                  <strong>+91</strong>
                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </Field>
            </div>

            <div className="tdac-bottom-space" />
          </div>

          {(submitError || submitSuccess) && (
            <div
              style={{
                padding: "10px 20px",
                textAlign: "center",
                fontSize: "14px",
                color: submitError ? "#c62828" : "#16734a",
                background: submitError ? "#fff0f0" : "#effaf4",
              }}
            >
              {submitError || submitSuccess}
            </div>
          )}

          <div className="tdac-footer-actions">
            <button
              type="button"
              className="tdac-travelers-button"
              onClick={() => setTravelerCount((count) => count + 1)}
            >
              + Add Travelers
              {travelerCount > 1 ? ` (${travelerCount})` : ""}
            </button>

            <button
              type="submit"
              className="tdac-submit"
              disabled={!canSubmit || submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit application"}
            </button>
          </div>
        </form>
      </main>

      {faqOpen && (
        <div
          className="tdac-faq-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tdac-faq-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setFaqOpen(false);
            }
          }}
        >
          <div className="tdac-faq-modal">
            <div className="tdac-faq-modal-header">
              <div>
                <div className="tdac-faq-eyebrow">HELP & SUPPORT</div>
                <h2 id="tdac-faq-title">Frequently Asked Questions</h2>
                <p>
                  Common questions about your {country} application.
                </p>
              </div>

              <button
                type="button"
                className="tdac-faq-close"
                aria-label="Close FAQs"
                onClick={() => setFaqOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="tdac-faq-content">
              {faqLoading && (
                <div className="tdac-faq-state">Loading FAQs...</div>
              )}

              {!faqLoading && faqError && (
                <div className="tdac-faq-error">
                  <div>{faqError}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setFaqs([]);
                      setFaqError("");
                    }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!faqLoading && !faqError && faqs.length === 0 && (
                <div className="tdac-faq-state">
                  No FAQs are available right now.
                </div>
              )}

              {!faqLoading && !faqError && faqs.length > 0 && (
                <div className="tdac-faq-list">
                  {faqs.map((faq) => {
                    const isOpen = openFaqId === faq._id;

                    return (
                      <div
                        className={`tdac-faq-item ${isOpen ? "open" : ""}`}
                        key={faq._id}
                      >
                        <button
                          type="button"
                          className="tdac-faq-question"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenFaqId(isOpen ? null : faq._id)
                          }
                        >
                          <span>{faq.question}</span>
                          <span className="tdac-faq-chevron">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="tdac-faq-answer">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }

        .tdac-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #f1f1ef;
          color: #151515;
          font-family: Arial, Helvetica, sans-serif;
        }

        .tdac-background {
          position: fixed;
          inset: -50px;
          background-position: center;
          background-size: cover;
          filter: blur(24px);
          transform: scale(1.08);
          opacity: .18;
        }

        .tdac-background-wash {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 82% 66%, rgba(180, 224, 230, .34), transparent 34%),
            radial-gradient(circle at 8% 54%, rgba(255, 255, 255, .96), transparent 44%),
            rgba(244, 244, 242, .74);
        }

        .tdac-back,
        .tdac-home-button,
        .tdac-shell {
          position: relative;
          z-index: 2;
        }

        .tdac-back {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 100;
  cursor: pointer;
  padding: 9px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,.86);
  color: #333;
  text-decoration: none;
  font-size: 14px;
  box-shadow: 0 4px 14px rgba(0,0,0,.06);
  backdrop-filter: blur(12px);
}

        .tdac-home-button {
          position: fixed;
          top: 18px;
          right: 18px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #495057;
          background: rgba(255,255,255,.78);
          text-decoration: none;
          font-size: 20px;
          box-shadow: 0 4px 14px rgba(0,0,0,.05);
        }

        .tdac-shell {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 35px 24px 24px;
        }

        .tdac-card {
          width: min(662px, 100%);
          height: calc(100vh - 58px);
          min-height: 640px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 28px;
          background: rgba(255,255,255,.97);
          box-shadow: 0 20px 65px rgba(0,0,0,.10);
        }

        .tdac-card-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 24px 30px 18px;
          border-bottom: 1px solid #dedede;
        }

        .tdac-brand-block {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }

        .tdac-flag {
          width: 44px;
          height: 44px;
          flex: 0 0 44px;
          overflow: hidden;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .tdac-flag img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tdac-flag span {
          font-size: 33px;
        }

        .tdac-kicker {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .12em;
          color: #333;
          margin-bottom: 4px;
        }

        .tdac-title {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 20px;
          line-height: 1.1;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }

        .tdac-verified {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          margin-left: 7px;
          border-radius: 50%;
          background: #5a62eb;
          color: white;
          text-decoration: none;
          font-family: Arial, sans-serif;
          font-size: 10px;
          vertical-align: 2px;
        }

        .tdac-faq-button {
          flex-shrink: 0;
          border: 1px solid #232323;
          background: white;
          border-radius: 999px;
          padding: 11px 16px;
          font-weight: 600;
          font-size: 13px;
        }

        .tdac-faq-button:hover {
          background: #f6f6f6;
        }

        .tdac-ocr-message {
          margin: -6px 0 18px;
          padding: 10px 13px;
          border-radius: 10px;
          background: #f4f6ff;
          color: #4e56c9;
          font-size: 12px;
          line-height: 1.45;
        }

        .tdac-passport-button:disabled {
          opacity: .65;
          cursor: wait;
        }

        .tdac-faq-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(10, 12, 18, .42);
          backdrop-filter: blur(8px);
        }

        .tdac-faq-modal {
          width: min(620px, 100%);
          max-height: min(720px, calc(100vh - 48px));
          overflow: hidden;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 24px;
          background: #fff;
          box-shadow: 0 24px 80px rgba(0,0,0,.22);
        }

        .tdac-faq-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 24px 26px 18px;
          border-bottom: 1px solid #e8e8e8;
        }

        .tdac-faq-eyebrow {
          margin-bottom: 5px;
          color: #5a62eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
        }

        .tdac-faq-modal-header h2 {
          margin: 0;
          font-size: 23px;
          line-height: 1.15;
        }

        .tdac-faq-modal-header p {
          margin: 6px 0 0;
          color: #6c6c6c;
          font-size: 13px;
          line-height: 1.5;
        }

        .tdac-faq-close {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dedede;
          border-radius: 50%;
          background: #fff;
          color: #333;
          font-size: 24px;
          line-height: 1;
        }

        .tdac-faq-close:hover {
          background: #f5f5f5;
        }

        .tdac-faq-content {
          max-height: 570px;
          overflow-y: auto;
          padding: 10px 18px 18px;
        }

        .tdac-faq-list {
          display: flex;
          flex-direction: column;
        }

        .tdac-faq-item {
          border-bottom: 1px solid #ededed;
        }

        .tdac-faq-item:last-child {
          border-bottom: 0;
        }

        .tdac-faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 8px;
          border: 0;
          background: transparent;
          color: #1f1f1f;
          text-align: left;
          font-size: 15px;
          font-weight: 650;
        }

        .tdac-faq-question:hover {
          color: #555de3;
        }

        .tdac-faq-chevron {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f1f2ff;
          color: #565de6;
          font-size: 18px;
          font-weight: 400;
        }

        .tdac-faq-answer {
          padding: 0 48px 18px 8px;
          color: #626262;
          font-size: 14px;
          line-height: 1.65;
        }

        .tdac-faq-state {
          padding: 35px 20px;
          color: #666;
          text-align: center;
          font-size: 14px;
        }

        .tdac-faq-error {
          margin: 20px 10px;
          padding: 16px;
          border-radius: 14px;
          background: #fff3f3;
          color: #b72f2f;
          text-align: center;
          font-size: 14px;
          line-height: 1.5;
        }

        .tdac-faq-error button {
          margin-top: 12px;
          border: 1px solid #b72f2f;
          border-radius: 999px;
          padding: 8px 14px;
          background: #fff;
          color: #b72f2f;
          font-size: 12px;
          font-weight: 700;
        }

        .tdac-form-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 20px 64px 25px;
        }

        .tdac-form-scroll::-webkit-scrollbar {
          width: 10px;
        }

        .tdac-form-scroll::-webkit-scrollbar-thumb {
          background: #b9b9b9;
          border-radius: 12px;
        }

        .tdac-section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 20px;
        }

        .tdac-section-title h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .tdac-section-title p {
          margin: 3px 0 0;
          color: #555;
          font-size: 13px;
        }

        .tdac-section-icon {
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          background: #5861ea;
          font-size: 14px;
        }

        .tdac-section-icon.green { background: #659d1f; }
        .tdac-section-icon.purple { background: #8457e8; }
        .tdac-section-icon.cyan { background: #20b8d2; }

        .tdac-passport-button {
          width: 100%;
          height: 45px;
          border: 1px solid #2a2a2a;
          border-radius: 999px;
          background: white;
          font-weight: 600;
          font-size: 14px;
        }

        .tdac-or {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 17px 0 18px;
          color: #8a8a8a;
          font-size: 12px;
        }

        .tdac-or span {
          height: 1px;
          flex: 1;
          background: #e4e4e4;
        }

        .tdac-or em { font-style: normal; }

        .tdac-grid {
          display: grid;
          gap: 20px 30px;
          margin-bottom: 26px;
        }

        .tdac-grid.two {
          grid-template-columns: 1fr 1fr;
        }

        .tdac-grid.one {
          grid-template-columns: minmax(0, 1fr);
        }

        .tdac-field {
          min-width: 0;
        }

        .tdac-label {
          display: block;
          margin-bottom: 7px;
          color: #272727;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .tdac-field input,
        .tdac-field select {
          width: 100%;
          height: 42px;
          border: 0;
          border-bottom: 1px dashed #d4d4d4;
          outline: none;
          background: transparent;
          color: #222;
          font-size: 15px;
        }

        .tdac-field input::placeholder {
          color: #a3a3a3;
        }

        .tdac-field input:focus,
        .tdac-field select:focus {
          border-bottom-color: #666;
        }

        .tdac-toggle {
          display: inline-flex;
          padding: 3px;
          margin: -2px 0 24px;
          border-radius: 999px;
          background: #ececec;
        }

        .tdac-toggle button {
          border: 0;
          background: transparent;
          padding: 9px 19px;
          border-radius: 999px;
          color: #555;
          font-size: 13px;
        }

        .tdac-toggle button.selected {
          background: white;
          color: #222;
          box-shadow: 0 1px 5px rgba(0,0,0,.13);
        }

        .tdac-phone {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px dashed #d4d4d4;
        }

        .tdac-phone input {
          border-bottom: 0;
          flex: 1;
          height: 41px;
        }

        .tdac-phone strong {
          font-size: 14px;
          font-weight: 500;
        }

        .tdac-passport-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .tdac-ocr-message {
          margin-top: 10px;
          padding: 10px 13px;
          border-radius: 10px;
          background: #f4f6ff;
          color: #4e56c9;
          font-size: 12px;
          line-height: 1.45;
        }

        .tdac-bottom-space {
          height: 25px;
        }

        .tdac-footer-actions {
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: 13px;
          padding: 10px 50px 18px;
          background: rgba(255,255,255,.98);
        }

        .tdac-travelers-button,
        .tdac-submit {
          height: 53px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
        }

        .tdac-travelers-button {
          border: 1px solid #262626;
          background: white;
          color: #111;
        }

        .tdac-submit {
          border: 0;
          background: #efefef;
          color: #a2a2a2;
          cursor: not-allowed;
        }

        .tdac-submit:not(:disabled) {
          background: #565de6;
          color: white;
          cursor: pointer;
        }

        .tdac-back-inline {
          margin-top: 12px;
          padding: 10px 16px;
          border-radius: 999px;
          background: white;
          color: #333;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(0,0,0,.06);
        }

        .tdac-loading-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-family: Arial, Helvetica, sans-serif;
        }

        .tdac-spinner {
          width: 35px;
          height: 35px;
          border: 3px solid #dedede;
          border-top-color: #565de6;
          border-radius: 50%;
          animation: tdacSpin .7s linear infinite;
        }

        @keyframes tdacSpin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 680px) {
          .tdac-faq-overlay {
            padding: 10px;
          }

          .tdac-faq-modal {
            max-height: calc(100vh - 20px);
            border-radius: 20px;
          }

          .tdac-faq-modal-header {
            padding: 20px 18px 15px;
          }

          .tdac-faq-modal-header h2 {
            font-size: 19px;
          }

          .tdac-faq-content {
            max-height: calc(100vh - 110px);
            padding-inline: 12px;
          }

          .tdac-faq-question {
            padding: 16px 6px;
            font-size: 14px;
          }

          .tdac-faq-answer {
            padding-right: 38px;
          }

          .tdac-shell {
            padding: 18px 10px 10px;
          }

          .tdac-card {
            height: calc(100vh - 28px);
            min-height: 0;
            border-radius: 20px;
          }

          .tdac-card-header {
            padding: 18px 18px 15px;
          }

          .tdac-brand-block {
            gap: 10px;
          }

          .tdac-flag {
            width: 38px;
            height: 38px;
            flex-basis: 38px;
          }

          .tdac-title {
            font-size: 17px;
          }

          .tdac-faq-button {
            padding: 9px 12px;
          }

          .tdac-form-scroll {
            padding: 18px 22px 20px;
          }

          .tdac-grid.two {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .tdac-footer-actions {
            grid-template-columns: 1fr;
            padding: 10px 18px 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default TDAC;
