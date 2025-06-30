import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import LoadingFallback from './LoadingFallback';
import ModelInstructions from './ModelInstructions';

interface SelectedMesh {
  mesh: THREE.Mesh;
  originalMaterial: THREE.Material | THREE.Material[];
}

interface ModelProps {
  url: string;
  position: [number, number, number];
  onMeshClick: (mesh: THREE.Mesh, originalMaterial: THREE.Material | THREE.Material[]) => void;
}

const Model: React.FC<ModelProps> = ({ url, position, onMeshClick }) => {
  try {
    const { scene } = useGLTF(url);
    const groupRef = useRef<THREE.Group>(null);

    // Clone the scene to avoid sharing materials between instances
    const clonedScene = scene.clone();

    // Handle click events on meshes
    const handleClick = (event: ThreeElements['mesh']) => {
      event.stopPropagation();
      const mesh = event.object as THREE.Mesh;
      if (mesh.isMesh) {
        onMeshClick(mesh, mesh.material);
      }
    };

    // Traverse the model and add click handlers to all meshes
    React.useEffect(() => {
      if (clonedScene) {
        clonedScene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Store original material reference
            child.userData.originalMaterial = child.material;
          }
        });
      }
    }, [clonedScene]);

    return (
      <group ref={groupRef} position={position}>
        <primitive 
          object={clonedScene} 
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'auto';
          }}
        />
      </group>
    );
  } catch (error) {
    return (
      <Html position={position}>
        <div className="bg-red-600 text-white p-2 rounded">
          Failed to load model: {url}
        </div>
      </Html>
    );
  }
};

const DebugOverlay: React.FC<{ selectedMesh: SelectedMesh | null }> = ({ selectedMesh }) => {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg font-mono text-sm max-w-md">
      <h3 className="font-bold mb-2">Debug Info</h3>
      {selectedMesh ? (
        <div>
          <p><strong>Selected Mesh:</strong> {selectedMesh.mesh.name || 'Unnamed'}</p>
          <p><strong>Position:</strong> 
            {` x: ${selectedMesh.mesh.position.x.toFixed(2)}`}
            {`, y: ${selectedMesh.mesh.position.y.toFixed(2)}`}
            {`, z: ${selectedMesh.mesh.position.z.toFixed(2)}`}
          </p>
          <p><strong>World Position:</strong>
            {(() => {
              const worldPos = new THREE.Vector3();
              selectedMesh.mesh.getWorldPosition(worldPos);
              return ` x: ${worldPos.x.toFixed(2)}, y: ${worldPos.y.toFixed(2)}, z: ${worldPos.z.toFixed(2)}`;
            })()}
          </p>
        </div>
      ) : (
        <p>Click on a mesh to see debug info</p>
      )}
    </div>
  );
};

const Instructions: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg max-w-md">
      <h3 className="font-bold mb-2">Controls</h3>
      <ul className="text-sm space-y-1">
        <li>• <strong>Rotate:</strong> Left click + drag</li>
        <li>• <strong>Zoom:</strong> Mouse wheel</li>
        <li>• <strong>Pan:</strong> Right click + drag</li>
        <li>• <strong>Select:</strong> Click on any mesh to highlight</li>
      </ul>
    </div>
  );
};

const ModelViewer: React.FC = () => {
  const [selectedMesh, setSelectedMesh] = useState<SelectedMesh | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const modelPaths = [
    '/models/model1.gltf',
    '/models/model2.gltf',
    '/models/model3.gltf'
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

  return (
    <div className="w-full h-screen relative">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 5, 10], fov: 75 }}
          onClick={clearSelection}
          className="bg-gray-900"
        >
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Environment */}
          <Environment preset="studio" />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            dampingFactor={0.1}
            enableDamping={true}
          />

          {/* Load and display models */}
          {modelPaths.map((path, index) => (
            <Model
              key={path}
              url={path}
              position={[(index - 1) * 4, 0, 0]} // Space models along X-axis
              onMeshClick={handleMeshClick}
            />
          ))}

          {/* Grid helper for reference */}
          <gridHelper args={[20, 20]} />
        </Canvas>
      </Suspense>

      {/* UI Overlays */}
      <DebugOverlay selectedMesh={selectedMesh} />
      <Instructions />
      
      {/* Model setup instructions */}
      {showInstructions && <ModelInstructions />}
      
      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        {selectedMesh && (
          <button
            onClick={clearSelection}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Clear Selection
          </button>
        )}
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showInstructions ? 'Hide' : 'Show'} Setup
        </button>
      </div>
    </div>
  );
};

export default ModelViewer;
