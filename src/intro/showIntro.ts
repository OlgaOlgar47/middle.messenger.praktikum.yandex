import { text } from "@/locale";
import { russiaPaths, uruguayPaths } from "./countryOutlines";

const HIDE_MS = 3000;
const REMOVE_MS = 3480;
const SVG_NS = "http://www.w3.org/2000/svg";

const WAVE_PATH = [
  "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,",
  "576,122.7C672,117,768,139,864,144C960,149,1056,139,",
  "1152,122.7C1248,107,1344,85,1392,74.7L1440,64",
  "L1440,320L0,320Z",
].join("");

const FLAKES = [
  { left: "8%", duration: "7s", delay: "0s" },
  { left: "18%", duration: "9s", delay: "1.2s" },
  { left: "31%", duration: "6.5s", delay: "0.4s" },
  { left: "46%", duration: "8s", delay: "2s" },
  { left: "58%", duration: "10s", delay: "0.8s" },
  { left: "71%", duration: "7.5s", delay: "1.6s" },
  { left: "84%", duration: "9.5s", delay: "0.2s" },
  { left: "93%", duration: "8.5s", delay: "2.4s" },
];

type CountrySpec = {
  className: string;
  paths: string[];
  viewBox: string;
  stroke: string;
};

function createCountry(spec: CountrySpec): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", `intro-country ${spec.className}`);
  svg.setAttribute("viewBox", spec.viewBox);
  svg.setAttribute("aria-hidden", "true");

  const group = document.createElementNS(SVG_NS, "g");
  group.setAttribute("transform", "translate(0,1024) scale(0.1,-0.1)");

  spec.paths.forEach((d) => {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", spec.stroke);
    path.setAttribute("stroke-width", "2.4");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("vector-effect", "non-scaling-stroke");
    group.append(path);
  });

  svg.append(group);
  return svg;
}

function createLink(): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "intro-link");
  const line = document.createElementNS(SVG_NS, "line");
  line.setAttribute("stroke", "#00FFAA");
  line.setAttribute("stroke-width", "2.5");
  line.setAttribute("stroke-dasharray", "8 10");
  line.setAttribute("stroke-linecap", "round");
  svg.append(line);
  return svg;
}

function createWave(): HTMLDivElement {
  const wave = document.createElement("div");
  wave.className = "intro-wave";
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 1440 320");
  svg.setAttribute("preserveAspectRatio", "none");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("fill", "#ffffff");
  path.setAttribute("fill-opacity", "0.55");
  path.setAttribute("d", WAVE_PATH);
  svg.append(path);
  wave.append(svg);
  return wave;
}

function placeLink(root: HTMLElement): void {
  const line = root.querySelector("line");
  const russia = root.querySelector(".intro-country-ru");
  const uruguay = root.querySelector(".intro-country-uy");
  if (!(line instanceof SVGLineElement) || !russia || !uruguay) {
    return;
  }
  const svg = line.ownerSVGElement;
  if (!svg) {
    return;
  }
  const rootBox = svg.getBoundingClientRect();
  const from = russia.getBoundingClientRect();
  const to = uruguay.getBoundingClientRect();
  line.setAttribute("x1", String(from.left + from.width * 0.28 - rootBox.left));
  line.setAttribute("y1", String(from.top + from.height * 0.78 - rootBox.top));
  line.setAttribute("x2", String(to.left + to.width * 0.7 - rootBox.left));
  line.setAttribute("y2", String(to.top + to.height * 0.22 - rootBox.top));
}

export function showIntro(): void {
  const root = document.createElement("div");
  root.className = "intro";

  const backdrop = document.createElement("div");
  backdrop.className = "intro-bg";
  backdrop.setAttribute("aria-hidden", "true");

  const map = document.createElement("div");
  map.className = "intro-map";
  map.append(
    createCountry({
      className: "intro-country-ru",
      paths: russiaPaths,
      viewBox: "0 190 1024 650",
      stroke: "#1E3A8A",
    }),
    createCountry({
      className: "intro-country-uy",
      paths: uruguayPaths,
      viewBox: "40 0 950 1024",
      stroke: "#0678AD",
    }),
    createLink()
  );

  const glow = document.createElement("div");
  glow.className = "intro-glow";

  backdrop.append(map, glow, createWave());
  FLAKES.forEach((flake) => {
    const dot = document.createElement("span");
    dot.className = "intro-flake";
    dot.style.left = flake.left;
    dot.style.animationDuration = flake.duration;
    dot.style.animationDelay = flake.delay;
    backdrop.append(dot);
  });

  const content = document.createElement("div");
  content.className = "intro-content";

  const logo = document.createElement("img");
  logo.className = "intro-logo";
  logo.src = "/images/logoURUS.svg";
  logo.alt = "URUSchat";

  const phrase = document.createElement("p");
  phrase.className = "intro-phrase";
  phrase.textContent = text().introPhrase;

  const line = document.createElement("span");
  line.className = "intro-line";

  content.append(logo, phrase, line);
  root.append(backdrop, content);
  document.body.append(root);

  const place = () => placeLink(root);
  place();
  window.addEventListener("resize", place);

  window.setTimeout(() => {
    root.classList.add("intro-leaving");
  }, HIDE_MS);

  window.setTimeout(() => {
    window.removeEventListener("resize", place);
    root.remove();
  }, REMOVE_MS);
}
