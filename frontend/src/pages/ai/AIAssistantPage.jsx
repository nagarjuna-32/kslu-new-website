import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  Copy,
  Check,
  ShieldAlert,
  BookOpen,
  FileText,
  RotateCcw,
  Layers,
  FileCheck2,
  Award
} from 'lucide-react';
import api from '../../api/client';

export const AIAssistantPage = () => {
  const [activeMode, setActiveMode] = useState('tutor'); // 'tutor', 'concept', 'practice', 'summarize'
  
  // 1. Tutor Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to the **KSLU Circle AI Study Assistant**!\n\nI am configured specifically for Karnataka State Law University (KSLU) syllabi and Indian jurisprudence. Select a mode above or ask any law question below.\n\n*DISCLAIMER: This tool is provided solely for academic exam preparation and does not constitute formal legal advice.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // 2. Concept Explainer State
  const [conceptQuery, setConceptQuery] = useState('');
  const [conceptSubject, setConceptSubject] = useState('Constitutional Law I');
  const [conceptResult, setConceptResult] = useState('');
  const [conceptLoading, setConceptLoading] = useState(false);

  // 3. Practice Questions State
  const [practiceSubject, setPracticeSubject] = useState('Law of Torts and Consumer Protection');
  const [practiceTopic, setPracticeTopic] = useState('Strict and Absolute Liability');
  const [practiceScheme, setPracticeScheme] = useState('80');
  const [practiceResult, setPracticeResult] = useState('');
  const [practiceLoading, setPracticeLoading] = useState(false);

  // 4. Summarizer State
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [summaryResult, setSummaryResult] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const promptPills = [
    { label: 'Explain Article 21 & Due Process', prompt: 'Explain the evolution of Article 21 from A.K. Gopalan to Maneka Gandhi and Puttaswamy privacy judgment.' },
    { label: 'Damnum Sine Injuria vs Injuria Sine Damno', prompt: 'Contrast Damnum Sine Injuria with Injuria Sine Damno using Ashby v. White and Gloucester Grammar School case.' },
    { label: 'Strict vs Absolute Liability', prompt: 'Explain the difference between Strict Liability in Rylands v. Fletcher and Absolute Liability in M.C. Mehta.' },
    { label: '16-Mark Model Answer Structure', prompt: 'What is the ideal blueprint for writing a 16-mark answer in KSLU Scheme 80 Marks examinations?' }
  ];

  const handleSend = async (userPrompt = null) => {
    const textToSend = userPrompt || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!userPrompt) setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/ask', {
        prompt: textToSend,
        subject: subject || 'General Law'
      });

      if (response.success && response.data?.answer) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.answer }]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your query. Please try again or refine your question.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!conceptQuery.trim()) return;
    setConceptLoading(true);
    setConceptResult('');
    try {
      const res = await api.post('/ai/explain', {
        concept: conceptQuery,
        subject: conceptSubject
      });
      if (res.success && res.data?.explanation) {
        setConceptResult(res.data.explanation);
      }
    } catch (err) {
      setConceptResult('Failed to generate concept explanation. Please try again.');
    } finally {
      setConceptLoading(false);
    }
  };

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setPracticeLoading(true);
    setPracticeResult('');
    try {
      const res = await api.post('/ai/practice-questions', {
        subject: practiceSubject,
        topic: practiceTopic,
        scheme: practiceScheme
      });
      if (res.success && res.data?.questions) {
        setPracticeResult(res.data.questions);
      }
    } catch (err) {
      setPracticeResult('Failed to generate practice questions.');
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleSummarizeDoc = async (e) => {
    e.preventDefault();
    if (!docText.trim() || docText.length < 50) return;
    setSummaryLoading(true);
    setSummaryResult('');
    try {
      const res = await api.post('/ai/summarize', {
        title: docTitle || 'Student Law Notes',
        text: docText
      });
      if (res.success && res.data?.summary) {
        setSummaryResult(res.data.summary);
      }
    } catch (err) {
      setSummaryResult('Failed to summarize document text.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gold-100 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400">
              <Bot className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Pedagogical Legal Assistant
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mt-1">
            AI Study Assistant for KSLU Students
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Indian jurisprudence doctrine explanations, answer structuring, model question generation, and note summaries.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 rounded-2xl p-1 text-xs shrink-0 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveMode('tutor')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeMode === 'tutor'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400'
            }`}
          >
            Legal Tutor
          </button>
          <button
            onClick={() => setActiveMode('concept')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeMode === 'concept'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400'
            }`}
          >
            Concept Explainer
          </button>
          <button
            onClick={() => setActiveMode('practice')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeMode === 'practice'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400'
            }`}
          >
            Exam Questions
          </button>
          <button
            onClick={() => setActiveMode('summarize')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              activeMode === 'summarize'
                ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-gold-400 shadow-sm'
                : 'text-navy-600 dark:text-navy-400'
            }`}
          >
            Notes Summarizer
          </button>
        </div>
      </div>

      {/* Educational Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="leading-relaxed">
          <strong>Strict Academic Disclaimer:</strong> This module is configured solely for student exam preparation and pedagogical analysis. It does not provide professional legal counsel or attorney-client advice. Always cross-verify citations in official law reports (SCC, AIR, SCR).
        </p>
      </div>

      {/* MODE 1: INTERACTIVE TUTOR CHAT */}
      {activeMode === 'tutor' && (
        <div className="space-y-4">
          {/* Preset Pills */}
          <div className="flex flex-wrap gap-2">
            {promptPills.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(pill.prompt)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 hover:border-gold-500 text-xs text-navy-700 dark:text-navy-300 hover:text-gold-600 transition"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Conversation Thread */}
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-sm p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[550px] overflow-y-auto">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div key={idx} className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gold-100 dark:bg-gold-950/80 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`relative group max-w-2xl p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-navy-100 rounded-tr-none'
                      : 'bg-navy-50 dark:bg-navy-800/50 text-navy-900 dark:text-navy-100 rounded-tl-none border border-navy-100 dark:border-navy-700'
                  }`}>
                    {m.content}
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(m.content, idx)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 transition bg-white/80 dark:bg-navy-800/80 rounded"
                        title="Copy Answer"
                      >
                        {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 text-xs justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-gold-100 dark:bg-gold-950/80 text-gold-600 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
                <div className="p-3 rounded-2xl bg-navy-50 dark:bg-navy-800/50 text-navy-500 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-200"></div>
                  <span className="text-[11px] ml-1">Analyzing statutory provisions & precedents...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-3 border border-navy-200 dark:border-navy-800 shadow-md flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask any law question, doctrine, or exam query..."
              className="flex-1 px-3 py-2 bg-transparent text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none text-xs"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white rounded-xl transition disabled:opacity-40 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: CONCEPT EXPLAINER */}
      {activeMode === 'concept' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              Legal Concept & Doctrine Explainer
            </h3>
            <p className="text-navy-500 mt-1">
              Provides definition, essential ingredients, landmark precedents, and 16-mark answer blueprint for any statutory concept.
            </p>
          </div>

          <form onSubmit={handleExplainConcept} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Legal Doctrine / Maxim / Section</label>
              <input
                type="text"
                required
                value={conceptQuery}
                onChange={(e) => setConceptQuery(e.target.value)}
                placeholder="e.g. Res Judicata, Promissory Estoppel, Mens Rea, Damnum Sine Injuria..."
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Subject Area</label>
              <input
                type="text"
                value={conceptSubject}
                onChange={(e) => setConceptSubject(e.target.value)}
                placeholder="e.g. Constitutional Law / CPC"
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={conceptLoading}
                className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                {conceptLoading ? 'Analyzing Doctrine...' : 'Explain Legal Concept'}
              </button>
            </div>
          </form>

          {conceptResult && (
            <div className="p-5 bg-navy-50 dark:bg-navy-800/40 rounded-2xl border border-navy-200/80 dark:border-navy-700/80 whitespace-pre-wrap leading-relaxed text-navy-800 dark:text-navy-200">
              {conceptResult}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: EXAM PRACTICE QUESTIONS */}
      {activeMode === 'practice' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              KSLU Exam Practice Question Generator
            </h3>
            <p className="text-navy-500 mt-1">
              Generates high-probability 16-mark essay questions and 8-mark problem questions according to KSLU Scheme 80 Marks and Scheme 100 Marks.
            </p>
          </div>

          <form onSubmit={handleGenerateQuestions} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={practiceSubject}
                onChange={(e) => setPracticeSubject(e.target.value)}
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Specific Topic / Unit</label>
              <input
                type="text"
                value={practiceTopic}
                onChange={(e) => setPracticeTopic(e.target.value)}
                placeholder="e.g. Strict Liability / Fundamental Rights"
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Examination Scheme</label>
              <select
                value={practiceScheme}
                onChange={(e) => setPracticeScheme(e.target.value)}
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              >
                <option value="80">Scheme 80 Marks (80:20)</option>
                <option value="100">Scheme 100 Marks</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={practiceLoading}
                className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                {practiceLoading ? 'Compiling Exam Questions...' : 'Generate 5 Practice Questions'}
              </button>
            </div>
          </form>

          {practiceResult && (
            <div className="p-5 bg-navy-50 dark:bg-navy-800/40 rounded-2xl border border-navy-200/80 dark:border-navy-700/80 whitespace-pre-wrap leading-relaxed text-navy-800 dark:text-navy-200">
              {practiceResult}
            </div>
          )}
        </div>
      )}

      {/* MODE 4: DOCUMENT & NOTES SUMMARIZER */}
      {activeMode === 'summarize' && (
        <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-8 border border-navy-200 dark:border-navy-800 shadow-sm space-y-6 text-xs">
          <div>
            <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-white">
              Law Notes & Judgment Summarizer
            </h3>
            <p className="text-navy-500 mt-1">
              Paste statutory sections, court judgments, or student lecture notes to extract propositions, precedents, and model exam bullet points.
            </p>
          </div>

          <form onSubmit={handleSummarizeDoc} className="space-y-4">
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Document / Topic Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Maneka Gandhi v. Union of India Case Brief"
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-navy-800 dark:text-navy-200 mb-1">Law Text / Lecture Extract (min. 50 characters) *</label>
              <textarea
                rows="6"
                required
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                placeholder="Paste case text, statutory sections, or study notes..."
                className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-xl"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={summaryLoading || docText.length < 50}
              className="px-6 py-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
            >
              {summaryLoading ? 'Synthesizing Legal Summary...' : 'Generate Executive Revision Summary'}
            </button>
          </form>

          {summaryResult && (
            <div className="p-5 bg-navy-50 dark:bg-navy-800/40 rounded-2xl border border-navy-200/80 dark:border-navy-700/80 whitespace-pre-wrap leading-relaxed text-navy-800 dark:text-navy-200">
              {summaryResult}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
