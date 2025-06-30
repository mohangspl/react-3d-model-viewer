
import React from 'react';

const ModelInstructions: React.FC = () => {
  return (
    <div className="absolute top-4 right-4 bg-blue-900 bg-opacity-90 text-white p-4 rounded-lg max-w-sm">
      <h3 className="font-bold mb-2">Model Setup</h3>
      <div className="text-sm space-y-2">
        <p>Place your GLTF models in:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>/public/models/model1.gltf</li>
          <li>/public/models/model1.bin</li>
          <li>/public/models/model2.gltf</li>
          <li>/public/models/model2.bin</li>
          <li>/public/models/model3.gltf</li>
          <li>/public/models/model3.bin</li>
        </ul>
        <p className="text-xs text-gray-300 mt-2">
          Export from STEP files to GLTF format with separate .bin files
        </p>
      </div>
    </div>
  );
};

export default ModelInstructions;
