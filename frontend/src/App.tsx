import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Chat from "./Components/Chat";
import "./App.css";
import HomePage from "./Components/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
