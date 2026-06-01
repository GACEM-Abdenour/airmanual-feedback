import { useState } from 'react';
import type { CategoryTag } from '../types';
import { Save, AlertTriangle, FileText, CheckCircle2, Tag, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CopyButton } from '../components/CopyButton';

export function GlobalRules() {
  const { globalSettings, updateSettings, categories, addCategory, deleteCategory } = useAppContext();
  const [settings, setSettings] = useState(globalSettings);
  const [saved, setSaved] = useState(false);
  
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    specificRules: '',
    redlines: '',
    expectedSchema: ''
  });

  const handleSave = () => {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateCategory = () => {
    if (!newCategory.name) return;
    const addedCategory: CategoryTag = {
      id: `cat-${Date.now()}`,
      ...newCategory
    };
    addCategory(addedCategory);
    setNewCategory({ name: '', specificRules: '', redlines: '', expectedSchema: '' });
    setIsNewCategoryModalOpen(false);
  };

  const handleDeleteCategoryClick = (id: string) => {
    setCategoryToDelete(id);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-end border-b border-borderMain pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Global Rules & Categories</h1>
          <p className="text-textMuted mt-1 text-sm">Define overarching rules and manage specific category schemas.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Global Rules Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-borderMain rounded-lg p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-indigo-400 mr-2" />
              <h2 className="text-lg font-medium text-white">General Rules</h2>
            </div>
            <CopyButton text={settings.generalRules} />
          </div>
          <p className="text-sm text-textMuted mb-3">Guidelines that apply broadly across all AI responses.</p>
          <textarea
            value={settings.generalRules}
            onChange={(e) => setSettings({ ...settings, generalRules: e.target.value })}
            className="w-full flex-1 min-h-[120px] bg-background border border-borderMain rounded-md p-3 text-sm text-textMain focus:outline-none focus:border-primary resize-y"
            placeholder="e.g. Always prioritize safety..."
          />
        </div>

        <div className="bg-surface border border-red-500/20 rounded-lg p-6 relative flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <AlertTriangle className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h2 className="text-lg font-medium text-white">Redlines (Escalation)</h2>
            </div>
            <CopyButton text={settings.redlines} />
          </div>
          <p className="text-sm text-textMuted mb-3 relative z-10">Critical situations where the AI must stop or escalate.</p>
          <textarea
            value={settings.redlines}
            onChange={(e) => setSettings({ ...settings, redlines: e.target.value })}
            className="w-full flex-1 min-h-[120px] bg-background border border-red-500/30 rounded-md p-3 text-sm text-textMain focus:outline-none focus:border-red-500 resize-y relative z-10"
            placeholder="e.g. Rotor strike mentioned..."
          />
        </div>

        <div className="bg-surface border border-borderMain rounded-lg p-6 md:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mr-2" />
              <h2 className="text-lg font-medium text-white">Global Expected Answering Schema</h2>
            </div>
            <CopyButton text={settings.expectedSchema} />
          </div>
          <p className="text-sm text-textMuted mb-3">The default structural format for generated answers.</p>
          <textarea
            value={settings.expectedSchema}
            onChange={(e) => setSettings({ ...settings, expectedSchema: e.target.value })}
            className="w-full min-h-[100px] bg-background border border-borderMain rounded-md p-3 text-sm text-textMain focus:outline-none focus:border-primary resize-y font-mono"
            placeholder="1. Direct Answer..."
          />
        </div>
      </div>

      {/* Category Management Section */}
      <div className="mt-8 border-t border-borderMain pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              Categories & Routing Rules
            </h2>
            <p className="text-sm text-textMuted mt-1">Manage the specific rules associated with each question category.</p>
          </div>
          <button 
            onClick={() => setIsNewCategoryModalOpen(true)}
            className="bg-surface hover:bg-surfaceHover border border-borderMain text-white px-4 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </button>
        </div>

        <div className="grid gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-surface border border-borderMain rounded-lg p-5">
              <div className="flex justify-between items-center mb-4 border-b border-borderMain pb-3">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-3"></span>
                  {cat.name}
                </h3>
                <button onClick={() => handleDeleteCategoryClick(cat.id)} className="text-textMuted hover:text-red-400 transition-colors p-1 rounded hover:bg-surfaceHover">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-indigo-400 uppercase font-semibold flex items-center"><FileText className="w-3 h-3 mr-1"/> Specific Rules</p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={cat.specificRules} /></div>
                  </div>
                  <p className="text-sm text-textMain whitespace-pre-wrap">{cat.specificRules || 'None'}</p>
                </div>
                <div className="relative group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-red-400 uppercase font-semibold flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> Redlines</p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={cat.redlines} /></div>
                  </div>
                  <p className="text-sm text-textMain whitespace-pre-wrap">{cat.redlines || 'None'}</p>
                </div>
                <div className="relative group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-emerald-400 uppercase font-semibold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> Expected Schema</p>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity"><CopyButton text={cat.expectedSchema} /></div>
                  </div>
                  <p className="text-sm text-textMain whitespace-pre-wrap">{cat.expectedSchema || 'None'}</p>
                </div>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-textMuted text-center py-8">No categories created yet.</p>
          )}
        </div>
      </div>

      {/* New Category Modal Overlay */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface border border-borderMain rounded-lg shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">Create New Category</h2>
            
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                  className="w-full bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Avionics Issue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1 flex items-center"><FileText className="w-4 h-4 mr-1 text-indigo-400"/> Specific Rules</label>
                <textarea 
                  value={newCategory.specificRules}
                  onChange={e => setNewCategory({...newCategory, specificRules: e.target.value})}
                  className="w-full h-24 bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                  placeholder="Rules specific to this category..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1 flex items-center"><AlertTriangle className="w-4 h-4 mr-1 text-red-400"/> Redlines</label>
                <textarea 
                  value={newCategory.redlines}
                  onChange={e => setNewCategory({...newCategory, redlines: e.target.value})}
                  className="w-full h-24 bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Escalation triggers..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400"/> Expected Schema</label>
                <textarea 
                  value={newCategory.expectedSchema}
                  onChange={e => setNewCategory({...newCategory, expectedSchema: e.target.value})}
                  className="w-full h-24 bg-background border border-borderMain rounded-md p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Expected answering structure..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-borderMain">
              <button 
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateCategory}
                className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-surface border border-borderMain rounded-lg shadow-2xl w-full max-w-sm p-6 flex flex-col">
            <div className="flex items-center text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h2 className="text-lg font-bold text-white">Delete Category</h2>
            </div>
            <p className="text-sm text-textMuted mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCategory}
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
