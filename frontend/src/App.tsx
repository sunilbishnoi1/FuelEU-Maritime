import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./adapters/ui/layout/main-layout";
import RoutesPage from "./adapters/ui/pages/routes-page";
import ComparePage from "./adapters/ui/pages/compare-page";
import BankingPage from "./adapters/ui/pages/banking-page";
import PoolingPage from "./adapters/ui/pages/pooling-page";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/routes" replace />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/banking" element={<BankingPage />} />
          <Route path="/pooling" element={<PoolingPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
