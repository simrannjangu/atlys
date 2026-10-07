import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";

/*
  size: "sm" | "md" | "lg"
  to:   link target (pass null for no link)
*/
export default function Logo({ size = "md", to = "/", className = "" }) {
  const mark = (
    <span
      className={`vz-logo vz-${size}`}
      style={{ backgroundImage: `url(${logoImg})` }}
      role="img"
      aria-label="Vyzits: Visa, Immigration, Travel"
    />
  );

  if (!to) return mark;

  return (
    <Link to={to} className={`vz-link ${className}`} aria-label="Home">
      {mark}
    </Link>
  );
}