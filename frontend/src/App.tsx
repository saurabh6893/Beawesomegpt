import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './Components/Chat';
import "./App.css";
import HomePage from './Components/HomePage';

function App() {
  return (
    <Router>
      <div className="mainbody">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;