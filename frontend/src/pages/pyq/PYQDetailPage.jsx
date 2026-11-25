import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Bookmark,
  Calendar,
  Layers,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2
} from 'lucide-react';
import api from '../../api/client';
import { CardSkeleton } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const PYQDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { setToast } = useNotification();

  const [pyq, setPyq] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchPYQ = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/pyqs/${id}`);
        if (response.success && response.data?.pyq) {
          setPyq(response.data.pyq);

          // Fetch related papers for same subject
          if (response.data.pyq.subjectId) {
            api.get(`/pyqs?subjectId=${response.data.pyq.subjectId}&limit=4`)
              .then(r => setRelated((r.data?.items || []).filter(item => item.id !== id)));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPYQ();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      setToast({ title: 'Sign In Required', message: 'Please sign in to bookmark question papers.', type: 'info' });
      return;
    }
    try {
      const res = await api.post(`/pyqs/${id}/bookmark`);
      if (res.success) {
        setPyq(prev => ({ ...prev, isBookmarked: res.data.isBookmarked }));
        setToast({ title: res.data.isBookmarked ? 'Bookmarked' : 'Bookmark Removed', message: res.message, type: 'info' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    window.open(`/api/pyqs/${id}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CardSkeleton />
      </div>
    );
  }

  if (!pyq) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-navy-900 dark:text-white">Question paper not found</h2>
        <Link to="/pyqs" className="px-4 py-2 bg-navy-900 text-gold-400 text-xs font-semibold rounded-xl inline-block">
          Return to PYQ Library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-navy-500">
        <Link to="/" className="hover:text-navy-900 dark:hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/pyqs" className="hover:text-navy-900 dark:hover:text-white">PYQ Library</Link>
        <span>/</span>
        <span className="text-navy-800 dark:text-navy-200 font-semibold truncate max-w-sm">{pyq.title}</span>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-gold-100 dark:bg-gold-950/80 text-gold-800 dark:text-gold-300 border border-gold-300 dark:border-gold-800">
                {pyq.scheme?.name || 'Scheme 80 Marks'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-800 dark:text-navy-200">
                {pyq.examType}
              </span>
              <span className="text-xs font-semibold text-navy-500">
                {pyq.examMonth} {pyq.examYear}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white">
              {pyq.title}
            </h1>

            <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400">
              {pyq.course?.name} • {pyq.semester?.title} • Subject: <strong className="text-navy-800 dark:text-navy-200">{pyq.subject?.name} (Code: {pyq.subject?.code})</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                pyq.isBookmarked
                  ? 'border-gold-500 text-gold-600 bg-gold-50 dark:bg-gold-950/40'
                  : 'border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-50 dark:hover:bg-navy-800'
              }`}
            >
              <Bookmark className="w-4 h-4" fill={pyq.isBookmarked ? 'currentColor' : 'none'} />
              <span>{pyq.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Paper Metadata Stats */}
        <div className="pt-4 border-t border-navy-100 dark:border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-navy-500">
          <div>
            <span className="block text-navy-400">Total Downloads</span>
            <span className="text-navy-800 dark:text-navy-200 font-bold">{pyq.downloadCount}</span>
          </div>
          <div>
            <span className="block text-navy-400">Total Views</span>
            <span className="text-navy-800 dark:text-navy-200 font-bold">{pyq.viewCount}</span>
          </div>
          <div>
            <span className="block text-navy-400">Passing Requirement</span>
            <span className="text-navy-800 dark:text-navy-200 font-bold">{pyq.scheme?.passingMarks || 32} / {pyq.scheme?.maxMarks || 80} Marks</span>
          </div>
          <div>
            <span className="block text-navy-400">Verification</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified KSLU Paper</span>
            </span>
          </div>
        </div>
      </div>

      {/* In-Browser PDF Document Viewer */}
      <div className={`bg-white dark:bg-navy-900 rounded-3xl border border-navy-200 dark:border-navy-800 overflow-hidden shadow-lg flex flex-col ${
        isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[750px]'
      }`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-navy-900 text-white text-xs">
          <div className="flex items-center gap-2 truncate mr-4">
            <FileText className="w-4 h-4 text-gold-400 shrink-0" />
            <span className="font-semibold truncate">{pyq.title}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setZoom(prev => Math.max(prev - 25, 50))}
              className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-navy-300 min-w-[40px] text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(prev + 25, 200))}
              className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 hover:bg-navy-800 rounded-lg text-navy-300 hover:text-white ml-2"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="flex-1 bg-navy-100 dark:bg-navy-950 overflow-auto p-4 flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="w-full h-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden transition-transform duration-150"
          >
            <iframe
              src={`${pyq.driveFileId ? `/api/pyqs/${pyq.id}/stream` : pyq.fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full border-0 min-h-[600px]"
              title={pyq.title}
            />
          </div>
        </div>
      </div>

      {/* Related Question Papers */}
      {related.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
            More Question Papers for {pyq.subject?.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to={`/pyqs/${rel.id}`}
                className="p-4 bg-white dark:bg-navy-900 rounded-2xl border border-navy-200 dark:border-navy-800 shadow-sm hover:border-gold-500 transition space-y-2 block"
              >
                <div className="flex items-center justify-between text-navy-400">
                  <span>{rel.scheme?.name}</span>
                  <span>{rel.examMonth} {rel.examYear}</span>
                </div>
                <h4 className="font-bold text-navy-900 dark:text-white line-clamp-1">{rel.title}</h4>
                <span className="text-[11px] text-gold-600 dark:text-gold-400 font-semibold block">
                  View Paper &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
