import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ChartPage from './pages/ChartPage';
import ReportPage from './pages/ReportPage';
import ArchivePage from './pages/ArchivePage';

function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <div className="flex-1 min-h-0 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chart" element={<ChartPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/archive" element={<ArchivePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
