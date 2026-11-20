import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ExternalLink,
  FileText,
  RotateCcw
} from 'lucide-react';

export const PDFViewerModal = ({ isOpen, onClose, fileUrl, title, onDownload }) => {
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen || !fileUrl) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`bg-white dark:bg-navy-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-navy-200 dark:border-navy-700 transition-all ${
            isFullScreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh]'
          }`}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-900 text-white border-b border-navy-800">
            <div className="flex items-center gap-2.5 truncate mr-4">
              <FileText className="w-5 h-5 text-gold-400 shrink-0" />
              <h3 className="text-sm font-semibold truncate text-white" title={title}>
                {title || 'Academic Document Preview'}
              </h3>
            </div>

            {/* Viewer Toolbar */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition"
                title="Zoom Out"
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1.5 text-navy-300 min-w-[45px] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition"
                title="Zoom In"
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-navy-700 mx-1"></div>

              <button
                onClick={toggleFullScreen}
                className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {onDownload && (
                <button
                  onClick={onDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-600 hover:bg-gold-500 text-white text-xs font-medium rounded-lg transition ml-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              )}

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-navy-300 hover:text-white hover:bg-navy-800 rounded-lg transition ml-1"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="p-1.5 text-navy-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition ml-2"
                title="Close Viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div className="flex-1 bg-navy-100 dark:bg-navy-950 overflow-auto p-2 sm:p-4 flex items-center justify-center relative">
            <div
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="w-full h-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden transition-transform duration-150"
            >
              <iframe
                src={`${fileUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0 min-h-[500px]"
                title={title || 'PDF Document'}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
