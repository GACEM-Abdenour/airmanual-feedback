import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { QuestionEntry, CategoryTag, GlobalSettings } from '../types';

interface AppContextType {
  questions: QuestionEntry[];
  categories: CategoryTag[];
  globalSettings: GlobalSettings;
  questionRequests: QuestionEntry[];
  addQuestion: (q: QuestionEntry) => void;
  updateQuestion: (q: QuestionEntry) => void;
  deleteQuestion: (id: string) => void;
  importExcelData: (cats: CategoryTag[], qs: QuestionEntry[], sets?: GlobalSettings) => void;
  importQuestionRequests: (qs: QuestionEntry[]) => void;
  approveRequest: (id: string) => void;
  approveAllRequests: () => void;
  denyRequest: (id: string) => void;
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
  const [questionRequests, setQuestionRequests] = useState<QuestionEntry[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    generalRules: '', redlines: '', expectedSchema: ''
  });

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      const { data: cats, error: catsErr } = await supabase.from('categories').select('*');
      if (catsErr) console.error('Fetch categories error:', catsErr);
      if (cats) setCategories(cats);

      const { data: qs, error: qsErr } = await supabase.from('questions').select('*').order('id', { ascending: false });
      if (qsErr) console.error('Fetch questions error:', qsErr);
      if (qs) setQuestions(qs);

      const { data: sets, error: setsErr } = await supabase.from('settings').select('*').eq('id', 'global').single();
      if (setsErr && setsErr.code !== 'PGRST116') console.error('Fetch settings error:', setsErr); // Ignore not found error
      if (sets) {
        setGlobalSettings({
          generalRules: sets.generalRules || '',
          redlines: sets.redlines || '',
          expectedSchema: sets.expectedSchema || ''
        });
      }

      const { data: reqs, error: reqsErr } = await supabase.from('question_requests').select('*').order('id', { ascending: false });
      if (reqsErr && reqsErr.code !== '42P01') console.error('Fetch requests error:', reqsErr); // Ignore relation does not exist
      if (reqs) setQuestionRequests(reqs);
    };
    fetchData();
  }, []);

  const addQuestion = async (q: QuestionEntry) => {
    setQuestions([q, ...questions]);
    const { error } = await supabase.from('questions').insert([q]);
    if (error) console.error('Add question error:', error);
  };
  
  const updateQuestion = async (updatedQ: QuestionEntry) => {
    setQuestions(questions.map(q => q.id === updatedQ.id ? updatedQ : q));
    const { error } = await supabase.from('questions').update(updatedQ).eq('id', updatedQ.id);
    if (error) console.error('Update question error:', error);
  };

  const deleteQuestion = async (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) console.error('Delete question error:', error);
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
      const { error } = await supabase.from('settings').upsert({ id: 'global', ...newSettings });
      if (error) console.error('Upsert settings error:', error);
    }

    if (newCategories.length > 0) {
      const { error } = await supabase.from('categories').upsert(newCategories);
      if (error) console.error('Upsert categories error:', error);
    }
    if (newQuestions.length > 0) {
      const { error } = await supabase.from('questions').upsert(newQuestions);
      if (error) console.error('Upsert questions error:', error);
    }
  };

  const importQuestionRequests = async (newRequests: QuestionEntry[]) => {
    // Generate new unique IDs so they don't overwrite existing questions
    const sanitizedRequests = newRequests.map(req => ({
      ...req,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }));
    
    setQuestionRequests([...sanitizedRequests, ...questionRequests]);
    if (sanitizedRequests.length > 0) {
      const { error } = await supabase.from('question_requests').upsert(sanitizedRequests);
      if (error) console.error('Upsert requests error:', error);
    }
  };

  const approveRequest = async (id: string) => {
    const reqToApprove = questionRequests.find(r => r.id === id);
    if (!reqToApprove) return;
    
    const { suggestedBy, ...restOfReq } = reqToApprove;
    // Generate real question ID
    const newQuestion = {
      ...restOfReq,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setQuestionRequests(questionRequests.filter(r => r.id !== id));
    setQuestions([newQuestion, ...questions]);
    
    await supabase.from('question_requests').delete().eq('id', id);
    await supabase.from('questions').insert([newQuestion]);
  };

  const approveAllRequests = async () => {
    if (questionRequests.length === 0) return;

    const newQuestions = questionRequests.map(req => {
      const { suggestedBy, ...rest } = req;
      return {
        ...rest,
        id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
    });

    // Clear requests locally
    setQuestionRequests([]);
    // Add all to questions locally
    setQuestions([...newQuestions, ...questions]);

    // Delete all from requests table
    const requestIds = questionRequests.map(r => r.id);
    await supabase.from('question_requests').delete().in('id', requestIds);
    // Insert all to questions table
    await supabase.from('questions').insert(newQuestions);
  };

  const denyRequest = async (id: string) => {
    setQuestionRequests(questionRequests.filter(r => r.id !== id));
    await supabase.from('question_requests').delete().eq('id', id);
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
      const { error } = await supabase.from('questions').update({
        likes: updatedQuestion.likes,
        dislikes: updatedQuestion.dislikes,
        userReaction: updatedQuestion.userReaction
      }).eq('id', questionId);
      if (error) console.error('Toggle reaction error:', error);
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
      const { error } = await supabase.from('questions').update({ comments: updatedComments }).eq('id', questionId);
      if (error) console.error('Add comment error:', error);
    }
  };

  const addCategory = async (c: CategoryTag) => {
    setCategories([...categories, c]);
    const { error } = await supabase.from('categories').insert([c]);
    if (error) console.error('Add category error:', error);
  };
  
  const deleteCategory = async (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) console.error('Delete category error:', error);
  };
  
  const updateSettings = async (s: GlobalSettings) => {
    setGlobalSettings(s);
    const { error } = await supabase.from('settings').upsert({ id: 'global', ...s });
    if (error) console.error('Update settings error:', error);
  };

  return (
    <AppContext.Provider value={{
      questions,
      categories,
      globalSettings,
      questionRequests,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      importExcelData,
      importQuestionRequests,
      approveRequest,
      approveAllRequests,
      denyRequest,
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
