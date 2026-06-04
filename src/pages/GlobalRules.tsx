import { useState } from 'react';
import type { CategoryTag } from '../types';
import { Save, AlertTriangle, FileText, CheckCircle2, Tag, Plus, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CopyButton } from '../components/CopyButton';

export function GlobalRules() {
  const { globalSettings, updateSettings, categories, addCategory, updateCategory, deleteCategory } = useAppContext();
  const [settings, setSettings] = useState(globalSettings);
  const [saved, setSaved] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  
  const defaultTaskType: CategoryTag = {
    id: '',
    name: '',
    whenToUse: '',
    checksBeforeAnswering: '',
    primaryResources: '',
    mandatoryMentions: '',
    avoidances: '',
    followUpTriggers: '',
    escalationTriggers: '',
    uncertaintyHandling: '',
    answerStyle: '',
    exampleQuestions: '',
    expectedKeyPoints: '',
    specificRules: '',
    redlines: '',
    expectedSchema: ''
  };

  const [formData, setFormData] = useState<CategoryTag>(defaultTaskType);

  const handleSave = () => {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleOpenCreateModal = () => {
    setFormData(defaultTaskType);
    setIsEditing(false);
    setShowLegacy(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryTag) => {
    setFormData({
      id: cat.id,
      name: cat.name || '',
      whenToUse: cat.whenToUse || '',
      checksBeforeAnswering: cat.checksBeforeAnswering || '',
      primaryResources: cat.primaryResources || '',
      mandatoryMentions: cat.mandatoryMentions || '',
      avoidances: cat.avoidances || '',
      followUpTriggers: cat.followUpTriggers || '',
      escalationTriggers: cat.escalationTriggers || '',
      uncertaintyHandling: cat.uncertaintyHandling || '',
      answerStyle: cat.answerStyle || '',
      exampleQuestions: cat.exampleQuestions || '',
      expectedKeyPoints: cat.expectedKeyPoints || '',
      specificRules: cat.specificRules || '',
      redlines: cat.redlines || '',
      expectedSchema: cat.expectedSchema || ''
    });
    setIsEditing(true);
    setShowLegacy(false);
    setIsModalOpen(true);
  };

  const handleSaveTaskType = () => {
    if (!formData.name) return;
    
    if (isEditing) {
      updateCategory(formData);
    } else {
      addCategory({
        ...formData,
        id: `cat-${Date.now()}`
      });
    }
    setIsModalOpen(false);
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
          <h1 className="text-2xl font-bold text-white">Global Rules & Task Policies</h1>
          <p className="text-textMuted mt-1 text-sm">Define global safety rules and specific Engineering Task Types.</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
        >
          {saved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saved ? 'Saved!' : 'Save Global Rules'}
        </button>
      </div>

      {/* Global Rules Section - Unchanged */}
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

      {/* Engineering Task Types Section */}
      <div className="mt-8 border-t border-borderMain pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Tag className="w-5 h-5 mr-2 text-primary" />
              Engineering Task Types
            </h2>
            <p className="text-sm text-textMuted mt-1">Define how AeroMind should handle different types of engineering tasks.</p>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="bg-surface hover:bg-surfaceHover border border-borderMain text-white px-4 py-2 rounded-md transition-colors flex items-center text-sm font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task Type
          </button>
        </div>

        <div className="grid gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-surface border border-borderMain rounded-lg p-5">
              <div className="flex justify-between items-center border-b border-borderMain pb-3 mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-3"></span>
                  {cat.name}
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEditModal(cat)} className="text-textMuted hover:text-white transition-colors p-1.5 rounded hover:bg-surfaceHover">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCategoryClick(cat.id)} className="text-textMuted hover:text-red-400 transition-colors p-1.5 rounded hover:bg-surfaceHover">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Snapshot of key fields to show on the card without cluttering */}
                {cat.whenToUse && (
                  <div>
                    <p className="text-xs text-indigo-400 uppercase font-semibold mb-1">When to Use</p>
                    <p className="text-sm text-textMuted line-clamp-3">{cat.whenToUse}</p>
                  </div>
                )}
                {cat.checksBeforeAnswering && (
                  <div>
                    <p className="text-xs text-emerald-400 uppercase font-semibold mb-1">Checks Before Answering</p>
                    <p className="text-sm text-textMuted line-clamp-3">{cat.checksBeforeAnswering}</p>
                  </div>
                )}
                {cat.primaryResources && (
                  <div>
                    <p className="text-xs text-amber-400 uppercase font-semibold mb-1">Primary Resources</p>
                    <p className="text-sm text-textMuted line-clamp-3">{cat.primaryResources}</p>
                  </div>
                )}
                {/* Legacy fallback if new fields aren't populated yet */}
                {!cat.whenToUse && !cat.checksBeforeAnswering && !cat.primaryResources && (
                  <>
                    <div>
                      <p className="text-xs text-indigo-400 uppercase font-semibold mb-1">Specific Rules (Legacy)</p>
                      <p className="text-sm text-textMuted line-clamp-3">{cat.specificRules || 'None'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 uppercase font-semibold mb-1">Redlines (Legacy)</p>
                      <p className="text-sm text-textMuted line-clamp-3">{cat.redlines || 'None'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-textMuted text-center py-8">No task types created yet.</p>
          )}
        </div>
      </div>

      {/* Task Type Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-borderMain rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-borderMain">
              <h2 className="text-xl font-bold text-white">
                {isEditing ? 'Edit Engineering Task Type' : 'Create Engineering Task Type'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Engineering Task Type Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-borderMain rounded-md p-3 text-lg font-medium text-white focus:outline-none focus:border-primary"
                  placeholder="e.g. Troubleshooting, Inspection, Logbook Analysis"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-indigo-400 mb-2">When should AeroMind use this?</label>
                  <textarea 
                    value={formData.whenToUse}
                    onChange={e => setFormData({...formData, whenToUse: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Describe the scenario where this task type applies..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-400 mb-2">What should AeroMind check before answering?</label>
                  <textarea 
                    value={formData.checksBeforeAnswering}
                    onChange={e => setFormData({...formData, checksBeforeAnswering: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="List prerequisites, necessary context, or data to gather..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-2">Which resources/manuals are most important?</label>
                  <textarea 
                    value={formData.primaryResources}
                    onChange={e => setFormData({...formData, primaryResources: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="AMM, IPC, specific chapters..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-emerald-400 mb-2">What should AeroMind always mention?</label>
                  <textarea 
                    value={formData.mandatoryMentions}
                    onChange={e => setFormData({...formData, mandatoryMentions: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                    placeholder="Specific warnings, standard procedures..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">What should AeroMind avoid?</label>
                  <textarea 
                    value={formData.avoidances}
                    onChange={e => setFormData({...formData, avoidances: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                    placeholder="Do not recommend bypassing safety checks..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">When should AeroMind escalate or warn the user?</label>
                  <textarea 
                    value={formData.escalationTriggers}
                    onChange={e => setFormData({...formData, escalationTriggers: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none"
                    placeholder="e.g. If parts are missing, if structural damage is found..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-400 mb-2">What should AeroMind do when information is missing or uncertain?</label>
                  <textarea 
                    value={formData.uncertaintyHandling}
                    onChange={e => setFormData({...formData, uncertaintyHandling: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="e.g. State clearly that the manual must be consulted directly..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-amber-400 mb-2">When should AeroMind ask follow-up questions?</label>
                  <textarea 
                    value={formData.followUpTriggers}
                    onChange={e => setFormData({...formData, followUpTriggers: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="If the aircraft model or tail number is not provided..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-primary mb-2">Preferred answer style</label>
                  <textarea 
                    value={formData.answerStyle}
                    onChange={e => setFormData({...formData, answerStyle: e.target.value})}
                    className="w-full h-24 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-primary resize-none"
                    placeholder="e.g. Bullet points, highly technical, step-by-step..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textMain mb-2">Example questions</label>
                  <textarea 
                    value={formData.exampleQuestions}
                    onChange={e => setFormData({...formData, exampleQuestions: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-borderMain resize-none"
                    placeholder="List examples..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textMain mb-2">Expected key points</label>
                  <textarea 
                    value={formData.expectedKeyPoints}
                    onChange={e => setFormData({...formData, expectedKeyPoints: e.target.value})}
                    className="w-full h-28 bg-background border border-borderMain rounded-md p-3 text-sm text-white focus:outline-none focus:border-borderMain resize-none"
                    placeholder="List expected outputs..."
                  />
                </div>
              </div>

              {/* Legacy Fields Toggle */}
              <div className="pt-6 border-t border-borderMain">
                <button 
                  onClick={() => setShowLegacy(!showLegacy)}
                  className="flex items-center text-sm font-medium text-textMuted hover:text-white transition-colors"
                >
                  {showLegacy ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showLegacy ? 'Hide Legacy Fields' : 'Show Legacy Fields (Deprecated)'}
                </button>
                
                {showLegacy && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-xs text-textMuted mb-1">Specific Rules</label>
                      <textarea 
                        value={formData.specificRules}
                        onChange={e => setFormData({...formData, specificRules: e.target.value})}
                        className="w-full h-24 bg-background border border-borderMain rounded-md p-2 text-xs text-textMuted focus:outline-none focus:border-borderMain resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-textMuted mb-1">Redlines</label>
                      <textarea 
                        value={formData.redlines}
                        onChange={e => setFormData({...formData, redlines: e.target.value})}
                        className="w-full h-24 bg-background border border-borderMain rounded-md p-2 text-xs text-textMuted focus:outline-none focus:border-borderMain resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-textMuted mb-1">Expected Schema</label>
                      <textarea 
                        value={formData.expectedSchema}
                        onChange={e => setFormData({...formData, expectedSchema: e.target.value})}
                        className="w-full h-24 bg-background border border-borderMain rounded-md p-2 text-xs text-textMuted focus:outline-none focus:border-borderMain resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-borderMain flex justify-end gap-3 bg-surface rounded-b-lg">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-sm font-medium text-textMuted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveTaskType}
                className="bg-primary hover:bg-primaryHover text-white px-8 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Create Task Type'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-borderMain rounded-lg shadow-2xl w-full max-w-sm p-6 flex flex-col">
            <div className="flex items-center text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h2 className="text-lg font-bold text-white">Delete Task Type</h2>
            </div>
            <p className="text-sm text-textMuted mb-6">
              Are you sure you want to delete this Task Type? This action cannot be undone.
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
