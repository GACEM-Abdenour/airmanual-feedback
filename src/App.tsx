import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { QuestionsManager } from './pages/QuestionsManager';
import { GlobalRules } from './pages/GlobalRules';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<QuestionsManager />} />
            <Route path="/global-rules" element={<GlobalRules />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
