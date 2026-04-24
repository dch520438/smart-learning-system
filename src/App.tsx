import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Knowledge } from "./pages/Knowledge";
import { Notes } from "./pages/Notes";
import { Mistakes } from "./pages/Mistakes";
import { Memorize } from "./pages/Memorize";
import { Patterns } from "./pages/Patterns";
import { SamePoint } from "./pages/SamePoint";
import { Test } from "./pages/Test";
import { Practice } from "./pages/Practice";
import { Scores } from "./pages/Scores";
import { Analysis } from "./pages/Analysis";
import { Mindmap } from "./pages/Mindmap";
import { Placeholder } from "./pages/Placeholder";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/memorize" element={<Memorize />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/patterns" element={<Patterns />} />
          <Route path="/same-point" element={<SamePoint />} />
          <Route path="/test" element={<Test />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/mindmap" element={<Mindmap />} />
        </Routes>
      </div>
    </Router>
  );
}
