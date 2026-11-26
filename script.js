"use strict";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = "css_discord_v3", OLD = "css_discord_v2", HK = OLD + "_h", TK = OLD + "_tour";
const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);
const BASES = {
  system24: "https://refact0r.github.io/system24/build/system24.css",
  midnight: "https://refact0r.github.io/midnight-discord/build/midnight.css",
};
const FONTS = { "DM Mono": [300, "-0.05ch"], "JetBrains Mono": [400, "-0.05ch"], "Fira Code": [400, "-0.05ch"], Figtree: [400, "0"], Inter: [400, "0"], Nunito: [400, "0"] };
// [nombre, fondo, acento, secreto]  (el orden de los primeros 11 no se toca por la config guardada)
const SCHEMES = [
  ["Desde mi imagen"], ["Original", "#121017", "#9d7cd6"], ["Tokyo Night", "#1a1b26", "#7aa2f7"], ["Catppuccin", "#1e1e2e", "#cba6f7"],
  ["Dracula", "#282a36", "#bd93f9"], ["Nord", "#2e3440", "#88c0d0"], ["Rosé Pine", "#191724", "#ebbcba"], ["Gruvbox", "#282828", "#fabd2f"],
  ["Sakura", "#1f1418", "#f5a9c8"], ["Matrix", "#050a05", "#33ff66"], ["Sunset", "#1c1112", "#ff7a59"],
  ["Catppuccin Macchiato", "#24273a", "#c6a0f6"], ["Catppuccin Frappe", "#303446", "#ca9ee6"], ["Rosé Pine Moon", "#232136", "#c4a7e7"],
  ["Solarized Dark", "#002b36", "#2aa198"], ["One Dark", "#282c34", "#61afef"], ["Monokai", "#272822", "#a6e22e"],
  ["Everforest", "#2d353b", "#a7c080"], ["Kanagawa", "#1f1f28", "#7e9cd8"], ["Ayu Mirage", "#1f2430", "#ffcc66"],
  ["Material Ocean", "#0f111a", "#84ffff"], ["Night Owl", "#011627", "#82aaff"], ["Synthwave", "#241b2f", "#ff7edb"],
  ["Cyberpunk", "#0b0f1a", "#fcee0a"], ["Tomorrow Night", "#1d1f21", "#81a2be"], ["Palenight", "#292d3e", "#c792ea"],
  ["Cobalt", "#193549", "#ffc600"], ["Oceanic", "#1b2b34", "#6699cc"], ["Poimandres", "#1b1e28", "#5de4c7"],
  ["Vesper", "#101010", "#ffc799"], ["GitHub Dark", "#0d1117", "#58a6ff"], ["OLED", "#000000", "#8b5cf6"],
  ["Sangre", "#120808", "#e11d48"], ["Mono", "#111111", "#e5e5e5"], ["Lavanda", "#17141f", "#b69cff"],
  ["Cafe", "#1a1410", "#d4a373"], ["Menta oscura", "#0d1614", "#4fd1a5"], ["Hielo", "#0e1620", "#9ad7ff"],
  ["Vaporwave", "#120a24", "#ff71ce", 1],
];
// [id, nombre, oscuro, bg, card, texto, texto suave, borde, secreto]
const PG = [
  ["original", "Original", 1, "#0d0a14", "#151120", "#f3f3f6", "#a6adc8", "#2b253d"],
  ["medianoche", "Medianoche", 1, "#0a0f1f", "#111a33", "#e8ecff", "#96a0c8", "#243055"],
  ["carbon", "Carbon", 1, "#0f0f10", "#18181a", "#ececec", "#9a9a9f", "#2c2c30"],
  ["bosque", "Bosque", 1, "#08130e", "#0f1f17", "#e6f4ea", "#8fb09b", "#1f3a2b"],
  ["papel", "Papel", 0, "#f3ecdf", "#fbf6ec", "#2b2620", "#7a6f60", "#dcd0bb"],
  ["nieve", "Nieve", 0, "#eef3f8", "#ffffff", "#1c2430", "#5d6b7d", "#d3dce8"],
  ["menta", "Menta", 0, "#e6f4ee", "#f7fcf9", "#14301f", "#4f7a63", "#bfe0cf"],
  ["neon", "Neon", 1, "#0b0620", "#150b33", "#ffe9fb", "#c79bd9", "#4a1d7a", 1],
];
const PAGE = ["pg", "bgfx", "snd", "conf", "tipd", "hmax", "mini", "secret"];
const DEF = {
  base: "system24", scheme: 1, pal: [[157, 124, 214], [192, 202, 245], [187, 154, 247], [137, 180, 250], [245, 194, 231]], pi: 0, custom: "",
  font: "DM Mono", radius: 5, opacity: 85, gap: 12, border: 2, bgurl: "", blur: 1, trans: 1, small: 1, labels: 1, anim: 1,
  msg: 1, msgText: "Meow :3\n(Waiting for something to happen?)", pad: 40,
  gift: 1, btns: 1, sup: 1, gifb: 0, np: 0, help: 0, members: 0, scrolloff: 0,
  ment: 1, glow: 1, glowR: 8, glowO: 100, hov: 0, emb: 0, react: 0, fsz: 0, fsize: 15, inputglow: 0,
  scroll: 1, sel: 1, extra: "",
  prof: 0, p1: "#121017", p2: "#9d7cd6", shape: "circle", size: "512",
  pg: "original", bgfx: 1, snd: 0, conf: 1, tipd: 250, hmax: 6, mini: 1, secret: 0,
};
// controles: t = tgl | rng | sel | txt | txt1 | area ; g/c = grupo ; dep = depende de otro toggle ; tip = "titulo|desc|codigo|ayuda"
const THEME_UI = [
  { g: "Estilo", t: "sel", k: "base", l: "Tema base", a: Object.keys(BASES), tip: "Tema base|Se importa desde github, necesitas internet.|@import url(...);|base" },
  { g: "Estilo", t: "sel", k: "font", l: "Fuente", a: ["Default", ...Object.keys(FONTS)] },
  { g: "Estilo", t: "rng", k: "radius", l: "Bordes suavizados", a: 0, b: 20, u: "px" },
  { g: "Estilo", t: "rng", k: "opacity", l: "Opacidad del fondo", a: 0, b: 100, u: "%" },
  { g: "Estilo", t: "rng", k: "gap", l: "Separacion de paneles", a: 0, b: 24, u: "px" },
  { g: "Estilo", t: "rng", k: "border", l: "Grosor de bordes", a: 0, b: 6, u: "px" },
  { g: "Estilo", t: "txt1", k: "bgurl", l: "Fondo de discord (url de imagen)", tip: "Fondo de discord|Pone una imagen de fondo en discord. Se ve mejor con la opacidad del fondo baja.|--background-image: on;" },
  { g: "Opciones", t: "tgl", k: "blur", l: "Blur en paneles" }, { g: "Opciones", t: "tgl", k: "trans", l: "Transparencia" },
  { g: "Opciones", t: "tgl", k: "small", l: "Panel de usuario chico" }, { g: "Opciones", t: "tgl", k: "labels", l: "Etiquetas de paneles" }, { g: "Opciones", t: "tgl", k: "anim", l: "Animaciones" },
];
const QUICK_UI = [
  { c: "Perfil", t: "tgl", k: "msg", l: "Texto custom en perfil" },
  { c: "Perfil", t: "txt", k: "msgText", l: "Texto", dep: "msg" },
  { c: "Perfil", t: "rng", k: "pad", l: "Padding/Altura Banner", a: 10, b: 100, u: "px", dep: "msg" },
  { c: "Ocultar", t: "tgl", k: "gift", l: "Ocultar boton Nitro" },
  { c: "Ocultar", t: "tgl", k: "btns", l: "Ocultar botones extra (Tienda/Llamadas)" },
  { c: "Ocultar", t: "tgl", k: "sup", l: "Ocultar superreacciones" },
  { c: "Ocultar", t: "tgl", k: "gifb", l: "Ocultar GIF y stickers" },
  { c: "Ocultar", t: "tgl", k: "np", l: "Ocultar Active Now" },
  { c: "Ocultar", t: "tgl", k: "help", l: "Ocultar boton de ayuda" },
  { c: "Ocultar", t: "tgl", k: "members", l: "Ocultar lista de miembros" },
  { c: "Ocultar", t: "tgl", k: "scrolloff", l: "Ocultar scrollbars" },
  { c: "Chat", t: "tgl", k: "ment", l: "Color en menciones" },
  { c: "Chat", t: "tgl", k: "glow", l: "Efecto brillo en links", tip: "Brillo en links|Le da un resplandor a los links y nombres.|text-shadow: 0 0 8px;" },
  { c: "Chat", t: "rng", k: "glowR", l: "Radio de brillo (Glow)", a: 2, b: 25, u: "px", dep: "glow" },
  { c: "Chat", t: "rng", k: "glowO", l: "Opacidad del resplandor", a: 10, b: 100, u: "%", dep: "glow" },
  { c: "Chat", t: "tgl", k: "hov", l: "Color al pasar por un mensaje" },
  { c: "Chat", t: "tgl", k: "emb", l: "Bordes de embeds con color" },
  { c: "Chat", t: "tgl", k: "react", l: "Reacciones tuyas con color" },
  { c: "Chat", t: "tgl", k: "fsz", l: "Cambiar tamaño del texto" },
  { c: "Chat", t: "rng", k: "fsize", l: "Tamaño del texto", a: 12, b: 22, u: "px", dep: "fsz" },
  { c: "Interfaz", t: "tgl", k: "scroll", l: "Scrollbar con color" },
  { c: "Interfaz", t: "tgl", k: "sel", l: "Seleccion de texto con color" },
  { c: "Interfaz", t: "tgl", k: "inputglow", l: "Brillo en la caja de chat" },
  { c: "Extra", t: "area", k: "extra", l: "CSS propio (va al final)" },
];
const SET_UI = [
  { t: "tgl", k: "bgfx", l: "Fondo animado" }, { t: "tgl", k: "mini", l: "Mini preview flotante al scrollear" },
  { t: "tgl", k: "snd", l: "Sonido al copiar" }, { t: "tgl", k: "conf", l: "Confetti al copiar todo" },
  { t: "rng", k: "tipd", l: "Delay de tooltips", a: 0, b: 800, u: "ms" },
  { t: "rng", k: "hmax", l: "Items del historial", a: 3, b: 12, u: "" },
];

const fix = (s) => {
  if (!Array.isArray(s.pal) || s.pal.length < 5) s.pal = DEF.pal;
  if (!SCHEMES[s.scheme]) s.scheme = 1;
  if (!BASES[s.base]) s.base = DEF.base;
  if (!PG.some((p) => p[0] === s.pg)) s.pg = DEF.pg;
  delete s._h; delete s.wins; delete s.pageN; delete s.sync;
  return s;
};
const load = () => {
  try {
    let raw = localStorage.getItem(KEY), mig = false;
    if (!raw) { raw = localStorage.getItem(OLD); mig = !!raw; }
    const o = JSON.parse(raw) || {}; if (mig) o.pg = DEF.pg;
    return fix({ ...DEF, ...o });
  } catch { return fix({ ...DEF }); }
};
let S = load(), H = [], tab = "uni", pt = "chat", raf = 0, OUT = {}, hall = false, ME = "none";
try { H = JSON.parse(localStorage.getItem(HK)) || []; } catch {}
const AV = { img: null, url: "", cx: 0, cy: 0, z: 1 };

/* ---------- utilidades ---------- */
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const hex = (r, g, b) => "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const onCol = (c) => (.299 * c[0] + .587 * c[1] + .114 * c[2] > 150 ? "#0d0a14" : "#fff");
const copy = async (s) => {
  try { await navigator.clipboard.writeText(s); } catch {
    const t = document.createElement("textarea"); t.value = s; document.body.append(t); t.select(); document.execCommand("copy"); t.remove();
  }
};
const save = (name, data, type = "text/css") => {
  const a = document.createElement("a"), u = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type + ";charset=utf-8" }));
  a.href = u; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
};
const ago = (t) => { const m = ((Date.now() - t) / 6e4) | 0; return m < 1 ? "recien" : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${(m / 60) | 0} h` : `hace ${(m / 1440) | 0} d`; };

/* ---------- toasts, sonido, confetti ---------- */
let ac;
function beep() {
  try {
    ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = 660; g.gain.setValueAtTime(.08, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + .12);
    o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .12);
  } catch {}
}
function toast(m, kind = "code") {
  const t = document.createElement("div"); t.className = "toast " + kind;
  t.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 13l4 4L19 7" pathLength="1" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span>';
  t.lastChild.textContent = m; $("#toasts").append(t); if (S.snd) beep();
  setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 2000);
}
function confetti() {
  if (!S.conf || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("i"), a = -Math.random() * Math.PI, d = 60 + Math.random() * 90; p.className = "cf";
    p.style.cssText = `left:${innerWidth / 2}px;top:${innerHeight - 60}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:hsl(${Math.random() * 360} 80% 65%)`;
    document.body.append(p); setTimeout(() => p.remove(), 900);
  }
}
addEventListener("error", (e) => toast("Error: " + e.message, "warn"));
addEventListener("unhandledrejection", (e) => toast("Error: " + ((e.reason && e.reason.message) || e.reason), "warn"));
const cp = async (txt, msg, kind = "code", big = false) => { await copy(txt); toast(msg, kind); if (big) confetti(); };

/* ---------- paleta en OKLab ---------- */
const lin = (v) => ((v /= 255) > .04045 ? ((v + .055) / 1.055) ** 2.4 : v / 12.92);
const gam = (v) => 255 * (v > .0031308 ? 1.055 * v ** (1 / 2.4) - .055 : 12.92 * v);
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
function toLab(r, g, b) {
  r = lin(r); g = lin(g); b = lin(b);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969567 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720403 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
}
function fromLab([L, a, b]) {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return [gam(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), gam(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), gam(-.0041960863 * l - .7034186147 * m + 1.707614701 * s)].map(clamp);
}
// Saca colores que se vean (con saturacion), ignora fondos negros/blancos/grises y no repite tonos parecidos
function extract(img, n = 5) {
  const c = document.createElement("canvas"), k = Math.min(1, 96 / Math.max(img.width, img.height));
  c.width = Math.max(1, (img.width * k) | 0); c.height = Math.max(1, (img.height * k) | 0);
  const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data; let P = [];
  const A = [];
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue;
    const l = toLab(d[i], d[i + 1], d[i + 2]), ch = Math.hypot(l[1], l[2]), p = { c: [d[i], d[i + 1], d[i + 2]], l, w: .1 + ch * 5 };
    A.push(p); if (l[0] > .2 && l[0] < .96 && ch > .03) P.push(p);
  }
  if (P.length < 30) P = A;
  if (!P.length) return null;
  const K = Math.min(8, P.length), C = [P.reduce((a, b) => (b.w > a.w ? b : a)).l];
  while (C.length < K) {
    let best = P[0], bd = -1;
    for (const p of P) { const m = Math.min(...C.map((q) => dist(p.l, q))) * p.w; if (m > bd) { bd = m; best = p; } }
    C.push(best.l);
  }
  let G;
  for (let it = 0; it < 8; it++) {
    G = C.map(() => []);
    for (const p of P) { let b = 0, m = 1e9; C.forEach((q, j) => { const e = dist(p.l, q); if (e < m) { m = e; b = j; } }); G[b].push(p); }
    C.forEach((q, j) => {
      const g = G[j]; if (!g.length) return; let W = 0; const s = [0, 0, 0];
      g.forEach((p) => { W += p.w; p.c.forEach((v, t) => (s[t] += v * p.w)); }); C[j] = toLab(...s.map((v) => v / W));
    });
  }
  const out = [];
  G.map((g, j) => ({ s: g.reduce((a, p) => a + p.w, 0), l: C[j] })).sort((a, b) => b.s - a.s)
    .forEach((o) => { if (out.length < n && out.every((q) => dist(q, o.l) > .1)) out.push(o.l); });
  const res = out.map((l) => fromLab([Math.max(.62, Math.min(.85, l[0])), l[1], l[2]]));
  // si la imagen tiene pocos colores, rellena con versiones mas claras/oscuras de los que hay
  for (let j = 0; res.length < n; j++) res.push(mix(res[j % out.length], j % 2 ? [0, 0, 0] : [255, 255, 255], .15 * (1 + (j >> 1))).map(Math.round));
  return res;
}

/* ---------- generacion de CSS (recibe el estado s) ---------- */
const rule = (sel, p) => `${sel} {\n${Object.entries(p).map(([k, v]) => `    ${k}: ${v};`).join("\n")}\n}\n`;
function colors(s = S) {
  const sc = SCHEMES[s.scheme] || SCHEMES[1];
  let acc = sc[2] ? rgb(sc[2]) : s.pal[s.pi] || s.pal[0];
  if (s.custom) acc = rgb(s.custom);
  return { acc, bg: sc[1] ? rgb(sc[1]) : mix(acc, [8, 8, 12], .9), hex: hex(...acc) };
}
function themeCss(c, s) {
  const o = (s.opacity / 100).toFixed(2), f = FONTS[s.font], on = (v) => (v ? "on" : "off"), a = c.acc, W = [255, 255, 255], K = [0, 0, 0];
  const [r, g, b] = a.map(Math.round), fam = f ? `"${s.font}"` : "''", bg = s.bgurl.replace(/["\\\n\r)]/g, "").trim();
  const bgs = [0, .22, .45, .67].map((t, i) => `    --bg-${i + 1}: rgba(${mix(c.bg, K, t).map(Math.round)}, ${o});`).join("\n");
  const acs = [mix(a, W, .2), a, mix(a, K, .12), mix(a, K, .24), mix(a, K, .36)].map((v, i) => `    --accent-${i + 1}: ${hex(...v)};`).join("\n");
  return `${f ? `@import url("https://fonts.googleapis.com/css2?family=${s.font.replace(/ /g, "+")}:wght@300;400;700&display=swap");\n` : ""}@import url("${BASES[s.base]}");

body {
    --font: ${fam};
    --code-font: ${fam};
    font-weight: ${f ? f[0] : 400};
    letter-spacing: ${f ? f[1] : 0};

    --gap: ${s.gap}px;
    --divider-thickness: 4px;
    --border-thickness: ${s.border}px;
    --border-hover-transition: 0.2s ease;
    --animations: ${on(s.anim)};

    --transparency-tweaks: ${on(s.trans)};
    --remove-bg-layer: ${on(s.trans)};
    --panel-blur: ${on(s.blur)};
    --small-user-panel: ${on(s.small)};
    --unrounding: off;
    --panel-labels: ${on(s.labels)};
${bg ? `\n    --background-image: on;\n    --background-image-url: url("${bg}");\n` : ""}}

:root {
    --colors: on;

${bgs}

    --hover: rgba(${r}, ${g}, ${b}, 0.15);
    --active: rgba(${r}, ${g}, ${b}, 0.28);
    --mention: rgba(${r}, ${g}, ${b}, 0.1);

${acs}
    --border: rgba(${r}, ${g}, ${b}, 0.35);
    --border-hover: ${c.hex};
}

#app-mount :is(
    [class*="panel"], [class*="menu"], [class*="card"], [class*="popout"], [class*="modal"],
    [class*="input"], [class*="button"], [class*="avatar"], [class*="mask"], img, foreignObject
) {
    border-radius: ${s.radius}px !important;
}`;
}
function quickCss(c, s) {
  const A = c.hex, [r, g, b] = c.acc.map(Math.round), gc = `rgba(${r}, ${g}, ${b}, ${s.glowO / 100})`, gr = s.glowR, I = " !important", Q = [];
  const msg = s.msgText.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\a ");
  const hide = (on, sel) => on && Q.push(rule(sel, { display: "none" + I }));
  if (s.msg) Q.push(rule(".user-profile-sidebar::after", {
    "--profile-gradient-start": "color-mix(in oklab, var(--profile-gradient-overlay-color) 100%, var(--profile-gradient-primary-color))",
    "--profile-gradient-end": "color-mix(in oklab, var(--profile-gradient-overlay-color) 100%, var(--profile-gradient-secondary-color))",
    padding: s.pad + "px",
    background: "linear-gradient(var(--profile-gradient-start), var(--profile-gradient-start) var(--custom-user-profile-banner-height), var(--profile-gradient-end))",
    color: "#ffffff", "text-align": "center", "font-size": "15px", overflow: "hidden", display: "block", content: `"${msg}"`,
  }));
  hide(s.gift, '#app-mount div:is([aria-label*="regalo" i], [aria-label*="gift" i])');
  hide(s.btns, '#app-mount [class*="upperContainer__"] [aria-label*="videollamada" i],\n#app-mount [data-list-item-id*="nitro"],\n#app-mount [data-list-item-id*="shop"],\n#app-mount [data-list-item-id*="quests"]');
  hide(s.sup, '#app-mount [aria-label*="super" i][role="button"]');
  hide(s.gifb, '#app-mount [class*="channelTextArea"] :is([aria-label*="GIF" i], [aria-label*="sticker" i])');
  hide(s.np, '#app-mount [class*="nowPlayingColumn"]');
  hide(s.help, '#app-mount a[href*="support.discord.com"]');
  hide(s.members, '#app-mount [class*="membersWrap"]');
  if (s.ment) Q.push(rule('#app-mount [class*="mentioned__"]', { "border-left": `4px solid ${A}` + I, background: `linear-gradient(to right, ${A}22, transparent)` + I }));
  if (s.glow) Q.push(
    rule('#app-mount [class*="modeSelected__"] [class*="name__"]', { color: A + I, "font-weight": "bold" + I, "text-shadow": `0 0 ${gr}px ${gc}` }),
    rule('#app-mount a[id*="message-link"],\n#app-mount [class*="messageContent"] a', { color: A + I, "font-weight": "500" + I, transition: "text-shadow 0.3s ease, color 0.3s ease" + I }),
    rule('#app-mount a[id*="message-link"]:hover,\n#app-mount [class*="messageContent"] a:hover', { color: "#ffffff" + I, "text-shadow": `0 0 ${gr}px ${gc}, 0 0 ${Math.round(gr * 1.8)}px ${gc}` + I, "text-decoration": "underline" + I }));
  if (s.hov) Q.push(rule('#app-mount [class*="message_"]:hover', { background: A + "14" + I }));
  if (s.emb) Q.push(rule('#app-mount [class*="embedWrapper"]', { "border-left-color": A + I }));
  if (s.react) Q.push(rule('#app-mount [class*="reactionMe"]', { "border-color": A + I, background: A + "22" + I }));
  if (s.fsz) Q.push(rule('#app-mount [class*="messageContent"]', { "font-size": s.fsize + "px" + I }));
  if (s.scroll) Q.push(
    rule("#app-mount ::-webkit-scrollbar", { width: "8px", height: "8px" }),
    rule("#app-mount ::-webkit-scrollbar-thumb", { background: A + "66", "border-radius": s.radius + "px" }),
    rule("#app-mount ::-webkit-scrollbar-track", { background: "transparent" }));
  if (s.scrolloff) Q.push(rule("#app-mount ::-webkit-scrollbar", { display: "none" + I }));
  if (s.sel) Q.push(rule("#app-mount ::selection", { background: A + "55", color: "#ffffff" }));
  if (s.inputglow) Q.push(rule('#app-mount [class*="channelTextArea"]:focus-within', { "box-shadow": `0 0 0 1px ${A}, 0 0 14px ${A}55` + I }));
  if (s.extra.trim()) Q.push(s.extra.trim() + "\n");
  return Q.join("\n");
}
function build(s) {
  const c = colors(s), T = themeCss(c, s), Qc = quickCss(c, s);
  const meta = (n) => `/**\n * @name ${n}\n * @author Joako\n * @description Generado con CSS.DISCORD\n */\n\n`;
  return {
    uni: [`${s.base}-full.theme.css`, meta(s.base + "-FullCustom") + T + "\n\n" + Qc],
    theme: [`${s.base}-tema.theme.css`, meta(s.base + " (Custom Palette)") + T],
    quick: ["quickcss.css", Qc],
  };
}
const prof = () => { const a = colors().hex; return [["#121017", a], [a, "#ffffff"], [a, hex(...S.pal[(S.pi + 1) % S.pal.length])], [S.p1, S.p2]][S.prof]; };
const enc3y3 = (s) => String.fromCodePoint(0xe0000) + [...s].map((ch) => String.fromCodePoint(0xe0000 + ch.charCodeAt(0))).join("") + String.fromCodePoint(0xe007f);

/* ---------- historial ---------- */
const saveH = () => { try { localStorage.setItem(HK, JSON.stringify(H)); } catch {} };
const snap = () => { const o = {}; for (const k in S) if (!PAGE.includes(k)) o[k] = S[k]; return JSON.parse(JSON.stringify(o)); };
const full = (h) => fix({ ...DEF, ...h.s });
function mini(s) {
  const c = colors(s), o = (s.opacity / 100).toFixed(2), b = (t) => `rgba(${mix(c.bg, [0, 0, 0], t).map(Math.round)},${o})`;
  return `<div class="mm" style="--a:${c.hex};--b1:${b(0)};--b3:${b(.45)};--r:${Math.min(s.radius, 8)}px"><i></i><div class="mc"><b class="men"></b><b></b><b class="s"></b></div></div>`;
}
function addHist() {
  H.unshift({ id: Date.now().toString(36), t: Date.now(), n: "Tema " + (H.length + 1), s: snap() });
  H = H.slice(0, 30); saveH(); renderHist();
}
function renderHist() {
  const L = hall ? H : H.slice(0, S.hmax);
  $("#hist").innerHTML = L.length ? L.map((h) => `<div class="hi"><div class="th">${mini(full(h))}<div class="ha"><button data-act="hap" data-id="${h.id}">Aplicar</button><button data-act="hcp" data-id="${h.id}">Copiar codigo</button><button data-act="hrm" data-id="${h.id}">Eliminar</button></div></div><input type="text" class="nm" data-hn="${h.id}" value="${esc(h.n)}" aria-label="Nombre"><small>${ago(h.t)}</small></div>`).join("") : '<p class="mu">Todavia no guardaste nada</p>';
  const m = $("#hmore"); m.hidden = H.length <= S.hmax; m.textContent = hall ? "Ver menos" : `Ver todo (${H.length})`;
}

/* ---------- vista previa tipo discord ---------- */
const IC = {
  hash: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>', spk: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0"/>', pin: '<path d="M9 3h6l-1 6 3 3H7l3-3-1-6zM12 12v9"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a5 5 0 0 1 4 6"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/>', help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5M12 17v.5"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', chev: '<path d="M6 9l6 6 6-6"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9c-2-4-6-3-5 0 .4 1 3 1 5 0zM12 9c2-4 6-3 5 0-.4 1-3 1-5 0z"/>',
  gif: '<rect x="3" y="6" width="18" height="12" rx="3"/><text x="12" y="15" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700">GIF</text>',
  stk: '<path d="M5 4h14a1 1 0 0 1 1 1v9l-6 6H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 20v-5a1 1 0 0 1 1-1h5"/>',
  emo: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5v.5M15 9.5v.5"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  hs: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
};
const ic = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
const AVC = ["#5865f2", "#eb459e", "#3ba55d", "#faa61a", "#ed4245"];
const dav = (t, i, x = "") => `<span class="dav ${x}" style="--c:${AVC[i % 5]}">${t}</span>`;
const WALL = "radial-gradient(circle at 18% 28%,#ff7ab866,transparent 42%),radial-gradient(circle at 82% 72%,#4aa8ff66,transparent 46%),linear-gradient(135deg,#1c2347,#2b1f4d)";
function dcHTML() {
  return `<div class="dc-s"><span class="srv home">${ic("hash", 20)}</span><i class="sep"></i><span class="srv act">J</span><span class="srv" style="--c:#3ba55d">M</span><span class="srv" style="--c:#eb459e">B</span><span class="srv add">${ic("plus", 20)}</span></div>
<div class="dc-c"><div class="chh"><b>Servidor de Joako</b>${ic("chev", 14)}</div><div class="cat">${ic("chev", 10)} TEXTO</div>
<div class="chn act">${ic("hash", 16)} general</div><div class="chn">${ic("hash", 16)} memes</div><div class="chn">${ic("hash", 16)} temas-css</div>
<div class="cat">${ic("chev", 10)} VOZ</div><div class="chn">${ic("spk", 16)} General</div><div class="chn">${ic("spk", 16)} Musica</div></div>
<div class="dc-t"><span class="t1">${ic("hash", 18)}<b>general</b></span><span class="t2">${ic("bell")}${ic("pin")}${ic("users")}${ic("search")}<i class="i-help">${ic("help")}</i></span></div>
<div class="dc-m">
<div class="msg">${dav("A", 3)}<div><div class="mh"><b style="--n:#f0b232">Aki</b><small>Hoy a las 10:42</small></div><p>alguien vio el tema nuevo?</p></div></div>
<div class="msg ment">${dav("A", 3)}<div><div class="mh"><b style="--n:#f0b232">Aki</b><small>Hoy a las 10:43</small></div><p><span class="at">@Joako</span> te quedo re bien, pasame el codigo</p></div></div>
<div class="msg">${dav("J", 1, "me")}<div><div class="mh"><b style="--n:var(--a)">Joako</b><small>Hoy a las 10:44</small></div><p>lo hice en <a>css.discord</a>, mirá</p>
<div class="rxs"><span class="rx me">💜 3</span><span class="rx">🔥 1</span></div>
<div class="emb"><b>CSS.DISCORD</b><span>Pagina de uso personal para configurar cositas de discord</span></div></div></div><i class="scr"></i></div>
<div class="dc-i"><span class="pl">${ic("plus", 20)}</span><span class="ph">Enviar mensaje a #general</span><span class="tr"><i class="i-gift">${ic("gift", 20)}</i><i class="i-gif">${ic("gif", 20)}</i><i class="i-gif">${ic("stk", 20)}</i>${ic("emo", 20)}</span></div>
<div class="dc-u">${dav("J", 1, "me st")}<div class="un"><b>Joako</b><small>Escuchando musica</small></div><span class="uc">${ic("mic")}${ic("hs")}${ic("gear")}</span></div>
<div class="dc-r"><h5>EN LINEA — 3</h5><div class="mem">${dav("J", 1, "me st")}<b style="color:var(--a)">Joako</b></div><div class="mem">${dav("A", 3, "st")}<b>Aki</b></div><div class="mem">${dav("M", 2, "st")}<b>Mau</b></div><h5>OFFLINE — 1</h5><div class="mem off">${dav("B", 4)}<b>Bruno</b></div></div>`;
}
function profHTML() {
  const [p1, p2] = prof(), t = esc(S.msgText);
  return `<div class="pf" style="--p1:${p1};--p2:${p2}"><div class="pf-b"></div>${dav("J", 1, "me st pf-a")}<div class="pf-n"><b>Joako</b><small>joako</small></div>
<div class="pf-x"><h5>SOBRE MI</h5><p>css, discord y cafe</p><h5>MIEMBRO DESDE</h5><p>12 mar 2020</p></div>${S.msg ? `<div class="pf-c" style="padding:${Math.round(S.pad * .45)}px 12px">${t}</div>` : ""}</div>`;
}
function paintPreview(c) {
  const o = (S.opacity / 100).toFixed(2), A = c.hex, [r, g, b] = c.acc.map(Math.round), B = (t) => `rgba(${mix(c.bg, [0, 0, 0], t).map(Math.round)},${o})`;
  const f = FONTS[S.font], bg = S.bgurl.replace(/["\\\n\r)]/g, "").trim();
  const v = [["--a", A], ["--b1", B(0)], ["--b2", B(.22)], ["--b3", B(.45)], ["--pr", S.radius + "px"], ["--gap", S.gap + "px"], ["--bw", S.border + "px"],
    ["--bc", `rgba(${r},${g},${b},.35)`], ["--blur", S.blur ? "10px" : "0px"], ["--wall", bg ? `url("${bg}") center/cover, ${WALL}` : WALL],
    ["--ff", f ? `"${S.font}", monospace` : "system-ui, sans-serif"], ["--fw", f ? f[0] : 400], ["--ls", f ? f[1] : "0"],
    ["--lc", S.glow ? A : "#00a8fc"], ["--gs", S.glow ? `0 0 ${S.glowR}px rgba(${r},${g},${b},${S.glowO / 100})` : "none"],
    ["--hov", S.hov ? A + "14" : "rgba(255,255,255,.03)"], ["--rx", S.react ? A : "#5865f2"], ["--eb", S.emb ? A : "#5865f2"],
    ["--sel", S.sel ? A + "55" : "rgba(0,120,215,.5)"], ["--sc", S.scroll ? A + "66" : "rgba(255,255,255,.18)"],
    ["--mb", S.ment ? `4px solid ${A}` : "2px solid #f0b232"], ["--mg", S.ment ? `linear-gradient(to right,${A}22,transparent)` : "rgba(240,178,50,.1)"],
    ["--fs", (S.fsz ? S.fsize : 15) + "px"], ["--me", ME]];
  const cl = { hasme: ME !== "none", "no-gift": S.gift, "no-gif": S.gifb, "no-help": S.help, "no-mem": S.members, "no-sc": S.scrolloff, glowin: S.inputglow, small: S.small };
  $$(".dc").forEach((el) => { v.forEach(([k, x]) => el.style.setProperty(k, x)); for (const k in cl) el.classList.toggle(k, !!cl[k]); });
  const pr = $("#dcProf"); pr.style.cssText = v.map(([k, x]) => `${k}:${x}`).join(";"); pr.innerHTML = profHTML(); pr.classList.toggle("hasme", ME !== "none");
  if (f && S.font !== "DM Mono" && !$(`link[data-f="${S.font}"]`)) {
    const l = document.createElement("link"); l.rel = "stylesheet"; l.dataset.f = S.font;
    l.href = `https://fonts.googleapis.com/css2?family=${S.font.replace(/ /g, "+")}:wght@300;400;700&display=swap`; document.head.append(l);
  }
}

/* ---------- ui ---------- */
function ctl(o) {
  const { t, k, l, a, b, u = "", dep, tip } = o, id = "c_" + k;
  const at = `${dep ? ` data-dep="${dep}"` : ""}${tip ? ` data-tip="${esc(tip)}"` : ""}`;
  if (t === "tgl") return `<label class="row"${at}><span>${l}</span><span class="sw"><input type="checkbox" id="${id}" data-k="${k}"><i></i></span></label>`;
  if (t === "rng") return `<div class="col"${at}><label class="row" for="${id}"><span>${l}</span><b id="v_${k}"></b></label><input type="range" id="${id}" data-k="${k}" data-u="${u}" min="${a}" max="${b}"></div>`;
  if (t === "sel") return `<label class="row"${at}><span>${l}</span><select id="${id}" data-k="${k}">${a.map((x) => `<option>${x}</option>`).join("")}</select></label>`;
  if (t === "txt1") return `<label class="col"${at}><span>${l}</span><input type="text" id="${id}" data-k="${k}" spellcheck="false"></label>`;
  return `<label class="col"${at}><span>${l}</span><textarea id="${id}" data-k="${k}" rows="${t === "area" ? 4 : 2}" spellcheck="false"></textarea></label>`;
}
function groups(list, key) {
  const g = {}; list.forEach((o) => (g[o[key]] = g[o[key]] || []).push(o));
  return Object.entries(g).map(([n, items]) => `<details class="grp" open><summary>${n}</summary><div class="ctls">${items.map(ctl).join("")}</div></details>`).join("");
}
function syncUI() {
  $$("[data-k]").forEach((el) => {
    const v = S[el.dataset.k];
    if (el.type === "checkbox") el.checked = !!v; else if (el.id !== "cc") el.value = v;
    const l = $("#v_" + el.dataset.k); if (l) l.textContent = v + el.dataset.u;
  });
}
function buildLists() {
  $("#schemes").innerHTML = SCHEMES.map((s, i) => [s, i]).filter(([s]) => !s[3] || S.secret).map(([s, i]) => `<button class="sch" data-s="${i}" data-n="${s[0].toLowerCase()}"><span class="sd">${s[1] ? `<i style="background:${s[1]}"></i><i style="background:${s[2]}"></i>` : '<i style="background:linear-gradient(135deg,#f66,#6af,#6f9)"></i>'}</span>${s[0]}</button>`).join("");
  $("#pgs").innerHTML = PG.filter((p) => !p[8] || S.secret).map((p) => `<button class="pgc" data-pg="${p[0]}"><span class="sd">${[p[3], p[4], p[7], p[5]].map((x) => `<i style="background:${x}"></i>`).join("")}</span>${p[1]}</button>`).join("");
}
function applyPage() {
  const p = PG.find((x) => x[0] === S.pg) || PG[0], st = document.documentElement.style;
  ["--bg", "--card", "--tx", "--mu", "--bd"].forEach((n, i) => st.setProperty(n, p[3 + i]));
  document.documentElement.dataset.dark = p[2]; document.body.classList.toggle("nobg", !S.bgfx);
  $$("[data-pg]").forEach((b) => b.classList.toggle("on", b.dataset.pg === S.pg));
}
function vis() {
  $$("[data-dep]").forEach((e) => (e.hidden = !S[e.dataset.dep]));
  $$("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  $$("[data-s]").forEach((b) => b.classList.toggle("on", +b.dataset.s === S.scheme));
  $$("[data-prof]").forEach((b) => b.classList.toggle("on", +b.dataset.prof === S.prof));
  $$("[data-pt]").forEach((b) => b.classList.toggle("on", b.dataset.pt === pt));
  $("#dcMain").hidden = pt !== "chat"; $("#dcProf").hidden = pt !== "perfil";
}
const render = () => raf || (raf = requestAnimationFrame(() => { raf = 0; update(); }));
function update() {
  const c = colors(); OUT = build(S);
  $("#out").value = OUT[tab][1];
  $("#pal").innerHTML = S.pal.map((p, i) => { const h = hex(...p); return `<button class="pal${S.scheme === 0 && S.pi === i && !S.custom ? " on" : ""}" data-i="${i}" style="background:${h};color:${onCol(p)}">${h}</button>`; }).join("");
  const st = document.documentElement.style; st.setProperty("--acc", c.hex); st.setProperty("--on", onCol(c.acc));
  if (document.activeElement !== $("#cc")) $("#cc").value = c.hex;
  prof().forEach((h, i) => { const b = $("#b" + (i + 1)); b.style.background = h; b.style.color = onCol(rgb(h)); b.textContent = h; });
  applyPage(); vis(); paintPreview(c);
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
}

/* ---------- navegacion, panel lateral, mini preview, fondo ---------- */
const SECS = [["s-imagen", "Imagen"], ["s-preview", "Preview"], ["s-tema", "Tema"], ["s-quick", "QuickCSS"], ["s-codigo", "Codigo"], ["s-perfil", "Perfil"], ["s-avatar", "Avatar"], ["s-historial", "Historial"]];
function setupNav() {
  $("#links").innerHTML = SECS.map(([id, n]) => `<a href="#${id}" data-sec="${id}">${n}</a>`).join("");
  let lock = 0; const mark = (id) => $$("[data-sec]").forEach((a) => a.classList.toggle("on", a.dataset.sec === id));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && Date.now() > lock) mark(e.target.id); }), { rootMargin: "-30% 0px -60% 0px" });
  SECS.forEach(([id]) => io.observe($("#" + id)));
  $("#links").addEventListener("click", (e) => { const a = e.target.closest("[data-sec]"); if (a) { lock = Date.now() + 1400; mark(a.dataset.sec); } });
  addEventListener("scroll", () => { if (Date.now() > lock && innerHeight + scrollY >= document.documentElement.scrollHeight - 4) mark("s-historial"); }, { passive: true });
  const mini = $("#mini"), mo = new IntersectionObserver(([e]) => { mini.hidden = !S.mini || e.isIntersecting || mini.dataset.x === "1"; }, { threshold: 0 });
  mo.observe($("#s-preview"));
}
function openDrawer(w) {
  $("#drawer").classList.add("open"); $("#scrim").hidden = false; $("#drawer").setAttribute("aria-hidden", "false");
  $$("[data-dt]").forEach((b) => b.classList.toggle("on", b.dataset.dt === w)); $("#d-aj").hidden = w !== "aj"; $("#d-ay").hidden = w !== "ay";
}
function closeDrawer() { $("#drawer").classList.remove("open"); $("#scrim").hidden = true; $("#drawer").setAttribute("aria-hidden", "true"); }
let spot = null;
addEventListener("pointermove", (e) => {
  if (!S.bgfx || spot) return;
  spot = requestAnimationFrame(() => { spot = null; const st = document.documentElement.style; st.setProperty("--mx", e.clientX + "px"); st.setProperty("--my", e.clientY + "px"); });
});

/* ---------- tooltips ---------- */
const tip = $("#tip"); let tto, thide, cur = null;
function showTip(t) {
  const [ti, de, code, go] = t.dataset.tip.split("|");
  const cd = code ? `<code>${esc(code).replace(/([\w-]+):\s*([^;]+);?/g, '<i class="k">$1</i>: <i class="v">$2</i>;')}</code>` : "";
  tip.innerHTML = `<b>${esc(ti)}</b>${esc(de || "")}${cd}${go ? `<a data-go="${go}">Ver guia</a>` : ""}`;
  const r = t.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + "px";
  tip.style.top = (r.bottom + h + 12 > innerHeight ? Math.max(8, r.top - h - 8) : r.bottom + 8) + "px";
  tip.classList.add("on");
}
document.addEventListener("pointerover", (e) => {
  if (e.pointerType === "touch") return;
  const t = e.target.closest("[data-tip]"); if (!t) return;
  clearTimeout(thide); if (t === cur) return; cur = t; clearTimeout(tto); tto = setTimeout(() => showTip(t), S.tipd);
});
document.addEventListener("pointerout", (e) => {
  const t = e.target.closest("[data-tip]"); if (!t || t.contains(e.relatedTarget)) return;
  clearTimeout(tto); thide = setTimeout(() => { tip.classList.remove("on"); cur = null; }, 120);
});
tip.addEventListener("pointerenter", () => clearTimeout(thide));
tip.addEventListener("pointerleave", () => { tip.classList.remove("on"); cur = null; });
addEventListener("scroll", () => { tip.classList.remove("on"); cur = null; }, { passive: true });

/* ---------- tour (no bloquea la pagina) ---------- */
const TOUR = [
  ["#s-imagen .zone", "Sube una imagen aca y saco los colores solos"],
  ["#s-preview h2", "Aca ves como queda, en vivo"],
  ["#s-tema h2", "Elegi un tema y ajusta lo que quieras"],
  [".nav-copy", "Cuando termines, copia o descarga el codigo desde aca"],
];
let ts = 0, tt2, tsel = null;
function tourPlace() {
  const el = tsel && $(tsel); if (!el) return;
  const r = el.getBoundingClientRect(), sp = $("#spot").style, tb = $("#tb").style;
  sp.left = r.left - 6 + "px"; sp.top = r.top - 6 + "px"; sp.width = r.width + 12 + "px"; sp.height = r.height + 12 + "px";
  tb.left = Math.max(12, Math.min(innerWidth - 292, r.left)) + "px";
  tb.top = Math.max(12, r.bottom + 170 > innerHeight ? r.top - 150 : r.bottom + 16) + "px";
}
function tour(i) {
  ts = i; const o = $("#tour"); clearTimeout(tt2);
  if (i >= TOUR.length) { o.hidden = true; tsel = null; try { localStorage.setItem(TK, "1"); } catch {} return; }
  const [sel, txt] = TOUR[i]; tsel = sel; const el = $(sel);
  $("#tt").textContent = `${i + 1}/${TOUR.length}  ${txt}`; $("#tn").textContent = i === TOUR.length - 1 ? "Listo" : "Siguiente"; o.hidden = false;
  if (el && !el.closest(".nav")) el.scrollIntoView({ behavior: "smooth", block: "center" });
  tt2 = setTimeout(tourPlace, 650);
}
addEventListener("scroll", () => { if (tsel) tourPlace(); }, { passive: true });

/* ---------- secreto ---------- */
const KON = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]; let ki = 0;
document.addEventListener("keydown", (e) => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase(); ki = k === KON[ki] ? ki + 1 : k === KON[0] ? 1 : 0;
  if (ki === KON.length) {
    ki = 0; S.secret = 1; S.pg = "neon"; S.scheme = SCHEMES.length - 1; S.custom = ""; buildLists(); toast("Tema secreto desbloqueado!", "color"); render();
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("span"); p.className = "rain"; p.textContent = ["💜", "✨", "🎮", "🔥", "🌙"][i % 5];
      p.style.cssText = `left:${Math.random() * 100}vw;animation-duration:${2 + Math.random() * 3}s;animation-delay:${Math.random() * 1.5}s`;
      document.body.append(p); setTimeout(() => p.remove(), 6500);
    }
  }
});

/* ---------- imagen, colores y avatar ---------- */
function onFile(f) {
  if (!f || !f.type.startsWith("image/")) return toast("Eso no es una imagen", "warn");
  $$(".ups").forEach((e) => (e.textContent = "Imagen: " + f.name));
  const u = URL.createObjectURL(f), im = new Image();
  im.onload = () => {
    try { const p = extract(im); if (p) S.pal = p; } catch (e) { console.error(e); }
    Object.assign(S, { pi: 0, scheme: 0, custom: "" });
    URL.revokeObjectURL(AV.url); Object.assign(AV, { img: im, url: u, cx: im.width / 2, cy: im.height / 2 });
    $("#avEmpty").hidden = $("#pkEmpty").hidden = true; $("#avBox").hidden = $("#pkWrap").hidden = false;
    pkDraw(); ME = `url(${u})`;
    setZ(1); addHist(); render();
  };
  im.onerror = () => toast("No se pudo leer la imagen", "warn");
  im.src = u;
}
function pkDraw() {
  const c = $("#pk"), im = AV.img; c.width = 320; c.height = Math.round((320 * im.height) / im.width);
  c.getContext("2d", { willReadFrequently: true }).drawImage(im, 0, 0, c.width, c.height);
}
$("#pk").addEventListener("click", (e) => {
  const c = e.currentTarget, r = c.getBoundingClientRect();
  const px = c.getContext("2d", { willReadFrequently: true }).getImageData(Math.floor(((e.clientX - r.left) * c.width) / r.width), Math.floor(((e.clientY - r.top) * c.height) / r.height), 1, 1).data;
  if (px[3] < 128) return;
  S.custom = hex(px[0], px[1], px[2]); S.scheme = 0; render(); toast("Color " + S.custom, "color");
});
function drawAv(cv = $("#cv"), n = cv.width) {
  const { img, z } = AV; if (!img) return;
  const cs = Math.min(img.width, img.height) / z;
  AV.cx = Math.max(cs / 2, Math.min(img.width - cs / 2, AV.cx)); AV.cy = Math.max(cs / 2, Math.min(img.height - cs / 2, AV.cy));
  const x = cv.getContext("2d"); x.clearRect(0, 0, n, n); x.save(); x.beginPath();
  x.roundRect(0, 0, n, n, S.shape === "circle" ? n / 2 : S.shape === "rounded" ? n * .22 : 0); x.clip();
  x.drawImage(img, AV.cx - cs / 2, AV.cy - cs / 2, cs, cs, 0, 0, n, n); x.restore();
}
function setZ(z) { AV.z = Math.max(1, Math.min(4, z)); $("#zoom").value = AV.z * 100; $("#zv").textContent = AV.z.toFixed(1) + "x"; drawAv(); }
const cv = $("#cv"); let drag = null;
cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
cv.addEventListener("pointermove", (e) => {
  if (!drag || !AV.img) return;
  const k = Math.min(AV.img.width, AV.img.height) / AV.z / cv.clientWidth;
  AV.cx -= (e.clientX - drag[0]) * k; AV.cy -= (e.clientY - drag[1]) * k; drag = [e.clientX, e.clientY]; drawAv();
});
["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => (drag = null)));
cv.addEventListener("wheel", (e) => { e.preventDefault(); setZ(AV.z * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });
$("#zoom").addEventListener("input", (e) => setZ(e.target.value / 100));

/* ---------- acciones y eventos ---------- */
const ACT = {
  pick: () => $("#img").click(),
  import: () => $("#impIn").click(),
  export: () => save("css-discord-config.json", JSON.stringify({ ...S, _h: H }, null, 2), "application/json"),
  reset: () => { if (confirm("Restablecer todo?")) { S = fix({ ...DEF, secret: S.secret }); syncUI(); render(); } },
  dl: () => save(...OUT[tab]),
  copy: () => cp(OUT[tab][1], "Codigo copiado", "code", tab === "uni"),
  dlall: () => save(...OUT.uni),
  copyall: () => cp(OUT.uni[1], "Codigo copiado", "code", true),
  hx: (b) => cp(b.textContent, "Copiado!", "color"),
  c3: () => cp(enc3y3(`[${prof()}]`), "Codigo 3y3 copiado", "color"),
  avreset: () => { if (AV.img) { AV.cx = AV.img.width / 2; AV.cy = AV.img.height / 2; setZ(1); } },
  avdl: () => {
    if (!AV.img) return toast("Primero selecciona una imagen.", "warn");
    const c = document.createElement("canvas"); c.width = c.height = +S.size; drawAv(c, c.width); c.toBlob((bl) => save(`avatar-${S.size}.png`, bl));
  },
  hsave: () => { addHist(); toast("Guardado en el historial"); },
  hmore: () => { hall = !hall; renderHist(); },
  hap: (b) => { const h = H.find((x) => x.id === b.dataset.id); if (!h) return; Object.assign(S, full(h), Object.fromEntries(PAGE.map((k) => [k, S[k]]))); syncUI(); render(); toast("Aplicado"); },
  hcp: (b) => { const h = H.find((x) => x.id === b.dataset.id); if (h) cp(build(full(h)).uni[1], "Codigo copiado", "code", true); },
  hrm: (b) => { H = H.filter((x) => x.id !== b.dataset.id); saveH(); renderHist(); },
  mode: () => { const cur = PG.find((x) => x[0] === S.pg), t = PG.find((x) => x[2] !== cur[2] && !x[8]); S.pg = t[0]; render(); },
  rand: () => { const L = PG.filter((x) => (!x[8] || S.secret) && x[0] !== S.pg); S.pg = L[(Math.random() * L.length) | 0][0]; render(); },
  dopen: (b) => openDrawer(b.dataset.d), dclose: closeDrawer,
  mclose: () => { const m = $("#mini"); m.dataset.x = "1"; m.hidden = true; },
  tour: () => { closeDrawer(); tour(0); }, tnext: () => tour(ts + 1), tskip: () => tour(99),
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-s],[data-i],[data-prof],[data-tab],[data-pt],[data-dt],[data-go],[data-pg],[data-act]"); if (!b) return;
  const d = b.dataset;
  if (d.s !== undefined) { S.scheme = +d.s; S.custom = ""; }
  else if (d.i !== undefined) { S.pi = +d.i; S.scheme = 0; S.custom = ""; }
  else if (d.prof !== undefined) S.prof = +d.prof;
  else if (d.tab) tab = d.tab;
  else if (d.pt) pt = d.pt;
  else if (d.pg) S.pg = d.pg;
  else if (d.dt) return openDrawer(d.dt);
  else if (d.go) { openDrawer("ay"); setTimeout(() => { const h = $("#h-" + d.go); if (h) h.scrollIntoView({ behavior: "smooth" }); }, 120); tip.classList.remove("on"); return; }
  else return ACT[d.act](b);
  render();
});
document.addEventListener("input", (e) => {
  const el = e.target, k = el.dataset && el.dataset.k; if (!k) return;
  S[k] = el.type === "checkbox" ? +el.checked : el.type === "range" ? +el.value : el.value;
  if (k === "p1" || k === "p2") S.prof = 3;
  const l = $("#v_" + k); if (l) l.textContent = S[k] + el.dataset.u;
  if (k === "hmax") renderHist();
  if (k === "mini") $("#mini").hidden = true;
  if (AV.img) drawAv();
  render();
});
document.addEventListener("change", (e) => {
  const id = e.target.dataset && e.target.dataset.hn, h = id && H.find((x) => x.id === id);
  if (h) { h.n = e.target.value.trim() || h.n; saveH(); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });
$("#sq").addEventListener("input", (e) => { const q = e.target.value.toLowerCase(); $$(".sch").forEach((b) => (b.hidden = !b.dataset.n.includes(q))); });
$("#img").addEventListener("change", (e) => onFile(e.target.files[0]));
$("#impIn").addEventListener("change", async (e) => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  try {
    const o = JSON.parse(await f.text()); if (Array.isArray(o._h)) { H = o._h; saveH(); renderHist(); }
    S = fix({ ...DEF, ...o }); syncUI(); render(); toast("Config importada");
  } catch { toast("Ese archivo no sirve", "warn"); }
});
document.addEventListener("paste", (e) => { const f = e.clipboardData && e.clipboardData.files[0]; if (f) onFile(f); });
const dz = $("#s-imagen");
document.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("hl"); });
document.addEventListener("dragleave", (e) => { if (!e.relatedTarget) dz.classList.remove("hl"); });
document.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("hl"); const f = e.dataTransfer.files[0]; if (f) onFile(f); });

/* ---------- init ---------- */
buildLists();
$("#themeUI").innerHTML = groups(THEME_UI, "g");
$("#quickUI").innerHTML = groups(QUICK_UI, "c");
$("#setUI").innerHTML = SET_UI.map(ctl).join("");
$("#dcMain").innerHTML = dcHTML(); $("#dcMini").innerHTML = dcHTML();
setupNav(); syncUI(); update(); renderHist();
try { if (!localStorage.getItem(TK)) setTimeout(() => tour(0), 900); } catch {}
