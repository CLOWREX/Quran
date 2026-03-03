import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import SurahDetail from "./SurahDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/surah/:id" element={<SurahDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
