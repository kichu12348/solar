// dont need dis code no mo cuz i put a simpler one in the solar.jsx file
export function degToRad(deg) {
  return deg * (Math.PI / 180);
}

export function solveKepler(M, e, tolerance = 1e-6) {
  let E = M + e * Math.sin(M);
  let delta;
  do {
    delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
  } while (Math.abs(delta) > tolerance);
  return E;
}

export function computeHeliocentricCoords(T, elements) {
  const { a, e, I, L, longPeri, longNode } = elements;

  const M = degToRad(L - longPeri);
  const E = solveKepler(M, e);

  const x_orbital = a * (Math.cos(E) - e);
  const y_orbital = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const ν = Math.atan2(y_orbital, x_orbital);
  const r = Math.sqrt(x_orbital * x_orbital + y_orbital * y_orbital);

  const w = degToRad(longPeri - longNode);
  const i = degToRad(I);
  const Ω = degToRad(longNode);

  const x_ecliptic =
    r *
    (Math.cos(Ω) * Math.cos(ν + w) -
      Math.sin(Ω) * Math.sin(ν + w) * Math.cos(i));
  const y_ecliptic =
    r *
    (Math.sin(Ω) * Math.cos(ν + w) +
      Math.cos(Ω) * Math.sin(ν + w) * Math.cos(i));
  const z_ecliptic = r * (Math.sin(ν + w) * Math.sin(i));

  return { x: x_ecliptic, y: y_ecliptic, z: z_ecliptic };
}

const planets = {
  Mercury: {
    a: 0.38709927,
    e: 0.20563593,
    I: 7.00497902,
    L: 252.2503235,
    longPeri: 77.45779628,
    longNode: 48.33076593,
  },
  Venus: {
    a: 0.72333566,
    e: 0.00677672,
    I: 3.39467605,
    L: 181.9790995,
    longPeri: 131.60246718,
    longNode: 76.67984255,
  },
  Earth: {
    a: 1.00000261,
    e: 0.01671123,
    I: 0,
    L: 100.46457166,
    longPeri: 102.93768193,
    longNode: 0,
  },
  Mars: {
    a: 1.52371034,
    e: 0.0933941,
    I: 1.84969142,
    L: -4.55343205,
    longPeri: -23.94362959,
    longNode: 49.55953891,
  },
  Jupiter: {
    a: 5.202887,
    e: 0.04838624,
    I: 1.30439695,
    L: 34.39644051,
    longPeri: 14.72847983,
    longNode: 100.47390909,
  },
  Saturn: {
    a: 9.53667594,
    e: 0.05386179,
    I: 2.48599187,
    L: 49.95424423,
    longPeri: 92.59887831,
    longNode: 113.66242448,
  },
  Uranus: {
    a: 19.18916464,
    e: 0.04725744,
    I: 0.77263783,
    L: 313.23810451,
    longPeri: 170.9542763,
    longNode: 74.01692503,
  },
  Neptune: {
    a: 30.06992276,
    e: 0.00859048,
    I: 1.77004347,
    L: -55.12002969,
    longPeri: 44.96476227,
    longNode: 131.78422574,
  },
};

export function getPlanetPosition(planetName, julianDate) {
  const T = (julianDate - 2451545.0) / 36525.0;
  const elements = planets[planetName];
  if (!elements) throw new Error("Invalid planet name.");
  return computeHeliocentricCoords(T, elements);
}
