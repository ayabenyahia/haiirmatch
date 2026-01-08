import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientRequest from "./pages/ClientRequest";
import ClientExplore from "./pages/ClientExplore";
import Hairdresser from "./pages/Hairdresser";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* CLIENT */}
        <Route path="/client/request" element={<ClientRequest />} />
        <Route path="/client/explore" element={<ClientExplore />} />

        {/* HAIRDRESSER */}
        <Route path="/hairdresser" element={<Hairdresser />} />
      </Routes>
    </BrowserRouter>
  );
}

