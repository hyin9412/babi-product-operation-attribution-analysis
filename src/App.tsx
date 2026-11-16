import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { BabiWorkspaceShell } from "./app/BabiWorkspaceShell";
import AnalysisPage from './pages/AnalysisPage';
import DesignChecklist from './pages/DesignChecklist';

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/design-checklist" element={<DesignChecklist />} />
        <Route path="/finance/workspace" element={<BabiWorkspaceShell />} />
        <Route path="/finance/workspace/" element={<BabiWorkspaceShell />} />
        <Route path="/finance/sell/transparency" element={<BabiWorkspaceShell><AnalysisPage /></BabiWorkspaceShell>} />
        <Route path="*" element={<Navigate to="/finance/sell/transparency" replace />} />
      </Routes>
    </HashRouter>
  );
};
