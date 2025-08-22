// import React from 'react';
// import { Download, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

// interface ImageContent {
//   id: string;
//   fileName: string;
//   fileSize: number;
//   fileData: string;
//   about: string;
//   createdAt: Date;
// }

// interface ImagePreviewProps {
//   image: ImageContent;
//   onClose: () => void;
// }

// const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onClose }) => {
//   const [zoom, setZoom] = React.useState(1);
//   const [rotation, setRotation] = React.useState(0);

//   const handleDownload = () => {
//     const link = document.createElement('a');
//     link.href = image.fileData;
//     link.download = image.fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
//   const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
//   const handleRotate = () => setRotation(prev => (prev + 90) % 360);
//   const handleReset = () => {
//     setZoom(1);
//     setRotation(0);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
//         <div className="flex items-center gap-4">
//           <h3 className="text-lg font-semibold text-white">{image.fileName}</h3>
//           <span className="text-sm text-gray-400">{formatFileSize(image.fileSize)}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={handleZoomOut}
//             className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
//             title="Zoom Out"
//           >
//             <ZoomOut className="w-4 h-4" />
//           </button>
//           <span className="text-sm text-gray-300 min-w-16 text-center">
//             {Math.round(zoom * 100)}%
//           </span>
//           <button
//             onClick={handleZoomIn}
//             className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
//             title="Zoom In"
//           >
//             <ZoomIn className="w-4 h-4" />
//           </button>
//           <button
//             onClick={handleRotate}
//             className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
//             title="Rotate"
//           >
//             <RotateCw className="w-4 h-4" />
//           </button>
//           <button
//             onClick={handleReset}
//             className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
//             title="Reset View"
//           >
//             Reset
//           </button>
//           <button
//             onClick={handleDownload}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//           >
//             <Download className="w-4 h-4" />
//             Download
//           </button>
//           <button
//             onClick={onClose}
//             className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* Image Container */}
//       <div className="flex-1 overflow-auto flex items-center justify-center p-4">
//         <div 
//           className="max-w-none transition-transform duration-200"
//           style={{ 
//             transform: `scale(${zoom}) rotate(${rotation}deg)`,
//             transformOrigin: 'center center'
//           }}
//         >
//           <img
//             src={image.fileData}
//             alt={image.fileName}
//             className="max-w-none h-auto shadow-2xl"
//             style={{
//               maxHeight: zoom === 1 ? '80vh' : 'none',
//               maxWidth: zoom === 1 ? '80vw' : 'none'
//             }}
//           />
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="bg-gray-900 p-4 border-t border-gray-700">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm text-gray-300">{image.about}</p>
//             <p className="text-xs text-gray-500 mt-1">
//               Created: {new Date(image.createdAt).toLocaleString()}
//             </p>
//           </div>
//           <div className="text-xs text-gray-500">
//             Press ESC to close
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImagePreview;

import React from 'react';
import { Download, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageContent {
  id: string;
  fileName: string;
  fileSize: number;
  fileData: string; // This will now be the preview URL
  about: string;
  createdAt: Date;
  previewUrl?: string; // Optional backup URL
}

interface ImagePreviewProps {
  image: ImageContent;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onClose }) => {
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  const handleDownload = () => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = image.fileData; // Use the preview URL for download
    link.download = image.fileName;
    link.target = '_blank'; // Open in new tab to trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  // Get the image URL (either fileData which is now the preview URL, or previewUrl as fallback)
  const imageUrl = image.previewUrl || image.fileData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">{image.fileName}</h3>
          <span className="text-sm text-gray-400">{formatFileSize(image.fileSize)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-300 min-w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
            title="Reset View"
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        <div 
          className="max-w-none transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={imageUrl}
            alt={image.fileName}
            className="max-w-none h-auto shadow-2xl"
            style={{
              maxHeight: zoom === 1 ? '80vh' : 'none',
              maxWidth: zoom === 1 ? '80vw' : 'none'
            }}
            onError={(e) => {
              // Fallback if image fails to load
              console.error('Failed to load image:', imageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">{image.about}</p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(image.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Press ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;