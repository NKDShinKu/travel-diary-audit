import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout.tsx';
import TravelNoteList from '@/pages/travel-list/index.tsx';
import LoginPage from '@/pages/login/index.tsx';
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from '@/utils/AuthContext';

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<TravelNoteList />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster></Toaster>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
