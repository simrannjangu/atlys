import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="not-found">

      <p className="eyebrow">
        404
      </p>

      <h1>
        Page not found
      </h1>

      <p>
        The page you're looking for doesn't exist.
      </p>

      <Link to="/">
        ← Back to VisaGo
      </Link>

    </main>
  );
}

export default NotFound;