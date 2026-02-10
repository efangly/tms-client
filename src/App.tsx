import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ChartPage from './pages/ChartPage';
import ReportPage from './pages/ReportPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chart" element={<ChartPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </div>
  );
}

export default App;
