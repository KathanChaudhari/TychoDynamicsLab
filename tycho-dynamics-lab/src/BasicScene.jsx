import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function BasicScene(){

    const containerRef = useRef(null)

    useEffect(() => {

       const container= containerRef.current

       const scene = new THREE.Scene();
       scene.background = new THREE.Color(0x030712);

       const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
      );
      camera.position.set(7, 5, 10);
     camera.lookAt(0, 0, -2);
  
  
     const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });
  
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
  
      container.appendChild(renderer.domElement);

      const hemisphereLight = new THREE.HemisphereLight(
        0x9db7ff,
        0x050505,
        1.5
      );
  
      const sunLight = new THREE.DirectionalLight(0xffffff, 3);
      sunLight.position.set(5, 8, 6);
  
      scene.add(hemisphereLight, sunLight);

      const axesHelper = new THREE.AxesHelper(3);
      const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x172033);
  
      gridHelper.rotation.x = Math.PI / 2;
      gridHelper.position.z = -7;
  
      scene.add(axesHelper, gridHelper);

      const spacecraft = new THREE.Group();
    scene.add(spacecraft);

    const hullMaterial = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.7,
        roughness: 0.35,
      });
  
      const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x172033,
        metalness: 0.5,
        roughness: 0.5,
      });
  
      const engineMaterial = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x075985,
        emissiveIntensity: 3,
      });

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.8, 3),
        hullMaterial
      );
      spacecraft.add(body);
      
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 1.2, 4),
        hullMaterial
      );
  
      nose.rotation.x = -Math.PI / 2;
      nose.position.z = -2.1;
      spacecraft.add(nose);

      const leftWing = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.12, 1.4),
        darkMaterial
      );
  
      leftWing.position.x = -1.5;
      leftWing.position.z = 0.3;
      spacecraft.add(leftWing);

      const rightWing = leftWing.clone();
    rightWing.position.x = 1.5;
    spacecraft.add(rightWing);

    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.25, 24),
      engineMaterial
    );

    engine.rotation.x = Math.PI / 2;
    engine.position.z = 1.6;
    spacecraft.add(engine);

    const dockingRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.16, 16, 64),
        new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          metalness: 0.8,
          roughness: 0.3,
        })
      );
  
      dockingRing.position.z = -7;
      scene.add(dockingRing);
  
      const dockingLight = new THREE.PointLight(0x38bdf8, 15, 10);
      dockingLight.position.set(0, 0, -6.5);
      scene.add(dockingLight);

      const clock = new THREE.Clock();

    function animate() {
      const elapsedTime = clock.getElapsedTime();

      spacecraft.position.y = Math.sin(elapsedTime) * 0.15;
      spacecraft.rotation.z = Math.sin(elapsedTime * 0.6) * 0.05;

      dockingRing.rotation.z = elapsedTime * 0.08;

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
  
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
  
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      }
  
      window.addEventListener("resize", handleResize);
    }, [])
    

    return <div ref={containerRef} className="absolute inset-0" />;
}