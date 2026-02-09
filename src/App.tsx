import { BrowserRouter, Routes, Route } from "react-router-dom";
// 1. Importe a Home (o arquivo que organiza Navbar, Hero, Sobre, Contato e Footer)
import Home from "./Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Item from "./pages/Item";
import Colecao from "./pages/Colecao";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/item/:id" element={<Item />} />
        <Route path="/colecao" element={<Colecao />} />

        
      </Routes>
    </BrowserRouter>
  );
}

export default App;