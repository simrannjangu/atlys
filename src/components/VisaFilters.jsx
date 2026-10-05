import { useState } from "react";

function VisaFilters() {
  const [visaDelivery, setVisaDelivery] = useState("Any Time");
  const [visaType, setVisaType] = useState("All Visa Types");
  const [documents, setDocuments] = useState("Any Documents");
  const [travelDate, setTravelDate] = useState("");

  const today = new Date();

  const todayString =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  return (
    <section className="atlys-filter-section">
      <div className="atlys-filters">

        <div className="atlys-filter">
          <div className="filter-icon delivery-icon">
            ⚡
          </div>

          <div className="filter-text">
            <span className="filter-label">
              Visa delivery:
            </span>

            <select
              value={visaDelivery}
              onChange={(e) =>
                setVisaDelivery(e.target.value)
              }
            >
              <option>Any Time</option>
              <option>Fastest</option>
              <option>Standard</option>
            </select>
          </div>
        </div>

        <div className="atlys-filter">
          <div className="filter-icon type-icon">
            ▰
          </div>

          <div className="filter-text">
            <span className="filter-label">
              Type:
            </span>

            <select
              value={visaType}
              onChange={(e) =>
                setVisaType(e.target.value)
              }
            >
              <option>All Visa Types</option>
              <option>e-Visa</option>
              <option>Sticker</option>
              <option>Visa on Arrival</option>
              <option>No Visa Required</option>
            </select>
          </div>
        </div>

        <div className="atlys-filter">
          <div className="filter-icon documents-icon">
            ▣
          </div>

          <div className="filter-text">
            <span className="filter-label">
              Documents:
            </span>

            <select
              value={documents}
              onChange={(e) =>
                setDocuments(e.target.value)
              }
            >
              <option>Any Documents</option>
              <option>Passport</option>
              <option>Photo</option>
              <option>Bank Statements</option>
              <option>Income Tax Returns</option>
            </select>
          </div>
        </div>

        <div className="atlys-filter holiday-filter">
          <div className="filter-icon holiday-icon">
            ◒
          </div>

          <div className="filter-text">
            <span className="filter-label">
              Holidays:
            </span>

            <input
              type="date"
              value={travelDate}
              min={todayString}
              onChange={(e) =>
                setTravelDate(e.target.value)
              }
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default VisaFilters;