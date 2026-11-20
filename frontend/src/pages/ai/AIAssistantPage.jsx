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
  RotateCcw
} from 'lucide-react';
import api from '../../api/client';

export const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to the **KSLU Circle AI Study Assistant**!\n\nI am configured specifically for Karnataka State Law University syllabi and Indian jurisprudence. I can assist you with:\n* Explaining complex statutory doctrines and landmark case precedents.\n* Structuring high-scoring 16-mark essay answers and 8-mark problem answers for Scheme 80 and Scheme 100 Marks.\n* Generating model revision questions.\n\n*DISCLAIMER: This tool is provided solely for academic exam preparation and does not constitute formal legal advice.*`
    }
  ]);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const promptPills = [
    { label: 'Explain Article 21 & Due Process', prompt: 'Explain the evolution of Article 21 from A.K. Gopalan to Maneka Gandhi and Puttaswamy privacy judgment.' },
    { label: 'Damnum Sine Injuria vs Injuria Sine Damno', prompt: 'Contrast Damnum Sine Injuria with Injuria Sine Damno using Ashby v. White and Gloucester Grammar School case.' },
    { label: 'Strict vs Absolute Liability', prompt: 'Explain the difference between Strict Liability in Rylands v. Fletcher and Absolute Liability in M.C. Mehta.' },
    { label: '16-Mark Model Answer Structure', prompt: 'What is the ideal blueprint for writing a 16-mark answer in KSLU Scheme 80 Marks examinations?' },
    { label: 'Practice Questions: Law of Torts', prompt: 'Generate 5 high-probability examination questions for Law of Torts for KSLU examinations with case law pointers.' }
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

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gold-100 dark:bg-gold-950/60 text-gold-600 dark:text-gold-400">
              <Bot className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Pedagogical Legal Tutor
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900 dark:text-white mt-1">
            AI Study Assistant for KSLU Students
          </h1>
          <p className="text-xs text-navy-500 mt-1">
            Academic legal analysis, doctrine breakdowns, landmark case explanations, and answer framing.
          </p>
        </div>

        {/* Clear chat */}
        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content: 'Chat reset. How may I assist your law studies today?'
              }
            ])
          }
          className="p-2 text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-800 transition self-start sm:self-auto"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Educational Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <p className="leading-relaxed">
          <strong>Strict Academic Disclaimer:</strong> This AI module provides educational exam assistance. It does not provide legal counsel, attorney-client privilege, or professional legal advice. Always cross-verify citations in official law reports (SCC, AIR, SCR).
        </p>
      </div>

      {/* Suggested Topic Pills */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-navy-400">
          Suggested Academic Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {promptPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(pill.prompt)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-800 hover:border-gold-500 dark:hover:border-gold-400 text-xs text-navy-700 dark:text-navy-300 hover:text-gold-600 dark:hover:text-gold-400 shadow-sm transition"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl border border-navy-200 dark:border-navy-800 shadow-sm p-4 sm:p-6 space-y-4 min-h-[420px] max-h-[600px] overflow-y-auto">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gold-100 dark:bg-gold-950/80 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative group max-w-2xl p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-navy-900 text-white dark:bg-navy-800 dark:text-navy-100 rounded-tr-none'
                    : 'bg-navy-50 dark:bg-navy-800/50 text-navy-900 dark:text-navy-100 rounded-tl-none border border-navy-100 dark:border-navy-700'
                }`}
              >
                {m.content}

                {!isUser && (
                  <button
                    onClick={() => copyToClipboard(m.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 transition bg-white/80 dark:bg-navy-800/80 rounded"
                    title="Copy Answer"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-gold-100 dark:bg-gold-950/80 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-navy-50 dark:bg-navy-800/50 text-navy-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gold-500 rounded-full animate-bounce delay-200"></div>
              <span className="text-[11px] ml-1">Analyzing statutory provisions & precedents...</span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="bg-white dark:bg-navy-900 rounded-2xl p-3 border border-navy-200 dark:border-navy-800 shadow-md flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask any law question, doctrine, or past year exam query..."
          className="flex-1 px-3 py-2 bg-transparent text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none text-xs"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-navy-900 hover:bg-navy-800 text-gold-400 dark:bg-gold-600 dark:hover:bg-gold-500 dark:text-white rounded-xl transition disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
