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
  const globeRef = useRef<THREE.Mesh | null>(null);
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

    // Create globe
    const globeRadius = 1.5;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    
    // Globe material with gradient effect
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a2e,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.1,
      shininess: 30,
      transparent: true,
      opacity: 0.9,
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Add wireframe overlay
    const wireframeGeometry = new THREE.SphereGeometry(globeRadius + 0.01, 32, 32);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // Add point light for purple glow
    const pointLight = new THREE.PointLight(0x8b5cf6, 1, 100);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Create validator nodes
    const validatorNodes: THREE.Mesh[] = [];
    validators.forEach((validator) => {
      const position = latLngToVector3(
        validator.position.lat,
        validator.position.lng,
        globeRadius + 0.05
      );

      // Node sphere
      const nodeGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: validator.status === 'active' ? 0x8b5cf6 : 0x3b82f6,
      });
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.copy(position);
      scene.add(node);
      validatorNodes.push(node);

      // Node glow
      const glowGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: validator.status === 'active' ? 0x8b5cf6 : 0x3b82f6,
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(position);
      scene.add(glow);
    });

    // Create connections between nodes
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.2,
    });

    for (let i = 0; i < validators.length; i++) {
      const nextIndex = (i + 1) % validators.length;
      const start = latLngToVector3(
        validators[i].position.lat,
        validators[i].position.lng,
        globeRadius + 0.05
      );
      const end = latLngToVector3(
        validators[nextIndex].position.lat,
        validators[nextIndex].position.lng,
        globeRadius + 0.05
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

      const points = curve.getPoints(30);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeometry, connectionMaterial);
      scene.add(line);
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

      // Auto-rotate globe
      if (globe) {
        globe.rotation.y += 0.001;
        wireframe.rotation.y += 0.001;
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
      globeGeometry.dispose();
      globeMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      validatorNodes.forEach(node => {
        node.geometry.dispose();
        (node.material as THREE.Material).dispose();
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
