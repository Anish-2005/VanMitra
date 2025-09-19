"use client";

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from "../ThemeProvider";

interface ThreeBackgroundProps {
  className?: string;
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ className = "" }) => {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const frameRef = useRef<number | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Seeded randomness for deterministic positioning
  const seeded = (i: number, salt = 1) =>
    Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

  useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  const isLight = mounted && theme === 'light';

  useEffect(() => {
    if (!isClient || !mountRef.current) return;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      sceneRef.current = scene;
      rendererRef.current = renderer;

      // Create enhanced floating particles
      const particleCount = 120; // Increased count
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      const updateParticleColors = () => {
        const isLightTheme = mounted && theme === 'light';
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          const particleIndex = i / 3;
          const r1 = seeded(particleIndex, 1);
          const r2 = seeded(particleIndex, 2);

          if (isLightTheme) {
            // Light theme colors - softer, brighter greens
            if (r1 > 0.7) {
              colors[i] = 0.4;     // R (softer green)
              colors[i + 1] = 0.9; // G
              colors[i + 2] = 0.5; // B
            } else if (r2 > 0.6) {
              colors[i] = 0.5;     // R
              colors[i + 1] = 0.8; // G (medium green)
              colors[i + 2] = 0.6; // B
            } else {
              colors[i] = 0.6;     // R
              colors[i + 1] = 0.95; // G (bright green)
              colors[i + 2] = 0.7; // B
            }
          } else {
            // Dark theme colors - deeper, richer greens
            if (r1 > 0.7) {
              colors[i] = 0.1;     // R (dark green)
              colors[i + 1] = 0.8; // G
              colors[i + 2] = 0.2; // B
            } else if (r2 > 0.6) {
              colors[i] = 0.2;     // R
              colors[i + 1] = 0.6; // G (medium green)
              colors[i + 2] = 0.3; // B
            } else {
              colors[i] = 0.3;     // R
              colors[i + 1] = 0.9; // G (bright green)
              colors[i + 2] = 0.4; // B
            }
          }
        }
      };

      for (let i = 0; i < particleCount * 3; i += 3) {
        const particleIndex = i / 3;
        const r1 = seeded(particleIndex, 1);
        const r2 = seeded(particleIndex, 2);
        const r3 = seeded(particleIndex, 3);

        positions[i] = (r1 - 0.5) * 40;     // X position
        positions[i + 1] = (r2 - 0.5) * 40; // Y position
        positions[i + 2] = (r3 - 0.5) * 40; // Z position

        // Varied sizes
        sizes[particleIndex] = 0.02 + r3 * 0.08;
      }

      // Initialize colors
      updateParticleColors();

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          varying float vSize;

          void main() {
            vColor = color;
            vSize = size;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vSize;

          void main() {
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (r > 0.5) discard;

            float alpha = 1.0 - smoothstep(0.0, 0.5, r);
            // Adjust opacity based on theme - lighter for light theme
            float themeOpacity = ${isLight ? '0.6' : '0.8'};
            gl_FragColor = vec4(vColor, alpha * themeOpacity);
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending
      });

      materialRef.current = material;
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particlesRef.current = particles;

      camera.position.z = 5;

      // Animation loop with enhanced effects
      const animate = () => {
        if (!particlesRef.current || !rendererRef.current || !sceneRef.current) return;

        frameRef.current = requestAnimationFrame(animate);

        const time = Date.now() * 0.001;

        // Update shader time uniform
        if (material.uniforms.time) {
          material.uniforms.time.value = time;
        }

        // Complex rotation with slight variations
        particlesRef.current.rotation.y += 0.001;
        particlesRef.current.rotation.x += 0.0005;
        particlesRef.current.rotation.z += 0.0002;

        // Subtle floating motion
        particlesRef.current.position.y = Math.sin(time * 0.5) * 0.5;

        rendererRef.current.render(sceneRef.current, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!rendererRef.current || !camera) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
        }
        if (rendererRef.current && mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
        }
        if (geometry) {
          geometry.dispose();
        }
        if (material) {
          material.dispose();
        }
      };
    } catch (error) {
      console.warn('Three.js initialization failed:', error);
      return () => { };
    }
  }, [isClient, theme, mounted]);

  // Update particle colors when theme changes
  useEffect(() => {
    if (!materialRef.current || !particlesRef.current) return;

    const particles = particlesRef.current;
    const geometry = particles.geometry as THREE.BufferGeometry;
    const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute;
    
    if (!colorAttribute) return;

    const colors = colorAttribute.array as Float32Array;
    const particleCount = colors.length / 3;

    for (let i = 0; i < particleCount * 3; i += 3) {
      const particleIndex = i / 3;
      const r1 = seeded(particleIndex, 1);
      const r2 = seeded(particleIndex, 2);

      if (isLight) {
        // Light theme colors - softer, brighter greens
        if (r1 > 0.7) {
          colors[i] = 0.4;     // R (softer green)
          colors[i + 1] = 0.9; // G
          colors[i + 2] = 0.5; // B
        } else if (r2 > 0.6) {
          colors[i] = 0.5;     // R
          colors[i + 1] = 0.8; // G (medium green)
          colors[i + 2] = 0.6; // B
        } else {
          colors[i] = 0.6;     // R
          colors[i + 1] = 0.95; // G (bright green)
          colors[i + 2] = 0.7; // B
        }
      } else {
        // Dark theme colors - deeper, richer greens
        if (r1 > 0.7) {
          colors[i] = 0.1;     // R (dark green)
          colors[i + 1] = 0.8; // G
          colors[i + 2] = 0.2; // B
        } else if (r2 > 0.6) {
          colors[i] = 0.2;     // R
          colors[i + 1] = 0.6; // G (medium green)
          colors[i + 2] = 0.3; // B
        } else {
          colors[i] = 0.3;     // R
          colors[i + 1] = 0.9; // G (bright green)
          colors[i + 2] = 0.4; // B
        }
      }
    }

    colorAttribute.needsUpdate = true;
  }, [theme, isLight]);

  // Don't render on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return <div ref={mountRef} className={`fixed inset-0 pointer-events-none z-0 ${className}`} />;
};

export default ThreeBackground;