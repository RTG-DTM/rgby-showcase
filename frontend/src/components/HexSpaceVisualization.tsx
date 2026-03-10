import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrajectoryPoint } from '../hooks/useChat';

interface Props {
  trajectory: TrajectoryPoint[];
}

export default function HexSpaceVisualization({ trajectory }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 8, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const gridHelper = new THREE.GridHelper(20, 20, 0x00bfff, 0x1b1b25);
    scene.add(gridHelper);

    const axisLength = 6;
    const axes = [
      { color: 0xff3b3b, label: 'R', dir: new THREE.Vector3(1, 0, 0) },
      { color: 0x2ecc71, label: 'G', dir: new THREE.Vector3(0, 1, 0) },
      { color: 0x3b8bff, label: 'B', dir: new THREE.Vector3(0, 0, 1) },
      { color: 0xf5c518, label: 'Y', dir: new THREE.Vector3(-1, 0, 0) },
    ];

    axes.forEach(axis => {
      const geometry = new THREE.CylinderGeometry(0.04, 0.04, axisLength, 8);
      const material = new THREE.MeshBasicMaterial({ color: axis.color });
      const cylinder = new THREE.Mesh(geometry, material);

      if (axis.label === 'R') {
        cylinder.rotation.z = -Math.PI / 2;
        cylinder.position.set(axisLength / 2, 0, 0);
      } else if (axis.label === 'G') {
        cylinder.position.set(0, axisLength / 2, 0);
      } else if (axis.label === 'B') {
        cylinder.rotation.x = Math.PI / 2;
        cylinder.position.set(0, 0, axisLength / 2);
      } else {
        cylinder.rotation.z = Math.PI / 2;
        cylinder.position.set(-axisLength / 2, 0, 0);
      }
      scene.add(cylinder);
    });

    // Anchor point (El Capitan: 6R3G3B5Y)
    const anchorPos = new THREE.Vector3(6 - 3, 3 - 3, 3 - 3);
    const anchorGeo = new THREE.OctahedronGeometry(0.3);
    const anchorMat = new THREE.MeshBasicMaterial({ color: 0xf5c518, wireframe: true });
    const anchor = new THREE.Mesh(anchorGeo, anchorMat);
    anchor.position.copy(anchorPos);
    scene.add(anchor);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    function animate() {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      anchor.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || trajectory.length === 0) return;
    const scene = sceneRef.current;

    scene.children
      .filter(c => c.userData.isTrajectory)
      .forEach(obj => scene.remove(obj));

    const project = (rgby: { r: number; g: number; b: number; y: number }) =>
      new THREE.Vector3(rgby.r - 3, rgby.g - 3, rgby.b - 3);

    trajectory.forEach((turn, i) => {
      // User node (green)
      const uPos = project(turn.user);
      const uGeo = new THREE.SphereGeometry(0.15, 16, 16);
      const uMat = new THREE.MeshBasicMaterial({ color: 0x2ecc71, transparent: true, opacity: 0.8 });
      const uNode = new THREE.Mesh(uGeo, uMat);
      uNode.position.copy(uPos);
      uNode.userData.isTrajectory = true;
      scene.add(uNode);

      // AI node (blue)
      const aPos = project(turn.ai);
      const aGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const aMat = new THREE.MeshBasicMaterial({ color: 0x3b8bff, transparent: true, opacity: 0.7 });
      const aNode = new THREE.Mesh(aGeo, aMat);
      aNode.position.copy(aPos);
      aNode.userData.isTrajectory = true;
      scene.add(aNode);

      // User-AI link
      const linkGeo = new THREE.BufferGeometry().setFromPoints([uPos, aPos]);
      const linkMat = new THREE.LineBasicMaterial({ color: 0x2f2f43, transparent: true, opacity: 0.4 });
      const link = new THREE.Line(linkGeo, linkMat);
      link.userData.isTrajectory = true;
      scene.add(link);

      // Connect user trajectory
      if (i > 0) {
        const prevPos = project(trajectory[i - 1].user);
        const lineGeo = new THREE.BufferGeometry().setFromPoints([prevPos, uPos]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.6 });
        const line = new THREE.Line(lineGeo, lineMat);
        line.userData.isTrajectory = true;
        scene.add(line);
      }
    });

    // Highlight latest
    const last = trajectory[trajectory.length - 1];
    const lastPos = project(last.user);
    const curGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const curMat = new THREE.MeshBasicMaterial({ color: 0xf5c518, transparent: true, opacity: 0.9 });
    const cur = new THREE.Mesh(curGeo, curMat);
    cur.position.copy(lastPos);
    cur.userData.isTrajectory = true;
    scene.add(cur);

    const glowGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xf5c518, transparent: true, opacity: 0.2 });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.copy(lastPos);
    glow.userData.isTrajectory = true;
    scene.add(glow);
  }, [trajectory]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
}
