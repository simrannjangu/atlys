import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./SchengenAppointmentChecker.css";

const DESTINATIONS_API =
  "https://atlys-backend-cr9i.onrender.com/api/schengen/destinations";

const SCHENGEN_API =
  "https://atlys-backend-cr9i.onrender.com/api/schengen";

const FAQS = [
  {
    question: "How often are slots updated from your country?",
    answer: (
      <>
        We update the availability shown on this page from the available
        Schengen appointment data. New slots will appear when they are
        returned by the connected API.
        <br />
        <br />
        The availability shown on each card reflects the latest data loaded
        from the VYZITS backend.
      </>
    ),
  },
  {
    question:
      "Which Schengen countries tend to have the earliest slots from your country?",
    answer: (
      <>
        Slot availability changes frequently and depends on the destination,
        application centre, capacity and appointment releases.
        <br />
        <br />
        Use the destination and city filters above to see the slots currently
        available through VYZITS.
      </>
    ),
  },
  {
    question: "Can I book the slot directly from this page?",
    answer: (
      <>
        This page currently displays appointment availability returned by the
        VYZITS Schengen APIs. Booking can be connected to the appointment flow
        separately when the booking endpoint is available.
      </>
    ),
  },
  {
    question: 'Why do some countries show "No slots"?',
    answer: (
      <>
        A destination can show no slots when there are no active slots
        returned by the backend, when the available capacity is insufficient
        for the selected number of travellers, or when no appointment has
        currently been added for that destination.
      </>
    ),
  },
  {
    question: "How many travellers can I book on one slot?",
    answer: (
      <>
        The Travellers selector is used to filter slots according to their
        remaining capacity. For example, a slot with a remaining capacity of
        2 will not be displayed when 3 travellers are selected.
      </>
    ),
  },
  {
    question: "Does the purpose of visit affect slot availability?",
    answer: (
      <>
        Yes. The backend records a purpose for destinations, centres and
        slots. Selecting a purpose filters the available slots accordingly.
      </>
    ),
  },
];

function getDateLabel(date) {
  if (!date) {
    return "No date listed";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDestinationName(destination, destinations) {
  const item = destinations.find(
    (destinationItem) => destinationItem._id === destination
  );

  return item?.name || "Schengen destination";
}

function SchengenAppointmentChecker() {
  const [applyingFrom, setApplyingFrom] = useState("");
  const [destination, setDestination] = useState("");
  const [city, setCity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [travellers, setTravellers] = useState(1);

  const [destinations, setDestinations] = useState([]);
  const [centres, setCentres] = useState([]);
  const [slots, setSlots] = useState([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDestinations() {
      try {
        setLoadingInitial(true);
        setError("");

        const response = await fetch(DESTINATIONS_API);

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Destinations API returned ${response.status}`
          );
        }

        const destinationList = Array.isArray(data?.destinations)
          ? data.destinations
          : [];

        if (!cancelled) {
          setDestinations(destinationList);
        }
      } catch (err) {
        console.error("SCHENGEN DESTINATIONS API ERROR:", err);

        if (!cancelled) {
          setDestinations([]);
          setError(
            err?.message || "Unable to load Schengen destinations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingInitial(false);
        }
      }
    }

    loadDestinations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDestinationData() {
      if (!destination) {
        setCentres([]);
        setSlots([]);
        return;
      }

      try {
        setLoadingCentres(true);
        setLoadingSlots(true);
        setError("");

        const centresResponse = await fetch(
          `${SCHENGEN_API}/${destination}/centres`
        );

        const slotsResponse = await fetch(
          `${SCHENGEN_API}/${destination}/slots`
        );

        let centresData = {};
        let slotsData = {};

        try {
          centresData = await centresResponse.json();
        } catch {
          centresData = {};
        }

        try {
          slotsData = await slotsResponse.json();
        } catch {
          slotsData = {};
        }

        if (!centresResponse.ok) {
          throw new Error(
            centresData?.message ||
              `Centres API returned ${centresResponse.status}`
          );
        }

        if (!slotsResponse.ok) {
          throw new Error(
            slotsData?.message ||
              `Slots API returned ${slotsResponse.status}`
          );
        }

        const centresList = Array.isArray(centresData?.centres)
          ? centresData.centres
          : [];

        const slotsList = Array.isArray(slotsData?.slots)
          ? slotsData.slots
          : [];

        if (!cancelled) {
          setCentres(centresList);
          setSlots(slotsList);
        }
      } catch (err) {
        console.error("SCHENGEN CENTRES/SLOTS API ERROR:", err);

        if (!cancelled) {
          setCentres([]);
          setSlots([]);
          setError(
            err?.message ||
              "Unable to load Schengen centres and slots."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCentres(false);
          setLoadingSlots(false);
        }
      }
    }

    loadDestinationData();

    return () => {
      cancelled = true;
    };
  }, [destination]);

  const applyingFromOptions = useMemo(() => {
    const countries = destinations
      .map((item) => item?.residenceCountry)
      .filter(Boolean)
      .map((item) => String(item).trim());

    return [...new Set(countries)];
  }, [destinations]);

  const destinationOptions = useMemo(() => {
    return destinations.filter((item) => {
      if (!applyingFrom) {
        return true;
      }

      return (
        String(item?.residenceCountry || "")
          .trim()
          .toLowerCase() === applyingFrom.trim().toLowerCase()
      );
    });
  }, [destinations, applyingFrom]);

  const cityOptions = useMemo(() => {
    const cities = centres
      .map((item) => item?.city || item?.centreName)
      .filter(Boolean)
      .map((item) => String(item).trim());

    return [...new Set(cities)];
  }, [centres]);

  const purposeOptions = useMemo(() => {
    const purposes = [
      ...destinations.map((item) => item?.purpose),
      ...centres.map((item) => item?.purpose),
      ...slots.map((item) => item?.purpose),
    ]
      .filter(Boolean)
      .map((item) => String(item).trim());

    return [...new Set(purposes)];
  }, [destinations, centres, slots]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const slotPurpose = String(slot?.purpose || "")
        .trim()
        .toLowerCase();

      const slotCity = String(slot?.city || "")
        .trim()
        .toLowerCase();

      const selectedCity = city.trim().toLowerCase();
      const selectedPurpose = purpose.trim().toLowerCase();

      const remainingCapacity = Number(
        slot?.remainingCapacity ?? slot?.capacity ?? 0
      );

      const isAvailable = slot?.available !== false;
      const hasCapacity = remainingCapacity >= travellers;

      if (!isAvailable || !hasCapacity) {
        return false;
      }

      if (selectedPurpose && slotPurpose !== selectedPurpose) {
        return false;
      }

      if (selectedCity) {
        if (slotCity === selectedCity) {
          return true;
        }

        const centre = centres.find(
          (item) => item?._id === slot?.centreId
        );

        const centreCity = String(
          centre?.city || centre?.centreName || ""
        )
          .trim()
          .toLowerCase();

        if (centreCity !== selectedCity) {
          return false;
        }
      }

      return true;
    });
  }, [slots, centres, city, purpose, travellers]);

  function handleApplyingFromChange(event) {
    setApplyingFrom(event.target.value);
    setDestination("");
    setCity("");
    setPurpose("");
    setCentres([]);
    setSlots([]);
    setError("");
  }

  function handleDestinationChange(event) {
    setDestination(event.target.value);
    setCity("");
    setPurpose("");
    setError("");
  }

  function handleCheck() {
    if (!applyingFrom) {
      setError("Please select the country you are applying from.");
      return;
    }

    if (!destination) {
      setError("Please select a destination.");
      return;
    }

    setLoading(true);
    setError("");

    window.setTimeout(() => {
      setLoading(false);
    }, 350);
  }

  const selectedDestinationName = getDestinationName(
    destination,
    destinations
  );

  const dataLoading =
    loadingInitial || loadingCentres || loadingSlots;

  return (
    <div className="schengen-page">
      <Navbar />

      <section className="schengen-hero">
        <div className="schengen-grid-bg"></div>

        <div className="schengen-hero-inner">
          <div className="schengen-breadcrumb">
            <span>VYZITS</span>
            <span>›</span>
            <strong>Schengen appointments</strong>
          </div>

          <div className="schengen-live-pill">
            <span className="schengen-live-dot"></span>
            LIVE SCHENGEN SLOTS · UPDATED CONTINUOUSLY
          </div>

          <h1>
            Schengen visa appointment
            <br />
            availability
          </h1>

          <p className="schengen-subtitle">
            Find available appointment slots for Schengen destinations
            using the latest VYZITS availability data.
          </p>

          <div className="schengen-filter-card">
            <div className="schengen-filter">
              <label>APPLYING FROM</label>

              <select
                value={applyingFrom}
                onChange={handleApplyingFromChange}
              >
                <option value="">
                  {loadingInitial
                    ? "Loading..."
                    : "Select country"}
                </option>

                {applyingFromOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="schengen-filter">
              <label>DESTINATION</label>

              <select
                value={destination}
                disabled={!applyingFrom}
                onChange={handleDestinationChange}
              >
                <option value="">
                  {applyingFrom
                    ? "Pick destination..."
                    : "Pick residence first"}
                </option>

                {destinationOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="schengen-filter">
              <label>CITY</label>

              <select
                value={city}
                disabled={!destination || loadingCentres}
                onChange={(event) =>
                  setCity(event.target.value)
                }
              >
                <option value="">
                  {!destination
                    ? "Pick destination first"
                    : loadingCentres
                    ? "Loading cities..."
                    : "Pick city..."}
                </option>

                {cityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="schengen-filter">
              <label>PURPOSE</label>

              <select
                value={purpose}
                disabled={!destination}
                onChange={(event) =>
                  setPurpose(event.target.value)
                }
              >
                <option value="">
                  {destination
                    ? "Select purpose..."
                    : "Pick destination first"}
                </option>

                {purposeOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="schengen-filter travellers-filter">
              <label>TRAVELLERS</label>

              <div className="traveller-stepper">
                <button
                  type="button"
                  onClick={() =>
                    setTravellers((value) =>
                      Math.max(1, value - 1)
                    )
                  }
                  aria-label="Decrease travellers"
                >
                  −
                </button>

                <strong>{travellers}</strong>

                <button
                  type="button"
                  onClick={() =>
                    setTravellers((value) =>
                      Math.min(10, value + 1)
                    )
                  }
                  aria-label="Increase travellers"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="schengen-check-button"
            onClick={handleCheck}
            disabled={!applyingFrom || loading}
          >
            {loading ? "Checking..." : "Check availability"}
            <span>→</span>
          </button>
        </div>
      </section>

      <main className="schengen-main">
        {error && (
          <div className="schengen-api-error">
            {error}
          </div>
        )}

        {applyingFrom ? (
          <section className="schengen-results-area">
            {dataLoading ? (
              <div className="schengen-empty">
                <h2>Loading availability</h2>
                <p>
                  Checking destinations, application centres and
                  available appointment slots.
                </p>
              </div>
            ) : filteredSlots.length > 0 ? (
              <div className="schengen-results-grid">
                {filteredSlots.map((slot, index) => {
                  const centre = centres.find(
                    (item) => item?._id === slot?.centreId
                  );

                  const available =
                    slot?.available !== false &&
                    Number(
                      slot?.remainingCapacity ??
                        slot?.capacity ??
                        0
                    ) >= travellers;

                  return (
                    <article
                      className="schengen-result-card"
                      key={slot?._id || index}
                    >
                      <div className="result-card-top">
                        <span>
                          {selectedDestinationName}
                        </span>

                        <span
                          className={
                            available
                              ? "result-status"
                              : "result-status no-slots"
                          }
                        >
                          {available
                            ? "Available"
                            : "No slots"}
                        </span>
                      </div>

                      <h2>
                        {centre?.centreName ||
                          centre?.name ||
                          "Application centre"}
                      </h2>

                      <div className="result-slot">
                        <span>Earliest slot</span>

                        <strong>
                          {getDateLabel(slot?.date)}
                        </strong>

                        {slot?.time && (
                          <small>{slot.time}</small>
                        )}
                      </div>

                      <div>
                        <small>
                          {centre?.provider ||
                            "Visa application centre"}
                        </small>
                      </div>

                      <div>
                        <small>
                          {centre?.city
                            ? `${centre.city}${
                                centre.state
                                  ? `, ${centre.state}`
                                  : ""
                              }`
                            : ""}
                        </small>
                      </div>

                      <div>
                        <small>
                          Remaining capacity:{" "}
                          {slot?.remainingCapacity ??
                            slot?.capacity ??
                            0}
                        </small>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="schengen-empty">
                <h2>No slots found</h2>

                <p>
                  We couldn&apos;t find an available appointment
                  matching your current filters.
                </p>
              </div>
            )}
          </section>
        ) : (
          <div className="schengen-pick-state">
            <h2>Pick where you&apos;re applying from</h2>

            <p>
              Use the{" "}
              <strong>Applying from</strong> filter above to see
              Schengen slot availability from your country.
            </p>
          </div>
        )}

        <section className="schengen-faq">
          <h2>Frequently asked questions</h2>

          <div className="schengen-faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  className={`schengen-faq-item ${
                    isOpen ? "faq-open" : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    className="schengen-faq-question"
                    onClick={() =>
                      setOpenFaq(
                        isOpen ? null : index
                      )
                    }
                  >
                    <span>{faq.question}</span>

                    <span className="schengen-faq-chevron">
                      {isOpen ? "⌃" : "⌄"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="schengen-faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SchengenAppointmentChecker;