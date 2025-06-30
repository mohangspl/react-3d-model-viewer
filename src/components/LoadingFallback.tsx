
import React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Loading 3D Models...</h2>
        <p className="text-gray-400">Please wait while we load your GLTF models</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
