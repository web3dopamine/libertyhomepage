import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [useWebGL, setUseWebGL] = useState(false);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points[];
    animationId: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.log('WebGL not supported, using CSS fallback for DottedSurface');
      setUseWebGL(false);
      return;
    }

    setUseWebGL(true);
    console.log('Initializing DottedSurface with WebGL support');

    const SEPARATION = 100;
    const AMOUNTX = 50;
    const AMOUNTY = 50;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 400, 800);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
    } catch (error) {
      console.warn('Failed to create WebGL renderer:', error);
      setUseWebGL(false);
      return;
    }

    containerRef.current.appendChild(renderer.domElement);
    console.log('Canvas added to DOM');

    const positions: number[] = [];
    const colors: number[] = [];

    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);
        
        const tealR = 46 / 255;
        const tealG = 184 / 255;
        const tealB = 184 / 255;
        colors.push(tealR, tealG, tealB);
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    console.log('Created', AMOUNTX * AMOUNTY, 'particles');

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const positionAttribute = geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;

          positions[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;

          i++;
        }
      }

      positionAttribute.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    animate();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles: [points],
      animationId,
      count,
    };

    return () => {
      window.removeEventListener('resize', handleResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        sceneRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });

        sceneRef.current.renderer.dispose();

        if (containerRef.current && sceneRef.current.renderer.domElement) {
          containerRef.current.removeChild(
            sceneRef.current.renderer.domElement,
          );
        }
      }
    };
  }, []);

  // CSS fallback if WebGL is not supported
  if (!useWebGL) {
    return (
      <div
        className={cn('pointer-events-none fixed inset-0 z-0 overflow-hidden', className)}
        style={{
          backgroundImage: `radial-gradient(circle, rgba(46, 184, 184, 0.4) 2px, transparent 2px)`,
          backgroundSize: '50px 50px',
          backgroundPosition: '0 0',
          animation: 'dottedWave 20s ease-in-out infinite',
        }}
        {...props}
      >
        <style>{`
          @keyframes dottedWave {
            0%, 100% {
              background-position: 0 0, 25px 25px;
            }
            50% {
              background-position: 25px 0, 0 25px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-none fixed inset-0 z-0', className)}
      {...props}
    />
  );
}
