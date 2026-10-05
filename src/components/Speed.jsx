import React, { useEffect, useMemo, useState } from "react";
import "./Speed.css";

const SPEED_API = "https://atlys-backend-cr9i.onrender.com/api/speedupdates";

function getShipDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getDay(value) {
  const date = getShipDate(value);

  if (!date) return "";

  return String(date.getDate()).padStart(2, "0");
}

function getMonth(value) {
  const date = getShipDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
  })
    .format(date)
    .toUpperCase();
}

function getYear(value) {
  const date = getShipDate(value);

  if (!date) return "";

  return date.getFullYear();
}

function getWeekday(value) {
  const date = getShipDate(value);

  if (!date) return "";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  })
    .format(date)
    .toUpperCase();
}

function getDaysAgo(value) {
  const date = getShipDate(value);

  if (!date) return "";

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const difference = Math.round(
    (todayStart.getTime() - dateStart.getTime()) / 86400000
  );

  if (difference <= 0) {
    return "TODAY";
  }

  if (difference === 1) {
    return "1 DAY AGO";
  }

  return `${difference} DAYS AGO`;
}

function Speed() {
  const [today, setToday] = useState(null);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSpeedUpdates() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(SPEED_API);

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Speed API returned ${response.status}`
          );
        }

        if (!cancelled) {
          setToday(data?.today || null);
          setArchive(
            Array.isArray(data?.archive)
              ? data.archive
              : []
          );
        }
      } catch (err) {
        console.error("SPEED API ERROR:", err);

        if (!cancelled) {
          setToday(null);
          setArchive([]);
          setError(
            err?.message ||
              "Unable to load speed updates."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSpeedUpdates();

    return () => {
      cancelled = true;
    };
  }, []);

  const todaysShips = useMemo(() => {
    if (!today || !Array.isArray(today.ships)) {
      return [];
    }

    return [...today.ships].sort(
      (a, b) =>
        Number(a?.order || 0) -
        Number(b?.order || 0)
    );
  }, [today]);

  const archiveGroups = useMemo(() => {
    if (!Array.isArray(archive)) {
      return [];
    }

    return archive
      .filter((item) => item?.active !== false)
      .sort((a, b) => {
        const aDate =
          getShipDate(a?.date)?.getTime() || 0;

        const bDate =
          getShipDate(b?.date)?.getTime() || 0;

        return bDate - aDate;
      });
  }, [archive]);

  const currentDate = today?.date || new Date();

  const currentDay =
    today?.dayNumber != null
      ? String(today.dayNumber).padStart(2, "0")
      : getDay(currentDate);

  const currentMonth =
    today?.monthYear ||
    `${getMonth(currentDate)} ${getYear(currentDate)}`;

  const currentYear = getYear(currentDate);

  const currentWeekday = getWeekday(currentDate);

  return (
    <div className="speed-page">
      <header className="speed-log-header">
        <div className="speed-log-left">
          <a href="/" className="speed-logo">
            visa<span>go</span>
            <sup>→</sup>
          </a>

          <span className="speed-slash">/</span>

          <span className="speed-log-name">
            SHIP.LOG
          </span>
        </div>

        <div className="speed-log-right">
          <span className="shipping-dot"></span>

          <span>SHIPPING</span>

          <strong>
            {new Date().toISOString()}
          </strong>
        </div>
      </header>

      <div className="speed-timeline">
        {Array.from(
          { length: 14 },
          (_, index) => (
            <span
              key={index}
              className={
                index === 0
                  ? "timeline-dot active"
                  : "timeline-dot"
              }
            ></span>
          )
        )}
      </div>

      <section className="speed-current">
        <div className="speed-ghost-word">
          SHIPPED
        </div>

        <div className="speed-current-line">
          <span>{currentWeekday}</span>

          <div></div>

          <span>
            TODAY / {currentYear}
          </span>
        </div>

        <div className="speed-big-date">
          <div className="speed-date-month">
            {currentMonth}
          </div>

          <div className="speed-date-day">
            {currentDay}
          </div>

          <div className="speed-date-year">
            {currentYear}
          </div>
        </div>

        <div className="speed-current-stats">
          <span>
            <b>{todaysShips.length}</b> SHIPS
          </span>

          <i>·</i>

          <span>
            <b>1</b> DAY
          </span>
        </div>
      </section>

      <main className="speed-content">
        {error && (
          <div className="speed-api-error">
            {error}
          </div>
        )}

        <section className="speed-todays-ships">
          <div className="speed-section-label">
            <span>TODAY&apos;S SHIPS</span>
            <div></div>
          </div>

          <div className="speed-today-list">
            {loading ? (
              <div className="speed-empty-row">
                Loading updates...
              </div>
            ) : todaysShips.length === 0 ? (
              <div className="speed-empty-row">
                No updates available today.
              </div>
            ) : (
              todaysShips.map((ship, index) => (
                <article
                  className="speed-today-item"
                  key={ship?._id || index}
                >
                  <div className="speed-item-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                    {" / "}
                    {String(
                      todaysShips.length
                    ).padStart(2, "0")}
                  </div>

                  <div className="speed-item-text">
                    <h2>
                      {ship?.description ||
                        "New update shipped."}
                    </h2>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="speed-archive">
          <div className="speed-archive-title-row">
            <h2>Archive</h2>

            <div></div>

            <span>
              LAST {archiveGroups.length} DAYS
            </span>
          </div>

          {archiveGroups.length === 0 ? (
            <div className="speed-empty-archive">
              No archived ships.
            </div>
          ) : (
            archiveGroups.map((group) => {
              const date = group?.date;

              const groupShips = Array.isArray(
                group?.ships
              )
                ? [...group.ships].sort(
                    (a, b) =>
                      Number(a?.order || 0) -
                      Number(b?.order || 0)
                  )
                : [];

              return (
                <article
                  className="speed-archive-group"
                  key={group?._id || date}
                >
                  <div className="speed-archive-date">
                    <span className="archive-days-ago">
                      {getDaysAgo(date)}
                    </span>

                    <strong>
                      {getDay(date)}
                    </strong>

                    <b>{getMonth(date)}</b>

                    <span className="archive-year">
                      {getYear(date)}
                    </span>

                    <small>
                      {groupShips.length}{" "}
                      {groupShips.length === 1
                        ? "SHIP"
                        : "SHIPS"}
                    </small>
                  </div>

                  <div className="speed-archive-items">
                    {groupShips.map(
                      (ship, index) => (
                        <div
                          className="speed-archive-item"
                          key={
                            ship?._id ||
                            index
                          }
                        >
                          <span>
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                            {" / "}
                            {String(
                              groupShips.length
                            ).padStart(2, "0")}
                          </span>

                          <div>
                            <p>
                              {ship?.description ||
                                "New update shipped."}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>

        <div className="speed-end">
          <span>
            VISAGO · SHIP LOG · AUTO-PUBLISHED
            EVERY DAY AT 23:59 IST
          </span>

          <span>
            END OF TRANSMISSION //
          </span>
        </div>
      </main>
    </div>
  );
}

export default Speed;