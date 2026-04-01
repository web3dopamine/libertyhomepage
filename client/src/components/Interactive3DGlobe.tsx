import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ~65 mesh nodes distributed worldwide
const NODES: Array<{ lat: number; lng: number }> = [
  // North America
  { lat: 71.0, lng: -156.0 },   // Alaska
  { lat: 64.2, lng: -149.5 },   // Fairbanks
  { lat: 60.5, lng: -135.0 },   // Yukon
  { lat: 49.3, lng: -123.1 },   // Vancouver
  { lat: 47.6, lng: -122.3 },   // Seattle
  { lat: 45.5, lng: -122.7 },   // Portland
  { lat: 37.8, lng: -122.4 },   // San Francisco
  { lat: 34.1, lng: -118.2 },   // Los Angeles
  { lat: 32.7, lng: -117.2 },   // San Diego
  { lat: 51.0, lng: -114.1 },   // Calgary
  { lat: 43.7, lng: -79.4 },    // Toronto
  { lat: 45.5, lng: -73.6 },    // Montreal
  { lat: 44.9, lng: -93.2 },    // Minneapolis
  { lat: 41.9, lng: -87.6 },    // Chicago
  { lat: 40.7, lng: -74.0 },    // New York
  { lat: 42.4, lng: -71.1 },    // Boston
  { lat: 38.9, lng: -77.0 },    // Washington DC
  { lat: 33.7, lng: -84.4 },    // Atlanta
  { lat: 25.8, lng: -80.2 },    // Miami
  { lat: 29.8, lng: -95.4 },    // Houston
  { lat: 32.8, lng: -97.0 },    // Dallas
  { lat: 39.7, lng: -104.9 },   // Denver
  { lat: 33.4, lng: -112.1 },   // Phoenix
  { lat: 19.4, lng: -99.1 },    // Mexico City
  { lat: 9.9, lng: -84.1 },     // San Jose CR
  // Caribbean / Central America
  { lat: 18.5, lng: -66.1 },    // San Juan PR
  // South America
  { lat: 10.5, lng: -66.9 },    // Caracas
  { lat: 4.7, lng: -74.1 },     // Bogota
  { lat: -0.2, lng: -78.5 },    // Quito
  { lat: -12.0, lng: -77.0 },   // Lima
  { lat: -33.5, lng: -70.7 },   // Santiago
  { lat: -34.6, lng: -58.4 },   // Buenos Aires
  { lat: -23.5, lng: -46.6 },   // Sao Paulo
  { lat: -3.1, lng: -60.0 },    // Manaus
  { lat: -15.8, lng: -47.9 },   // Brasilia
  { lat: -8.1, lng: -34.9 },    // Recife
  // Europe
  { lat: 38.7, lng: -9.1 },     // Lisbon
  { lat: 40.4, lng: -3.7 },     // Madrid
  { lat: 41.4, lng: 2.2 },      // Barcelona
  { lat: 43.3, lng: 5.4 },      // Marseille
  { lat: 51.5, lng: -0.1 },     // London
  { lat: 48.9, lng: 2.4 },      // Paris
  { lat: 50.9, lng: 4.3 },      // Brussels
  { lat: 52.4, lng: 4.9 },      // Amsterdam
  { lat: 53.6, lng: 10.0 },     // Hamburg
  { lat: 52.5, lng: 13.4 },     // Berlin
  { lat: 50.1, lng: 8.7 },      // Frankfurt
  { lat: 47.4, lng: 8.5 },      // Zurich
  { lat: 48.2, lng: 16.4 },     // Vienna
  { lat: 50.1, lng: 14.4 },     // Prague
  { lat: 52.2, lng: 21.0 },     // Warsaw
  { lat: 47.5, lng: 19.0 },     // Budapest
  { lat: 45.8, lng: 15.9 },     // Zagreb
  { lat: 44.8, lng: 20.5 },     // Belgrade
  { lat: 37.9, lng: 23.7 },     // Athens
  { lat: 41.0, lng: 28.9 },     // Istanbul
  { lat: 46.9, lng: 7.4 },      // Bern
  { lat: 45.5, lng: 9.2 },      // Milan
  { lat: 41.9, lng: 12.5 },     // Rome
  { lat: 55.8, lng: 12.6 },     // Copenhagen
  { lat: 59.3, lng: 18.1 },     // Stockholm
  { lat: 60.2, lng: 24.9 },     // Helsinki
  { lat: 59.9, lng: 10.7 },     // Oslo
  { lat: 56.9, lng: 24.1 },     // Riga
  { lat: 59.4, lng: 24.7 },     // Tallinn
  { lat: 54.7, lng: 25.3 },     // Vilnius
  { lat: 55.8, lng: 37.6 },     // Moscow
  { lat: 56.8, lng: 60.6 },     // Yekaterinburg
  { lat: 53.9, lng: 27.6 },     // Minsk
  { lat: 50.5, lng: 30.5 },     // Kyiv
  // Africa
  { lat: 36.8, lng: 3.1 },      // Algiers
  { lat: 33.9, lng: -6.9 },     // Rabat
  { lat: 30.0, lng: 31.2 },     // Cairo
  { lat: 15.6, lng: 32.5 },     // Khartoum
  { lat: 14.7, lng: -17.4 },    // Dakar
  { lat: 12.4, lng: -1.5 },     // Ouagadougou
  { lat: 6.5, lng: 3.4 },       // Lagos
  { lat: 4.4, lng: 18.6 },      // Bangui
  { lat: -1.3, lng: 36.8 },     // Nairobi
  { lat: -6.2, lng: 35.7 },     // Dodoma
  { lat: -4.3, lng: 15.3 },     // Kinshasa
  { lat: -8.8, lng: 13.2 },     // Luanda
  { lat: -25.9, lng: 32.6 },    // Maputo
  { lat: -26.2, lng: 28.0 },    // Johannesburg
  { lat: -33.9, lng: 18.4 },    // Cape Town
  { lat: -18.9, lng: 47.5 },    // Antananarivo
  // Middle East
  { lat: 31.8, lng: 35.2 },     // Jerusalem
  { lat: 25.2, lng: 55.3 },     // Dubai
  { lat: 24.7, lng: 46.7 },     // Riyadh
  { lat: 21.4, lng: 39.8 },     // Jeddah
  { lat: 15.6, lng: 44.2 },     // Sanaa
  { lat: 33.3, lng: 44.4 },     // Baghdad
  { lat: 35.7, lng: 51.4 },     // Tehran
  { lat: 41.7, lng: 44.8 },     // Tbilisi
  { lat: 40.4, lng: 49.9 },     // Baku
  // Central Asia
  { lat: 43.2, lng: 76.9 },     // Almaty
  { lat: 41.3, lng: 69.2 },     // Tashkent
  { lat: 37.9, lng: 58.4 },     // Ashgabat
  // South Asia
  { lat: 33.7, lng: 73.0 },     // Islamabad
  { lat: 24.9, lng: 67.1 },     // Karachi
  { lat: 28.6, lng: 77.2 },     // New Delhi
  { lat: 23.8, lng: 90.4 },     // Dhaka
  { lat: 19.1, lng: 72.9 },     // Mumbai
  { lat: 12.9, lng: 77.6 },     // Bangalore
  { lat: 13.1, lng: 80.3 },     // Chennai
  { lat: 6.9, lng: 79.9 },      // Colombo
  { lat: 27.7, lng: 85.3 },     // Kathmandu
  // Southeast / East Asia
  { lat: 16.9, lng: 96.2 },     // Yangon
  { lat: 13.8, lng: 100.5 },    // Bangkok
  { lat: 21.0, lng: 105.8 },    // Hanoi
  { lat: 10.8, lng: 106.7 },    // Ho Chi Minh City
  { lat: 11.6, lng: 104.9 },    // Phnom Penh
  { lat: 17.97, lng: 102.6 },   // Vientiane
  { lat: 3.1, lng: 101.7 },     // Kuala Lumpur
  { lat: 1.4, lng: 103.8 },     // Singapore
  { lat: 14.6, lng: 121.0 },    // Manila
  { lat: -6.2, lng: 106.8 },    // Jakarta
  { lat: -8.7, lng: 115.2 },    // Bali
  { lat: 22.3, lng: 114.2 },    // Hong Kong
  { lat: 23.1, lng: 113.3 },    // Guangzhou
  { lat: 31.2, lng: 121.5 },    // Shanghai
  { lat: 30.6, lng: 104.1 },    // Chengdu
  { lat: 39.9, lng: 116.4 },    // Beijing
  { lat: 43.8, lng: 87.6 },     // Urumqi
  { lat: 47.9, lng: 106.9 },    // Ulaanbaatar
  { lat: 37.6, lng: 126.9 },    // Seoul
  { lat: 35.7, lng: 139.7 },    // Tokyo
  { lat: 34.7, lng: 135.5 },    // Osaka
  { lat: 43.1, lng: 141.3 },    // Sapporo
  { lat: 63.8, lng: 143.2 },    // Magadan
  { lat: 43.2, lng: 131.9 },    // Vladivostok
  // Oceania
  { lat: -27.5, lng: 153.0 },   // Brisbane
  { lat: -33.9, lng: 151.2 },   // Sydney
  { lat: -37.8, lng: 144.9 },   // Melbourne
  { lat: -31.9, lng: 115.9 },   // Perth
  { lat: -12.5, lng: 130.8 },   // Darwin
  { lat: -36.9, lng: 174.8 },   // Auckland
  { lat: -17.7, lng: 168.3 },   // Port Vila
  { lat: -18.1, lng: 178.4 },   // Suva
  // Remote / Island nodes for coverage
  { lat: 20.0, lng: -155.0 },   // Hawaii
  { lat: -13.8, lng: -172.0 },  // Samoa
  { lat: 14.1, lng: -87.2 },    // Tegucigalpa
  { lat: 64.1, lng: -21.9 },    // Reykjavik
  { lat: 78.2, lng: 15.6 },     // Svalbard
  { lat: -54.8, lng: -68.3 },   // Ushuaia
  { lat: -69.0, lng: 39.6 },    // Antarctica
];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Great-circle arc between two surface points
function greatArc(a: THREE.Vector3, b: THREE.Vector3, radius: number, segs = 24): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    pts.push(new THREE.Vector3().lerpVectors(a, b, t).normalize().multiplyScalar(radius));
  }
  return pts;
}

// Haversine distance in radians
function angularDist(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR;
  const dLng = (b.lng - a.lng) * toR;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  return 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * sinDLng * sinDLng));
}

export function Interactive3DGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // WebGL check
    try {
      const c = document.createElement('canvas');
      if (!c.getContext('webgl') && !c.getContext('experimental-webgl')) return;
    } catch { return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5.2;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch { return; }

    const RADIUS = 1.5;

    // ── Globe base ──────────────────────────────────────────
    const globeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x081414,
        emissive: 0x0d2222,
        emissiveIntensity: 0.35,
        shininess: 20,
        transparent: true,
        opacity: 0.92,
      })
    );
    scene.add(globeMesh);

    // Wireframe overlay
    const wireMesh = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS + 0.008, 36, 36),
      new THREE.MeshBasicMaterial({ color: 0x2EB8B8, wireframe: true, transparent: true, opacity: 0.10 })
    );
    scene.add(wireMesh);

    // ── Lights ──────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dLight.position.set(5, 3, 5);
    scene.add(dLight);
    const pLight = new THREE.PointLight(0x2EB8B8, 0.8, 100);
    pLight.position.set(0, 0, 3.5);
    scene.add(pLight);

    // ── Compute node 3D positions ───────────────────────────
    const nodePositions = NODES.map(n => latLngToVec3(n.lat, n.lng, RADIUS + 0.03));

    // ── Build mesh edges: each node connects to K nearest ───
    const K = 4; // nearest neighbours
    const edges: Array<[number, number]> = [];
    const edgeSet = new Set<string>();
    for (let i = 0; i < NODES.length; i++) {
      const dists = NODES.map((n, j) => ({ j, d: angularDist(NODES[i], n) }))
        .filter(x => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, K);
      for (const { j } of dists) {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!edgeSet.has(key)) { edgeSet.add(key); edges.push([i, j]); }
      }
    }

    // ── POI group (rotates with globe) ──────────────────────
    const poi = new THREE.Group();
    scene.add(poi);

    // Connection lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2EB8B8, transparent: true, opacity: 0.22 });
    const arcPoints: Array<THREE.Vector3[]> = [];
    for (const [i, j] of edges) {
      const pts = greatArc(nodePositions[i], nodePositions[j], RADIUS + 0.015);
      arcPoints.push(pts);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      poi.add(new THREE.Line(geo, lineMat));
    }

    // Node dots + glow halos
    const nodeCoreMeshes: THREE.Mesh[] = [];
    const nodeGlowMeshes: THREE.Mesh[] = [];

    for (const pos of nodePositions) {
      // Core dot
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x40d4d4 })
      );
      core.position.copy(pos);
      poi.add(core);
      nodeCoreMeshes.push(core);

      // Halo glow
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.044, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0x2EB8B8, transparent: true, opacity: 0.25 })
      );
      halo.position.copy(pos);
      poi.add(halo);
      nodeGlowMeshes.push(halo);
    }

    // ── Animated data pulses ────────────────────────────────
    const NUM_PULSES = 28;
    interface Pulse {
      edgeIndex: number;
      t: number;
      speed: number;
      mesh: THREE.Mesh;
    }
    const pulses: Pulse[] = [];
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x7aeaea, transparent: true, opacity: 0.9 });

    for (let p = 0; p < NUM_PULSES; p++) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), pulseMat);
      const edgeIndex = Math.floor(Math.random() * edges.length);
      const t = Math.random();
      poi.add(mesh);
      pulses.push({ edgeIndex, t, speed: 0.0012 + Math.random() * 0.0018, mesh });
    }

    // ── Mouse interaction ───────────────────────────────────
    let targetX = 0, targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetY = ((e.clientX - rect.left) / rect.width * 2 - 1) * 0.5;
      targetX = (-((e.clientY - rect.top) / rect.height * 2 - 1)) * 0.5;
    };
    container.addEventListener('mousemove', onMouseMove);

    // ── Animation loop ──────────────────────────────────────
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const t = Date.now();

      // Rotate globe + wireframe + poi together
      globeMesh.rotation.y += 0.0008;
      wireMesh.rotation.y += 0.0008;
      poi.rotation.y += 0.0008;

      // Smooth camera follow mouse
      camera.position.x += (targetY - camera.position.x) * 0.04;
      camera.position.y += (targetX - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      // Pulse nodes (staggered phase)
      nodeCoreMeshes.forEach((core, i) => {
        const s = 1 + Math.sin(t * 0.0018 + i * 0.47) * 0.28;
        core.scale.setScalar(s);
      });
      nodeGlowMeshes.forEach((halo, i) => {
        const s = 1 + Math.sin(t * 0.0018 + i * 0.47 + Math.PI) * 0.3;
        halo.scale.setScalar(s);
        (halo.material as THREE.MeshBasicMaterial).opacity = 0.12 + Math.sin(t * 0.002 + i) * 0.1;
      });

      // Advance data pulses
      for (const pulse of pulses) {
        pulse.t += pulse.speed;
        if (pulse.t > 1) {
          // Pick a new random edge
          pulse.t = 0;
          pulse.edgeIndex = Math.floor(Math.random() * edges.length);
        }
        const pts = arcPoints[pulse.edgeIndex];
        const idx = Math.min(Math.floor(pulse.t * (pts.length - 1)), pts.length - 1);
        pulse.mesh.position.copy(pts[idx]);
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ──────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ─────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px]"
      data-testid="interactive-3d-globe"
    />
  );
}
