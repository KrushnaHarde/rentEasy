import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
// import Categories from "./components/Categories";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Profile from "./components/Profile";
import SearchResult from './components/SearchResult';
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Rent from "./components/Rent";
import Notification from "./components/Notifications";
import CategoryProducts from "./components/CategoryProducts";


import './index.css';  // Or './App.css' if that's where you put the Tailwind imports


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/category/:categoryName" element={<Categories />} /> */}
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
        {/* <Route path="categories" element={<Categories />} /> */}
        <Route path="/search" element={<SearchResult />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/rent" element={<Rent />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notification />} />

        <Route path="/category/:categoryName" element={<CategoryProducts />} />
        {/* <Route path="/category/:category/:subcategory" element={<CategoryProducts />} /> */}

      </Routes>
    </Router>
  );
}

export default App;
