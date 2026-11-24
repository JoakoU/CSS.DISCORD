"use strict";
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const KEY = "css_discord_v2";
const BASES = {
  system24: "https://refact0r.github.io/system24/build/system24.css",
  midnight: "https://refact0r.github.io/midnight-discord/build/midnight.css",
};
const FONTS = { "DM Mono": [300, "-0.05ch"], "JetBrains Mono": [400, "-0.05ch"], "Fira Code": [400, "-0.05ch"], Figtree: [400, "0"], Inter: [400, "0"], Nunito: [400, "0"] };
const SCHEMES = [
  ["Desde mi imagen"], ["Original", "#121017", "#9d7cd6"], ["Tokyo Night", "#1a1b26", "#7aa2f7"],
  ["Catppuccin", "#1e1e2e", "#cba6f7"], ["Dracula", "#282a36", "#bd93f9"], ["Nord", "#2e3440", "#88c0d0"],
  ["Rosé Pine", "#191724", "#ebbcba"], ["Gruvbox", "#282828", "#fabd2f"], ["Sakura", "#1f1418", "#f5a9c8"],
  ["Matrix", "#050a05", "#33ff66"], ["Sunset", "#1c1112", "#ff7a59"],
];
const DEF = {
  base: "system24", scheme: 1, pal: [[157, 124, 214], [192, 202, 245], [187, 154, 247]], pi: 0, custom: "",
  font: "DM Mono", radius: 5, opacity: 85, gap: 12, border: 2, blur: 1, trans: 1, small: 1, labels: 1, anim: 1,
  msg: 1, msgText: "Meow :3\n(Waiting for something to happen?)", pad: 40,
  gift: 1, btns: 1, sup: 1, gifb: 0, np: 0, ment: 1, glow: 1, glowR: 8, glowO: 100, scroll: 1, sel: 1, extra: "",
  prof: 0, p1: "#121017", p2: "#9d7cd6", shape: "circle", size: "512",
};
// [tipo, clave, etiqueta, ...extra]  tipos: tgl, rng(min,max,unidad), sel(opciones), txt, area
const THEME_UI = [
  ["sel", "base", "Tema base", Object.keys(BASES)], ["sel", "font", "Fuente", ["Default", ...Object.keys(FONTS)]],
  ["rng", "radius", "Bordes suavizados", 0, 20, "px"], ["rng", "opacity", "Opacidad del fondo", 0, 100, "%"],
  ["rng", "gap", "Separación de paneles", 0, 24, "px"], ["rng", "border", "Grosor de bordes", 0, 6, "px"],
  ["tgl", "blur", "Blur en paneles"], ["tgl", "trans", "Tweaks de transparencia"], ["tgl", "small", "Panel de usuario pequeño"],
  ["tgl", "labels", "Etiquetas de paneles"], ["tgl", "anim", "Animaciones"],
];
const QUICK_UI = [
  ["tgl", "msg", "Texto custom en perfil"], ["txt", "msgText", "Texto del perfil"], ["rng", "pad", "Padding/altura banner", 10, 100, "px"],
  ["tgl", "gift", "Ocultar botón Nitro"], ["tgl", "btns", "Ocultar botones extra (Tienda/Llamadas)"],
  ["tgl", "sup", "Ocultar superreacciones"], ["tgl", "gifb", "Ocultar GIF/stickers del chat"], ["tgl", "np", "Ocultar «Active Now» en DMs"],
  ["tgl", "ment", "Color en menciones"], ["tgl", "glow", "Efecto brillo en links"],
  ["rng", "glowR", "Radio de brillo (Glow)", 2, 25, "px"], ["rng", "glowO", "Opacidad del resplandor", 10, 100, "%"],
  ["tgl", "scroll", "Scrollbar con tu acento"], ["tgl", "sel", "Selección de texto con acento"],
  ["area", "extra", "CSS propio (se agrega al final)"],
];

const fix = (s) => {
  if (!Array.isArray(s.pal) || s.pal.length < 3) s.pal = DEF.pal;
  if (!SCHEMES[s.scheme]) s.scheme = 1;
  if (!BASES[s.base]) s.base = DEF.base;
  return s;
};
const load = () => { try { return fix({ ...DEF, ...JSON.parse(localStorage.getItem(KEY)) }); } catch { return { ...DEF }; } };
let S = load(), tab = "uni", raf = 0, tt, OUT = {};
const AV = { img: null, url: "", cx: 0, cy: 0, z: 1 };

/* ---------- utilidades ---------- */
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const hex = (r, g, b) => "#" + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const onCol = (c) => (.299 * c[0] + .587 * c[1] + .114 * c[2] > 150 ? "#0d0a14" : "#fff");
const toast = (m) => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 1800); };
const copy = async (s) => {
  try { await navigator.clipboard.writeText(s); } catch {
    const t = document.createElement("textarea"); t.value = s; document.body.append(t); t.select(); document.execCommand("copy"); t.remove();
  }
};
const save = (name, data, type = "text/css") => {
  const a = document.createElement("a"), u = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type: type + ";charset=utf-8" }));
  a.href = u; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000);
};

/* ---------- paleta en OKLab (k-means) ---------- */
const lin = (v) => ((v /= 255) > .04045 ? ((v + .055) / 1.055) ** 2.4 : v / 12.92);
const gam = (v) => 255 * (v > .0031308 ? 1.055 * v ** (1 / 2.4) - .055 : 12.92 * v);
function toLab(r, g, b) {
  r = lin(r); g = lin(g); b = lin(b);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b), m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969567 * b), s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720403 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
}
function fromLab([L, a, b]) {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  return [gam(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), gam(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), gam(-.0041960863 * l - .7034186147 * m + 1.707614701 * s)].map(clamp);
}
function extract(img, n = 3) {
  const c = document.createElement("canvas"), k = Math.min(1, 100 / Math.max(img.width, img.height));
  c.width = Math.max(1, (img.width * k) | 0); c.height = Math.max(1, (img.height * k) | 0);
  const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height).data, P = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 128) P.push({ c: [d[i], d[i + 1], d[i + 2]], l: toLab(d[i], d[i + 1], d[i + 2]) });
  if (!P.length) return null;
  let C = Array.from({ length: n }, (_, i) => P[Math.floor((i * P.length) / n)].l), G;
  for (let it = 0; it < 6; it++) {
    G = C.map(() => []);
    for (const p of P) { let b = 0, m = 1e9; C.forEach((q, j) => { const e = Math.hypot(p.l[0] - q[0], p.l[1] - q[1], p.l[2] - q[2]); if (e < m) { m = e; b = j; } }); G[b].push(p); }
    C = C.map((q, j) => { if (!G[j].length) return q; const s = [0, 0, 0]; G[j].forEach((p) => p.c.forEach((v, t) => (s[t] += v))); return toLab(...s.map((v) => v / G[j].length)); });
  }
  return G.map((g, j) => ({ n: g.length, c: fromLab([Math.max(C[j][0], .7), C[j][1], C[j][2]]) })).sort((a, b) => b.n - a.n).map((o) => o.c);
}

/* ---------- generación de CSS ---------- */
const rule = (s, p) => `${s} {\n${Object.entries(p).map(([k, v]) => `    ${k}: ${v};`).join("\n")}\n}\n`;
function colors() {
  const sc = SCHEMES[S.scheme];
  let acc = sc[2] ? rgb(sc[2]) : S.pal[S.pi] || S.pal[0];
  if (S.custom) acc = rgb(S.custom);
  return { acc, bg: sc[1] ? rgb(sc[1]) : mix(acc, [8, 8, 12], .9), hex: hex(...acc) };
}
function themeCss(c) {
  const o = (S.opacity / 100).toFixed(2), f = FONTS[S.font], on = (v) => (v ? "on" : "off"), a = c.acc, W = [255, 255, 255], K = [0, 0, 0];
  const [r, g, b] = a.map(Math.round), fam = f ? `"${S.font}"` : "''";
  const bgs = [0, .22, .45, .67].map((t, i) => `    --bg-${i + 1}: rgba(${mix(c.bg, K, t).map(Math.round)}, ${o});`).join("\n");
  const acs = [mix(a, W, .2), a, mix(a, K, .12), mix(a, K, .24), mix(a, K, .36)].map((v, i) => `    --accent-${i + 1}: ${hex(...v)};`).join("\n");
  return `${f ? `@import url("https://fonts.googleapis.com/css2?family=${S.font.replace(/ /g, "+")}:wght@300;400;700&display=swap");\n` : ""}@import url("${BASES[S.base]}");

body {
    --font: ${fam};
    --code-font: ${fam};
    font-weight: ${f ? f[0] : 400};
    letter-spacing: ${f ? f[1] : 0};

    --gap: ${S.gap}px;
    --divider-thickness: 4px;
    --border-thickness: ${S.border}px;
    --border-hover-transition: 0.2s ease;
    --animations: ${on(S.anim)};

    --transparency-tweaks: ${on(S.trans)};
    --remove-bg-layer: ${on(S.trans)};
    --panel-blur: ${on(S.blur)};
    --small-user-panel: ${on(S.small)};
    --unrounding: off;
    --panel-labels: ${on(S.labels)};
}

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
    border-radius: ${S.radius}px !important;
}`;
}
function quickCss(c) {
  const A = c.hex, [r, g, b] = c.acc.map(Math.round), gc = `rgba(${r}, ${g}, ${b}, ${S.glowO / 100})`, gr = S.glowR, I = " !important", Q = [];
  const msg = S.msgText.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\a ");
  const hide = (on, sel) => on && Q.push(rule(sel, { display: "none" + I }));
  if (S.msg) Q.push(rule(".user-profile-sidebar::after", {
    "--profile-gradient-start": "color-mix(in oklab, var(--profile-gradient-overlay-color) 100%, var(--profile-gradient-primary-color))",
    "--profile-gradient-end": "color-mix(in oklab, var(--profile-gradient-overlay-color) 100%, var(--profile-gradient-secondary-color))",
    padding: S.pad + "px",
    background: "linear-gradient(var(--profile-gradient-start), var(--profile-gradient-start) var(--custom-user-profile-banner-height), var(--profile-gradient-end))",
    color: "#ffffff", "text-align": "center", "font-size": "15px", overflow: "hidden", display: "block", content: `"${msg}"`,
  }));
  hide(S.gift, '#app-mount div:is([aria-label*="regalo" i], [aria-label*="gift" i])');
  hide(S.btns, '#app-mount [class*="upperContainer__"] [aria-label*="videollamada" i],\n#app-mount [data-list-item-id*="nitro"],\n#app-mount [data-list-item-id*="shop"],\n#app-mount [data-list-item-id*="quests"]');
  hide(S.sup, '#app-mount [aria-label*="super" i][role="button"]');
  hide(S.gifb, '#app-mount [class*="channelTextArea"] :is([aria-label*="GIF" i], [aria-label*="sticker" i])');
  hide(S.np, '#app-mount [class*="nowPlayingColumn"]');
  if (S.ment) Q.push(rule('#app-mount [class*="mentioned__"]', { "border-left": `4px solid ${A}` + I, background: `linear-gradient(to right, ${A}22, transparent)` + I }));
  if (S.glow) Q.push(
    rule('#app-mount [class*="modeSelected__"] [class*="name__"]', { color: A + I, "font-weight": "bold" + I, "text-shadow": `0 0 ${gr}px ${gc}` }),
    rule('#app-mount a[id*="message-link"],\n#app-mount [class*="messageContent"] a', { color: A + I, "font-weight": "500" + I, transition: "text-shadow 0.3s ease, color 0.3s ease" + I }),
    rule('#app-mount a[id*="message-link"]:hover,\n#app-mount [class*="messageContent"] a:hover', { color: "#ffffff" + I, "text-shadow": `0 0 ${gr}px ${gc}, 0 0 ${Math.round(gr * 1.8)}px ${gc}` + I, "text-decoration": "underline" + I }));
  if (S.scroll) Q.push(
    rule("#app-mount ::-webkit-scrollbar", { width: "8px", height: "8px" }),
    rule("#app-mount ::-webkit-scrollbar-thumb", { background: A + "66", "border-radius": S.radius + "px" }),
    rule("#app-mount ::-webkit-scrollbar-track", { background: "transparent" }));
  if (S.sel) Q.push(rule("#app-mount ::selection", { background: A + "55", color: "#ffffff" }));
  if (S.extra.trim()) Q.push(S.extra.trim() + "\n");
  return Q.join("\n");
}
const prof = () => { const a = colors().hex; return [["#121017", a], [a, "#ffffff"], [a, hex(...S.pal[(S.pi + 1) % 3])], [S.p1, S.p2]][S.prof]; };
const enc3y3 = (s) => String.fromCodePoint(0xe0000) + [...s].map((ch) => String.fromCodePoint(0xe0000 + ch.charCodeAt(0))).join("") + String.fromCodePoint(0xe007f);

/* ---------- render ---------- */
const render = () => raf || (raf = requestAnimationFrame(() => { raf = 0; update(); }));
function update() {
  const c = colors(), o = (S.opacity / 100).toFixed(2), T = themeCss(c), Qc = quickCss(c);
  const meta = (n) => `/**\n * @name ${n}\n * @author Joako\n * @description Generado con CSS.DISCORD\n */\n\n`;
  OUT = {
    uni: [`${S.base}-full.theme.css`, meta(S.base + "-FullCustom") + T + "\n\n" + Qc],
    theme: [`${S.base}-tema.theme.css`, meta(S.base + " (Custom Palette)") + T],
    quick: ["quickcss.css", Qc],
  };
  $("#out").value = OUT[tab][1];
  $$("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  $$("[data-s]").forEach((b) => b.classList.toggle("on", +b.dataset.s === S.scheme));
  $$("[data-prof]").forEach((b) => b.classList.toggle("on", +b.dataset.prof === S.prof));
  $("#pal").innerHTML = S.pal.map((p, i) => `<button class="pal${S.scheme === 0 && S.pi === i && !S.custom ? " on" : ""}" data-i="${i}" aria-label="Color ${i + 1}">${[p, mix(p, [255, 255, 255], .2), mix(p, [0, 0, 0], .5)].map((v) => `<i style="background:${hex(...v)}"></i>`).join("")}</button>`).join("");
  const st = document.documentElement.style; st.setProperty("--acc", c.hex); st.setProperty("--on", onCol(c.acc));
  $("#pv").style.cssText = `--pa:${c.hex};--pr:${S.radius}px;--pb:rgba(${c.bg.map(Math.round)},${o});--pg:${S.glow ? S.glowR : 0}px`;
  if (document.activeElement !== $("#cc")) $("#cc").value = c.hex;
  prof().forEach((h, i) => { const b = $("#b" + (i + 1)); b.style.background = h; b.style.color = onCol(rgb(h)); b.textContent = h; });
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
}
function ctl([t, k, l, a, b, u]) {
  const id = "c_" + k;
  if (t === "tgl") return `<label class="row"><span>${l}</span><span class="sw"><input type="checkbox" id="${id}" data-k="${k}"><i></i></span></label>`;
  if (t === "rng") return `<div class="col"><label class="row" for="${id}"><span>${l}</span><b id="v_${k}"></b></label><input type="range" id="${id}" data-k="${k}" data-u="${u}" min="${a}" max="${b}"></div>`;
  if (t === "sel") return `<label class="row"><span>${l}</span><select id="${id}" data-k="${k}">${a.map((o) => `<option>${o}</option>`).join("")}</select></label>`;
  return `<div class="col"><label for="${id}">${l}</label><textarea id="${id}" data-k="${k}" rows="${t === "area" ? 4 : 2}" spellcheck="false"></textarea></div>`;
}
function syncUI() {
  $$("[data-k]").forEach((el) => {
    const v = S[el.dataset.k];
    if (el.type === "checkbox") el.checked = !!v; else if (el.id !== "cc") el.value = v;
    const l = $("#v_" + el.dataset.k); if (l) l.textContent = v + el.dataset.u;
  });
}

/* ---------- imagen y avatar ---------- */
function onFile(f) {
  if (!f || !f.type.startsWith("image/")) return toast("Elegí un archivo de imagen");
  $("#upStatus").textContent = "Imagen: " + f.name;
  const u = URL.createObjectURL(f), im = new Image();
  im.onload = () => {
    try {
      const p = extract(im);
      if (p) { while (p.length < 3) p.push(mix(p[p.length - 1], [255, 255, 255], .2).map(Math.round)); S.pal = p; }
    } catch (e) { console.error(e); }
    Object.assign(S, { pi: 0, scheme: 0, custom: "" });
    URL.revokeObjectURL(AV.url);
    Object.assign(AV, { img: im, url: u, cx: im.width / 2, cy: im.height / 2 });
    $("#avEmpty").hidden = true; $("#avBox").hidden = false;
    $("#pvAv").style.backgroundImage = `url(${u})`;
    setZ(1); render();
  };
  im.onerror = () => toast("No se pudo leer la imagen");
  im.src = u;
}
function drawAv(cv = $("#cv"), n = cv.width) {
  const { img, z } = AV; if (!img) return;
  const cs = Math.min(img.width, img.height) / z;
  AV.cx = Math.max(cs / 2, Math.min(img.width - cs / 2, AV.cx));
  AV.cy = Math.max(cs / 2, Math.min(img.height - cs / 2, AV.cy));
  const x = cv.getContext("2d"); x.clearRect(0, 0, n, n); x.save(); x.beginPath();
  x.roundRect(0, 0, n, n, S.shape === "circle" ? n / 2 : S.shape === "rounded" ? n * .22 : 0); x.clip();
  x.drawImage(img, AV.cx - cs / 2, AV.cy - cs / 2, cs, cs, 0, 0, n, n); x.restore();
}
function setZ(z) {
  AV.z = Math.max(1, Math.min(4, z));
  $("#zoom").value = AV.z * 100; $("#zv").textContent = AV.z.toFixed(1) + "x"; drawAv();
}

/* ---------- acciones ---------- */
const ACT = {
  pick: () => $("#img").click(),
  import: () => $("#impIn").click(),
  export: () => save("css-discord-config.json", JSON.stringify(S, null, 2), "application/json"),
  reset: () => { if (confirm("¿Restablecer toda la configuración?")) { S = { ...DEF }; syncUI(); render(); } },
  dl: () => save(...OUT[tab]),
  copy: () => copy(OUT[tab][1]).then(() => toast("Código copiado")),
  hx: (b) => copy(b.textContent).then(() => toast("Copiado " + b.textContent)),
  c3: () => copy(enc3y3(`[${prof()}]`)).then(() => toast("Código 3y3 copiado")),
  avreset: () => { if (AV.img) { AV.cx = AV.img.width / 2; AV.cy = AV.img.height / 2; setZ(1); } },
  avdl: () => {
    if (!AV.img) return toast("Primero subí una imagen");
    const c = document.createElement("canvas"); c.width = c.height = +S.size; drawAv(c, c.width);
    c.toBlob((bl) => save(`avatar-${S.size}.png`, bl));
  },
};
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-s],[data-i],[data-prof],[data-tab],[data-act]"); if (!b) return;
  const d = b.dataset;
  if (d.s !== undefined) { S.scheme = +d.s; S.custom = ""; }
  else if (d.i !== undefined) { S.pi = +d.i; S.scheme = 0; S.custom = ""; }
  else if (d.prof !== undefined) S.prof = +d.prof;
  else if (d.tab) tab = d.tab;
  else return ACT[d.act](b);
  render();
});
document.addEventListener("input", (e) => {
  const el = e.target, k = el.dataset && el.dataset.k; if (!k) return;
  S[k] = el.type === "checkbox" ? +el.checked : el.type === "range" ? +el.value : el.value;
  if (k === "p1" || k === "p2") S.prof = 3;
  const l = $("#v_" + k); if (l) l.textContent = S[k] + el.dataset.u;
  if (AV.img) drawAv();
  render();
});
$("#img").addEventListener("change", (e) => onFile(e.target.files[0]));
$("#impIn").addEventListener("change", async (e) => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  try { S = fix({ ...DEF, ...JSON.parse(await f.text()) }); syncUI(); render(); toast("Config importada"); } catch { toast("Archivo inválido"); }
});
$("#zoom").addEventListener("input", (e) => setZ(e.target.value / 100));
document.addEventListener("paste", (e) => { const f = e.clipboardData && e.clipboardData.files[0]; if (f) onFile(f); });
const dz = $("#drop");
["dragenter", "dragover"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.add("hl"); }));
["dragleave", "drop"].forEach((t) => dz.addEventListener(t, (e) => { e.preventDefault(); dz.classList.remove("hl"); if (t === "drop") onFile(e.dataTransfer.files[0]); }));
const cv = $("#cv"); let drag = null;
cv.addEventListener("pointerdown", (e) => { drag = [e.clientX, e.clientY]; cv.setPointerCapture(e.pointerId); });
cv.addEventListener("pointermove", (e) => {
  if (!drag || !AV.img) return;
  const k = Math.min(AV.img.width, AV.img.height) / AV.z / cv.clientWidth;
  AV.cx -= (e.clientX - drag[0]) * k; AV.cy -= (e.clientY - drag[1]) * k; drag = [e.clientX, e.clientY]; drawAv();
});
["pointerup", "pointercancel"].forEach((t) => cv.addEventListener(t, () => (drag = null)));
cv.addEventListener("wheel", (e) => { e.preventDefault(); setZ(AV.z * (e.deltaY < 0 ? 1.1 : .9)); }, { passive: false });

/* ---------- init ---------- */
$("#schemes").innerHTML = SCHEMES.map((s, i) => `<button class="sch" data-s="${i}"><span class="sd">${s[1] ? `<i style="background:${s[1]}"></i><i style="background:${s[2]}"></i>` : '<i style="background:linear-gradient(135deg,#f66,#6af,#6f9)"></i>'}</span>${s[0]}</button>`).join("");
$("#themeUI").innerHTML = THEME_UI.map(ctl).join("");
$("#quickUI").innerHTML = QUICK_UI.map(ctl).join("");
syncUI(); update();
