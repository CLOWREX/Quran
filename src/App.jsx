import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SurahDetail from "./pages/SurahDetail";

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
