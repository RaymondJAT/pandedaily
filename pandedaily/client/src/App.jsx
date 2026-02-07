import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import WebsiteLayout from './components/layout/WebsiteLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import Users from './pages/dashboard/Users'
import Access from './pages/dashboard/Access'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Dashboard Routes - Protected Admin Access */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute allowedTypes={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Nested dashboard routes */}
            <Route path="users" element={<Users />} />
            <Route path="access" element={<Access />} />
            {/* Add more dashboard routes here as needed */}
          </Route>

          {/* Public Website Routes */}
          <Route path="/*" element={<WebsiteLayout />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
