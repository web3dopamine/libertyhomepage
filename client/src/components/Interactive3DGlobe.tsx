import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Validator {
  position: { lat: number; lng: number };
  name: string;
  status: 'active' | 'syncing';
}

const validators: Validator[] = [
  { position: { lat: 40.7128, lng: -74.0060 }, name: 'US-East-1', status: 'active' },
  { position: { lat: 51.5074, lng: -0.1278 }, name: 'EU-West-1', status: 'active' },
  { position: { lat: 35.6762, lng: 139.6503 }, name: 'Asia-Pacific-1', status: 'active' },
  { position: { lat: -33.8688, lng: 151.2093 }, name: 'Australia-1', status: 'active' },
  { position: { lat: 1.3521, lng: 103.8198 }, name: 'Singapore-1', status: 'active' },
  { position: { lat: 37.7749, lng: -122.4194 }, name: 'US-West-1', status: 'syncing' },
  { position: { lat: 52.5200, lng: 13.4050 }, name: 'EU-Central-1', status: 'active' },
  { position: { lat: 43.6532, lng: -79.3832 }, name: 'Canada-1', status: 'active' },
  { position: { lat: 19.4326, lng: -99.1332 }, name: 'Mexico-1', status: 'active' },
  { position: { lat: -23.5505, lng: -46.6333 }, name: 'Brazil-1', status: 'active' },
  { position: { lat: 55.7558, lng: 37.6173 }, name: 'Russia-1', status: 'active' },
  { position: { lat: 28.6139, lng: 77.2090 }, name: 'India-1', status: 'active' },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
}

export function Interactive3DGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        console.warn('WebGL not supported, 3D globe will not render');
        return;
      }
    } catch (e) {
      console.warn('WebGL not available:', e);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup with error handling
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (error) {
      console.warn('Failed to create WebGL renderer:', error);
      return;
    }

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Create dotted wireframe globe
    const globeRadius = 1.5;
    const numLatitudeLines = 18;
    const numLongitudeLines = 36;
    const dotsPerLine = 50;

    // Teal/cyan color scheme
    const primaryColor = new THREE.Color(0x2EB8B8);
    const secondaryColor = new THREE.Color(0x38B2AC);

    // Create latitude lines (horizontal circles)
    for (let i = 0; i <= numLatitudeLines; i++) {
      const lat = (i / numLatitudeLines) * 180 - 90;
      const radius = globeRadius * Math.cos(lat * Math.PI / 180);
      const y = globeRadius * Math.sin(lat * Math.PI / 180);

      for (let j = 0; j < dotsPerLine; j++) {
        const lng = (j / dotsPerLine) * 360;
        const theta = lng * Math.PI / 180;
        
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);

        const dotGeometry = new THREE.SphereGeometry(0.01, 4, 4);
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: primaryColor,
          transparent: true,
          opacity: 0.4 + Math.random() * 0.2,
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, y, z);
        globeGroup.add(dot);
      }
    }

    // Create longitude lines (vertical circles)
    for (let i = 0; i < numLongitudeLines; i++) {
      const lng = (i / numLongitudeLines) * 360;
      const theta = lng * Math.PI / 180;

      for (let j = 0; j <= dotsPerLine; j++) {
        const lat = (j / dotsPerLine) * 180 - 90;
        const phi = (90 - lat) * Math.PI / 180;
        
        const x = -(globeRadius * Math.sin(phi) * Math.cos(theta + Math.PI));
        const z = globeRadius * Math.sin(phi) * Math.sin(theta + Math.PI);
        const y = globeRadius * Math.cos(phi);

        const dotGeometry = new THREE.SphereGeometry(0.01, 4, 4);
        const dotMaterial = new THREE.MeshBasicMaterial({
          color: secondaryColor,
          transparent: true,
          opacity: 0.3 + Math.random() * 0.15,
        });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, y, z);
        globeGroup.add(dot);
      }
    }

    // Create a group for all POI elements (nodes, glows, connections) to rotate with the globe
    const poiGroup = new THREE.Group();
    globeGroup.add(poiGroup);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Add point light for teal glow
    const pointLight = new THREE.PointLight(0x38B2AC, 0.8, 100);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Create validator nodes
    const validatorNodes: THREE.Mesh[] = [];
    validators.forEach((validator) => {
      const position = latLngToVector3(
        validator.position.lat,
        validator.position.lng,
        globeRadius + 0.08
      );

      // Node sphere
      const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: validator.status === 'active' ? 0x38B2AC : 0x66CCCC,
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(position);
      poiGroup.add(node);
      validatorNodes.push(node);

      // Node glow
      const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: validator.status === 'active' ? 0x38B2AC : 0x66CCCC,
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(position);
      poiGroup.add(glow);
    });

    // Create connections between nodes
    const connectionMaterial = new THREE.LineDashedMaterial({
      color: 0x2EB8B8,
      transparent: true,
      opacity: 0.3,
      dashSize: 0.05,
      gapSize: 0.05,
    });

    for (let i = 0; i < validators.length; i++) {
      const nextIndex = (i + 1) % validators.length;
      const start = latLngToVector3(
        validators[i].position.lat,
        validators[i].position.lng,
        globeRadius + 0.08
      );
      const end = latLngToVector3(
        validators[nextIndex].position.lat,
        validators[nextIndex].position.lng,
        globeRadius + 0.08
      );

      // Create curved line
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        new THREE.Vector3(
          (start.x + end.x) / 2,
          (start.y + end.y) / 2 + 0.3,
          (start.z + end.z) / 2
        ),
        end
      );

      const points = curve.getPoints(50);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, connectionMaterial);
      line.computeLineDistances();
      poiGroup.add(line);
    }

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
      
      targetRotationX = mouseY * 0.5;
      targetRotationY = mouseX * 0.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Auto-rotate globe and all children (including POIs)
      if (globeGroup) {
        globeGroup.rotation.y += 0.002;
      }

      // Smooth camera rotation based on mouse
      camera.position.x += (targetRotationY - camera.position.x) * 0.05;
      camera.position.y += (targetRotationX - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Pulse validator nodes
      validatorNodes.forEach((node, index) => {
        const scale = 1 + Math.sin(Date.now() * 0.002 + index) * 0.2;
        node.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of Three.js resources
      globeGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
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
