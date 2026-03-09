
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import Students from './features/students/Students';
import Results from './features/results/Results';
import Statistics from './features/statistics/Statistics';
import Classes from './features/classes/Classes';
import Subjects from './features/subjects/Subjects';
import ApproveResults from './pages/ApproveResults';
import Assignments from './pages/Assignments';
import Layout from './components/Layout';
import { SchoolProvider, useSchoolContext } from './context/SchoolContext';
import { useTranslation } from 'react-i18next';

// Auth Guard
const ProtectedRoute = () => {
  // Simple check for token presence. For robust apps, verify token expiry here.
  const isAuthenticated = !!localStorage.getItem('accessToken');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <LoadingWrapper>
         <Outlet />
      </LoadingWrapper>
    </Layout>
  );
};

// Role-based Route Protection
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useSchoolContext();
  
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper to handle initial data loading state
const LoadingWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { loading, error } = useSchoolContext();
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="mx-3 text-gray-600">{t ? t('loading') : 'Loading...'}</span>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-red-500">
        <p className="text-xl font-bold mb-2">{t ? t('error_occurred') : 'Error'}</p>
        <p>{error}</p>
        <button 
           onClick={() => window.location.reload()}
           className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          {t ? t('retry') : 'Retry'}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <SchoolProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/results" element={<Results />} />
            <Route 
              path="/approve-results" 
              element={
                <AdminRoute>
                  <ApproveResults />
                </AdminRoute>
              } 
            />
            <Route path="/statistics" element={<Statistics />} />
            <Route 
              path="/assignments" 
              element={
                <AdminRoute>
                  <Assignments />
                </AdminRoute>
              } 
            />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </SchoolProvider>
  );
}

export default App;
