import { useEffect, useState } from "react";
import VisaCard from "./VisaCard";

const VISA_API = "https://atlys-backend-cr9i.onrender.com/api/visas";

function PopularDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(VISA_API);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.visas)
          ? data.visas
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.countries)
          ? data.countries
          : [];

        setDestinations(list);
      } catch (err) {
        console.error("VISAS API ERROR:", err);
        setError("Unable to load destinations.");
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  return (
    <section className="popular-destinations">
      {loading && <div className="destination-message">Loading destinations...</div>}

      {error && <div className="destination-message error">{error}</div>}

      {!loading && !error && destinations.length === 0 && (
        <div className="destination-message">No destinations available.</div>
      )}

      {!loading && !error && destinations.length > 0 && (
        <div className="visa-grid">
          {destinations.map((destination, index) => (
            <VisaCard
              key={
                destination._id ||
                destination.id ||
                destination.slug ||
                destination.country?._id ||
                index
              }
              destination={destination}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default PopularDestinations;