import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { TrajectoryPoint } from '../hooks/useChat';

interface Props {
  trajectory: TrajectoryPoint[];
}

/* ── Tetrahedron geometry ──
   Regular tetrahedron vertices placed so centroid = origin.
   Each vertex = one RGBY channel.
   Scale factor chosen so max RGBY score (6) maps to vertex. */
const S = 5; // visual scale
const VERTICES = {
  R: new THREE.Vector3(S, S, S),          // front-top-right
  G: new THREE.Vector3(S, -S, -S),        // front-bottom-left
  B: new THREE.Vector3(-S, S, -S),        // back-top-left
  Y: new THREE.Vector3(-S, -S, S),        // back-bottom-right
};

const COLORS = {
  R: 0xe53935,
  G: 0x43a047,
  B: 0x5c6bc0,
  Y: 0xc6a700,
};

/** Map RGBY scores (0-6) to barycentric position inside tetrahedron */
function rgbyToPosition(r: number, g: number, b: number, y: number): THREE.Vector3 {
  const total = r + g + b + y || 1;
  const wR = r / total;
  const wG = g / total;
  const wB = b / total;
  const wY = y / total;
  return new THREE.Vector3(
    VERTICES.R.x * wR + VERTICES.G.x * wG + VERTICES.B.x * wB + VERTICES.Y.x * wY,
    VERTICES.R.y * wR + VERTICES.G.y * wG + VERTICES.B.y * wB + VERTICES.Y.y * wY,
    VERTICES.R.z * wR + VERTICES.G.z * wG + VERTICES.B.z * wB + VERTICES.Y.z * wY,
  );
}

function makeLabel(text: string, color: string, fontSize = 13): CSS2DObject {
  const div = document.createElement('div');
  div.textContent = text;
  div.style.cssText = `
    color: ${color}; font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: ${fontSize}px; font-weight: 700; pointer-events: none;
    text-shadow: 0 0 6px rgba(0,0,0,0.9); white-space: nowrap;
  `;
  return new CSS2DObject(div);
}

function makeInfoLabel(lines: string[], bgColor: string): CSS2DObject {
  const div = document.createElement('div');
  div.innerHTML = lines.join('<br>');
  div.style.cssText = `
    color: #fff; font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 10px; line-height: 1.4; pointer-events: none;
    background: ${bgColor}; padding: 4px 8px; border-radius: 4px;
    white-space: nowrap; text-shadow: none;
  `;
  return new CSS2DObject(div);
}

export default function HexSpaceVisualization({ trajectory }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const animationIdRef = useRef<number>(0);
  const trajectoryGroupRef = useRef<THREE.Group | null>(null);

  // Initial scene setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080a0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(10, 8, 12);

    // WebGL renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // CSS2D label renderer (overlays HTML labels)
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;

    // ── Tetrahedron wireframe ──
    const verts = [VERTICES.R, VERTICES.G, VERTICES.B, VERTICES.Y];
    const edges: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        edges.push([verts[i], verts[j]]);
      }
    }
    edges.forEach(([a, b]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
      const mat = new THREE.LineBasicMaterial({ color: 0x2a2e3a, transparent: true, opacity: 0.5 });
      scene.add(new THREE.Line(geo, mat));
    });

    // ── Face fills (subtle transparent) ──
    const faces = [
      [VERTICES.R, VERTICES.G, VERTICES.B],
      [VERTICES.R, VERTICES.G, VERTICES.Y],
      [VERTICES.R, VERTICES.B, VERTICES.Y],
      [VERTICES.G, VERTICES.B, VERTICES.Y],
    ];
    faces.forEach(tri => {
      const geo = new THREE.BufferGeometry();
      const positions = new Float32Array([
        tri[0].x, tri[0].y, tri[0].z,
        tri[1].x, tri[1].y, tri[1].z,
        tri[2].x, tri[2].y, tri[2].z,
      ]);
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1c2129, transparent: true, opacity: 0.08,
        side: THREE.DoubleSide, depthWrite: false,
      });
      scene.add(new THREE.Mesh(geo, mat));
    });

    // ── Vertex markers + labels ──
    (Object.entries(VERTICES) as [keyof typeof VERTICES, THREE.Vector3][]).forEach(([ch, pos]) => {
      // Glowing sphere at vertex
      const geo = new THREE.SphereGeometry(0.25, 24, 24);
      const mat = new THREE.MeshBasicMaterial({ color: COLORS[ch] });
      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.copy(pos);
      scene.add(sphere);

      // Outer glow
      const glowGeo = new THREE.SphereGeometry(0.45, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: COLORS[ch], transparent: true, opacity: 0.15,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.copy(pos);
      scene.add(glow);

      // Channel label
      const channelNames: Record<string, string> = {
        R: 'R — Risk',
        G: 'G — Systems',
        B: 'B — Procedure',
        Y: 'Y — Behaviour',
      };
      const label = makeLabel(channelNames[ch], `#${COLORS[ch].toString(16).padStart(6, '0')}`, 14);
      label.position.copy(pos.clone().multiplyScalar(1.18));
      scene.add(label);
    });

    // ── Centroid marker ──
    const centroid = new THREE.Vector3(0, 0, 0);
    const centGeo = new THREE.OctahedronGeometry(0.18);
    const centMat = new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: true });
    const centMesh = new THREE.Mesh(centGeo, centMat);
    centMesh.position.copy(centroid);
    scene.add(centMesh);

    const centLabel = makeLabel('ORIGIN', '#666', 10);
    centLabel.position.set(0, -0.5, 0);
    scene.add(centLabel);

    // ── El Capitan anchor (6R 3G 3B 5Y) ──
    const anchorPos = rgbyToPosition(6, 3, 3, 5);
    const anchorGeo = new THREE.OctahedronGeometry(0.3);
    const anchorMat = new THREE.MeshBasicMaterial({ color: 0xf5c518, wireframe: true });
    const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
    anchorMesh.position.copy(anchorPos);
    scene.add(anchorMesh);

    const anchorLabel = makeLabel('EL CAPITAN 6R3G3B5Y', '#f5c518', 10);
    anchorLabel.position.copy(anchorPos.clone().add(new THREE.Vector3(0, 0.6, 0)));
    scene.add(anchorLabel);

    // ── Trajectory group (cleared and rebuilt per update) ──
    const trajGroup = new THREE.Group();
    scene.add(trajGroup);
    trajectoryGroupRef.current = trajGroup;

    // ── Lighting ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pLight = new THREE.PointLight(0xffffff, 0.8);
    pLight.position.set(10, 10, 10);
    scene.add(pLight);

    // ── Animate ──
    function animate() {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      anchorMesh.rotation.y += 0.008;
      centMesh.rotation.y -= 0.005;
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      if (labelRenderer.domElement.parentNode === container) {
        container.removeChild(labelRenderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // ── Update trajectory points ──
  useEffect(() => {
    const group = trajectoryGroupRef.current;
    if (!group) return;

    // Clear previous trajectory objects
    while (group.children.length) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    }

    if (trajectory.length === 0) return;

    trajectory.forEach((turn, i) => {
      const uPos = rgbyToPosition(turn.user.r, turn.user.g, turn.user.b, turn.user.y);
      const aPos = rgbyToPosition(turn.ai.r, turn.ai.g, turn.ai.b, turn.ai.y);

      const isLatest = i === trajectory.length - 1;
      const uSize = isLatest ? 0.28 : 0.18;
      const aSize = isLatest ? 0.24 : 0.15;

      // ── User node (cyan/teal) ──
      const uGeo = new THREE.SphereGeometry(uSize, 20, 20);
      const uMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff, transparent: true, opacity: isLatest ? 0.95 : 0.7,
      });
      const uNode = new THREE.Mesh(uGeo, uMat);
      uNode.position.copy(uPos);
      group.add(uNode);

      // User label: turn + hex
      const uLabel = makeInfoLabel(
        [`T${turn.turn} USER`, turn.userHex],
        'rgba(0,229,255,0.25)',
      );
      uLabel.position.copy(uPos.clone().add(new THREE.Vector3(0, 0.5, 0)));
      group.add(uLabel);

      // ── AI node (magenta/pink) ──
      const aGeo = new THREE.SphereGeometry(aSize, 20, 20);
      const aMat = new THREE.MeshBasicMaterial({
        color: 0xff4081, transparent: true, opacity: isLatest ? 0.95 : 0.7,
      });
      const aNode = new THREE.Mesh(aGeo, aMat);
      aNode.position.copy(aPos);
      group.add(aNode);

      // AI label: turn + hex
      const aLabel = makeInfoLabel(
        [`T${turn.turn} AI`, turn.aiHex],
        'rgba(255,64,129,0.25)',
      );
      aLabel.position.copy(aPos.clone().add(new THREE.Vector3(0, 0.5, 0)));
      group.add(aLabel);

      // ── User↔AI link (dashed) ──
      const linkGeo = new THREE.BufferGeometry().setFromPoints([uPos, aPos]);
      const linkMat = new THREE.LineDashedMaterial({
        color: 0x555555, dashSize: 0.2, gapSize: 0.1,
        transparent: true, opacity: 0.4,
      });
      const link = new THREE.Line(linkGeo, linkMat);
      link.computeLineDistances();
      group.add(link);

      // ── Connect to previous turn (user trajectory = cyan, AI trajectory = magenta) ──
      if (i > 0) {
        const prevU = rgbyToPosition(
          trajectory[i - 1].user.r, trajectory[i - 1].user.g,
          trajectory[i - 1].user.b, trajectory[i - 1].user.y,
        );
        const prevA = rgbyToPosition(
          trajectory[i - 1].ai.r, trajectory[i - 1].ai.g,
          trajectory[i - 1].ai.b, trajectory[i - 1].ai.y,
        );

        // User trail
        const uTrailGeo = new THREE.BufferGeometry().setFromPoints([prevU, uPos]);
        const uTrailMat = new THREE.LineBasicMaterial({
          color: 0x00e5ff, transparent: true, opacity: 0.5,
        });
        group.add(new THREE.Line(uTrailGeo, uTrailMat));

        // AI trail
        const aTrailGeo = new THREE.BufferGeometry().setFromPoints([prevA, aPos]);
        const aTrailMat = new THREE.LineBasicMaterial({
          color: 0xff4081, transparent: true, opacity: 0.5,
        });
        group.add(new THREE.Line(aTrailGeo, aTrailMat));
      }
    });

    // ── Glow rings on latest nodes ──
    const last = trajectory[trajectory.length - 1];
    const lastU = rgbyToPosition(last.user.r, last.user.g, last.user.b, last.user.y);
    const lastA = rgbyToPosition(last.ai.r, last.ai.g, last.ai.b, last.ai.y);

    [{ pos: lastU, color: 0x00e5ff }, { pos: lastA, color: 0xff4081 }].forEach(({ pos, color }) => {
      const ringGeo = new THREE.RingGeometry(0.35, 0.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      group.add(ring);
    });
  }, [trajectory]);

  // ── Legend overlay ──
  const legend = useMemo(() => (
    <div style={{
      position: 'absolute', bottom: 12, left: 12,
      background: 'rgba(8,10,15,0.85)', padding: '8px 12px',
      borderRadius: 6, fontSize: 11, fontFamily: "'SF Mono', 'Fira Code', monospace",
      color: '#aaa', lineHeight: 1.8, pointerEvents: 'none', zIndex: 2,
    }}>
      <div><span style={{ color: '#00e5ff' }}>{'\u25CF'}</span> User turn</div>
      <div><span style={{ color: '#ff4081' }}>{'\u25CF'}</span> AI turn</div>
      <div><span style={{ color: '#f5c518' }}>{'\u25C7'}</span> El Capitan anchor</div>
      <div style={{ color: '#555', marginTop: 4 }}>Drag to orbit / scroll to zoom</div>
    </div>
  ), []);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {legend}
    </div>
  );
}
