const PALETA_DEFAULT = [
  { r: 157, g: 124, b: 214 },
  { r: 192, g: 202, b: 245 },
  { r: 187, g: 154, b: 247 },
];

let coloresExtraidos = JSON.parse(JSON.stringify(PALETA_DEFAULT));
let currentPrimaryHex = "#121017";
let currentAccentHex = "#9d7cd6";

let paletaIndex = 0;
let profilePresetIndex = 0;

let avatarImgElem = null;
let focalPercentX = 0.5;
let focalPercentY = 0.5;
let focalZoom = 1.0;
let isDraggingFocal = false;
let renderScheduled = false;

function copiarTexto(str) {
  if (!str) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(str).catch(() => fallbackCopy(str));
  } else {
    fallbackCopy(str);
  }
}

function fallbackCopy(str) {
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

function copiarCodigo3y3() {
  const rawStr = `[${currentPrimaryHex},${currentAccentHex}]`;
  let encoded3y3 = String.fromCodePoint(0xe0000);
  for (let i = 0; i < rawStr.length; i++) {
    encoded3y3 += String.fromCodePoint(0xe0000 + rawStr.charCodeAt(i));
  }
  encoded3y3 += String.fromCodePoint(0xe007f);
  copiarTexto(encoded3y3);
  alert("Codigo 3y3 copiado al portapapeles.");
}

function toggleAccordion(contentId, arrowId) {
  const content = document.getElementById(contentId);
  const arrow = document.getElementById(arrowId);
  if (content && arrow) {
    content.classList.toggle("open");
    arrow.classList.toggle("open");
  }
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function hexToRgb(hex) {
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToOklab(r, g, b) {
  let sr = r / 255,
    sg = g / 255,
    sb = b / 255;
  sr = sr > 0.04045 ? Math.pow((sr + 0.055) / 1.055, 2.4) : sr / 12.92;
  sg = sg > 0.04045 ? Math.pow((sg + 0.055) / 1.055, 2.4) : sg / 12.92;
  sb = sb > 0.04045 ? Math.pow((sb + 0.055) / 1.055, 2.4) : sb / 12.92;

  let l = 0.4122214708 * sr + 0.5363325363 * sg + 0.0514459929 * sb;
  let m = 0.2119034982 * sr + 0.6806995451 * sg + 0.1073969567 * sb;
  let s = 0.0883024619 * sr + 0.2817188376 * sg + 0.6299787005 * sb;

  let l_ = Math.cbrt(l),
    m_ = Math.cbrt(m),
    s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720403 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

function oklabDistance(lab1, lab2) {
  let dL = lab1.L - lab2.L,
    da = lab1.a - lab2.a,
    db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

function asegurarContrasteOKLab(lab, isDark = true) {
  let targetL = isDark ? Math.max(lab.L, 0.7) : Math.min(lab.L, 0.3);
  return { ...lab, L: targetL };
}

function oklabToRgb(lab) {
  let l_ = lab.L + 0.3963377774 * lab.a + 0.2158037573 * lab.b;
  let m_ = lab.L - 0.1055613458 * lab.a - 0.0638541728 * lab.b;
  let s_ = lab.L - 0.0894841775 * lab.a - 1.291485548 * lab.b;

  let l = l_ * l_ * l_,
    m = m_ * m_ * m_,
    s = s_ * s_ * s_;

  let sr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let sg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let sb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  let r = sr > 0.0031308 ? 1.055 * Math.pow(sr, 1 / 2.4) - 0.055 : 12.92 * sr;
  let g = sg > 0.0031308 ? 1.055 * Math.pow(sg, 1 / 2.4) - 0.055 : 12.92 * sg;
  let b = sb > 0.0031308 ? 1.055 * Math.pow(sb, 1 / 2.4) - 0.055 : 12.92 * sb;

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255))),
  };
}

function extraerPaletaOKLab(img, count = 3) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = Math.min(1, 100 / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.floor(img.width * scale));
  canvas.height = Math.max(1, Math.floor(img.height * scale));

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  let pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    pixels.push({ r, g, b, lab: rgbToOklab(r, g, b) });
  }

  if (!pixels.length) return JSON.parse(JSON.stringify(PALETA_DEFAULT));

  let centroids = [];
  let step = Math.floor(pixels.length / count);
  for (let i = 0; i < count; i++) {
    centroids.push({ ...pixels[Math.min(i * step, pixels.length - 1)] });
  }

  for (let iter = 0; iter < 6; iter++) {
    let clusters = Array.from({ length: count }, () => []);
    for (let p of pixels) {
      let minDist = Infinity,
        closest = 0;
      for (let c = 0; c < count; c++) {
        let dist = oklabDistance(p.lab, centroids[c].lab);
        if (dist < minDist) {
          minDist = dist;
          closest = c;
        }
      }
      clusters[closest].push(p);
    }

    for (let c = 0; c < count; c++) {
      if (!clusters[c].length) continue;
      let sumR = 0,
        sumG = 0,
        sumB = 0;
      for (let p of clusters[c]) {
        sumR += p.r;
        sumG += p.g;
        sumB += p.b;
      }
      let r = Math.round(sumR / clusters[c].length);
      let g = Math.round(sumG / clusters[c].length);
      let b = Math.round(sumB / clusters[c].length);
      centroids[c] = { r, g, b, lab: rgbToOklab(r, g, b) };
    }
  }

  return centroids.map((c) => oklabToRgb(asegurarContrasteOKLab(c.lab, true)));
}

function focalizarSubidaGlobal() {
  const uploadWrapper = document.getElementById("mainUploadWrapper");
  if (uploadWrapper) {
    uploadWrapper.scrollIntoView({ behavior: "smooth", block: "center" });
    uploadWrapper.classList.add("highlight");
    setTimeout(() => {
      uploadWrapper.classList.remove("highlight");
    }, 2000);
  }
}

function aplicarColoresUI(mainHex) {
  document.documentElement.style.setProperty("--accent-ui", mainHex);
  document.documentElement.style.setProperty("--border-hover", mainHex);
}

function inicializarCargaGlobal() {
  const globalImgInput = document.getElementById("globalImgInput");
  const globalUploadStatus = document.getElementById("globalUploadStatus");

  if (!globalImgInput) return;

  globalImgInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    if (globalUploadStatus) {
      globalUploadStatus.textContent = `Imagen: ${file.name}`;
    }

    const imgDataUrl = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = function () {
      try {
        coloresExtraidos = extraerPaletaOKLab(img, 3);
      } catch (err) {
        console.error(err);
      }

      while (coloresExtraidos.length < 3) {
        const base =
          coloresExtraidos[coloresExtraidos.length - 1] || PALETA_DEFAULT[0];
        coloresExtraidos.push({
          r: Math.min(255, Math.round(base.r * 1.2)),
          g: Math.min(255, Math.round(base.g * 1.2)),
          b: Math.min(255, Math.round(base.b * 1.2)),
        });
      }

      paletaIndex = 0;
      document
        .querySelectorAll(".palette-option")
        .forEach((opt, idx) => opt.classList.toggle("active", idx === 0));

      procesarPaleta();
    };

    img.src = imgDataUrl;
    cargarImagenParaRecorte(imgDataUrl);
  });
}

function cargarImagenParaRecorte(dataUrl) {
  avatarImgElem = new Image();
  avatarImgElem.onload = function () {
    resetFocalAndZoom();

    const focalImg = document.getElementById("focalImg");
    const focalEditor = document.getElementById("focalEditor");
    const cropperEmptyState = document.getElementById("cropperEmptyState");
    const cropperActiveState = document.getElementById("cropperActiveState");

    if (cropperEmptyState) cropperEmptyState.style.display = "none";
    if (cropperActiveState) cropperActiveState.style.display = "block";

    if (focalImg) focalImg.src = dataUrl;
    if (focalEditor) focalEditor.classList.add("active");

    requestRender();
  };
  avatarImgElem.src = dataUrl;
}

function resetFocalAndZoom() {
  focalPercentX = 0.5;
  focalPercentY = 0.5;
  focalZoom = 1.0;

  const focalX = document.getElementById("focalX");
  const focalY = document.getElementById("focalY");
  const focalZoomElem = document.getElementById("focalZoom");
  const zoomVal = document.getElementById("zoomVal");

  if (focalX) focalX.value = 50;
  if (focalY) focalY.value = 50;
  if (focalZoomElem) focalZoomElem.value = 100;
  if (zoomVal) zoomVal.textContent = "1.0x";

  requestRender();
}

function procesarPaleta() {
  coloresExtraidos.forEach((rgb, idx) => {
    const dotsContainer = document.getElementById(`dots-${idx}`);
    if (!dotsContainer) return;
    const hexMain = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hexDark = rgbToHex(
      Math.max(10, Math.round(rgb.r * 0.5)),
      Math.max(10, Math.round(rgb.g * 0.5)),
      Math.max(10, Math.round(rgb.b * 0.5)),
    );
    const hexLight = rgbToHex(
      Math.min(255, Math.round(rgb.r * 1.2)),
      Math.min(255, Math.round(rgb.g * 1.2)),
      Math.min(255, Math.round(rgb.b * 1.2)),
    );

    dotsContainer.innerHTML = `
            <div class="color-dot" style="background: ${hexMain};"></div>
            <div class="color-dot" style="background: ${hexLight};"></div>
            <div class="color-dot" style="background: ${hexDark};"></div>
        `;
  });

  const activeRGB = coloresExtraidos[paletaIndex] || coloresExtraidos[0];
  const mainHex = rgbToHex(activeRGB.r, activeRGB.g, activeRGB.b);

  aplicarColoresUI(mainHex);

  if (profilePresetIndex === 0) {
    currentPrimaryHex = "#121017";
    currentAccentHex = mainHex;
  } else if (profilePresetIndex === 1) {
    currentPrimaryHex = mainHex;
    currentAccentHex = "#ffffff";
  } else {
    let secRGB = coloresExtraidos[(paletaIndex + 1) % coloresExtraidos.length];
    currentPrimaryHex = mainHex;
    currentAccentHex = rgbToHex(secRGB.r, secRGB.g, secRGB.b);
  }

  const prevPrimary = document.getElementById("prevPrimary");
  const prevAccent = document.getElementById("prevAccent");

  if (prevPrimary) {
    prevPrimary.style.background = currentPrimaryHex;
    prevPrimary.textContent = currentPrimaryHex;
  }
  if (prevAccent) {
    prevAccent.style.background = currentAccentHex;
    prevAccent.style.color = currentAccentHex === "#ffffff" ? "#000" : "#fff";
    prevAccent.textContent = currentAccentHex;
  }

  actualizarTema();
  generarQuickCSS();
  guardarEnLocalStorage();
}

function seleccionarPaleta(index, el) {
  paletaIndex = index;
  document
    .querySelectorAll(".palette-option")
    .forEach((opt) => opt.classList.remove("active"));
  if (el) el.classList.add("active");
  procesarPaleta();
}

function seleccionarPresetProfile(index, el) {
  profilePresetIndex = index;
  document
    .querySelectorAll(".profile-preset-item")
    .forEach((opt) => opt.classList.remove("active"));
  if (el) el.classList.add("active");
  procesarPaleta();
}

function actualizarTema() {
  const radiusElem = document.getElementById("radiusSlider");
  const opacityElem = document.getElementById("opacitySlider");
  if (!radiusElem || !opacityElem) return;

  const radius = radiusElem.value;
  const opacity = (opacityElem.value / 100).toFixed(2);

  const radiusVal = document.getElementById("radiusVal");
  const opacityVal = document.getElementById("opacityVal");
  if (radiusVal) radiusVal.textContent = `${radius}px`;
  if (opacityVal) opacityVal.textContent = `${Math.round(opacity * 100)}%`;

  const rgb = coloresExtraidos[paletaIndex] || coloresExtraidos[0];
  const mainHex = rgbToHex(rgb.r, rgb.g, rgb.b);

  const discordPreview = document.getElementById("discordPreview");
  if (discordPreview) {
    discordPreview.style.setProperty("--preview-radius", `${radius}px`);
    discordPreview.style.setProperty(
      "--preview-bg",
      `rgba(18, 16, 23, ${opacity})`,
    );
    discordPreview.style.setProperty("--preview-border", mainHex);
  }

  const theme = `/**
 * @name system24 (Custom Palette)
 * @author Joako
 */

@import url("https://refact0r.github.io/system24/build/system24.css");

body {
    --font: "DM Mono";
    --code-font: "DM Mono";
    font-weight: 300;
    letter-spacing: -0.05ch;

    --gap: 12px;
    --divider-thickness: 4px;
    --border-thickness: 2px;
    --border-hover-transition: 0.2s ease;

    --transparency-tweaks: on;
    --remove-bg-layer: on;
    --panel-blur: on;
    --small-user-panel: on;
    --unrounding: off;
    --panel-labels: on;
}

:root {
    --colors: on;

    --bg-1: rgba(18, 16, 23, ${opacity});
    --bg-2: rgba(14, 12, 19, ${opacity});
    --bg-3: rgba(10, 8, 14, ${opacity});
    --bg-4: rgba(6, 5, 8, ${opacity});

    --hover: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15);
    --active: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28);

    --accent-1: ${mainHex};
    --accent-2: ${mainHex};
    --border: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35);
    --border-hover: ${mainHex};
}

#app-mount :is(
    div, button, a, img,
    [class*="container"], [class*="wrapper"], [class*="inner"],
    [class*="panel"], [class*="menu"], [class*="card"],
    [class*="popout"], [class*="modal"], [class*="input"], [class*="button"]
) {
    border-radius: ${radius}px !important;
}

#app-mount :is([class*="avatar"], foreignObject, [class*="mask"]) {
    border-radius: ${radius}px !important;
}`;

  const themeOutput = document.getElementById("themeOutput");
  if (themeOutput) themeOutput.value = theme;
}

function generarQuickCSS() {
  let css = "";

  const swProfileMsg = document.getElementById("swProfileMsg");
  const swHideGift = document.getElementById("swHideGift");
  const swHideButtons = document.getElementById("swHideButtons");
  const swHideSuperReactions = document.getElementById("swHideSuperReactions");
  const swMentionColor = document.getElementById("swMentionColor");
  const swLinkGlow = document.getElementById("swLinkGlow");

  const customMsgInput = document.getElementById("customMsgInput");
  const bannerPaddingSlider = document.getElementById("bannerPaddingSlider");
  const glowSlider = document.getElementById("glowSlider");
  const glowOpacitySlider = document.getElementById("glowOpacitySlider");

  const bannerPaddingVal = document.getElementById("bannerPaddingVal");
  const glowVal = document.getElementById("glowVal");
  const glowOpacityVal = document.getElementById("glowOpacityVal");

  let paddingPx = bannerPaddingSlider ? bannerPaddingSlider.value : "40";
  if (bannerPaddingVal) bannerPaddingVal.textContent = `${paddingPx}px`;

  let glowRadius = glowSlider ? glowSlider.value : "8";
  if (glowVal) glowVal.textContent = `${glowRadius}px`;

  let glowOpacity = glowOpacitySlider ? glowOpacitySlider.value / 100 : 1;
  if (glowOpacityVal)
    glowOpacityVal.textContent = `${Math.round(glowOpacity * 100)}%`;

  let customMsg = customMsgInput
    ? customMsgInput.value
    : "Meow :3\\a(Waiting for something to happen?)";
  customMsg = customMsg.replace(/"/g, '\\"').replace(/\n/g, "\\a ");

  if (swProfileMsg && swProfileMsg.checked) {
    css += `.user-profile-sidebar::after {\n    --profile-gradient-start: color-mix(\n        in oklab,\n        var(--profile-gradient-overlay-color) 100%,\n        var(--profile-gradient-primary-color)\n    );\n    --profile-gradient-end: color-mix(\n        in oklab,\n        var(--profile-gradient-overlay-color) 100%,\n        var(--profile-gradient-secondary-color)\n    );\n    padding: ${paddingPx}px;\n    background: linear-gradient(\n        var(--profile-gradient-start),\n        var(--profile-gradient-start) var(--custom-user-profile-banner-height),\n        var(--profile-gradient-end)\n    );\n    color: #ffffff;\n    text-align: center;\n    font-size: 15px;\n    overflow: hidden;\n    display: block;\n    content: "${customMsg}";\n}\n\n`;
  }

  if (swHideGift && swHideGift.checked) {
    css += `#app-mount div:is([aria-label*="regalo" i], [aria-label*="gift" i]) {\n    display: none !important;\n}\n\n`;
  }

  if (swHideButtons && swHideButtons.checked) {
    css += `#app-mount [class*="upperContainer__"] [aria-label*="videollamada" i],\n#app-mount [data-list-item-id*="nitro"],\n#app-mount [data-list-item-id*="shop"],\n#app-mount [data-list-item-id*="quests"] {\n    display: none !important;\n}\n\n`;
  }

  if (swHideSuperReactions && swHideSuperReactions.checked) {
    css += `#app-mount [aria-label*="super" i][role="button"] {\n    display: none !important;\n}\n\n`;
  }

  if (swMentionColor && swMentionColor.checked) {
    css += `#app-mount [class*="mentioned__"] {\n    border-left: 4px solid ${currentAccentHex} !important;\n    background: linear-gradient(to right, ${currentAccentHex}22, transparent) !important;\n}\n\n`;
  }

  if (swLinkGlow && swLinkGlow.checked) {
    const activeRGB = coloresExtraidos[paletaIndex] || coloresExtraidos[0];
    const glowRgba = `rgba(${activeRGB.r}, ${activeRGB.g}, ${activeRGB.b}, ${glowOpacity})`;

    css += `#app-mount [class*="modeSelected__"] [class*="name__"] {\n    color: ${currentAccentHex} !important;\n    font-weight: bold !important;\n    text-shadow: 0 0 ${glowRadius}px ${glowRgba};\n}\n#app-mount a[id*="message-link"],\n#app-mount [class*="messageContent"] a {\n    color: ${currentAccentHex} !important;\n    font-weight: 500 !important;\n    transition: text-shadow 0.3s ease, color 0.3s ease !important;\n}\n#app-mount a[id*="message-link"]:hover,\n#app-mount [class*="messageContent"] a:hover {\n    color: #ffffff !important;\n    text-shadow: 0 0 ${glowRadius}px ${glowRgba}, 0 0 ${Math.round(glowRadius * 1.8)}px ${glowRgba} !important;\n    text-decoration: underline !important;\n}\n\n`;
  }

  const quickOutput = document.getElementById("quickOutput");
  if (quickOutput) quickOutput.value = css;
}

function descargarTemaCompleto() {
  const themeSrc = document.getElementById("themeOutput")?.value || "";
  const quickSrc = document.getElementById("quickOutput")?.value || "";

  const unificado = `/**
 * @name System24-FullCustom
 * @author Joako
 * @description Tema unificado con configuraciones de QuickCSS.
 */

${themeSrc}

${quickSrc}`;

  const blob = new Blob([unificado], { type: "text/css;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "System24-FullCustom.theme.css";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function guardarEnLocalStorage() {
  const state = {
    paletaIndex,
    profilePresetIndex,
    coloresExtraidos,
    radius: document.getElementById("radiusSlider")?.value,
    opacity: document.getElementById("opacitySlider")?.value,
    customMsg: document.getElementById("customMsgInput")?.value,
    bannerPadding: document.getElementById("bannerPaddingSlider")?.value,
    glow: document.getElementById("glowSlider")?.value,
    glowOpacity: document.getElementById("glowOpacitySlider")?.value,
    swProfileMsg: document.getElementById("swProfileMsg")?.checked,
    swHideGift: document.getElementById("swHideGift")?.checked,
    swHideButtons: document.getElementById("swHideButtons")?.checked,
    swHideSuperReactions: document.getElementById("swHideSuperReactions")
      ?.checked,
    swMentionColor: document.getElementById("swMentionColor")?.checked,
    swLinkGlow: document.getElementById("swLinkGlow")?.checked,
  };
  localStorage.setItem("custom_css_generator_config", JSON.stringify(state));
}

function cargarDesdeLocalStorage() {
  const saved = localStorage.getItem("custom_css_generator_config");
  if (!saved) return;
  try {
    const state = JSON.parse(saved);
    if (state.coloresExtraidos) coloresExtraidos = state.coloresExtraidos;
    if (state.paletaIndex !== undefined) paletaIndex = state.paletaIndex;
    if (state.profilePresetIndex !== undefined)
      profilePresetIndex = state.profilePresetIndex;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };
    const setCheck = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.checked = val;
    };

    setVal("radiusSlider", state.radius);
    setVal("opacitySlider", state.opacity);
    setVal("customMsgInput", state.customMsg);
    setVal("bannerPaddingSlider", state.bannerPadding);
    setVal("glowSlider", state.glow);
    setVal("glowOpacitySlider", state.glowOpacity);

    setCheck("swProfileMsg", state.swProfileMsg);
    setCheck("swHideGift", state.swHideGift);
    setCheck("swHideButtons", state.swHideButtons);
    setCheck("swHideSuperReactions", state.swHideSuperReactions);
    setCheck("swMentionColor", state.swMentionColor);
    setCheck("swLinkGlow", state.swLinkGlow);

    document.querySelectorAll(".palette-option").forEach((opt, idx) => {
      opt.classList.toggle("active", idx === paletaIndex);
    });
    document.querySelectorAll(".profile-preset-item").forEach((opt, idx) => {
      opt.classList.toggle("active", idx === profilePresetIndex);
    });
  } catch (err) {
    console.error(err);
  }
}

function requestRender() {
  if (!renderScheduled) {
    renderScheduled = true;
    requestAnimationFrame(() => {
      actualizarVistaYRecorte();
      renderScheduled = false;
    });
  }
}

function calcularOrigenRecorte() {
  if (!avatarImgElem) return { sx: 0, sy: 0, cropSize: 0 };

  const imgW = avatarImgElem.width;
  const imgH = avatarImgElem.height;
  const baseSide = Math.min(imgW, imgH);
  const cropSize = baseSide / focalZoom;

  let centerX = imgW * focalPercentX;
  let centerY = imgH * focalPercentY;

  let sx = centerX - cropSize / 2;
  let sy = centerY - cropSize / 2;

  sx = Math.max(0, Math.min(imgW - cropSize, sx));
  sy = Math.max(0, Math.min(imgH - cropSize, sy));

  return { sx, sy, cropSize };
}

function actualizarVistaYRecorte() {
  if (!avatarImgElem) return;

  const focalPoint = document.getElementById("focalPoint");
  const focalImg = document.getElementById("focalImg");
  const focalContainer = document.getElementById("focalContainer");

  if (focalContainer && focalImg) {
    const containerW = focalContainer.clientWidth;
    const containerH = focalContainer.clientHeight;

    const imgW = avatarImgElem.width;
    const imgH = avatarImgElem.height;
    const baseSide = Math.min(imgW, imgH);
    const cropSize = baseSide / focalZoom;

    const scale = containerW / cropSize;

    const { sx, sy } = calcularOrigenRecorte();

    const displayImgW = imgW * scale;
    const displayImgH = imgH * scale;
    const displayLeft = -sx * scale;
    const displayTop = -sy * scale;

    focalImg.src = avatarImgElem.src;
    focalImg.style.width = `${displayImgW}px`;
    focalImg.style.height = `${displayImgH}px`;
    focalImg.style.left = `${displayLeft}px`;
    focalImg.style.top = `${displayTop}px`;

    if (focalPoint) {
      const dotX = (focalPercentX * imgW - sx) * scale;
      const dotY = (focalPercentY * imgH - sy) * scale;
      focalPoint.style.left = `${Math.max(0, Math.min(containerW, dotX))}px`;
      focalPoint.style.top = `${Math.max(0, Math.min(containerH, dotY))}px`;
    }
  }

  const canvas = document.getElementById("avatarCanvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 512, 512);

  ctx.save();
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const { sx, sy, cropSize } = calcularOrigenRecorte();
  ctx.drawImage(avatarImgElem, sx, sy, cropSize, cropSize, 0, 0, 512, 512);
  ctx.restore();
}

function actualizarPuntoDesdeEvent(e) {
  const focalContainer = document.getElementById("focalContainer");
  if (!focalContainer || !avatarImgElem) return;

  const rect = focalContainer.getBoundingClientRect();
  const containerW = rect.width;

  const imgW = avatarImgElem.width;
  const imgH = avatarImgElem.height;
  const baseSide = Math.min(imgW, imgH);
  const cropSize = baseSide / focalZoom;
  const scale = containerW / cropSize;

  const { sx, sy } = calcularOrigenRecorte();

  let clientX = e.clientX || (e.touches && e.touches[0].clientX);
  let clientY = e.clientY || (e.touches && e.touches[0].clientY);

  let clickX = clientX - rect.left;
  let clickY = clientY - rect.top;

  let targetImgX = sx + clickX / scale;
  let targetImgY = sy + clickY / scale;

  focalPercentX = Math.max(0, Math.min(1, targetImgX / imgW));
  focalPercentY = Math.max(0, Math.min(1, targetImgY / imgH));

  const focalX = document.getElementById("focalX");
  const focalY = document.getElementById("focalY");
  if (focalX) focalX.value = Math.round(focalPercentX * 100);
  if (focalY) focalY.value = Math.round(focalPercentY * 100);

  requestRender();
}

function actualizarPuntoDesdeSliders() {
  const focalX = document.getElementById("focalX");
  const focalY = document.getElementById("focalY");
  const focalZoomElem = document.getElementById("focalZoom");
  const zoomVal = document.getElementById("zoomVal");

  if (focalX && focalY) {
    focalPercentX = focalX.value / 100;
    focalPercentY = focalY.value / 100;
  }

  if (focalZoomElem) {
    focalZoom = focalZoomElem.value / 100;
    if (zoomVal) zoomVal.textContent = `${focalZoom.toFixed(1)}x`;
  }

  requestRender();
}

function inicializarFocalEvents() {
  const focalContainer = document.getElementById("focalContainer");
  if (!focalContainer) return;

  focalContainer.addEventListener("mousedown", (e) => {
    isDraggingFocal = true;
    actualizarPuntoDesdeEvent(e);
  });
  window.addEventListener("mousemove", (e) => {
    if (isDraggingFocal) actualizarPuntoDesdeEvent(e);
  });
  window.addEventListener("mouseup", () => {
    isDraggingFocal = false;
  });

  focalContainer.addEventListener("touchstart", (e) => {
    isDraggingFocal = true;
    actualizarPuntoDesdeEvent(e);
  });
  window.addEventListener("touchmove", (e) => {
    if (isDraggingFocal) actualizarPuntoDesdeEvent(e);
  });
  window.addEventListener("touchend", () => {
    isDraggingFocal = false;
  });
}

function descargarAvatarCircular() {
  if (!avatarImgElem) return alert("Primero selecciona una imagen.");
  actualizarVistaYRecorte();
  const canvas = document.getElementById("avatarCanvas");
  const link = document.createElement("a");
  link.download = "avatar-512x512.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function descargarArchivo(nombreArchivo, elementId) {
  const el = document.getElementById(elementId);
  if (!el || !el.value) return;
  const blob = new Blob([el.value], { type: "text/css;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function inicializarListeners() {
  const ids = [
    "radiusSlider",
    "opacitySlider",
    "customMsgInput",
    "bannerPaddingSlider",
    "glowSlider",
    "glowOpacitySlider",
  ];
  const updateAll = () => {
    actualizarTema();
    generarQuickCSS();
    guardarEnLocalStorage();
  };

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateAll);
  });

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener("change", updateAll);
  });

  const focalX = document.getElementById("focalX");
  const focalY = document.getElementById("focalY");
  const focalZoomElem = document.getElementById("focalZoom");

  if (focalX) focalX.addEventListener("input", actualizarPuntoDesdeSliders);
  if (focalY) focalY.addEventListener("input", actualizarPuntoDesdeSliders);
  if (focalZoomElem)
    focalZoomElem.addEventListener("input", actualizarPuntoDesdeSliders);
}

window.addEventListener("DOMContentLoaded", () => {
  inicializarCargaGlobal();
  inicializarFocalEvents();
  inicializarListeners();

  cargarDesdeLocalStorage();
  procesarPaleta();
});
