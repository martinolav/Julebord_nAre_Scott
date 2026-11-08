// ----- NEDTELLING -----
// Klokkeslettet er ikke bestemt ennå, så vi teller ned til starten av dagen.
// Når tiden er klar: bytt ut 00:00:00 med for eksempel 18:00:00.
const EVENT_START = new Date("2027-01-16T00:00:00+01:00");
const EVENT_DAY_END = new Date("2027-01-17T06:00:00+01:00");

const numbers = document.getElementById("countdown-numbers");
const message = document.getElementById("countdown-message");

function setNumber(id, value) {
  document.getElementById(id).textContent = String(value).padStart(2, "0");
}

function updateCountdown() {
  const now = new Date();
  const msLeft = EVENT_START - now;

  if (msLeft <= 0) {
    numbers.hidden = true;
    message.hidden = false;
    message.textContent = now < EVENT_DAY_END ? "Det er i dag! Skål!" : "Takk for festen!";
    clearInterval(timer);
    return;
  }

  const totalSeconds = Math.floor(msLeft / 1000);
  setNumber("days", Math.floor(totalSeconds / 86400));
  setNumber("hours", Math.floor(totalSeconds / 3600) % 24);
  setNumber("minutes", Math.floor(totalSeconds / 60) % 60);
  setNumber("seconds", totalSeconds % 60);
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

// ----- BYBILDET -----
// Trondheim i desember: bryggene, Gamle Bybro, Nidarosdomen, juletreet og Tyholttårnet.
// Hvert hus er [bredde, vegghøyde, gavlhøyde, farge].
const HOUSES = [
  [88, 70, 36, "#5c0f22"], [72, 92, 30, "#12302a"], [102, 62, 42, "#3d2a12"],
  [66, 80, 28, "#16384a"], [94, 98, 38, "#12302a"], [80, 66, 32, "#5c0f22"],
];
const GROUND = 266;
const DARK = "#12302a";
const COPPER = "#2f6b58";
const SNOW = "#f7f8f4";
const LIGHT = "#ffc738";
const SVG_NS = "http://www.w3.org/2000/svg";
let lightCount = 0;

function addShape(parent, tag, attrs) {
  const shape = document.createElementNS(SVG_NS, tag);
  for (const name in attrs) shape.setAttribute(name, attrs[name]);
  parent.appendChild(shape);
  return shape;
}

function addPolygon(parent, points, fill) {
  return addShape(parent, "polygon", { points: points.join(" "), fill });
}

// Legger snø langs et tak
function addSnow(parent, points) {
  addShape(parent, "polyline", {
    points: points.join(" "), fill: "none", stroke: SNOW,
    "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round",
  });
}

// Gjør en figur til et lys som tennes kort tid etter at siden er lastet
function turnOn(shape) {
  shape.classList.add("lit");
  shape.style.animationDelay = `${0.3 + ((lightCount++ * 37) % 100) / 45}s`;
  return shape;
}

function addStar(parent, cx, cy, radius) {
  const points = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 ? radius * 0.42 : radius;
    const angle = (i * Math.PI) / 8;
    points.push(`${cx + Math.sin(angle) * r},${cy - Math.cos(angle) * r}`);
  }
  turnOn(addPolygon(parent, points, LIGHT));
}

function addPointedWindow(parent, x, y, width, height) {
  turnOn(addPolygon(parent, [
    `${x},${y + height}`, `${x},${y + width / 2}`, `${x + width / 2},${y}`,
    `${x + width},${y + width / 2}`, `${x + width},${y + height}`,
  ], LIGHT));
}

function addHouse(parent, x, [width, wall, gable, color], houseIndex) {
  const eaves = GROUND - wall;
  const roof = [`${x},${eaves}`, `${x + width / 2},${eaves - gable}`, `${x + width},${eaves}`];
  addPolygon(parent, [`${x},${GROUND}`, ...roof, `${x + width},${GROUND}`], color);
  addSnow(parent, roof);

  // Hvert andre hus har adventsstjerne i gavlen
  if (houseIndex % 2 === 0) addStar(parent, x + width / 2, eaves - gable * 0.3, 8);

  // Vinduer: et mønster som ser tilfeldig ut, men er likt hver gang
  const columns = Math.floor((width - 16) / 22);
  const rows = Math.floor((wall - 8) / 32);
  const startX = x + (width - (columns * 22 - 8)) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const attrs = { x: startX + c * 22, y: eaves + 8 + r * 32, width: 14, height: 20 };
      addShape(parent, "rect", { ...attrs, fill: "#000", opacity: 0.3 });
      if ((houseIndex * 13 + r * 7 + c * 5) % 11 < 6) {
        turnOn(addShape(parent, "rect", { ...attrs, fill: LIGHT }));
      }
    }
  }
}

function addHouseRow(parent, startX, endX, firstIndex) {
  let x = startX;
  for (let i = firstIndex; x < endX; i++) {
    const house = HOUSES[i % HOUSES.length];
    addHouse(parent, x, house, i);
    x += house[0];
  }
}

function addTyholt(parent) {
  addShape(parent, "rect", { x: 1248, y: 8, width: 3, height: 40, fill: DARK });
  addShape(parent, "rect", { x: 1244, y: 44, width: 11, height: GROUND - 44, fill: DARK });
  addShape(parent, "rect", { x: 1230, y: 62, width: 39, height: 20, rx: 4, fill: DARK });
  for (let x = 1234; x < 1264; x += 8) {
    turnOn(addShape(parent, "rect", { x, y: 68, width: 5, height: 7, fill: LIGHT }));
  }
}

function addBybro(parent) {
  const red = "#5c0f22";
  addShape(parent, "rect", { x: 472, y: 194, width: 14, height: GROUND - 194, fill: red });
  addShape(parent, "rect", { x: 534, y: 194, width: 14, height: GROUND - 194, fill: red });
  addPolygon(parent, ["464,204", "464,186", "510,166", "556,186", "556,204"], red);
  addSnow(parent, ["464,186", "510,166", "556,186"]);
  addStar(parent, 510, 226, 11);
}

function addCathedral(parent) {
  // Skipet og koret
  addPolygon(parent, ["700,266", "700,158", "710,140", "860,140", "870,158", "870,266"], DARK);
  addPolygon(parent, ["870,266", "870,180", "905,160", "940,180", "940,266"], DARK);

  // Midttårnet med kobberspir
  addShape(parent, "rect", { x: 795, y: 90, width: 50, height: 60, fill: DARK });
  addPolygon(parent, ["795,90", "820,12", "845,90"], COPPER);

  // Vestfronten med to tårn
  addPolygon(parent, ["604,266", "604,126", "630,104", "656,126", "656,266"], DARK);
  addShape(parent, "rect", { x: 560, y: 100, width: 44, height: GROUND - 100, fill: DARK });
  addShape(parent, "rect", { x: 656, y: 100, width: 44, height: GROUND - 100, fill: DARK });
  addPolygon(parent, ["560,100", "582,66", "604,100"], COPPER);
  addPolygon(parent, ["656,100", "678,66", "700,100"], COPPER);

  addSnow(parent, ["710,140", "795,140"]);
  addSnow(parent, ["845,140", "860,140"]);
  addSnow(parent, ["870,180", "905,160", "940,180"]);
  addSnow(parent, ["604,126", "630,104", "656,126"]);
  addSnow(parent, ["560,100", "582,66", "604,100"]);
  addSnow(parent, ["656,100", "678,66", "700,100"]);

  // Rosevinduet
  turnOn(addShape(parent, "circle", { cx: 630, cy: 164, r: 15, fill: LIGHT }));
  for (let i = 0; i < 4; i++) {
    addShape(parent, "rect", {
      x: 629, y: 149, width: 2, height: 30, fill: DARK,
      transform: `rotate(${i * 45} 630 164)`,
    });
  }

  // Vinduer
  for (let x = 566; x < 696; x += 22) addPointedWindow(parent, x, 206, 10, 26);
  addPointedWindow(parent, 574, 118, 16, 44);
  addPointedWindow(parent, 670, 118, 16, 44);
  for (let x = 712; x < 860; x += 22) addPointedWindow(parent, x, 170, 12, 46);
  addPointedWindow(parent, 806, 102, 9, 32);
  addPointedWindow(parent, 825, 102, 9, 32);
  addPointedWindow(parent, 884, 192, 12, 40);
  addPointedWindow(parent, 914, 192, 12, 40);
}

function addChristmasTree(parent, cx) {
  addShape(parent, "rect", { x: cx - 5, y: 250, width: 10, height: 18, fill: "#2b1708" });
  const tiers = [[250, 42, 190], [212, 34, 158], [180, 25, 132]];
  for (const [base, half, top] of tiers) {
    addPolygon(parent, [`${cx - half},${base}`, `${cx},${top}`, `${cx + half},${base}`], "#0f5a41");
    addSnow(parent, [`${cx - half},${base}`, `${cx - half * 0.3},${base + 2}`]);
  }
  const bulbs = [[-26, 240], [-8, 232], [12, 241], [30, 236], [-18, 205], [4, 198], [20, 204], [-9, 172], [9, 170], [0, 150]];
  for (const [dx, y] of bulbs) {
    turnOn(addShape(parent, "circle", { cx: cx + dx, cy: y, r: 2.6, fill: LIGHT }));
  }
  addStar(parent, cx, 126, 14);
}

function drawScene() {
  const scene = document.getElementById("scene");
  addTyholt(scene);
  addHouseRow(scene, -20, 455, 0);
  addHouseRow(scene, 1030, 1460, 3);
  addCathedral(scene);
  addBybro(scene);
  addChristmasTree(scene, 985);
  addPolygon(scene, ["0,262", "300,268", "700,261", "1100,267", "1440,262", "1440,300", "0,300"], SNOW);
}

drawScene();

// ----- STRIKKEBORD MED SELBUSTJERNER -----
// Tegnes maske for maske. Hver maske er 5 piksler, og mønsteret gjentas over hele bredden.
function drawKnit() {
  const knit = document.getElementById("knit");
  const stitch = 5;
  const tileWidth = 20;
  const center = 7;
  const pattern = addShape(addShape(knit, "defs", {}), "pattern", {
    id: "selbu", patternUnits: "userSpaceOnUse", width: tileWidth * stitch, height: 21 * stitch,
  });

  function addStitch(column, row) {
    addShape(pattern, "rect", { x: column * stitch, y: row * stitch, width: stitch, height: stitch, fill: SNOW });
  }

  // Rutete kanter øverst og nederst
  for (let column = 0; column < tileWidth; column++) {
    for (const row of [0, 1, 19, 20]) {
      if ((column + row) % 2 === 0) addStitch(column, row);
    }
  }

  // Selbustjernen: åtte blader, med en glippe langs aksene og diagonalene
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      const a = Math.abs(x - center);
      const b = Math.abs(y - center);
      const fromAxis = Math.min(a, b);
      const fromDiagonal = Math.abs(a - b);
      const inPetal = fromAxis >= 1 && fromAxis <= 4 && fromDiagonal >= 1 && fromDiagonal <= 3;
      if (inPetal || (a === 0 && b === 0)) addStitch(x + 3, y + 3);
    }
  }

  addShape(knit, "rect", { width: "100%", height: "100%", fill: "url(#selbu)" });
}

drawKnit();

// ----- SNØFALL -----
// Tegner små hvite prikker på et lerret bak innholdet.
// Vises ikke for dem som har skrudd av animasjoner på enheten sin.
const canvas = document.getElementById("snow");
const ctx = canvas.getContext("2d");
let flakes = [];

function newFlake(startAnywhere) {
  return {
    x: Math.random() * canvas.width,
    y: startAnywhere ? Math.random() * canvas.height : -5,
    radius: 1 + Math.random() * 2.5,
    speed: 0.4 + Math.random() * 1.2,
    sway: Math.random() * Math.PI * 2,
  };
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.min(140, Math.round(canvas.width / 7));
  flakes = Array.from({ length: count }, () => newFlake(true));
}

function drawSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";

  for (let i = 0; i < flakes.length; i++) {
    const flake = flakes[i];
    flake.y += flake.speed;
    flake.sway += 0.01;
    flake.x += Math.sin(flake.sway) * 0.4;

    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();

    if (flake.y > canvas.height + 5) {
      flakes[i] = newFlake(false);
    }
  }

  requestAnimationFrame(drawSnow);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // På mobil endres vindushøyden når adressefeltet skjules, så vi tegner bare opp på nytt når bredden endres.
  let lastWidth = window.innerWidth;
  resizeCanvas();
  drawSnow();
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastWidth) {
      lastWidth = window.innerWidth;
      resizeCanvas();
    } else {
      canvas.height = window.innerHeight;
    }
  });
}
