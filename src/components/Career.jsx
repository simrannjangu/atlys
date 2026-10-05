import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three"; // npm i three
import "./Career.css";

/* =====================================================================
   STORY (sab kuch sirf ek baar, order fix):
   0 Passport (visa book ek baar khulti hai + stamp)
   1 Runway  -> plane roll karke takeoff
   2 Flight  -> baadlon ke beech climb
   3 Earth   -> space se globe + pins
   4 Arrival -> building
   ===================================================================== */

/* ================= helpers ================= */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const _c = new THREE.Color();
const grad = (stops, t, out) => {
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i], [b, cb] = stops[i + 1];
    if (t <= b) return out.set(ca).lerp(_c.set(cb), sstep(a, b, t));
  }
  return out.set(stops[stops.length - 1][1]);
};
const tex = (w, h, fn) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  fn(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};
const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
const arc = (c, t, cx, cy, r, a0, a1, bot) => {
  for (let i = 0; i < t.length; i++) {
    const a = a0 + (a1 - a0) * (i / (t.length - 1));
    c.save(); c.translate(cx + r * Math.cos(a), cy + r * Math.sin(a));
    c.rotate(a + (bot ? -Math.PI / 2 : Math.PI / 2)); c.fillText(t[i], 0, 0); c.restore();
  }
};
const latLon = (lat, lon, r) => {
  const phi = ((90 - lat) * Math.PI) / 180, th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
const box = (w, h, d, m, x, y, z, parent) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); parent.add(o); return o;
};

/* ---------- 3D value noise (fbm) ---------- */
const hash = (x, y, z) => { const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return h - Math.floor(h); };
const vnoise = (x, y, z) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const h = (a, b, c) => hash(xi + a, yi + b, zi + c);
  return lerp(
    lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v),
    lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v), w);
};
const fbm = (x, y, z, o = 5) => { let a = 0.5, s = 0, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, z * f); f *= 2.03; a *= 0.5; } return s; };

/* ---------- earth: fbm continents (day / city lights / clouds) ---------- */
const SEA = 0.54;
const dirLL = (lat, lon) => { const p = ((90 - lat) * Math.PI) / 180, t = ((lon + 180) * Math.PI) / 180; return [-Math.sin(p) * Math.cos(t), Math.cos(p), Math.sin(p) * Math.sin(t)]; };
const elevD = (x, y, z) => fbm(x * 1.6 + 3.1, y * 1.6 + 1.7, z * 1.6 + 9.3, 5);
const elevLL = (lat, lon) => elevD(...dirLL(lat, lon));
const snapLand = (lat, lon) => {
  if (elevLL(lat, lon) > SEA + 0.025) return [lat, lon];
  for (let r = 2; r <= 45; r += 2) for (let k = 0; k < 16; k++) {
    const a = (k / 16) * 6.283, la = clamp(lat + Math.sin(a) * r, -70, 70), lo = lon + Math.cos(a) * r;
    if (elevLL(la, lo) > SEA + 0.025) return [la, lo];
  }
  return [lat, lon];
};
function earthTex() {
  const W = 768, H = 384;
  const mk = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d"); return [c, x, x.createImageData(w, h)]; };
  const [c1, x1, d1] = mk(W, H), [c2, x2, d2] = mk(W, H), [c3, x3, d3] = mk(512, 256);
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const lat = 90 - ((y + 0.5) / H) * 180, lon = ((x + 0.5) / W) * 360 - 180, al = Math.abs(lat);
    const [dx, dy, dz] = dirLL(lat, lon), e = elevD(dx, dy, dz), i = (y * W + x) * 4;
    let col, lit = false;
    if (e < SEA) col = mix([24, 96, 132], [4, 22, 62], Math.sqrt(clamp((SEA - e) / 0.14)));
    else {
      const m = fbm(dx * 2.4 + 7, dy * 2.4 + 2, dz * 2.4 + 4, 3), h = clamp((e - SEA) / 0.3);
      let g = mix([46, 92, 40], [92, 112, 58], clamp(m * 1.6 - 0.3));
      if (m < 0.45 && al < 48) g = mix(g, [196, 166, 112], clamp((0.45 - m) * 7));
      col = mix(g, [112, 100, 88], sstep(0.25, 0.6, h)); col = mix(col, [245, 245, 248], sstep(0.62, 0.85, h));
      lit = m > 0.42 && vnoise(dx * 60, dy * 60, dz * 60) > 0.72 && al < 62 && Math.random() < 0.8;
    }
    const ice = sstep(66, 78, al + (fbm(dx * 5, dy * 5, dz * 5, 2) - 0.5) * 14);
    if (ice > 0) col = mix(col, [236, 242, 248], ice);
    d1.data.set([col[0], col[1], col[2], 255], i);
    d2.data.set(lit ? [255, 196, 120, 255] : [0, 0, 0, 255], i);
  }
  for (let y = 0; y < 256; y++) for (let x = 0; x < 512; x++) {
    const [dx, dy, dz] = dirLL(90 - (y / 256) * 180, (x / 512) * 360 - 180);
    d3.data.set([255, 255, 255, sstep(0.5, 0.8, fbm(dx * 3 + 11, dy * 3 + 5, dz * 3 + 2, 5)) * 235], (y * 512 + x) * 4);
  }
  x1.putImageData(d1, 0, 0); x2.putImageData(d2, 0, 0); x3.putImageData(d3, 0, 0);
  const t = (c) => { const k = new THREE.CanvasTexture(c); k.colorSpace = THREE.SRGBColorSpace; k.anisotropy = 8; return k; };
  return { map: t(c1), lights: t(c2), clouds: t(c3) };
}

/* ================= data ================= */
const BEATS = [
  { id: "hero", a: -1, b: 0.1 },
  { id: "mission", a: 0.26, b: 0.38 },
  { id: "fly", a: 0.46, b: 0.58 },
  { id: "world", a: 0.65, b: 0.76 },
  { id: "values", a: 0.8, b: 0.9 },
  { id: "roles", a: 0.93, b: 2 },
];
const CHAPTERS = [[0, "First light"], [0.22, "Takeoff"], [0.42, "Altitude"], [0.62, "The world"], [0.78, "Arrival"]];
const BOUNDS = [0.22, 0.42, 0.62, 0.78];
const NAV = [["Mission", 0.32], ["Values", 0.84], ["Roles", 0.98]];
const PINS = [
  { name: "India", landmark: "Taj Mahal", icon: "🕌", lat: 27, lon: 78 },
  { name: "United Arab Emirates", landmark: "Burj Khalifa", icon: "🏙️", lat: 24, lon: 54 },
  { name: "United Kingdom", landmark: "Big Ben", icon: "🕰️", lat: 52, lon: 0 },
  { name: "France", landmark: "Eiffel Tower", icon: "🗼", lat: 48, lon: 2 },
  { name: "United States", landmark: "Statue of Liberty", icon: "🗽", lat: 40, lon: -74 },
  { name: "Japan", landmark: "Itsukushima torii", icon: "⛩️", lat: 34, lon: 132 },
  { name: "Singapore", landmark: "Marina Bay Sands", icon: "🌃", lat: 1.3, lon: 103.8 },
  { name: "Australia", landmark: "Kangaroo", icon: "🦘", lat: -25, lon: 134 },
].map((p) => { const [la, lo] = snapLand(p.lat, p.lon); return { ...p, local: latLon(la, lo, 60.6) }; });
const ROLES = [
  { title: "Frontend Engineering", tag: "TECH", description: "Build fast, beautiful interfaces that make complicated travel journeys feel effortless." },
  { title: "Backend Engineering", tag: "TECH", description: "Build APIs, systems and infrastructure that power the VisaGo experience." },
  { title: "Product", tag: "PRODUCT", description: "Turn messy travel problems into simple products people actually love using." },
  { title: "Design", tag: "CREATIVE", description: "Shape a travel experience that feels clear, human and beautifully intentional." },
  { title: "Visa Operations", tag: "OPERATIONS", description: "Make applications move smoothly through the real-world visa process." },
  { title: "Growth", tag: "GROWTH", description: "Help more travellers discover a smarter and simpler way to plan their journeys." },
];
const VALUES = [
  ["Own the outcome", "Take responsibility from the first idea to the final detail."],
  ["Ship it", "Own the whole thing. Finish what you start."],
  ["Move with purpose", "Learn quickly, make thoughtful decisions and keep moving."],
  ["Care deeply", "Sweat the small details that make an experience feel effortless."],
  ["No asterisk", "Say what you mean. Do what you said."],
];

function Counter({ end, suffix = "", run, duration = 1800 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let s = null, f;
    const tick = (t) => { if (!s) s = t; const k = Math.min((t - s) / duration, 1); setV(Math.floor(end * (1 - Math.pow(1 - k, 3)))); if (k < 1) f = requestAnimationFrame(tick); };
    f = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(f);
  }, [run, end, duration]);
  return <>{v}{suffix}</>;
}

/* ================= page ================= */
function Career() {
  const cvs = useRef(null), beatEls = useRef([]), pinEls = useRef([]);
  const barRef = useRef(null), cutRef = useRef(null), cDlg = useRef(null), dDlg = useRef(null);
  const goRef = useRef(() => {});
  const [active, setActive] = useState(0), [chap, setChap] = useState(0);
  const [staticMode, setStaticMode] = useState(false);
  const [country, setCountry] = useState(null), [ready, setReady] = useState(false);
  const [role, setRole] = useState(ROLES[0]);

  const openCountry = (p) => { setCountry(p); setReady(false); cDlg.current?.showModal(); setTimeout(() => setReady(true), 700); };
  const openRole = (r) => { setRole(r); dDlg.current?.showModal(); };

  useEffect(() => {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cvs.current, antialias: true, powerPreference: "high-performance" }); }
    catch (e) { setStaticMode(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 3500);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.6);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004;
    Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 28, bottom: -28, near: 1, far: 160 });
    sun.shadow.camera.updateProjectionMatrix();
    const warm = new THREE.PointLight(0xffb070, 0, 60);
    scene.add(hemi, sun, warm);
    const G = [0, 1, 2, 3, 4].map(() => { const g = new THREE.Group(); scene.add(g); return g; });
    const bgC = new THREE.Color("#000");

    /* ---- shared: stars, glow, earth ---- */
    const sp = [];
    for (let i = 0; i < 2200; i++) { const u = Math.random() * 6.283, v = Math.acos(2 * Math.random() - 1); sp.push(900 * Math.sin(v) * Math.cos(u), 900 * Math.cos(v), 900 * Math.sin(v) * Math.sin(u)); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, transparent: true, fog: false }));
    scene.add(stars);
    const glowTex = tex(256, 256, (c) => { const g = c.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, "rgba(255,246,225,1)"); g.addColorStop(0.2, "rgba(255,190,120,.7)"); g.addColorStop(0.5, "rgba(255,120,70,.2)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
    const mkGlow = (parent, x, y, z, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); sp.position.set(x, y, z); sp.scale.setScalar(s); parent.add(sp); return sp; };
    const { map, lights, clouds } = earthTex();
    const atmos = new THREE.ShaderMaterial({
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { c: { value: new THREE.Color(0x5a8cff) } },
      vertexShader: "varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader: "varying vec3 n;uniform vec3 c;void main(){float i=pow(max(.72-dot(n,vec3(0,0,1.)),0.),3.);gl_FragColor=vec4(c*i*1.8,1.);}",
    });
    const makeEarth = (r) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 96, 96), new THREE.MeshStandardMaterial({ map, emissiveMap: lights, emissive: 0xffc477, emissiveIntensity: 0.5, roughness: 0.85 })));
      const cl = new THREE.Mesh(new THREE.SphereGeometry(r * 1.012, 96, 96), new THREE.MeshStandardMaterial({ map: clouds, transparent: true, depthWrite: false, roughness: 1 }));
      g.add(cl); g.userData.clouds = cl;
      g.add(new THREE.Mesh(new THREE.SphereGeometry(r * 1.08, 64, 64), atmos));
      return g;
    };

    /* ================= S0: sunrise earth + visa book ================= */
    const E0 = makeEarth(14); E0.position.set(7, -15, -22); G[0].add(E0);
    const glow0 = mkGlow(G[0], -4, -1.5, -38, 16);

    const PW = 3.2, PH = 4.4;
    const navy = mat(0x0b1226, { roughness: 0.55 }), cream = mat(0xefe6d2, { roughness: 0.9 });
    const coverTex = tex(512, 704, (c, w, h) => {
      c.fillStyle = "#0b1226"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#b8924a"; c.lineWidth = 3; c.strokeRect(34, 34, w - 68, h - 68);
      c.fillStyle = "#c9a45c"; c.textAlign = "center";
      c.font = "bold 92px Georgia"; c.fillText("visago", w / 2, 300);
      c.font = "bold 44px Arial"; c.letterSpacing = "10px"; c.fillText("PASSPORT", w / 2, 560);
      c.font = "22px Arial"; c.letterSpacing = "4px"; c.fillText("CITIZEN OF THE WORLD", w / 2, 600);
    });
    const visaTex = tex(512, 704, (c, w, h) => {
      c.fillStyle = "#efe6d2"; c.fillRect(0, 0, w, h);
      c.strokeStyle = "#d9cdb2"; c.lineWidth = 1; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(w / 2, h / 2, 40 + i * 12, 0, 6.28); c.stroke(); }
      c.fillStyle = "#8a8578"; c.font = "bold 17px Arial"; c.letterSpacing = "2px"; c.fillText("REPUBLIC OF EVERYWHERE · VISA PAGE 07", 36, 52);
      c.fillStyle = "#1c2a55"; c.font = "bold 42px Arial"; c.letterSpacing = "-1px"; c.fillText("START YOUR CAREER.", 36, 120); c.fillText("SEE THE WHOLE WORLD.", 36, 168);
      c.fillStyle = "#1e3a8a"; c.fillRect(36, 250, 290, 118); c.fillStyle = "#fff"; c.font = "bold 46px Arial"; c.fillText("VISA", 52, 312); c.font = "bold 20px Arial"; c.textAlign = "right"; c.fillText("THE WORLD", 312, 290); c.textAlign = "left";
      c.fillStyle = "#6a6a72"; c.font = "17px Arial"; c.letterSpacing = "0px";
      ["Type · Any adventure", "Entries · Unlimited", "Valid · For life", "Issued · on time, by visago"].forEach((t, i) => c.fillText(t, 62, 410 + i * 28));
      c.fillStyle = "#4a4a52"; c.font = "15px monospace"; c.fillText("P<WLD<<CITIZEN<OF<THE<WORLD<<<<<<<<<<<<", 20, 660); c.fillText("A7745901<2WLD0000000X9900007<<<<<<<<<06", 20, 682);
    });
    const stampTex = tex(512, 512, (c) => {
      c.strokeStyle = "#5057ea"; c.fillStyle = "#5057ea"; c.lineWidth = 8; c.beginPath(); c.arc(256, 256, 236, 0, 6.28); c.stroke();
      c.lineWidth = 4; c.beginPath(); c.arc(256, 256, 196, 0, 6.28); c.stroke();
      c.textAlign = "center"; c.textBaseline = "middle"; c.font = "bold 34px Arial"; c.letterSpacing = "0px";
      arc(c, "VISA APPROVED", 256, 256, 218, -Math.PI * 0.86, -Math.PI * 0.14);
      arc(c, "ON TIME · EVERY TIME", 256, 256, 218, Math.PI * 0.86, Math.PI * 0.14, true);
      c.font = "italic bold 110px Georgia"; c.fillText("visago", 256, 262);
    });
    const passport = new THREE.Group(); G[0].add(passport);
    box(PW, PH, 0.12, navy, 0, 0, -0.1, passport);
    const page = new THREE.Mesh(new THREE.PlaneGeometry(PW - 0.1, PH - 0.1), mat(0xffffff, { map: visaTex, roughness: 0.9 })); page.position.z = -0.03; passport.add(page);
    const imprint = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: stampTex, transparent: true, opacity: 0, depthWrite: false }));
    imprint.position.set(0.45, -0.55, -0.02); imprint.rotation.z = -0.25; passport.add(imprint);
    const hinge = new THREE.Group(); hinge.position.set(-PW / 2, 0, 0); passport.add(hinge);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(PW, PH, 0.1), [navy, navy, navy, navy, mat(0xffffff, { map: coverTex, roughness: 0.5 }), cream]);
    cover.position.set(PW / 2, 0, 0.06); hinge.add(cover);
    const stamp = new THREE.Group(); passport.add(stamp);
    box(1.5, 0.35, 1.5, mat(0x2a2623, { roughness: 0.5 }), 0, 0, 0, stamp);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), mat(0xa0582a, { roughness: 0.35, metalness: 0.4 })); knob.position.y = 0.65; stamp.add(knob);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.45, 16), mat(0xdddddd)); neck.position.y = 0.3; stamp.add(neck);
    stamp.rotation.set(0.5, 0, -0.25);

    /* ================= shared airplane (runway + flight) ================= */
    const plane = new THREE.Group(); scene.add(plane);
    const gear = new THREE.Group(); gear.position.y = -0.2; plane.add(gear);
    const wings = [];
    (() => {
      const white = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.32, metalness: 0.25, side: THREE.DoubleSide });
      const blue = mat(0x5057ea, { roughness: 0.4, metalness: 0.2, side: THREE.DoubleSide });
      const dark = mat(0x161923, { roughness: 0.5 }), grey = mat(0x8d94a3, { roughness: 0.35, metalness: 0.6 });
      const prof = [[0, -6.3], [0.32, -6.05], [0.68, -5.4], [0.9, -4.3], [0.97, -2.5], [0.97, 3], [0.82, 5], [0.5, 6.2], [0.14, 6.8], [0, 6.9]].map(([r, y]) => new THREE.Vector2(r, y));
      plane.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 40).rotateX(Math.PI / 2), white));
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.985, 0.985, 0.55, 40, 1, true).rotateX(Math.PI / 2), blue); band.position.z = -2.3; plane.add(band);
      const cock = box(1.45, 0.26, 0.8, dark, 0, 0.42, -5.15, plane); cock.rotation.x = -0.28;
      const wg = new THREE.BoxGeometry(0.02, 0.15, 0.13), wm = mat(0x1a2030, { roughness: 0.3 });
      for (let i = 0; i < 24; i++) [-1, 1].forEach((s) => { const w = new THREE.Mesh(wg, wm); w.position.set(s * 0.97, 0.3, -3.6 + i * 0.32); plane.add(w); });
      const sw = (x0, x1, le0, te0, le1, te1, th) => {
        const s = new THREE.Shape(); s.moveTo(x0, le0); s.lineTo(x1, le1); s.lineTo(x1, te1); s.lineTo(x0, te0); s.closePath();
        return new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false }).translate(0, 0, -th / 2).rotateX(Math.PI / 2);
      };
      const pair = (geo, m, y, rz, keep) => [1, -1].forEach((s) => { const o = new THREE.Mesh(geo, m); o.scale.x = s; o.position.y = y; o.rotation.z = rz; plane.add(o); if (keep) wings.push(o); });
      pair(sw(0.8, 7.2, -0.8, 1.9, 2.6, 3.4, 0.14), white, -0.35, 0.07, true);
      pair(sw(0.4, 3.6, 4.4, 6.0, 5.6, 6.4, 0.1), white, 0.3, 0.05);
      const fs = new THREE.Shape(); fs.moveTo(-3.9, 0.6); fs.lineTo(-6.5, 0.6); fs.lineTo(-6.5, 3.5); fs.lineTo(-5.6, 3.5); fs.closePath();
      plane.add(new THREE.Mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.1, bevelEnabled: false }).translate(0, 0, -0.05).rotateY(Math.PI / 2), blue));
      [-2.7, 2.7].forEach((x) => {
        const e = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 2.3, 24).rotateX(Math.PI / 2), grey); e.position.set(x, -0.95, 0.1); plane.add(e);
        const f = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.05, 24).rotateX(Math.PI / 2), dark); f.position.set(x, -0.95, -1.05); plane.add(f);
        box(0.12, 0.6, 1.2, white, x, -0.55, 0.5, plane);
      });
      const wheel = new THREE.CylinderGeometry(0.4, 0.4, 0.28, 16).rotateZ(Math.PI / 2), tyre = mat(0x15161a, { roughness: 0.9 });
      const leg = (x, z, h, dbl) => {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, h, 8), grey); st.position.set(x, -1.8 + h / 2 + 0.2, z); gear.add(st);
        (dbl ? [-0.2, 0.2] : [0]).forEach((o) => { const w = new THREE.Mesh(wheel, tyre); w.position.set(x + o, -1.8 - 0.2 + 0.2, z); gear.add(w); });
      };
      leg(0, -4.3, 1.1, false); leg(1.7, 1.0, 1.4, true); leg(-1.7, 1.0, 1.4, true);
    })();
    plane.traverse((o) => { if (o.isMesh) o.castShadow = false; });

    /* ================= S1: runway at dawn ================= */
    const R = G[1];
    const dawnTex = tex(8, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); [[0, "#1c2860"], [0.3, "#5f6aa8"], [0.48, "#d6908e"], [0.56, "#f4b48a"], [1, "#f4b48a"]].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const grassGround = rep(tex(256, 256, (c, w, h) => {
      c.fillStyle = "#4a5a34"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 5000; i++) { c.fillStyle = `hsl(${70 + Math.random() * 30},${25 + Math.random() * 20}%,${20 + Math.random() * 18}%)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 3); }
    }), 220, 220);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4200, 4200), mat(0xffffff, { map: grassGround, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.z = -900; R.add(ground);
    const asphalt = rep(tex(128, 512, (c, w, h) => {
      c.fillStyle = "#2b2d31"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 3500; i++) { const g = 30 + Math.random() * 28; c.fillStyle = `rgba(${g},${g},${g + 3},.6)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      c.fillStyle = "rgba(10,10,12,.28)"; c.fillRect(48, 0, 10, h); c.fillRect(70, 0, 10, h);
      c.fillStyle = "#e8e6df"; c.fillRect(6, 0, 4, h); c.fillRect(118, 0, 4, h); c.fillRect(62, 0, 4, 230);
    }), 1, 8.2);
    const runway = new THREE.Mesh(new THREE.PlaneGeometry(46, 1500), mat(0xffffff, { map: asphalt, roughness: 0.75 })); runway.rotation.x = -Math.PI / 2; runway.position.set(0, 0.03, -710); R.add(runway);
    const keysTex = tex(256, 128, (c, w, h) => { c.fillStyle = "#2b2d31"; c.fillRect(0, 0, w, h); c.fillStyle = "#e8e6df"; for (let i = 0; i < 8; i++) { c.fillRect(8 + i * 15, 10, 9, 108); c.fillRect(136 + i * 15, 10, 9, 108); } });
    const keys = new THREE.Mesh(new THREE.PlaneGeometry(46, 18), mat(0xffffff, { map: keysTex, roughness: 0.75 })); keys.rotation.x = -Math.PI / 2; keys.position.set(0, 0.05, -18); R.add(keys);
    const lampGeo = new THREE.SphereGeometry(0.22, 8, 8), lamps = new THREE.InstancedMesh(lampGeo, new THREE.MeshBasicMaterial({ color: 0xfff0c8 }), 150), dm = new THREE.Object3D();
    for (let i = 0; i < 75; i++) [-24, 24].forEach((x, k) => { dm.position.set(x, 0.25, 30 - i * 20); dm.updateMatrix(); lamps.setMatrixAt(i * 2 + k, dm.matrix); });
    R.add(lamps);
    const bandTex = tex(512, 64, (c, w, h) => { c.fillStyle = "#1a1f2e"; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = Math.random() < 0.8 ? "#ffd9a0" : "#3a4260"; c.fillRect(6 + i * 12.6, 14, 9, 36); } });
    const tm = new THREE.MeshStandardMaterial({ map: bandTex, emissiveMap: bandTex, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.6 });
    box(150, 14, 36, tm, -115, 7, -140, R); box(60, 8, 24, mat(0x2d3140), -190, 4, -110, R);
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.4, 44, 16), mat(0xcfc8bf)); tw.position.set(-70, 22, -90); R.add(tw);
    box(9, 5, 9, new THREE.MeshStandardMaterial({ color: 0x223, emissive: 0xffd9a0, emissiveIntensity: 0.7 }), -70, 46, -90, R);
    const mtnTex = tex(1024, 160, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#8a82ab"); g.addColorStop(1, "#6a6590");
      c.fillStyle = g; c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 4) c.lineTo(x, h - 28 - fbm(x * 0.006, 1.3, 0.2, 4) * 120);
      c.lineTo(w, h); c.fill();
    });
    const mtn = new THREE.Mesh(new THREE.PlaneGeometry(4200, 330), new THREE.MeshBasicMaterial({ map: mtnTex, transparent: true, fog: false })); mtn.position.set(0, 120, -2200); R.add(mtn);
    const glowR = mkGlow(R, -230, 40, -2000, 700);

    /* ================= S2: flight through clouds ================= */
    const F = G[2];
    const cloudTex = () => tex(256, 256, (c, w, h) => {
      for (let i = 0; i < 40; i++) {
        const a = Math.random() * 6.283, d = Math.random() * Math.random() * 70, x = 128 + Math.cos(a) * d * 1.4, y = 140 + Math.sin(a) * d * 0.7, r = 26 + Math.random() * 36;
        const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,255,255,.5)"); g.addColorStop(0.6, "rgba(255,255,255,.17)"); g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      }
      c.globalCompositeOperation = "source-atop";
      const sh = c.createLinearGradient(0, 60, 0, 215); sh.addColorStop(0, "rgba(255,255,255,0)"); sh.addColorStop(1, "rgba(105,118,152,.6)");
      c.fillStyle = sh; c.fillRect(0, 0, w, h);
    });
    const cTex = [0, 1, 2, 3].map(cloudTex);
    const addCloud = (x, y, z, sc, tint, op) => {
      const n = 6 + ((Math.random() * 4) | 0);
      for (let i = 0; i < n; i++) {
        const m = new THREE.SpriteMaterial({ map: cTex[(Math.random() * 4) | 0], color: tint, transparent: true, opacity: op * (0.55 + Math.random() * 0.4), depthWrite: false, fog: false, rotation: (Math.random() - 0.5) * 0.5 });
        const s = new THREE.Sprite(m), w = sc * (0.7 + Math.random() * 0.6);
        s.scale.set(w, w * 0.62, 1); s.position.set(x + (Math.random() - 0.5) * sc * 1.1, y + (Math.random() - 0.4) * sc * 0.22, z + (Math.random() - 0.5) * sc * 0.6); F.add(s);
      }
    };
    for (let i = 0; i < 55; i++) {
      const z = -Math.random() * 580, py = (-z / 520) * 70, side = Math.random() < 0.5 ? -1 : 1;
      addCloud(side * (20 + Math.random() * 140), py + (Math.random() - 0.5) * 90, z, 40 + Math.random() * 60, 0xffe8d6, 0.9);
    }
    for (let i = 0; i < 30; i++) { const z = -Math.random() * 600, py = (-z / 520) * 70; addCloud((Math.random() - 0.5) * 320, py - 55 - Math.random() * 20, z, 90 + Math.random() * 80, 0xbcc6e0, 0.95); }
    const glowF = mkGlow(F, -140, 30, -1100, 600);

    /* ================= S3: earth from space ================= */
    const E2 = makeEarth(60); E2.position.set(0, -14, 0); G[3].add(E2);
    PINS.forEach((p) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff5a46 })); d.position.copy(p.local); E2.add(d); });

    /* ================= S4: arrival building ================= */
    const B = G[4];
    const skyTex = tex(8, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); [[0, "#1b1448"], [0.35, "#5a3a7a"], [0.6, "#c9708a"], [0.75, "#f0a078"], [0.76, "#2a2a60"], [1, "#161a42"]].forEach(([o, col]) => g.addColorStop(o, col)); c.fillStyle = g; c.fillRect(0, 0, w, h); });
    const winTex = tex(512, 512, (c, w, h) => {
      c.fillStyle = "#a8705a"; c.fillRect(0, 0, w, h);
      for (let r = 0; r < 64; r++) for (let k = 0; k < 17; k++) { c.fillStyle = `hsl(${12 + Math.random() * 8},${35 + Math.random() * 10}%,${36 + Math.random() * 12}%)`; c.fillRect(k * 32 - (r % 2 ? 16 : 0) + 1, r * 8 + 1, 30, 6); }
      for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) {
        const x = 30 + k * 120, y = 24 + r * 122;
        c.fillStyle = "#e8dccb"; c.fillRect(x - 7, y - 7, 94, 102); c.fillRect(x - 10, y + 88, 100, 8);
        const g = c.createLinearGradient(x, y, x + 80, y + 88);
        if (Math.random() < 0.22) { g.addColorStop(0, "#ffd391"); g.addColorStop(1, "#f0a95a"); } else { g.addColorStop(0, "#3a4a78"); g.addColorStop(1, "#1a2240"); }
        c.fillStyle = g; c.fillRect(x, y, 80, 88); c.fillStyle = "#e8dccb"; c.fillRect(x + 38, y, 4, 88); c.fillRect(x, y + 42, 80, 4);
      }
    });
    const grassTex = rep(tex(256, 256, (c, w, h) => {
      c.fillStyle = "#3b6b2c"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 6000; i++) { c.fillStyle = `hsl(${80 + Math.random() * 35},${35 + Math.random() * 25}%,${16 + Math.random() * 22}%)`; c.fillRect(Math.random() * w, Math.random() * h, 2, 3); }
    }), 18, 12);
    const leafTex = rep(tex(128, 128, (c, w, h) => {
      c.fillStyle = "#4d7a35"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 1600; i++) { c.fillStyle = `hsl(${85 + Math.random() * 40},${35 + Math.random() * 25}%,${16 + Math.random() * 24}%)`; c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 3, 1.6, Math.random() * 3, 0, 6.3); c.fill(); }
    }), 3, 3);
    const barkTex = rep(tex(64, 128, (c, w, h) => {
      c.fillStyle = "#4a3a2c"; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(${20 + Math.random() * 40},${15 + Math.random() * 25},10,.55)`; c.lineWidth = 1 + Math.random() * 2; const x = Math.random() * w; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (Math.random() - 0.5) * 8, h); c.stroke(); }
    }), 1, 2);
    const bark = mat(0xffffff, { map: barkTex, roughness: 1 });
    const foliage = new THREE.MeshStandardMaterial({ map: leafTex, vertexColors: true, roughness: 1, color: 0x86b05c });
    const conMat = new THREE.MeshStandardMaterial({ map: leafTex, roughness: 1, color: 0x3e6a3c });
    const blob = (seed) => {
      const g = new THREE.IcosahedronGeometry(1, 3), pa = g.attributes.position, col = [], v = new THREE.Vector3();
      for (let i = 0; i < pa.count; i++) {
        v.fromBufferAttribute(pa, i);
        const k = 0.72 + 0.6 * fbm(v.x * 2 + seed, v.y * 2 + seed * 0.7, v.z * 2, 3);
        v.multiplyScalar(k); pa.setXYZ(i, v.x, v.y * 0.86, v.z);
        const sh = 0.5 + 0.5 * clamp((v.y + 1) / 2); col.push(sh * 0.92, sh, sh * 0.82);
      }
      g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
    };
    const blobs = [3, 17, 41].map(blob);
    const decid = (x, z, k) => {
      const t = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * k, 0.3 * k, 2.8 * k, 10), bark); tr.position.y = 1.4 * k; t.add(tr);
      for (let i = 0; i < 3; i++) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * k, 0.1 * k, 1.5 * k, 6), bark); br.position.set(Math.cos(i * 2.1) * 0.4 * k, 3 * k, Math.sin(i * 2.1) * 0.4 * k); br.rotation.set(Math.sin(i * 2.1) * 0.6, 0, -Math.cos(i * 2.1) * 0.6); t.add(br); }
      for (let i = 0; i < 9; i++) {
        const m = new THREE.Mesh(blobs[i % 3], foliage), a = Math.random() * 6.283, d = Math.random() * 1.5 * k;
        m.position.set(Math.cos(a) * d, (3.3 + Math.random() * 1.6) * k, Math.sin(a) * d);
        m.scale.setScalar((1 + Math.random() * 0.7) * k); m.rotation.y = Math.random() * 6; t.add(m);
      }
      t.position.set(x, 0, z); t.rotation.y = Math.random() * 6; B.add(t);
    };
    const conifer = (x, z, k) => {
      const t = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * k, 0.2 * k, 1.4 * k, 8), bark); tr.position.y = 0.7 * k; t.add(tr);
      for (let i = 0; i < 5; i++) {
        const g = new THREE.ConeGeometry((1.6 - i * 0.28) * k, 1.9 * k, 14, 3), pa = g.attributes.position, v = new THREE.Vector3();
        for (let j = 0; j < pa.count; j++) { v.fromBufferAttribute(pa, j); const n = 1 + 0.18 * (fbm(v.x * 3 + i, v.y * 3, v.z * 3, 2) - 0.5); pa.setXYZ(j, v.x * n, v.y, v.z * n); }
        g.computeVertexNormals();
        const c = new THREE.Mesh(g, conMat); c.position.y = (1.6 + i * 1.05) * k; t.add(c);
      }
      t.position.set(x, 0, z); B.add(t);
    };
    const brick = mat(0xa8705a);
    const bld = new THREE.Mesh(new THREE.BoxGeometry(9, 8, 6), [brick, brick, brick, brick, mat(0xffffff, { map: winTex }), brick]); bld.position.y = 4; B.add(bld);
    box(9.5, 0.4, 6.5, mat(0xe9e3d8), 0, 8.2, 0, B);
    box(5, 1.8, 3, mat(0xf3efe6), 1, 9.3, -0.5, B);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 1.4, 16), mat(0x2a2a30)); tank.position.set(-2.5, 9.1, -1); B.add(tank);
    box(0.12, 6, 0.12, mat(0xc4452e), 4.8, 3, 3.1, B); box(0.12, 6, 0.12, mat(0xc4452e), 5.4, 3, 3.1, B);
    const signT = tex(512, 128, (c) => { c.fillStyle = "#f3efe6"; c.fillRect(0, 0, 512, 128); c.fillStyle = "#1c2a55"; c.font = "bold 84px Georgia"; c.fillText("visago", 120, 98); });
    const rs = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: signT })); rs.position.set(1, 9.3, 1.02); B.add(rs);
    const house = box(5, 3, 4, mat(0xeadfd0), -13, 1.5, 4, B); house.rotation.y = 0.2;
    box(5.6, 0.5, 4.6, mat(0xa8352c), -13, 3.2, 4, B);
    const island = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), mat(0xffffff, { map: grassTex, roughness: 1 })); island.rotation.x = -Math.PI / 2; island.position.set(0, 0, 4); B.add(island);
    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(26, 10), mat(0x8a8794, { roughness: 0.9 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(2, 0.02, 11); B.add(plaza);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), mat(0x1c2a55, { roughness: 0.18, metalness: 0.5 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.4, -60); B.add(sea);
    [[-6, 8, 1], [6.5, 9, 0.9], [12, 2, 1.2], [-16, -2, 1.1], [-8, -6, 1.3], [10, 8, 0.8], [17, 6, 1], [-20, 6, 1.1], [-11, 11, 0.8]].forEach(([x, z, k]) => decid(x, z, k));
    [[16, -5, 1], [-22, -4, 1.2], [21, 1, 0.9]].forEach(([x, z, k]) => conifer(x, z, k));
    [[-4.5, 9.5, 0xffffff], [-3.8, 9.5, 0xf08a3a]].forEach(([x, z, c]) => box(0.7, 1.6, 0.05, new THREE.MeshBasicMaterial({ color: c }), x, 1.4, z, B));
    B.traverse((o) => { if (o.isMesh) { o.castShadow = o !== sea && o !== island; o.receiveShadow = true; } });

    /* ---------- per-scene state ---------- */
    const SKY2 = [[0, "#e9a27c"], [0.2, "#8aa6d6"], [0.45, "#3f6fc0"], [0.7, "#12265a"], [0.9, "#02040e"]];
    const dp = new THREE.Vector3(), dl = new THREE.Vector3(), lk = new THREE.Vector3(), cpos = new THREE.Vector3();
    let sc = -1, snap = true, shake = 0;
    const apply = (n) => {
      sc = n; snap = true; G.forEach((g, i) => (g.visible = i === n));
      plane.visible = n === 1 || n === 2;
      stars.visible = n === 0 || n === 2 || n === 3;
      scene.fog = n === 1 ? new THREE.Fog(0xe3a888, 150, 1500) : n === 2 ? new THREE.Fog(0xe9a27c, 150, 700) : n === 4 ? new THREE.Fog(0x8a5f86, 60, 200) : null;
      scene.background = n === 1 ? dawnTex : n === 4 ? skyTex : bgC;
      const L = [
        [0x8899ff, 0.5, 2.4, [-8, 3, -4], 0xfff0dd],
        [0xffd9b8, 0.75, 2.4, [-80, 24, -120], 0xffc890],
        [0xcfe0ff, 0.8, 2.2, [-60, 35, 30], 0xffe0c0],
        [0x223355, 0.08, 3, [-120, 40, 100], 0xfff4e6],
        [0xd8b0ff, 0.9, 2.2, [-30, 14, 20], 0xff9d78],
      ][n];
      hemi.color.set(L[0]); hemi.intensity = L[1]; sun.intensity = L[2]; sun.position.set(...L[3]); sun.color.set(L[4]);
      sun.castShadow = n === 4;
    };

    const upd = [
      /* 0: visa book - ek hi baar khulti hai (phases overlap nahi karte) */
      (p, t) => {
        E0.rotation.y = p * 2 + t * 0.02; E0.userData.clouds.rotation.y = t * 0.01; E0.position.y = -15 - 3 * sstep(0.08, 0.2, p);
        bgC.set("#000"); stars.material.opacity = 1;
        glow0.material.opacity = 1 - sstep(0.08, 0.2, p); glow0.scale.setScalar(lerp(16, 40, sstep(0, 0.1, p)));
        const pa = sstep(0.03, 0.11, p), op = sstep(0.11, 0.17, p);
        passport.visible = pa > 0.001;
        passport.position.set((PW / 2) * op, lerp(-7, 0, pa) + Math.sin(t) * 0.06, 0);
        passport.rotation.set(0, (Math.sin(t * 0.7) * 0.1 + 0.5 * (1 - pa)) * (1 - op), -0.38 * (1 - op));
        hinge.rotation.y = -Math.PI * 0.97 * op;
        const st = sstep(0.17, 0.185, p), rise = sstep(0.195, 0.215, p);
        stamp.visible = p > 0.165 && rise < 1; stamp.position.set(0.5, -0.4 + (1 - st) * 2.8 + rise * 2.8, 0.45);
        imprint.material.opacity = sstep(0.185, 0.195, p); imprint.scale.setScalar(lerp(1.1, 1, sstep(0.185, 0.2, p)));
        warm.intensity = 70; warm.position.set(2, 3, 6); shake = 0;
        dp.set(0, 0.2, lerp(8, 5.2, sstep(0.08, 0.22, p))); dl.set(0, lerp(-2, 0, pa), -2);
      },
      /* 1: runway -> takeoff */
      (p, t) => {
        const s = (p - 0.22) / 0.2, lift = sstep(0.74, 1, s);
        warm.intensity = 0;
        plane.position.set(0, 2.2 + 55 * lift * lift + Math.sin(t * 55) * 0.012 * s * (1 - lift), -s * s * 340);
        plane.rotation.set(0.26 * sstep(0.64, 0.8, s), 0, Math.sin(t * 1.3) * 0.004 * lift);
        gear.scale.setScalar(Math.max(0.001, 1 - sstep(0.86, 1, s))); gear.visible = gear.scale.x > 0.01;
        wings.forEach((w) => (w.rotation.z = 0.07 + Math.sin(t * 1.7) * 0.008 + lift * 0.03));
        shake = 0.015 + 0.05 * Math.min(1, s * 1.4) * (1 - lift);
        glowR.material.opacity = 1;
        dp.set(-10 - 6 * lift, 3 + 16 * lift, plane.position.z + 26); dl.set(plane.position.x, plane.position.y + 0.6, plane.position.z - 6);
      },
      /* 2: flight through clouds */
      (p, t) => {
        const s = (p - 0.42) / 0.2;
        grad(SKY2, s, bgC); scene.fog.color.copy(bgC); stars.material.opacity = sstep(0.5, 0.9, s);
        const x = Math.sin(s * 4) * 7, y = s * 70, z = -s * 520;
        plane.position.set(x, y, z);
        plane.rotation.set(0.13 + Math.sin(t * 0.8) * 0.006, -Math.cos(s * 4) * 0.03, -Math.cos(s * 4) * 0.2);
        gear.scale.setScalar(0.001); gear.visible = false;
        wings.forEach((w) => (w.rotation.z = 0.1 + Math.sin(t * 1.4) * 0.012));
        glowF.material.opacity = 1 - sstep(0.05, 0.55, s); warm.intensity = 0; shake = 0.03;
        dp.set(x * 0.5 - 2 + Math.sin(t * 0.3) * 1.2, y + 3.4, z + 24); dl.set(x, y + 0.6, z - 10);
      },
      /* 3: earth from space */
      (p, t) => {
        const s = (p - 0.62) / 0.16;
        bgC.set("#000"); stars.material.opacity = 1; warm.intensity = 0; shake = 0;
        E2.rotation.y = t * 0.025 + p * 2; E2.userData.clouds.rotation.y = t * 0.006;
        const a = lerp(-0.7, 0.15, s), d = lerp(200, 135, s);
        dp.set(Math.sin(a) * d * 0.5, lerp(26, 8, s), Math.cos(a) * d); dl.set(0, -10, 0);
      },
      /* 4: arrival */
      (p, t) => {
        const s = (p - 0.78) / 0.22; warm.intensity = 0; shake = 0;
        dp.set(lerp(-15, -7, s) + Math.sin(t * 0.3) * 0.3, lerp(5, 3.4, s), lerp(21, 13, s)); dl.set(lerp(1, 3, s), lerp(3.5, 4, s), 0);
      },
    ];

    /* ---------- smooth scroll: native scroll + damped progress (no wheel hijack, no scroll fighting) ---------- */
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxY = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    goRef.current = (f) => window.scrollTo({ top: clamp(f, 0, 1) * maxY(), behavior: reduced ? "auto" : "smooth" });
    const resize = () => { renderer.setSize(window.innerWidth, window.innerHeight, false); cam.aspect = window.innerWidth / window.innerHeight; cam.updateProjectionMatrix(); };
    resize();
    window.addEventListener("resize", resize);

    const v = new THREE.Vector3(), nv = new THREE.Vector3(), tc = new THREE.Vector3(), sv = new THREE.Vector3();
    const clock = new THREE.Clock();
    let cur = clamp(window.scrollY / maxY()), raf, last = performance.now(), lastBeat = -1, lastChap = -1;
    apply(0);
    const loop = () => {
      const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
      const t = clock.getElapsedTime();
      const target = clamp(window.scrollY / maxY());
      cur += (target - cur) * (reduced ? 1 : 1 - Math.exp(-dt * 5.5));
      const p = cur;

      const n = p < BOUNDS[0] ? 0 : p < BOUNDS[1] ? 1 : p < BOUNDS[2] ? 2 : p < BOUNDS[3] ? 3 : 4;
      if (n !== sc) apply(n);
      upd[n](p, t);
      const kc = 1 - Math.exp(-dt * 7);
      if (snap) { cpos.copy(dp); lk.copy(dl); snap = false; }
      cpos.lerp(dp, kc); lk.lerp(dl, kc);
      cam.position.copy(cpos).add(sv.set(Math.sin(t * 37) * shake, Math.sin(t * 29 + 1) * shake, 0));
      cam.lookAt(lk);
      stars.position.copy(cam.position);
      cam.updateMatrixWorld(); E2.updateMatrixWorld(true);

      let best = -1, bi = 0, oWorld = 0;
      BEATS.forEach((b, i) => {
        const f = 0.02, o = sstep(b.a, b.a + f, p) * (1 - sstep(b.b - f, b.b, p)), el = beatEls.current[i];
        if (el) { el.style.opacity = o; el.style.transform = `translateY(${(1 - o) * (p < (b.a + b.b) / 2 ? 26 : -26)}px)`; el.dataset.live = o > 0.6 ? "1" : "0"; }
        if (b.id === "world") oWorld = o;
        if (o > best) { best = o; bi = i; }
      });
      if (bi !== lastBeat) { lastBeat = bi; setActive(bi); }
      const ci = CHAPTERS.reduce((a, c, i) => (p >= c[0] ? i : a), 0);
      if (ci !== lastChap) { lastChap = ci; setChap(ci); }

      PINS.forEach((pin, i) => {
        const el = pinEls.current[i]; if (!el) return;
        v.copy(pin.local); E2.localToWorld(v);
        nv.copy(v).sub(E2.position).normalize(); tc.copy(cam.position).sub(v).normalize();
        const face = clamp((nv.dot(tc) - 0.05) * 6); v.project(cam);
        const op = n === 3 && v.z < 1 ? oWorld * face : 0;
        el.style.opacity = op; el.style.visibility = op > 0.02 ? "visible" : "hidden"; el.style.pointerEvents = op > 0.5 ? "auto" : "none";
        el.style.transform = `translate(${(v.x * 0.5 + 0.5) * window.innerWidth - 15}px,${(-v.y * 0.5 + 0.5) * window.innerHeight - 15}px)`;
      });

      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      if (cutRef.current) cutRef.current.style.opacity = Math.max(...BOUNDS.map((b) => 1 - sstep(0, 0.018, Math.abs(p - b))));
      renderer.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    };
  }, []);

  const goTo = (f) => goRef.current(f);

  /* ---------------- beat content ---------------- */
  const content = {
    hero: (
      <>
        <h1>Your <em>journey</em><br />to a more open world<br />starts here.</h1>
        <div className="saber" aria-hidden="true"><div className="saber-blade" /><div className="saber-tip">▼</div></div>
      </>
    ),
    mission: (
      <>
        <h2>Our <em>Mission</em></h2>
        <p>Make international travel feel simple again.</p>
        <p>We are building technology that makes travel simpler, clearer and more human — one journey at a time.</p>
      </>
    ),
    fly: (
      <>
        <h2>Small team. <em>Big altitude.</em></h2>
        <div className="stat-row">
          {[[1, "", "mission"], [24, "/7", "curiosity"], [100, "%", "ownership"]].map(([e, s, l]) => (
            <div key={l}><b className="stat-value"><Counter end={e} suffix={s} run={active === 2} /></b><span className="stat-label">{l}</span></div>
          ))}
        </div>
      </>
    ),
    world: (
      <>
        <h2>Making the world a <em>smaller</em> place.</h2>
        <p>From Chandigarh to everywhere. Tap a pin to see where travellers are headed.</p>
      </>
    ),
    values: (
      <>
        <h2>The five things<br />we <em>actually</em> mean.</h2>
        <div className="value-deck">
          {VALUES.map(([t, d]) => <div className="value-card" key={t}><b>{t}</b><span>{d}</span></div>)}
        </div>
      </>
    ),
    roles: (
      <div className="finale-panel">
        <h2><em>Not</em> for everyone.</h2>
        <p>But probably for you, if you’ve read this far. Fast, unglamorous, and mostly unmapped. If that reads like a warning, good. If it reads like an invitation, take the lift.</p>
        <div className="dept-strip">
          {ROLES.map((r) => <button key={r.title} className="ticket paper" onClick={() => openRole(r)}>{r.title}</button>)}
        </div>
        <div className="finale-meta"><Link to="/">Home</Link> · <Link to="/on-time-guaranteed">On Time Guarantee</Link> · <Link to="/sign-in">Sign in</Link> · © 2026 VisaGo</div>
      </div>
    ),
  };

  return (
    <div className={`vj ${staticMode ? "vj-static" : ""}`}>
      <canvas ref={cvs} className="vj-canvas" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div ref={cutRef} className="cut" aria-hidden="true" />
      <div ref={barRef} className="bar" aria-hidden="true" />

      <header className="nav">
        <Link to="/" className="logo">visago<i /><span>Careers</span></Link>
        <nav>
          {NAV.map(([l, f]) => <button key={l} className="nav-link" onClick={() => goTo(f)}>{l}</button>)}
          <button className="ticket" onClick={() => openRole(ROLES[0])}>View open roles <i className="perf" /> ↗</button>
        </nav>
      </header>

      <div className="chapter"><span className="chapter-dot" />{CHAPTERS[chap][1]}</div>

      <ul className="globe-pins">
        {PINS.map((p, i) => (
          <li key={p.name}>
            <button ref={(el) => (pinEls.current[i] = el)} className="globe-pin" onClick={() => openCountry(p)} aria-label={`${p.name}, ${p.landmark}`}>
              <span className="pin-dot" /><span className="pin-name">{p.name}</span>
            </button>
          </li>
        ))}
      </ul>

      {BEATS.map((b, i) => (
        <section key={b.id} ref={(el) => (beatEls.current[i] = el)} className={`beat beat-${b.id}`}>
          <div className="rail">{content[b.id]}</div>
          {b.id === "roles" && (
            <div className="enter-dock">
              <button className="ticket enter" onClick={() => openRole(ROLES[0])}>→ This is where we build</button>
            </div>
          )}
        </section>
      ))}

      <div className="spacer" />

      <dialog ref={cDlg} className="country-dialog" onClick={(e) => e.target === cDlg.current && cDlg.current.close()}>
        {country && (
          <div className="dlg-inner">
            <div className="dlg-head">
              <div><p className="dlg-sub">{country.landmark}</p><h3 className="dlg-title">{country.name}</h3></div>
              <button className="ticket paper" onClick={() => cDlg.current.close()}>Close</button>
            </div>
            <div className="country-stage" data-state={ready ? "ready" : "loading"}><span className="stage-icon">{country.icon}</span></div>
          </div>
        )}
      </dialog>

      <dialog ref={dDlg} className="dept-dialog" onClick={(e) => e.target === dDlg.current && dDlg.current.close()}>
        <div className="dlg-inner">
          <div className="dlg-head">
            <div><p className="dlg-sub">{role.tag}</p><h3 className="dlg-title">{role.title}</h3></div>
            <button className="ticket paper" onClick={() => dDlg.current.close()}>Close</button>
          </div>
          <p className="dlg-text">{role.description}</p>
          <div className="role-list">
            {ROLES.map((r) => <button key={r.title} className="role-row" onClick={() => setRole(r)}>{r.title}<em>{r.tag}</em><span>↗</span></button>)}
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Career;