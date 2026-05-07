import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Main from "./pages/Main";
import SongDetails from "./pages/SongDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*  Main page as landing */}
        <Route path="/" element={<Main />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Optional: fallback */}
        <Route path="*" element={<Main />} />
        <Route path="/song/:id" element={<SongDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;