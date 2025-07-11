import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import LoadingFallback from './LoadingFallback';
import { Button } from './ui/button';
import { ErrorBoundary } from "./ErrorBoundary";

interface SelectedMesh {
  mesh: THREE.Mesh;
  originalMaterial: THREE.Material | THREE.Material[];
}

interface ModelProps {
  url: string;
  onMeshClick: (mesh: THREE.Mesh, originalMaterial: THREE.Material | THREE.Material[]) => void;
  onLoad: () => void;
}

// Model: unified centering, scaling, and orientation logic
const Model: React.FC<ModelProps> = ({ url, onMeshClick, onLoad }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid sharing materials between instances
  const clonedScene = scene.clone();

  // Center, scale, and orient the model to fit the view and appear upright (same as Model3)
  React.useEffect(() => {
    if (!clonedScene) return;
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Shift the model to center at origin
    clonedScene.position.sub(center);

    // Scale to fit
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 8;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;
    clonedScene.scale.setScalar(scale);

    // Correct orientation to upright
    clonedScene.rotation.x = Math.PI / 2;

    // Adjust vertically so it's fully visible (shift slightly upward if needed)
    const heightOffset = size.y * 0.25;
    clonedScene.position.y += heightOffset;
  }, [clonedScene]);

  React.useEffect(() => { onLoad(); }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive
        object={clonedScene}
      />
    </group>
  );
};

// Model2: render clonedScene directly, just like Model1/Model3
const Model2: React.FC<Omit<ModelProps, 'url'>> = ({ onMeshClick, onLoad }) => {
  const gltf = useGLTF('/models/model21.gltf');
  const { scene } = gltf as any;
  const groupRef = useRef<THREE.Group>(null);
  const [group, setGroup] = React.useState<THREE.Group | null>(null);

  if (!scene) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <Html center style={{ color: 'white', background: 'rgba(255,0,0,0.8)', padding: 8, borderRadius: 4 }}>
          Invalid glTF file: missing scene
        </Html>
      </group>
    );
  }

  // Clone the scene to avoid sharing materials between instances
  const clonedScene = scene.clone(true);

  React.useEffect(() => {
    // Create a new group and add the cloned scene
    const centerGroup = new THREE.Group();
    centerGroup.add(clonedScene);

    // Center, scale, and rotate the group
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    centerGroup.position.set(0, 0, 0);
    centerGroup.scale.set(1, 1, 1);
    centerGroup.rotation.set(0, 0, 0);
    // Center the model
    clonedScene.position.sub(center);
    // Scale to fit
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 8;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;
    centerGroup.scale.setScalar(scale);
    // Upright orientation
    centerGroup.rotation.x = Math.PI / 2;

    setGroup(centerGroup);
  }, [clonedScene]);

  React.useEffect(() => { onLoad(); }, []);

  if (!group) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive 
        object={group}
      />
    </group>
  );
};

// Model3: ensure identical logic to Model
const Model3: React.FC<Omit<ModelProps, 'url'>> = ({ onMeshClick, onLoad }) => {
  const { scene } = useGLTF('/models/model3.gltf');
  const groupRef = useRef<THREE.Group>(null);
  const [group, setGroup] = React.useState<THREE.Group | null>(null);

  // Clone the scene to avoid sharing materials between instances
  const clonedScene = scene.clone();

  React.useEffect(() => {
    // Create a new group and add the cloned scene
    const centerGroup = new THREE.Group();
    centerGroup.add(clonedScene);

    // Center, scale, and rotate the group
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    centerGroup.position.set(0, 0, 0);
    centerGroup.scale.set(1, 1, 1);
    centerGroup.rotation.set(0, 0, 0);
    // Center the model
    clonedScene.position.sub(center);
    // Scale to fit
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 8;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;
    centerGroup.scale.setScalar(scale);
    // Upright orientation
    centerGroup.rotation.x = Math.PI / 2;
    setGroup(centerGroup);
  }, [clonedScene]);

  React.useEffect(() => { onLoad(); }, []);

  if (!group) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive
        object={group}
      />
    </group>
  );
};

const ModelViewer: React.FC = () => {
  const [selectedMesh, setSelectedMesh] = useState<SelectedMesh | null>(null);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const orbitControlsRef = React.useRef<any>(null);

  const modelOptions = [
    { label: 'Model 1', path: '/models/model1.gltf' },
    { label: 'Model 2', path: '/models/model21.gltf' },
    { label: 'Model 3', path: '/models/model3.gltf' }
  ];

  const handleMeshClick = (mesh: THREE.Mesh, originalMaterial: THREE.Material | THREE.Material[]) => {
    // Restore previous selection
    if (selectedMesh) {
      selectedMesh.mesh.material = selectedMesh.originalMaterial;
    }

    // Create highlight material
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x440000,
      transparent: true,
      opacity: 0.8
    });

    // Apply highlight to new selection
    mesh.material = highlightMaterial;

    setSelectedMesh({
      mesh,
      originalMaterial
    });
  };

  const clearSelection = () => {
    if (selectedMesh) {
      selectedMesh.mesh.material = selectedMesh.originalMaterial;
      setSelectedMesh(null);
    }
  };

  const handleModelSelect = (modelPath: string) => {
    clearSelection();
    setModelError(null);
    setLoading(true);
    setCurrentModel(modelPath);
  };

  const handleModelError = (error: string) => {
    setModelError(error);
    setLoading(false);
    setCurrentModel(null);
  };

  const handleModelLoad = () => {
    setLoading(false);
    setModelError(null);
  };

  // Handler to reset camera and controls
  const handleResetView = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Heading and Model Selection Buttons OUTSIDE the black flexbox */}
      <h2 style={{ margin: '24px 0 8px 0', fontWeight: 600, fontSize: 24, color: '#222', textAlign: 'center' }}>3D Model Viewer</h2>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          {modelOptions.map((model, idx) => (
            <Button
              key={model.path}
              onClick={() => handleModelSelect(model.path)}
              className={`transition-none ${currentModel === model.path ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'} ${idx === 0 || idx === 1 ? '' : ''}`}
              disabled={loading}
            >
              {loading && currentModel === model.path ? 'Loading...' : model.label}
            </Button>
          ))}
        </div>
      {/* Black flexbox containing the 3D viewer */}
      <div style={{ width: '50vw', height: '50vh', background: '#D2E3EB', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Reset View Button in top right corner */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <Button onClick={handleResetView} className="bg-gray-500 text-white hover:bg-gray-700">Reset View</Button>
        </div>
        <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* 3D Canvas */}
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<LoadingFallback />}>
              <Canvas camera={{ position: [0, 0, 16], fov: 45 }} shadows style={{ background: '#D2E3EB' }}>
                {currentModel === '/models/model1.gltf' ? (
                  <>
                    <hemisphereLight color={0xffffff} groundColor={0xaaaaaa} intensity={3.0} />
                    <ambientLight intensity={2.2} />
                    <directionalLight position={[10, 10, 10]} intensity={3.5} castShadow />
                    <directionalLight position={[-10, -10, 10]} intensity={2.0} />
                    <directionalLight position={[0, 10, -10]} intensity={1.5} />
                  </>
                ) : null}
                <directionalLight position={[10, 10, 10]} intensity={3.5} castShadow />
                <directionalLight position={[-10, -10, 10]} intensity={2.0} />
                <directionalLight position={[0, 10, -10]} intensity={1.5} />
          {currentModel && !modelError && (
            <ErrorBoundary key={currentModel} onError={handleModelError}>
              {currentModel === '/models/model1.gltf' ? (
                <Model
                  url={currentModel}
                  onMeshClick={handleMeshClick}
                  onLoad={handleModelLoad}
                />
              ) : currentModel === '/models/model21.gltf' ? (
                <Model2
                  onMeshClick={handleMeshClick}
                  onLoad={handleModelLoad}
                />
              ) : currentModel === '/models/model3.gltf' ? (
                <Model3
                  onMeshClick={handleMeshClick}
                  onLoad={handleModelLoad}
                />
              ) : null}
            </ErrorBoundary>
          )}
                <OrbitControls ref={orbitControlsRef} enablePan enableZoom enableRotate />
        </Canvas>
      </Suspense>
            {/* Error message */}
            {modelError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
                <div className="text-red-600 font-semibold text-lg p-4 rounded shadow bg-white border border-red-200">
                  {modelError}
                </div>
              </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelViewer;
