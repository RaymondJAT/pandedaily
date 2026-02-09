import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import WebsiteLayout from './components/layout/WebsiteLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import Users from './pages/dashboard/Users'
import Access from './pages/dashboard/Access'
import Customer from './pages/dashboard/Customer'
import Product from './pages/dashboard/Product'
import Inventory from './pages/dashboard/Inventory'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allowedTypes={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="users" element={<Users />} />
            <Route path="access" element={<Access />} />
            <Route path="customer" element={<Customer />} />
            <Route path="product" element={<Product />} />
            <Route path="inventory" element={<Inventory />} />
          </Route>

          {/* Public Website Routes */}
          <Route path="/*" element={<WebsiteLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
