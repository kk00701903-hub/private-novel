import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NovelAssistantApp, { AppIndexRedirect } from './NovelAssistantApp';
import WritingTab from './components/WritingTab';
import WorksTab from './components/WorksTab';
import ArchiveTab from './components/ArchiveTab';
import DraftsTab from './components/DraftsTab';
import SettingsTab from './components/SettingsTab';
import NotFound from './pages/not-found/Index';

const queryClient = new QueryClient();

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path="/" element={<NovelAssistantApp />}>
            <Route index element={<AppIndexRedirect />} />
            <Route path="writing" element={<WritingTab />} />
            <Route path="works" element={<WorksTab />} />
            <Route path="archive" element={<ArchiveTab />} />
            <Route path="drafts" element={<DraftsTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
