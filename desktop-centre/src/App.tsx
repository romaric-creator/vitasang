import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BloodStock from "./pages/BloodStock";
import Appointments from "./pages/Appointments";
import Alerts from "./pages/Alerts";
// ...existing code...

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        {/* Protected Routes inside Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              requiredRole={["personnel", "admin", "centre_manager"]}
            >
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute
              requiredRole={["personnel", "admin", "centre_manager"]}
            >
              <Layout>
                <BloodStock />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute
              requiredRole={["personnel", "admin", "centre_manager"]}
            >
              <Layout>
                <Appointments />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute requiredRole={["admin", "centre_manager"]}>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          }
        />
        // ...existing code...
        {/* Redirect Root and 404 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
