import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "@/react-app/pages/Dashboard";
import Import from "@/react-app/pages/Import";
import { Goals } from "@/react-app/pages/Goals";
import { Insights } from "@/react-app/pages/Insights";
import { Transactions } from "@/react-app/pages/Transactions";
import Agent from "@/react-app/pages/Agent";
import Profile from "@/react-app/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/import" element={<Import />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
