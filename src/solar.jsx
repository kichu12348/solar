import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Gltf, useGLTF } from "@react-three/drei";
import SunMod from "./models/sun.glb";
import JupiterMod from "./models/jupiter.glb";
import MarsMod from "./models/mars.glb";
import MercuryMod from "./models/mercury.glb";
import NeptuneMod from "./models/neptune.glb";
import SaturnMod from "./models/realistic_saturn_8k.glb";
import UranusMod from "./models/uranus.glb";
import VenusMod from "./models/venus.glb";
import EarthMod from "./models/earth.glb";

/*
go down to the bottomost for a detailed explanation of the code it
might or might not make your think 
your life choices😃
*/

//self explanatory
const degToRad = (deg) => deg * (Math.PI / 180);

//anomaly (M) and eccentricity (e)
const solveKepler = (M, e, tolerance = 1e-6) => {
  let E = M + e * Math.sin(M);
  let delta;
  do {
    delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
  } while (Math.abs(delta) > tolerance);
  return E;
};

const computeHeliocentricCoords = (T, elements) => {
  const { a, e, I, L, longPeri, longNode } = elements;
  const M = degToRad(L + 360 * T - longPeri);
  const E = solveKepler(M, e);

  const x_orbital = a * (Math.cos(E) - e);
  const y_orbital = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const v = Math.atan2(y_orbital, x_orbital); //true anomaly
  const r = Math.sqrt(x_orbital * x_orbital + y_orbital * y_orbital); //distonce

  const w = degToRad(longPeri - longNode); //omega smool
  const i = degToRad(I); //i
  const o = degToRad(longNode); //Omega big

  const x_ecliptic =
    r *
    (Math.cos(o) * Math.cos(v + w) -
      Math.sin(o) * Math.sin(v + w) * Math.cos(i));
  const y_ecliptic =
    r *
    (Math.sin(o) * Math.cos(v + w) +
      Math.cos(o) * Math.sin(v + w) * Math.cos(i));
  const z_ecliptic = r * (Math.sin(v + w) * Math.sin(i));

  return { x: x_ecliptic, y: y_ecliptic, z: z_ecliptic };
};

// Planet data
const planets = {
  Mercury: {
    model: MercuryMod,
    a: 0.38709927,
    e: 0.20563593,
    I: 7.00497902,
    L: 252.2503235,
    longPeri: 77.45779628,
    longNode: 48.33076593,
    size: 0.001,
  },
  Venus: {
    model: VenusMod,
    a: 0.72333566,
    e: 0.00677672,
    I: 3.39467605,
    L: 181.9790995,
    longPeri: 131.60246718,
    longNode: 76.67984255,
    size: 0.5,
  },
  Earth: {
    model: EarthMod,
    a: 1.00000261,
    e: 0.01671123,
    I: 0,
    L: 100.46457166,
    longPeri: 102.93768193,
    longNode: 0,
    size: 0.01,
  },
  Mars: {
    model: MarsMod,
    a: 1.52371034,
    e: 0.0933941,
    I: 1.84969142,
    L: -4.55343205,
    longPeri: -23.94362959,
    longNode: 49.55953891,
    size: 1,
  },
  Jupiter: {
    model: JupiterMod,
    a: 5.202887,
    e: 0.04838624,
    I: 1.30439695,
    L: 34.39644051,
    longPeri: 14.72847983,
    longNode: 100.47390909,
    size: 0.03,
  },
  Saturn: {
    model: SaturnMod,
    a: 9.53667594,
    e: 0.05386179,
    I: 2.48599187,
    L: 49.95424423,
    longPeri: 92.59887831,
    longNode: 113.66242448,
    size: 0.3,
  },
  Uranus: {
    model: UranusMod,
    a: 19.18916464,
    e: 0.04725744,
    I: 0.77263783,
    L: 313.23810451,
    longPeri: 170.9542763,
    longNode: 74.01692503,
    size: 0.03,
  },
  Neptune: {
    model: NeptuneMod,
    a: 30.06992276,
    e: 0.00859048,
    I: 1.77004347,
    L: -55.12002969,
    longPeri: 44.96476227,
    longNode: 131.78422574,
    size: 2,
  },
};


// constants
const SCALE_FACTOR = 10;

// Planet component
const Planet = ({ name, timeScale }) => {
  const mesh = useRef();
  const { model, a, e, I, L, longPeri, longNode, size } = planets[name];

  useFrame(({ clock }) => {
    const elapsedYears = (clock.getElapsedTime() * timeScale) / 365.25; // Convert seconds to years
    const { x, y, z } = computeHeliocentricCoords(elapsedYears, {
      a,
      e,
      I,
      L,
      longPeri,
      longNode,
    });
    mesh.current.position.set(
      x * SCALE_FACTOR,
      z * SCALE_FACTOR,
      -y * SCALE_FACTOR
    );
  });

  return (
    <mesh ref={mesh}>
      <Gltf src={model} scale={[size, size, size]} />
      <Html distanceFactor={20}>
        <div style={{ color: "white" }}>{name}</div>
      </Html>
    </mesh>
  );
};

// Sun component
const Sun = () => {
  return (
    <>
      <pointLight
        position={[0, 0, 0]}
        intensity={200}
        color={"white"}
        distance={500000}
      />
      <Gltf src={SunMod} scale={0.3} />
    </>
  );
};

// Controls
const Controls = ({ timeScale, setTimeScale }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        color: "white",
        background: "rgba(0,0,0,0.5)",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <div>
        Time Scale:
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={timeScale}
          onChange={(e) => setTimeScale(parseFloat(e.target.value))}
        />
        {timeScale.toFixed(1)} years/second
      </div>
    </div>
  );
};

// Main comp
const SolarSystem = () => {
  const [timeScale, setTimeScale] = useState(0.01);

  useEffect(()=>{
    [SunMod, JupiterMod, MarsMod, MercuryMod, NeptuneMod, SaturnMod, UranusMod, VenusMod, EarthMod].forEach((model) => {
      useGLTF.preload(model);
    });
  },[])

  return (
    <>
      <Canvas
        style={{ height: "100svh", width: "100vw" }}
        camera={{ position: [0, 20, 50], fov: 75 }}
      >
        <ambientLight intensity={0.5} />
        <Stars
          radius={300}
          depth={60}
          count={20000}
          factor={7}
          saturation={0}
          fade={true}
        />
        <Sun />
        {Object.keys(planets).map((name) => (
          <Planet key={name} name={name} timeScale={timeScale} />
        ))}
        <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true} 
        />
      </Canvas>
      <Controls timeScale={timeScale} setTimeScale={setTimeScale} />
    </>
  );
};

export default SolarSystem;

/*
    This code creates a 3D simulation of the solar system using React, a popular library for building user interfaces, and 
    Three.js, which is a library for creating 3D graphics in the browser. The simulation illustrates how planets move around 
    the sun based on their orbits. Here’s a detailed breakdown of how everything works:

    1. Imports:
        - Various components and libraries are imported at the beginning:
            - React, useRef, and useState from React:
                - useRef allows the creation of references to DOM elements (like 3D models) for manipulation smilar to how pointers in c works.
                - useState manages the state of the application, such as the speed of the simulation.
            - Canvas and useFrame from @react-three/fiber allow the creation of a canvas for rendering 3D objects.
            - OrbitControls, Stars, Html, Gltf from @react-three/drei provide additional functionalities for rendering 
              and controlling the scene.
            - Various 3D models of the sun and planets are also imported for use in the simulation.

    2. Conversion Functions:
        - A function called degToRad converts degrees to radians. This conversion is crucial since many mathematical 
          calculations in physics, including those related to orbits, utilize radians.

    3. Orbital Mechanics:
        - The simulation applies Kepler's laws of planetary motion to determine the position of each planet in its orbit:
            - The solveKepler function calculates the eccentric anomaly E for a given mean anomaly M and eccentricity e, 
              aiding in locating a planet along its elliptical orbit.
            - The computeHeliocentricCoords function calculates the 3D coordinates (x, y, z) of each planet based on its 
              orbital elements (like semi-major axis, eccentricity, and other angles). This allows for accurate placement 
              of the planets in space.

    4. Planet Data:
        - An object named planets contains information for each planet, including:
            - The model used for rendering (e.g., Mercury or Venus).
            - Orbital elements, which include:
                - a: semi-major axis (average distance from the sun).
                - e: eccentricity (how elliptical the orbit is).
                - I: inclination (tilt of the orbit).
                - L: mean longitude (position of the planet along its orbit).
                - longPeri: longitude of the periapsis (the closest point to the sun).
                - longNode: longitude of the ascending node (where the orbit crosses the sun's equatorial plane).
                - size: a scaling factor for the planet's visual representation.

    5. Rendering Planets:
        - The Planet component is responsible for rendering each planet:
            - The useFrame hook runs on every animation frame, updating the planet's position continuously based on elapsed time.
            - The elapsed time is converted into years, simulating real planetary motion.
            - The calculated coordinates (x, y, z) are applied to the planet's mesh (the 3D model) to position 
              it accurately in the scene.

    6. Sun Component:
        - The Sun component represents the sun:
            - A bright point light is added at the origin (0, 0, 0) to simulate sunlight, making the sun model 
              visible in the scene.

    7. Controls for Time Scaling:
        - The Controls component provides a user interface element (a slider) for adjusting the speed of the simulation.
            - Changing the time scale allows for speeding up or slowing down the movement of the planets, simulating 
              different time flows.

    8. Main SolarSystem Component:
        - The SolarSystem component serves as the main part of the application:
            - A <Canvas> is created as the rendering surface for the 3D scene.
            - Lights, the star background, the sun, and each planet are set up using the Planet component.
            - Controls for user interaction are included to modify the simulation speed.

    9. Export:
        - The SolarSystem component is exported at the end, making it available for use in other parts of the application.

    Overall, this code creates a dynamic and interactive visual representation of the solar system, allowing for observation 
    of the orbits of the planets around the sun while adjusting the speed of the simulation to see how time affects their motion.
*/
