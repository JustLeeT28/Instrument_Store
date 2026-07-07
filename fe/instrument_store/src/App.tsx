import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Header, Footer } from './components';
import {
  HomePage,
  CartPage,
  ProductDetailPage,
  ProductsPage,
  ProfilePage,
  FavoritePage,
  LoginPage,
  RegisterPage,
  OrderHistoryPage,
} from './pages';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminDashboard, ProductManagement, UserManagement, VoucherManagement } from './pages';
import './App.css';

function AppContent() {
  const location = useLocation();
  const hideShell = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!hideShell && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/favorite" element={<FavoritePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<div>Thong ke doanh thu (chua trien khai)</div>} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="vouchers" element={<VoucherManagement />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      {!hideShell && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
