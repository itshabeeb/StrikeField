"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sphere, Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import type { Exposure } from "../lib/calculations";

function Pole({ height }: { height: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.scale.y = THREE.MathUtils.damp(ref.current.scale.y, height / 15, 5, delta); });
  return <mesh ref={ref} position={[0, 3.75, 0]}><cylinderGeometry args={[0.18, 0.25, 7.5, 16]} /><meshStandardMaterial color="#dcecff" emissive="#38bdf8" emissiveIntensity={0.25} /></mesh>;
}

function Scene({ height, exposure, storm }: { height: number; exposure: Exposure; storm: boolean }) {
  const buildings = exposure === "sheltered" ? 5 : exposure === "similar" ? 3 : exposure === "hilltop" ? 2 : 0;
  return <><PerspectiveCamera makeDefault position={[13, 10, 16]} /><ambientLight intensity={0.5} /><pointLight position={[4, 12, 4]} color="#38bdf8" intensity={100} /><gridHelper args={[30, 30, "#205070", "#102d45"]} rotation={[0, 0, 0]} /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#071a2b" /></mesh><Pole height={height} /><Sphere args={[Math.max(3, height / 5.3), 24, 16]} position={[0, height / 5, 0]}><meshBasicMaterial color="#39d5ff" transparent opacity={0.08} wireframe /></Sphere>{Array.from({ length: buildings }).map((_, index) => <mesh key={index} position={[(index - 2) * 2.8, 1.1 + (index % 2), -2 - (index % 2)]}><boxGeometry args={[1.8, 2.2 + (index % 2) * 2, 1.8]} /><meshStandardMaterial color="#174b62" /></mesh>)}{exposure === "hilltop" && <mesh position={[0, -0.7, 0]}><coneGeometry args={[7, 1.6, 32]} /><meshStandardMaterial color="#165066" /></mesh>}{storm && <mesh position={[0, 11, 0]}><sphereGeometry args={[4, 16, 8]} /><meshBasicMaterial color="#b5ecff" transparent opacity={0.12} wireframe /></mesh>}<Text position={[0, 0.1, 4]} fontSize={0.35} color="#69cce8">ROLLING SPHERE / IEC 62305</Text><OrbitControls enableDamping makeDefault /></>;
}

export function EngineeringLab3D({ height, exposure, storm }: { height: number; exposure: Exposure; storm: boolean }) {
  return <div className="lab-canvas"><Canvas dpr={[1, 1.5]}><Scene height={height} exposure={exposure} storm={storm} /></Canvas><div className="lab-overlay"><span>3D ENGINEERING LAB</span><small>Left drag rotate · right drag pan · scroll zoom</small></div></div>;
}
