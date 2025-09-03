
import React from 'react';
import { Download, X, ExternalLink } from 'lucide-react';

interface PDFContent {
  id: string;
  fileName: string;
  fileSize: number;
  fileData: string; // This will now be the preview URL
  about: string;
  createdAt: Date;
  previewUrl?: string; // Optional backup URL
}

interface PDFPreviewProps {
  pdf: PDFContent;
  onClose: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ pdf, onClose }) => {
  const handleDownload = () => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = pdf.fileData; // Use the preview URL for download
    link.download = pdf.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdf.fileData, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get the PDF URL (either fileData which is now the preview URL, or previewUrl as fallback)
  const pdfUrl = pdf.previewUrl || pdf.fileData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">{pdf.fileName}</h3>
          <span className="text-sm text-gray-400">{formatFileSize(pdf.fileSize)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Browser
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

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-800">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-none"
          title={`PDF Preview: ${pdf.fileName}`}
          onError={() => {
            console.error('Failed to load PDF:', pdfUrl);
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">{pdf.about}</p>
            <p className="text-xs text-gray-500 mt-1">
              Created: {new Date(pdf.createdAt).toLocaleString()}
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

export default PDFPreview;