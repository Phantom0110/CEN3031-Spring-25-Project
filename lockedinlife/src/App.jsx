import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import CollectionsPage from './pages/CollectionsPage';
import StorePage from './pages/StorePage';
import BattlepassPage from './pages/BattlepassPage';
import DashboardLayout from './pages/DashboardLayout';
import './styles/app.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/battlepass" element={<BattlepassPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;