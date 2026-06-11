import { useState, useEffect } from 'react';
import { Beaker, Trash2, ChevronDown, ChevronUp, FileText, Database, ShieldAlert, CheckCircle2, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Source {
  name?: string;
  file_name?: string;
  page?: number;
  page_number?: number;
  type?: string;
  snippet?: string;
  [key: string]: any;
}

interface EvalCase {
  id: string;
  createdAt: string;
  updatedAt?: string;

  question: string;
  expectedAnswer: string;
  category?: string;
  tags?: string[];
  notes?: string;

  currentBackendUrl: string;
  currentAnswerText?: string;
  currentSources?: Source[];
  currentRawJson?: any;
  currentCapturedAt?: string;

  afterBackendUrl?: string;
  afterAnswerText?: string;
  afterSources?: Source[];
  afterRawJson?: any;
  afterCapturedAt?: string;

  v1Vote?: 'up' | 'down' | null;
  v2Vote?: 'up' | 'down' | null;
  v1Comment?: string;
  v2Comment?: string;
  isReviewed?: boolean;
}

export function TestLab() {
  const [cases, setCases] = useState<EvalCase[]>([]);
  const [currentCase, setCurrentCase] = useState<Partial<EvalCase>>({
    question: '',
    expectedAnswer: '',
    currentBackendUrl: import.meta.env.VITE_EVAL_BACKEND_URL || 'https://airmanual.onrender.com',
    afterBackendUrl: '',
    category: '',
    notes: ''
  });
  
  useEffect(() => {
    const saved = localStorage.getItem('symptom-pattern-eval-cases');
    if (saved) {
      try {
        setCases(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved cases', e);
      }
    }
  }, []);

  const saveToLocalStorage = (updatedCases: EvalCase[]) => {
    setCases(updatedCases);
    localStorage.setItem('symptom-pattern-eval-cases', JSON.stringify(updatedCases));
  };

  const updateCaseInList = (updatedCase: Partial<EvalCase>) => {
    if (!updatedCase.id) return;
    const existingIndex = cases.findIndex(c => c.id === updatedCase.id);
    if (existingIndex >= 0) {
      const updatedCases = [...cases];
      updatedCases[existingIndex] = updatedCase as EvalCase;
      saveToLocalStorage(updatedCases);
    }
  };

  const toggleVote = (version: 'v1' | 'v2', type: 'up' | 'down') => {
    setCurrentCase(prev => {
      let newV1 = prev.v1Vote;
      let newV2 = prev.v2Vote;

      if (version === 'v1') {
        if (type === 'up') {
          newV1 = newV1 === 'up' ? null : 'up';
          if (newV1 === 'up' && newV2 === 'up') newV2 = null;
        } else {
          newV1 = newV1 === 'down' ? null : 'down';
        }
      } else {
        if (type === 'up') {
          newV2 = newV2 === 'up' ? null : 'up';
          if (newV2 === 'up' && newV1 === 'up') newV1 = null;
        } else {
          newV2 = newV2 === 'down' ? null : 'down';
        }
      }

      const updated = { ...prev, v1Vote: newV1, v2Vote: newV2 };
      updateCaseInList(updated);
      return updated;
    });
  };

  const handleCommentChange = (version: 'v1' | 'v2', text: string) => {
    setCurrentCase(prev => {
      const updated = { ...prev, [version === 'v1' ? 'v1Comment' : 'v2Comment']: text };
      updateCaseInList(updated);
      return updated;
    });
  };

  const loadCase = (c: EvalCase) => {
    setCurrentCase(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this saved evaluation case?')) {
      saveToLocalStorage(cases.filter(c => c.id !== id));
      if (currentCase.id === id) {
        setCurrentCase({
          question: '',
          expectedAnswer: '',
          currentBackendUrl: import.meta.env.VITE_EVAL_BACKEND_URL || 'https://airmanual.onrender.com',
          afterBackendUrl: '',
          category: '',
          notes: ''
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-borderMain pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ShieldAlert className="w-8 h-8 mr-3 text-primary" />
              AeroMind Test Lab
            </h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              Internal Tooling
            </span>
          </div>
          <p className="text-textMuted mt-2">
            Compare expected answers between Version 1 and Version 2, and provide feedback.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface border border-borderMain rounded-lg p-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <h2 className="text-sm font-bold text-textMuted uppercase tracking-wider mb-2">Question / Target Case</h2>
            <p className="text-xl font-semibold text-white leading-relaxed">
              {currentCase.question || <span className="text-textMuted italic">No question selected. Select a case below or import JSON.</span>}
            </p>
            {currentCase.category && (
              <span className="inline-block mt-3 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-md text-xs font-semibold">
                {currentCase.category}
              </span>
            )}
          </div>
          
          <div className="flex gap-2 self-start mt-2 md:mt-0">
            {/* Mark as Reviewed Toggle */}
            {currentCase.id && (
              <button 
                onClick={() => {
                  const updated = { ...currentCase, isReviewed: !currentCase.isReviewed };
                  setCurrentCase(updated);
                  updateCaseInList(updated);
                }}
                className={`px-4 py-2 rounded-md transition-all flex items-center font-bold text-sm ${currentCase.isReviewed ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-surfaceHover text-textMuted hover:text-white border border-borderMain'}`}
              >
                <CheckCircle2 className={`w-5 h-5 mr-2 ${currentCase.isReviewed ? 'text-white' : 'text-textMuted'}`} />
                {currentCase.isReviewed ? 'Reviewed' : 'Mark Reviewed'}
              </button>
            )}
          </div>
        </div>

        {/* Expected Behavior */}
        <div className="mb-6 bg-emerald-500/5 border border-emerald-500/20 rounded-md p-4">
           <div className="flex items-center mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Expected Answer</h2>
          </div>
          <p className="text-sm text-textMain leading-relaxed">
            {currentCase.expectedAnswer || <span className="text-emerald-400/50 italic">No expected answer defined.</span>}
          </p>
        </div>

        {/* 2-Column Split: Version 1 vs Version 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: Version 1 */}
          <div className="bg-background border border-indigo-500/30 rounded-md flex flex-col h-full overflow-hidden">
            <div className="bg-indigo-500/10 p-3 border-b border-indigo-500/20 flex justify-between items-center">
              <div className="flex items-center">
                <Database className="w-4 h-4 text-indigo-400 mr-2" />
                <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Version 1</h2>
              </div>
              <div className="flex items-center gap-2">
                {currentCase.currentCapturedAt && <span className="text-[10px] text-indigo-300 opacity-60 mr-2">Captured</span>}
                <button 
                  onClick={() => toggleVote('v1', 'up')}
                  className={`p-1 rounded transition-colors ${currentCase.v1Vote === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-surface text-textMuted'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleVote('v1', 'down')}
                  className={`p-1 rounded transition-colors ${currentCase.v1Vote === 'down' ? 'bg-red-500/20 text-red-400' : 'hover:bg-surface text-textMuted'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="prose prose-invert prose-sm max-w-none text-textMain bg-surface/50 p-4 rounded-md border border-borderMain">
                {currentCase.currentAnswerText && currentCase.currentAnswerText !== 'No text extracted' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentCase.currentAnswerText}
                  </ReactMarkdown>
                ) : (
                  <span className="text-textMuted italic">No Version 1 baseline captured yet.</span>
                )}
              </div>

              {currentCase.currentSources && currentCase.currentSources.length > 0 && (
                <div className="border border-borderMain rounded bg-surface/50 p-3">
                  <h3 className="text-[10px] font-bold text-textMuted uppercase mb-2">Sources ({currentCase.currentSources.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentCase.currentSources.map((s, i) => (
                      <span key={i} className="inline-flex items-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] px-2 py-1 rounded">
                        {s.file_name || s.name || s.title || 'Unknown Source'}
                        {(s.page_number || s.page) ? ` (p.${s.page_number || s.page})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Version 1 Comments */}
              <div className="mt-auto">
                <div className="flex items-center text-xs text-textMuted mb-2 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> Comments on Version 1
                </div>
                <textarea
                  value={currentCase.v1Comment || ''}
                  onChange={e => handleCommentChange('v1', e.target.value)}
                  placeholder="Why is this good or bad?"
                  className="w-full bg-surface border border-borderMain rounded p-2 text-sm text-textMain focus:outline-none focus:border-indigo-500 resize-y min-h-[60px]"
                />
              </div>

              {currentCase.currentRawJson && <JsonViewer data={currentCase.currentRawJson} label="Raw JSON" />}
            </div>
          </div>

          {/* Column 2: Version 2 */}
          <div className="bg-background border border-amber-500/30 rounded-md flex flex-col h-full overflow-hidden">
            <div className="bg-amber-500/10 p-3 border-b border-amber-500/20 flex justify-between items-center">
              <div className="flex items-center">
                <Beaker className="w-4 h-4 text-amber-400 mr-2" />
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wide">Version 2</h2>
              </div>
              <div className="flex items-center gap-2">
                {currentCase.afterCapturedAt && <span className="text-[10px] text-amber-300 opacity-60 mr-2">Captured</span>}
                <button 
                  onClick={() => toggleVote('v2', 'up')}
                  className={`p-1 rounded transition-colors ${currentCase.v2Vote === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-surface text-textMuted'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleVote('v2', 'down')}
                  className={`p-1 rounded transition-colors ${currentCase.v2Vote === 'down' ? 'bg-red-500/20 text-red-400' : 'hover:bg-surface text-textMuted'}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="prose prose-invert prose-sm max-w-none text-textMain bg-surface/50 p-4 rounded-md border border-borderMain border-dashed min-h-[100px]">
                 {currentCase.afterAnswerText && currentCase.afterAnswerText !== 'No text extracted' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentCase.afterAnswerText}
                  </ReactMarkdown>
                ) : (
                  <span className="text-textMuted italic">No Version 2 data captured yet.</span>
                )}
              </div>

              {currentCase.afterSources && currentCase.afterSources.length > 0 && (
                <div className="border border-borderMain rounded bg-surface/50 p-3">
                  <h3 className="text-[10px] font-bold text-textMuted uppercase mb-2">Sources ({currentCase.afterSources.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentCase.afterSources.map((s, i) => (
                      <span key={i} className="inline-flex items-center bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] px-2 py-1 rounded">
                        {s.file_name || s.name || s.title || 'Unknown Source'}
                        {(s.page_number || s.page) ? ` (p.${s.page_number || s.page})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Version 2 Comments */}
              <div className="mt-auto">
                <div className="flex items-center text-xs text-textMuted mb-2 font-medium">
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> Comments on Version 2
                </div>
                <textarea
                  value={currentCase.v2Comment || ''}
                  onChange={e => handleCommentChange('v2', e.target.value)}
                  placeholder="Why is this good or bad?"
                  className="w-full bg-surface border border-borderMain rounded p-2 text-sm text-textMain focus:outline-none focus:border-amber-500 resize-y min-h-[60px]"
                />
              </div>

              {currentCase.afterRawJson && <JsonViewer data={currentCase.afterRawJson} label="Raw JSON" />}
            </div>
          </div>

        </div>
      </div>

      {/* Saved Cases List */}
      {cases.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-textMuted" />
            Evaluation Cases ({cases.length})
            <span className="ml-4 text-xs font-normal text-textMuted">
              {cases.filter(c => c.isReviewed).length} / {cases.length} Reviewed
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cases.map(c => (
              <div 
                key={c.id} 
                onClick={() => loadCase(c)}
                className={`bg-surface border rounded-lg p-4 cursor-pointer transition-colors relative group ${c.id === currentCase.id ? 'border-primary ring-1 ring-primary/50 bg-surfaceHover' : 'border-borderMain hover:bg-surfaceHover'} ${c.isReviewed ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded truncate max-w-[80%]">
                    {c.category?.replace(/_/g, ' ') || 'Uncategorized'}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.isReviewed && <span title="Reviewed"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></span>}
                    <button 
                      onClick={(e) => deleteCase(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-textMuted hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-white font-medium line-clamp-3 mb-3 leading-snug">{c.question}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {c.currentAnswerText && c.currentAnswerText !== 'No text extracted' && (
                      <span className="text-[10px] text-indigo-300 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1" />
                        V1
                      </span>
                    )}
                    {c.afterAnswerText && c.afterAnswerText !== 'No text extracted' && (
                      <span className="text-[10px] text-amber-300 flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
                        V2
                      </span>
                    )}
                  </div>
                  
                  {/* Show summary of votes/comments if present */}
                  {(c.v1Vote || c.v2Vote || c.v1Comment || c.v2Comment) && (
                    <div className="flex items-center gap-3 pt-2 border-t border-borderMain/50">
                      {(c.v1Vote === 'up' || c.v2Vote === 'up') && <ThumbsUp className="w-3 h-3 text-emerald-400" />}
                      {(c.v1Vote === 'down' || c.v2Vote === 'down') && <ThumbsDown className="w-3 h-3 text-red-400" />}
                      {(c.v1Comment || c.v2Comment) && <MessageSquare className="w-3 h-3 text-textMuted" />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JsonViewer({ data, label }: { data: any, label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-borderMain rounded overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surfaceHover px-3 py-2 flex justify-between items-center text-[10px] font-bold tracking-wide text-textMuted hover:text-white transition-colors"
      >
        <span>{label}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && (
        <pre className="p-3 bg-background text-[10px] text-textMain overflow-x-auto custom-scrollbar max-h-[300px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
