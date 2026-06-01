import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import type { QuestionEntry } from '../types';
import { ThumbsUp, ThumbsDown, MessageSquare, Plus, Download, Upload, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CopyButton } from '../components/CopyButton';
import type { GlobalSettings } from '../types';

export function QuestionsManager() {
  const { questions, categories, globalSettings, addQuestion, updateQuestion, deleteQuestion, importExcelData, toggleReaction, addComment } = useAppContext();
  
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [newQuestionData, setNewQuestionData] = useState({
    question: '',
    expectedAnswer: '',
    keyPoints: '',
    expectedResources: '',
    categoryId: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOrUpdateQuestion = () => {
    if (!newQuestionData.question.trim()) return;
    
    if (editingQuestionId) {
      const existingQ = questions.find(q => q.id === editingQuestionId);
      if (existingQ) {
        updateQuestion({
          ...existingQ,
          ...newQuestionData
        });
      }
    } else {
      const newQ: QuestionEntry = {
        id: `q-${Date.now()}`,
        ...newQuestionData,
        likes: 0,
        dislikes: 0,
        comments: []
      };
      addQuestion(newQ);
    }
    
    setNewQuestionData({
      question: '',
      expectedAnswer: '',
      keyPoints: '',
      expectedResources: '',
      categoryId: ''
    });
    setEditingQuestionId(null);
    setIsNewQuestionModalOpen(false);
  };

  const handleEditClick = (q: QuestionEntry) => {
    setNewQuestionData({
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      keyPoints: q.keyPoints,
      expectedResources: q.expectedResources,
      categoryId: q.categoryId
    });
    setEditingQuestionId(q.id);
    setIsNewQuestionModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setQuestionToDelete(id);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion(questionToDelete);
      setQuestionToDelete(null);
    }
  };

  // Excel logic
  const handleExportExcel = () => {
    // Questions Sheet
    const qsData = questions.map(q => ({
      id: q.id,
      question: q.question,
      response: q.expectedAnswer,
      'key point of the answer': q.keyPoints,
      'expected resources': q.expectedResources,
      categoryId: q.categoryId,
      likes: q.likes,
      dislikes: q.dislikes,
      comments: JSON.stringify(q.comments.map(c => c.text))
    }));
    const qsSheet = XLSX.utils.json_to_sheet(qsData);

    // Categories Sheet
    const globalRow = {
      id: 'global',
      name: 'Global Settings (Category 0)',
      'specific rules': globalSettings.generalRules,
      redlines: globalSettings.redlines,
      'expected schema': globalSettings.expectedSchema
    };

    const catData = [
      globalRow,
      ...categories.map(c => ({
        id: c.id,
        name: c.name,
        'specific rules': c.specificRules,
        redlines: c.redlines,
        'expected schema': c.expectedSchema
      }))
    ];
    const catSheet = XLSX.utils.json_to_sheet(catData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, qsSheet, "Questions");
    XLSX.utils.book_append_sheet(wb, catSheet, "Categories");

    XLSX.writeFile(wb, "AeroMind_Data.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      // Parse Categories and Global Settings
      let importedCategories: any[] = [];
      let importedGlobalSettings: GlobalSettings | undefined;

      if (wb.SheetNames.includes('Categories')) {
        const catSheet = wb.Sheets['Categories'];
        const rawCats = XLSX.utils.sheet_to_json<any>(catSheet);
        
        rawCats.forEach(row => {
          if (row.id === 'global') {
            importedGlobalSettings = {
              generalRules: row['specific rules'] || '',
              redlines: row.redlines || '',
              expectedSchema: row['expected schema'] || ''
            };
          } else {
            importedCategories.push({
              id: row.id || `cat-${Date.now()}-${Math.random()}`,
              name: row.name || 'Unnamed Category',
              specificRules: row['specific rules'] || '',
              redlines: row.redlines || '',
              expectedSchema: row['expected schema'] || ''
            });
          }
        });
      }

      // Parse Questions
      let importedQuestions: any[] = [];
      if (wb.SheetNames.includes('Questions')) {
        const qsSheet = wb.Sheets['Questions'];
        const rawQs = XLSX.utils.sheet_to_json<any>(qsSheet);
        importedQuestions = rawQs.map(row => ({
          id: row.id || `q-${Date.now()}-${Math.random()}`,
          question: row.question || '',
          expectedAnswer: row.response || '',
          keyPoints: row['key point of the answer'] || '',
          expectedResources: row['expected resources'] || '',
          categoryId: row.categoryId || '',
          likes: parseInt(row.likes) || 0,
          dislikes: parseInt(row.dislikes) || 0,
          userReaction: undefined,
          comments: []
        }));
      }

      importExcelData(importedCategories, importedQuestions, importedGlobalSettings);
    };
    reader.readAsBinaryString(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-end border-b border-borderMain pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Questions Manager</h1>
          <p className="text-textMuted text-sm">Create, tag, and export questions with their expected resolutions.</p>
        </div>
        <div className="flex gap-3">
          {import.meta.env.DEV && (
            <>
              <input 
                type="file" 
                accept=".xlsx" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="border border-borderMain hover:bg-surfaceHover text-textMain px-4 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </button>
            </>
          )}
          <button 
            onClick={handleExportExcel}
            className="border border-borderMain hover:bg-surfaceHover text-textMain px-4 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Quick Add Question (Replaced by Modal button below, but keeping header clean) */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => {
            setEditingQuestionId(null);
            setNewQuestionData({ question: '', expectedAnswer: '', keyPoints: '', expectedResources: '', categoryId: '' });
            setIsNewQuestionModalOpen(true);
          }}
          className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Question
        </button>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-10">
        {questions.map(q => {
          const cat = categories.find(c => c.id === q.categoryId) || categories.find(c => c.name === q.categoryId);
          return (
            <div key={q.id} className="bg-surface border border-borderMain rounded-lg p-5 hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start flex-1 pr-4">
                  <h3 className="text-lg font-medium text-white">{q.question}</h3>
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-4 mt-1">
                    {cat?.name || q.categoryId || 'Untagged'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(q)} className="p-1.5 text-textMuted hover:text-white transition-colors rounded hover:bg-surfaceHover">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteClick(q.id)} className="p-1.5 text-textMuted hover:text-red-400 transition-colors rounded hover:bg-surfaceHover">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-background rounded-md p-4 border border-borderMain group relative">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-emerald-400 uppercase block">Response (Expected Answer)</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={q.expectedAnswer} /></div>
                  </div>
                  <p className="text-sm text-textMain whitespace-pre-wrap">{q.expectedAnswer || <span className="text-textMuted italic">No response defined</span>}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-background rounded-md p-4 border border-borderMain group relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-indigo-400 uppercase block">Key Points</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={q.keyPoints} /></div>
                    </div>
                    <p className="text-sm text-textMain whitespace-pre-wrap">{q.keyPoints || <span className="text-textMuted italic">No key points defined</span>}</p>
                  </div>
                  <div className="bg-background rounded-md p-4 border border-borderMain group relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-amber-400 uppercase block">Expected Resources</span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={q.expectedResources} /></div>
                    </div>
                    <p className="text-sm text-textMain whitespace-pre-wrap">{q.expectedResources || <span className="text-textMuted italic">No resources defined</span>}</p>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-borderMain">
                <div className="flex items-center gap-4 text-textMuted">
                  <button 
                    onClick={() => toggleReaction(q.id, 'like')} 
                    className={`flex items-center gap-1.5 transition-colors text-sm ${q.userReaction === 'like' ? 'text-emerald-400' : 'hover:text-emerald-400'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${q.userReaction === 'like' ? 'fill-current' : ''}`} />
                    <span>{q.likes}</span>
                  </button>
                  <button 
                    onClick={() => toggleReaction(q.id, 'dislike')} 
                    className={`flex items-center gap-1.5 transition-colors text-sm ${q.userReaction === 'dislike' ? 'text-red-400' : 'hover:text-red-400'}`}
                  >
                    <ThumbsDown className={`w-4 h-4 ${q.userReaction === 'dislike' ? 'fill-current' : ''}`} />
                    <span>{q.dislikes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-sm ml-4 border-l border-borderMain pl-4">
                    <MessageSquare className="w-4 h-4" />
                    <span>{q.comments.length} Comments</span>
                  </div>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-borderMain">
                {q.comments.map(c => (
                  <div key={c.id}>
                    <span className="text-xs font-semibold text-white mr-2">{c.author}</span>
                    <span className="text-sm text-textMuted">{c.text}</span>
                  </div>
                ))}
                <CommentInput onAddComment={(text) => addComment(q.id, 'Current User', text)} />
              </div>
            </div>
          );
        })}
        {questions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-textMuted">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>No questions found. Try importing a CSV or adding one manually.</p>
          </div>
        )}
      </div>

      {/* New Question Modal */}
      {isNewQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface border border-borderMain rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h2>
            
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Question</label>
                <input 
                  type="text" 
                  value={newQuestionData.question}
                  onChange={e => setNewQuestionData({...newQuestionData, question: e.target.value})}
                  className="w-full bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. What is the procedure for..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Category (Tag)</label>
                <select 
                  value={newQuestionData.categoryId}
                  onChange={e => setNewQuestionData({...newQuestionData, categoryId: e.target.value})}
                  className="w-full bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select a category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Response (Expected Answer)</label>
                <textarea 
                  value={newQuestionData.expectedAnswer}
                  onChange={e => setNewQuestionData({...newQuestionData, expectedAnswer: e.target.value})}
                  className="w-full h-20 bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="The correct response..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Key Points</label>
                  <textarea 
                    value={newQuestionData.keyPoints}
                    onChange={e => setNewQuestionData({...newQuestionData, keyPoints: e.target.value})}
                    className="w-full h-20 bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="Must mention X, Y, and Z..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Expected Resources</label>
                  <textarea 
                    value={newQuestionData.expectedResources}
                    onChange={e => setNewQuestionData({...newQuestionData, expectedResources: e.target.value})}
                    className="w-full h-20 bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="AMM Chapter 12..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-borderMain">
              <button 
                onClick={() => setIsNewQuestionModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddOrUpdateQuestion}
                className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {editingQuestionId ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface border border-borderMain rounded-lg shadow-2xl w-full max-w-sm p-6 flex flex-col">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h2 className="text-lg font-bold text-white">Delete Question</h2>
            </div>
            <p className="text-sm text-textMuted mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentInput({ onAddComment }: { onAddComment: (t: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="flex gap-2 mt-2">
      <input 
        type="text" 
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a comment..." 
        onKeyDown={e => {
          if (e.key === 'Enter') {
            onAddComment(text);
            setText('');
          }
        }}
        className="flex-1 bg-background border border-borderMain rounded text-sm px-3 py-1.5 focus:outline-none focus:border-primary text-white" 
      />
      <button 
        onClick={() => {
          onAddComment(text);
          setText('');
        }}
        className="bg-surfaceHover border border-borderMain text-white px-3 py-1.5 rounded text-sm hover:bg-primary transition-colors"
      >
        Reply
      </button>
    </div>
  );
}
