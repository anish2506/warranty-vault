import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import EditProduct from "./pages/EditProduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />}
/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>}/>
        <Route path="/add-product" element={
        <ProtectedRoute>
          <AddProduct />
        </ProtectedRoute>}/>
        <Route path="/product/:id" element={
        <ProtectedRoute>
          <ProductDetails />
        </ProtectedRoute>}/>
        <Route path="/product/:id/edit" element={
        <ProtectedRoute>
          <EditProduct />
        </ProtectedRoute>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;