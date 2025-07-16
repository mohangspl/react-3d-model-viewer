import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
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

// Model: loads and renders a GLTF model from a URL
const Model: React.FC<ModelProps> = ({ url, onMeshClick, onLoad }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = scene.clone();

  React.useEffect(() => {
    if (!clonedScene) return;
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    clonedScene.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 8;
    const scale = maxDim > 0 ? targetSize / maxDim : 1;
    clonedScene.scale.setScalar(scale);
    clonedScene.rotation.x = Math.PI / 2;
    const heightOffset = size.y * 0.25;
    clonedScene.position.y += heightOffset;
  }, [clonedScene]);

  React.useEffect(() => { onLoad(); }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={clonedScene} />
    </group>
  );
};

const ModelViewer: React.FC = () => {
  const [selectedMesh, setSelectedMesh] = useState<SelectedMesh | null>(null);
  const [modelUrl, setModelUrl] = useState<string>('');
  const [remoteModelUrl, setRemoteModelUrl] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const orbitControlsRef = useRef<any>(null);

  const handleMeshClick = (mesh: THREE.Mesh, originalMaterial: THREE.Material | THREE.Material[]) => {
    if (selectedMesh) {
      selectedMesh.mesh.material = selectedMesh.originalMaterial;
    }
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0x440000,
      transparent: true,
      opacity: 0.8
    });
    mesh.material = highlightMaterial;
    setSelectedMesh({ mesh, originalMaterial });
  };

  const clearSelection = () => {
    if (selectedMesh) {
      selectedMesh.mesh.material = selectedMesh.originalMaterial;
      setSelectedMesh(null);
    }
  };

  const handleModelLoad = () => {
    setLoading(false);
    setModelError(null);
  };

  const handleModelError = (error: string) => {
    setModelError(error);
    setLoading(false);
    setRemoteModelUrl(null);
  };

  const handleResetView = () => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset();
    }
  };

  const handleDownloadModel = async () => {
    clearSelection();
    setModelError(null);
    setLoading(true);
    setRemoteModelUrl(null);
    setDownloadProgress(0);
    try {
      const response = await axios.get(modelUrl, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setDownloadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      const blob = new Blob([response.data], { type: 'model/gltf+json' });
      const url = URL.createObjectURL(blob);
      setRemoteModelUrl(url);
      setLoading(false);
    } catch (error) {
      setModelError('Failed to download remote model.');
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ margin: '24px 0 8px 0', fontWeight: 600, fontSize: 24, color: '#222', textAlign: 'center' }}>3D Model Viewer (Remote URL Only)</h2>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <input
          type="text"
          value={modelUrl}
          onChange={e => setModelUrl(e.target.value)}
          placeholder="Enter remote .gltf or .glb URL"
          style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: 400 }}
          disabled={loading}
        />
        <Button onClick={handleDownloadModel} disabled={loading || !modelUrl}>
          {loading ? 'Loading...' : 'Load Model'}
        </Button>
      </div>
      {loading && downloadProgress > 0 && (
        <div style={{ marginTop: 8, color: '#333', fontWeight: 500 }}>
          Downloading: {downloadProgress}%
        </div>
      )}
      <div style={{ width: '50vw', height: '50vh', background: '#D2E3EB', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
          <Button onClick={handleResetView} className="bg-gray-500 text-white hover:bg-gray-700">Reset View</Button>
        </div>
        <div style={{ flex: 1, width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Suspense fallback={<LoadingFallback />}>
              <Canvas camera={{ position: [0, 0, 16], fov: 45 }} shadows style={{ background: '#D2E3EB' }}>
                <hemisphereLight color={0xffffff} groundColor={0xaaaaaa} intensity={3.0} />
                <ambientLight intensity={2.2} />
                <directionalLight position={[10, 10, 10]} intensity={3.5} castShadow />
                <directionalLight position={[-10, -10, 10]} intensity={2.0} />
                <directionalLight position={[0, 10, -10]} intensity={1.5} />
                {remoteModelUrl && !modelError && (
                  <ErrorBoundary key={remoteModelUrl} onError={handleModelError}>
                    <Model
                      url={remoteModelUrl}
                      onMeshClick={handleMeshClick}
                      onLoad={handleModelLoad}
                    />
                  </ErrorBoundary>
                )}
                <OrbitControls ref={orbitControlsRef} enablePan enableZoom enableRotate />
              </Canvas>
            </Suspense>
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
