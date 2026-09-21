import React, { useEffect, useRef } from 'react';

/**
 * Initializes and manages the Hero 3D Double Helix Wave Three.js scene
 */
export async function initHeroHelix(
  container: HTMLElement,
  canvas: HTMLCanvasElement
): Promise<() => void> {
  // Dynamically import Three.js chunk
  const THREE = await import('three');

  const TURNS = 3.4;
  const STEPS = 118;
  const RAD = 0.95;
  const HEIGHT = 20;
  const RUNGS_COUNT = 30;
  const MOTES_COUNT = 260;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const aspect = width / Math.max(height, 1);

  // 1. Scene & Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(0, 0, 12);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // 2. Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const whiteDirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  whiteDirLight.position.set(4, 6, 8);
  scene.add(whiteDirLight);

  const mintRimLight = new THREE.DirectionalLight(0x22c9a8, 0.7);
  mintRimLight.position.set(-6, -3, 4);
  scene.add(mintRimLight);

  // 3. Geometry generation
  const strand1Points: InstanceType<typeof THREE.Vector3>[] = [];
  const strand2Points: InstanceType<typeof THREE.Vector3>[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const y = (t - 0.5) * HEIGHT;
    const angle = t * Math.PI * 2 * TURNS;

    strand1Points.push(new THREE.Vector3(Math.cos(angle) * RAD, y, Math.sin(angle) * RAD));
    strand2Points.push(new THREE.Vector3(Math.cos(angle + Math.PI) * RAD, y, Math.sin(angle + Math.PI) * RAD));
  }

  const curve1 = new THREE.CatmullRomCurve3(strand1Points);
  const curve2 = new THREE.CatmullRomCurve3(strand2Points);

  const tubeGeo1 = new THREE.TubeGeometry(curve1, 320, 0.085, 12, false);
  const tubeGeo2 = new THREE.TubeGeometry(curve2, 320, 0.085, 12, false);

  const matStrand1 = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9, // --blue
    roughness: 0.28,
    metalness: 0.12,
  });

  const matStrand2 = new THREE.MeshStandardMaterial({
    color: 0x22c9a8, // --mint
    roughness: 0.28,
    metalness: 0.12,
  });

  const meshStrand1 = new THREE.Mesh(tubeGeo1, matStrand1);
  const meshStrand2 = new THREE.Mesh(tubeGeo2, matStrand2);

  // 4. Nested groups: outer group rotates PI/2 to make wave horizontal at bottom; inner group spins on Y
  const outerGroup = new THREE.Group();
  const innerGroup = new THREE.Group();

  innerGroup.add(meshStrand1);
  innerGroup.add(meshStrand2);

  // 5. Base-pair rungs as single InstancedMesh
  const rungCylinderGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 8);
  const rungMat = new THREE.MeshStandardMaterial({
    color: 0x0369a1, // --blue-deep
    roughness: 0.3,
    metalness: 0.15,
    transparent: true,
    opacity: 0.45,
  });

  const rungsMesh = new THREE.InstancedMesh(rungCylinderGeo, rungMat, RUNGS_COUNT);
  const dummy = new THREE.Object3D();

  // 6. Spherical nodes on each strand at rung positions
  const nodeGeo = new THREE.SphereGeometry(0.13, 16, 16);
  const nodeMat1 = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.3,
  });
  const nodeMat2 = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    roughness: 0.2,
    metalness: 0.3,
  });

  interface NodeData {
    mesh1: InstanceType<typeof THREE.Mesh>;
    mesh2: InstanceType<typeof THREE.Mesh>;
    t: number; // 0..1 along helix
    baseScale: number;
    p1: InstanceType<typeof THREE.Vector3>;
    p2: InstanceType<typeof THREE.Vector3>;
  }

  const nodesList: NodeData[] = [];

  for (let i = 0; i < RUNGS_COUNT; i++) {
    const t = (i + 0.5) / RUNGS_COUNT;
    const p1 = curve1.getPoint(t);
    const p2 = curve2.getPoint(t);

    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dist = p1.distanceTo(p2);

    // Position and orient the cylinder rung
    dummy.position.copy(mid);
    dummy.scale.set(1, dist, 1);
    dummy.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3().subVectors(p2, p1).normalize()
    );
    dummy.updateMatrix();
    rungsMesh.setMatrixAt(i, dummy.matrix);

    // Add sphere nodes on each strand
    const node1 = new THREE.Mesh(nodeGeo, nodeMat1);
    node1.position.copy(p1);
    innerGroup.add(node1);

    const node2 = new THREE.Mesh(nodeGeo, nodeMat2);
    node2.position.copy(p2);
    innerGroup.add(node2);

    nodesList.push({
      mesh1: node1,
      mesh2: node2,
      t,
      baseScale: 1,
      p1,
      p2,
    });
  }

  rungsMesh.instanceMatrix.needsUpdate = true;
  innerGroup.add(rungsMesh);

  // 7. Ambient motes Points
  const motesGeo = new THREE.BufferGeometry();
  const motesPositions = new Float32Array(MOTES_COUNT * 3);

  for (let i = 0; i < MOTES_COUNT; i++) {
    motesPositions[i * 3 + 0] = (Math.random() - 0.5) * 16;
    motesPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    motesPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }

  motesGeo.setAttribute('position', new THREE.BufferAttribute(motesPositions, 3));

  const motesMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.07,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });

  const motes = new THREE.Points(motesGeo, motesMat);
  scene.add(motes);

  // 8. Outer group orientation
  outerGroup.add(innerGroup);
  outerGroup.rotation.z = Math.PI / 2; // Horizontal layout
  outerGroup.position.set(0, -4.6, -1); // Near bottom of hero reading as a wave
  scene.add(outerGroup);

  // 9. Responsive adjustments
  const updateLayout = () => {
    const curW = container.clientWidth || window.innerWidth;
    const curH = container.clientHeight || window.innerHeight;
    camera.aspect = curW / Math.max(curH, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(curW, curH);

    if (curW < 960) {
      outerGroup.scale.setScalar(0.62);
      outerGroup.position.set(0, -3.8, -1.2);
      motes.visible = false;
    } else {
      outerGroup.scale.setScalar(1.0);
      outerGroup.position.set(0, -4.6, -1.0);
      motes.visible = true;
    }
  };

  updateLayout();
  window.addEventListener('resize', updateLayout, { passive: true });

  // 10. Mouse parallax tracking
  let targetMouseX = 0;
  let targetMouseY = 0;
  let curMouseX = 0;
  let curMouseY = 0;

  const onPointerMove = (e: MouseEvent) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // 11. Animation loop
  const clock = new THREE.Clock();
  let animFrameId: number;
  let pulseTravel = 0;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = () => {
    const rawDt = clock.getDelta();
    const dt = Math.min(rawDt, 0.05);

    if (!isReducedMotion) {
      // Rotate inner group on Y
      innerGroup.rotation.y += dt * 0.75;

      // Pulse traveling 0 -> 1 along the helix
      pulseTravel = (pulseTravel + dt * 0.45) % 1.0;

      // Scale nodes with heartbeat wave pulse
      for (let i = 0; i < nodesList.length; i++) {
        const item = nodesList[i];
        // Calculate distance on 0..1 loop
        const dist = Math.abs(item.t - pulseTravel);
        const loopDist = Math.min(dist, 1 - dist);
        const boost = Math.max(0, 1 - loopDist * 14) * 0.85;
        const scale = 1 + boost;

        item.mesh1.scale.setScalar(scale);
        item.mesh2.scale.setScalar(scale);
      }

      // Smooth pointer parallax lerping
      curMouseX += (targetMouseX - curMouseX) * 0.05;
      curMouseY += (targetMouseY - curMouseY) * 0.05;

      outerGroup.rotation.x = curMouseY * 0.12;
      outerGroup.rotation.y = curMouseX * 0.12;
      camera.position.x = curMouseX * 0.35;
      camera.position.y = -curMouseY * 0.25;
      camera.lookAt(0, -1, 0);

      // Subtle motes drift
      motes.rotation.y += dt * 0.03;
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(animate);
  };

  animate();

  // 12. Cleanup on unmount
  return () => {
    cancelAnimationFrame(animFrameId);
    window.removeEventListener('resize', updateLayout);
    window.removeEventListener('pointermove', onPointerMove);

    // Dispose geometries & materials
    tubeGeo1.dispose();
    tubeGeo2.dispose();
    rungCylinderGeo.dispose();
    nodeGeo.dispose();
    motesGeo.dispose();

    matStrand1.dispose();
    matStrand2.dispose();
    rungMat.dispose();
    nodeMat1.dispose();
    nodeMat2.dispose();
    motesMat.dispose();

    renderer.dispose();
  };
}

export default function HeroHelix() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cleanup: (() => void) | undefined;
    let isCancelled = false;

    initHeroHelix(container, canvas).then(fn => {
      if (isCancelled) {
        fn();
      } else {
        cleanup = fn;
      }
    });

    return () => {
      isCancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
