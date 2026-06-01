import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { QuestionEntry, CategoryTag, GlobalSettings } from '../types';

interface AppContextType {
  questions: QuestionEntry[];
  categories: CategoryTag[];
  globalSettings: GlobalSettings;
  addQuestion: (q: QuestionEntry) => void;
  updateQuestion: (q: QuestionEntry) => void;
  deleteQuestion: (id: string) => void;
  importExcelData: (cats: CategoryTag[], qs: QuestionEntry[], sets?: GlobalSettings) => void;
  toggleReaction: (questionId: string, reaction: 'like' | 'dislike') => void;
  addComment: (questionId: string, author: string, text: string) => void;
  addCategory: (c: CategoryTag) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (s: GlobalSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<QuestionEntry[]>([]);
  const [categories, setCategories] = useState<CategoryTag[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    generalRules: '', redlines: '', expectedSchema: ''
  });

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: cats } = await supabase.from('categories').select('*');
      if (cats) setCategories(cats);

      const { data: qs } = await supabase.from('questions').select('*').order('id', { ascending: false });
      if (qs) setQuestions(qs);

      const { data: sets } = await supabase.from('settings').select('*').eq('id', 'global').single();
      if (sets) {
        setGlobalSettings({
          generalRules: sets.generalRules || '',
          redlines: sets.redlines || '',
          expectedSchema: sets.expectedSchema || ''
        });
      }
    };
    fetchData();
  }, []);

  const addQuestion = async (q: QuestionEntry) => {
    setQuestions([q, ...questions]);
    await supabase.from('questions').insert([q]);
  };
  
  const updateQuestion = async (updatedQ: QuestionEntry) => {
    setQuestions(questions.map(q => q.id === updatedQ.id ? updatedQ : q));
    await supabase.from('questions').update(updatedQ).eq('id', updatedQ.id);
  };

  const deleteQuestion = async (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    await supabase.from('questions').delete().eq('id', id);
  };
  
  const importExcelData = async (newCategories: CategoryTag[], newQuestions: QuestionEntry[], newSettings?: GlobalSettings) => {
    const mergedCats = [...categories];
    newCategories.forEach(nc => {
      const idx = mergedCats.findIndex(c => c.id === nc.id);
      if (idx !== -1) mergedCats[idx] = nc;
      else mergedCats.push(nc);
    });
    setCategories(mergedCats);

    const mergedQs = [...questions];
    newQuestions.forEach(nq => {
      const idx = mergedQs.findIndex(q => q.id === nq.id);
      if (idx !== -1) mergedQs[idx] = nq;
      else mergedQs.unshift(nq);
    });
    setQuestions(mergedQs);

    if (newSettings) {
      setGlobalSettings(newSettings);
      await supabase.from('settings').upsert({ id: 'global', ...newSettings });
    }

    if (newCategories.length > 0) {
      await supabase.from('categories').upsert(newCategories);
    }
    if (newQuestions.length > 0) {
      await supabase.from('questions').upsert(newQuestions);
    }
  };

  const toggleReaction = async (questionId: string, reaction: 'like' | 'dislike') => {
    let updatedQuestion: QuestionEntry | undefined;
    
    setQuestions(questions.map(q => {
      if (q.id !== questionId) return q;
      
      let newLikes = q.likes;
      let newDislikes = q.dislikes;
      let newReaction = q.userReaction;

      if (reaction === 'like') {
        if (newReaction === 'like') {
          newLikes -= 1;
          newReaction = undefined;
        } else {
          newLikes += 1;
          if (newReaction === 'dislike') newDislikes -= 1;
          newReaction = 'like';
        }
      } else if (reaction === 'dislike') {
        if (newReaction === 'dislike') {
          newDislikes -= 1;
          newReaction = undefined;
        } else {
          newDislikes += 1;
          if (newReaction === 'like') newLikes -= 1;
          newReaction = 'dislike';
        }
      }

      updatedQuestion = { ...q, likes: newLikes, dislikes: newDislikes, userReaction: newReaction };
      return updatedQuestion;
    }));

    if (updatedQuestion) {
      await supabase.from('questions').update({
        likes: updatedQuestion.likes,
        dislikes: updatedQuestion.dislikes,
        userReaction: updatedQuestion.userReaction
      }).eq('id', questionId);
    }
  };

  const addComment = async (questionId: string, author: string, text: string) => {
    const newComment = {
      id: `c-${Date.now()}`,
      author,
      text,
      timestamp: new Date().toISOString()
    };
    
    let updatedComments: any[] = [];
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        updatedComments = [...q.comments, newComment];
        return { ...q, comments: updatedComments };
      }
      return q;
    }));

    if (updatedComments.length > 0) {
      await supabase.from('questions').update({ comments: updatedComments }).eq('id', questionId);
    }
  };

  const addCategory = async (c: CategoryTag) => {
    setCategories([...categories, c]);
    await supabase.from('categories').insert([c]);
  };
  
  const deleteCategory = async (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    await supabase.from('categories').delete().eq('id', id);
  };
  
  const updateSettings = async (s: GlobalSettings) => {
    setGlobalSettings(s);
    await supabase.from('settings').upsert({ id: 'global', ...s });
  };

  return (
    <AppContext.Provider value={{
      questions,
      categories,
      globalSettings,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      importExcelData,
      toggleReaction,
      addComment,
      addCategory,
      deleteCategory,
      updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
