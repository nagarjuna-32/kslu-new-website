import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FolderTree,
  FileText,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Ban
} from 'lucide-react';
import api from '../../api/client';
import { useNotification } from '../../contexts/NotificationContext';
import { CardSkeleton } from '../../components/common/SkeletonLoader';

export const DriveSyncPage = () => {
  const { setToast } = useNotification();
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'sync'
  const [statusLoading, setStatusLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);

  // Dry run scan state
  const [scanning, setScanning] = useState(false);
  const [scanReport, setScanReport] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // Sync execution state
  const [triggering, setTriggering] = useState(false);
  const pollIntervalRef = useRef(null);

  // Fetch status
  const fetchStatus = async () => {
    try {
      const res = await api.get('/pyqs/sync/status');
      if (res.success && res.data) {
        setSyncStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch sync status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll while running
  useEffect(() => {
    if (syncStatus?.isRunning) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(async () => {
          try {
            const res = await api.get('/pyqs/sync/status');
            if (res.success && res.data) {
              setSyncStatus(res.data);
              if (!res.data.isRunning) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
                setToast({
                  title: 'Sync Complete',
                  message: 'Google Drive synchronization completed!',
                  type: 'success'
                });
              }
            }
          } catch (e) {
            console.error('Polling error:', e);
          }
        }, 3000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  }, [syncStatus?.isRunning]);

  // Handle dry-run scan
  const handleRunScan = async () => {
    setScanning(true);
    setScanReport(null);
    try {
      const res = await api.get('/pyqs/sync/scan-report');
      if (res.success && res.data) {
        setScanReport(res.data);
        setToast({
          title: 'Scan Successful',
          message: `Discovered ${res.data.summary.totalPdfFiles} PDFs across ${res.data.summary.totalCourseFolders} course folders.`,
          type: 'success'
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Scan failed.';
      setToast({
        title: 'Scan Failed',
        message: msg,
        type: 'error'
      });
    } finally {
      setScanning(false);
    }
  };

  // Handle production sync
  const handleTriggerSync = async () => {
    if (syncStatus?.isRunning || triggering) return;
    if (!window.confirm('Are you sure you want to run Google Drive synchronization? Database question paper records will be created or updated.')) {
      return;
    }

    setTriggering(true);
    try {
      const res = await api.post('/pyqs/sync/full');
      if (res.success) {
        setToast({
          title: 'Sync Started',
          message: 'Google Drive PYQ synchronization started in background.',
          type: 'info'
        });
        await fetchStatus();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to trigger sync.';
      setToast({
        title: 'Sync Failed',
        message: msg,
        type: 'error'
      });
    } finally {
      setTriggering(false);
    }
  };

  // Handle cancel
  const handleCancelSync = async () => {
    try {
      const res = await api.post('/pyqs/sync/cancel');
      if (res.success) {
        setToast({
          title: 'Cancel Requested',
          message: 'Signal sent to cancel active sync job.',
          type: 'warning'
        });
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCourse = (id) => {
    setExpandedCourses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSemester = (id) => {
    setExpandedSemesters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (statusLoading) {
    return <CardSkeleton />;
  }

  const isConfigured = syncStatus?.isConfigured;
  const isRunning = Boolean(syncStatus?.isRunning || triggering);
  const latestLog = syncStatus?.latestLog;
  const stats = syncStatus?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-gold-500/10 text-gold-600 dark:text-gold-400 rounded-xl">
              <Cloud className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white">
              Google Drive PYQ Integration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-400">
            Automated crawler for Previous Year Question Papers (PYQs). Google Drive serves as the source of truth for PDF papers.
          </p>
        </div>

        {/* Configuration Pill */}
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Google Drive Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Credentials Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning if not configured */}
      {!isConfigured && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Google Drive API credentials or Root Folder ID missing</span>
          </div>
          <p>
            Please set <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">GOOGLE_DRIVE_PYQ_ROOT_FOLDER_ID</code> and service account credentials (<code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">GOOGLE_SERVICE_ACCOUNT_JSON_BASE64</code> or <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">GOOGLE_SERVICE_ACCOUNT_KEY_PATH</code>) in your backend environment.
          </p>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm">
          <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">Total Available PYQs</span>
          <p className="text-2xl font-bold font-serif text-navy-900 dark:text-white mt-1">
            {stats.availablePYQs ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm">
          <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">Drive-Synced Papers</span>
          <p className="text-2xl font-bold font-serif text-gold-600 dark:text-gold-400 mt-1">
            {stats.driveSyncedPYQs ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm">
          <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">Supported Courses</span>
          <p className="text-2xl font-bold font-serif text-navy-900 dark:text-white mt-1">
            {stats.totalCourses ?? 5}
          </p>
        </div>
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-4 border border-navy-200 dark:border-navy-800 shadow-sm">
          <span className="text-[11px] font-semibold text-navy-500 uppercase tracking-wider">Academic Subjects</span>
          <p className="text-2xl font-bold font-serif text-navy-900 dark:text-white mt-1">
            {stats.totalSubjects ?? 205}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-200 dark:border-navy-800">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'scan'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Read-Only Scan Report (Dry Run)</span>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
            activeTab === 'sync'
              ? 'border-gold-500 text-gold-600 dark:text-gold-400'
              : 'border-transparent text-navy-600 dark:text-navy-400 hover:text-navy-900 dark:hover:text-white'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>Production Synchronization</span>
        </button>
      </div>

      {/* TAB 1: READ-ONLY SCAN REPORT */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm text-navy-900 dark:text-white">
                  Google Drive Pre-Synchronization Scan
                </h3>
                <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                  Inspect all folders, subjects, and PDFs from Google Drive without modifying the database.
                </p>
              </div>

              <button
                onClick={handleRunScan}
                disabled={scanning || !isConfigured}
                className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-navy-300 dark:bg-gold-500 dark:hover:bg-gold-400 dark:disabled:bg-navy-800 text-white dark:text-navy-950 rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                <span>{scanning ? 'Scanning Google Drive...' : 'Run Read-Only Scan'}</span>
              </button>
            </div>

            {/* Scan Report Summary */}
            {scanReport && (
              <div className="space-y-4 pt-4 border-t border-navy-100 dark:border-navy-800">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-navy-50 dark:bg-navy-800/50 rounded-xl">
                    <span className="text-[10px] text-navy-500 uppercase font-semibold">Course Folders</span>
                    <p className="text-lg font-bold text-navy-900 dark:text-white">{scanReport.summary.totalCourseFolders}</p>
                  </div>
                  <div className="p-3 bg-navy-50 dark:bg-navy-800/50 rounded-xl">
                    <span className="text-[10px] text-navy-500 uppercase font-semibold">Subject Folders</span>
                    <p className="text-lg font-bold text-navy-900 dark:text-white">{scanReport.summary.totalSubjectFolders}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">Matched PDFs</span>
                    <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{scanReport.summary.matchedPdfs}</p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold">Unmatched/Warnings</span>
                    <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{scanReport.summary.warningsCount}</p>
                  </div>
                </div>

                {/* Warnings list if any */}
                {scanReport.warnings?.length > 0 && (
                  <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-2 text-xs">
                    <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Attention required for {scanReport.warnings.length} items:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-amber-900 dark:text-amber-200 text-[11px] max-h-40 overflow-y-auto">
                      {scanReport.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Detected Course & Subject Tree */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase text-navy-500 tracking-wider">
                    Discovered Directory Hierarchy
                  </h4>

                  <div className="space-y-2">
                    {scanReport.coursesTree?.map((course) => (
                      <div
                        key={course.folderId}
                        className="border border-navy-200 dark:border-navy-800 rounded-xl overflow-hidden text-xs"
                      >
                        {/* Course Header */}
                        <button
                          onClick={() => toggleCourse(course.folderId)}
                          className="w-full flex items-center justify-between p-3 bg-navy-50 dark:bg-navy-800/60 hover:bg-navy-100 dark:hover:bg-navy-800 transition text-left"
                        >
                          <div className="flex items-center gap-2">
                            {expandedCourses[course.folderId] ? (
                              <ChevronDown className="w-4 h-4 text-navy-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-navy-400" />
                            )}
                            <span className="font-bold text-navy-900 dark:text-white">
                              {course.parsedName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-navy-200 dark:bg-navy-700 rounded-full text-navy-700 dark:text-navy-300">
                              {course.courseCode}
                            </span>
                          </div>
                          <span className="text-[11px] text-navy-500">
                            {course.semesters?.length || 0} semesters
                          </span>
                        </button>

                        {/* Semesters */}
                        {expandedCourses[course.folderId] && (
                          <div className="p-3 space-y-2 bg-white dark:bg-navy-900">
                            {course.semesters?.map((sem) => (
                              <div
                                key={sem.folderId}
                                className="border border-navy-100 dark:border-navy-800/60 rounded-lg p-2.5 space-y-2"
                              >
                                <button
                                  onClick={() => toggleSemester(sem.folderId)}
                                  className="w-full flex items-center justify-between text-left font-semibold text-navy-800 dark:text-navy-200"
                                >
                                  <div className="flex items-center gap-1.5">
                                    {expandedSemesters[sem.folderId] ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-navy-400" />
                                    )}
                                    <span>Semester {sem.semesterNumber}</span>
                                  </div>
                                  <span className="text-[11px] text-navy-500 font-normal">
                                    {sem.subjects?.length || 0} subjects
                                  </span>
                                </button>

                                {expandedSemesters[sem.folderId] && (
                                  <div className="pl-4 space-y-2 pt-2 border-t border-navy-100 dark:border-navy-800 text-[11px]">
                                    {sem.subjects?.map((sub) => (
                                      <div
                                        key={sub.folderId}
                                        className="p-2 bg-navy-50/50 dark:bg-navy-800/40 rounded-lg space-y-1.5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="font-semibold text-navy-900 dark:text-white">
                                              {sub.parsedName}
                                            </span>
                                            {sub.dbSubjectCode && (
                                              <span className="px-1.5 py-0.2 bg-gold-100 dark:bg-gold-950 text-gold-700 dark:text-gold-300 rounded font-mono text-[10px]">
                                                {sub.dbSubjectCode}
                                              </span>
                                            )}
                                          </div>
                                          {sub.isDbMatched ? (
                                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] flex items-center gap-1">
                                              <CheckCircle2 className="w-3 h-3" /> Matched
                                            </span>
                                          ) : (
                                            <span className="text-amber-600 dark:text-amber-400 text-[10px] flex items-center gap-1">
                                              <AlertTriangle className="w-3 h-3" /> Unmatched
                                            </span>
                                          )}
                                        </div>

                                        {/* Schemes & PDF count */}
                                        <div className="pl-2 space-y-1 text-navy-600 dark:text-navy-400">
                                          {sub.schemes?.map((sch) => (
                                            <div key={sch.folderId} className="flex items-center justify-between py-0.5">
                                              <span>{sch.folderName}</span>
                                              <span className="font-semibold text-navy-800 dark:text-navy-200">
                                                {sch.files?.length || 0} PDFs
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION SYNCHRONIZATION */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-navy-200 dark:border-navy-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-sm text-navy-900 dark:text-white">
                  Run Question Paper Synchronization
                </h3>
                <p className="text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                  Synchronizes all question papers from Google Drive into the database. Records are deduplicated by Google Drive file ID.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isRunning && (
                  <button
                    onClick={handleCancelSync}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel Sync</span>
                  </button>
                )}

                <button
                  onClick={handleTriggerSync}
                  disabled={isRunning || !isConfigured}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-navy-300 dark:bg-gold-500 dark:hover:bg-gold-400 dark:disabled:bg-navy-800 text-white dark:text-navy-950 rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Synchronizing...' : 'Trigger Full Sync'}</span>
                </button>
              </div>
            </div>

            {/* Latest execution status card */}
            {latestLog && (
              <div className="p-4 bg-navy-50 dark:bg-navy-800/40 rounded-xl border border-navy-200 dark:border-navy-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy-900 dark:text-white">
                      Latest Sync Status:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                        latestLog.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : latestLog.status === 'running'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {latestLog.status}
                    </span>
                  </div>

                  <span className="text-navy-500">
                    {new Date(latestLog.startedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                  <div>
                    <span className="text-navy-500">Files Discovered:</span>
                    <p className="font-bold text-navy-900 dark:text-white">{latestLog.filesFound}</p>
                  </div>
                  <div>
                    <span className="text-navy-500">Files Imported:</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{latestLog.filesImported}</p>
                  </div>
                  <div>
                    <span className="text-navy-500">Files Updated:</span>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{latestLog.filesUpdated}</p>
                  </div>
                  <div>
                    <span className="text-navy-500">Errors Count:</span>
                    <p className="font-bold text-rose-600 dark:text-rose-400">{latestLog.errorsCount}</p>
                  </div>
                </div>

                {latestLog.errorDetails && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg text-rose-800 dark:text-rose-300 text-[11px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {latestLog.errorDetails}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
