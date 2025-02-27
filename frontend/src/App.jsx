import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Categories from "./components/Categories";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import './index.css';  // Or './App.css' if that's where you put the Tailwind imports


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:categoryName" element={<Categories />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
