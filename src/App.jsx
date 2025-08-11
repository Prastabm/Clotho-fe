// App.jsx - Fixed version
import { ThemeProvider } from './components/ThemeProvider';
import LoginPage from './components/LoginPage';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import AdminNavbar from "@/components/AdminNavbar.jsx";
import AdminSidebar from "@/components/AdminSidebar.jsx";
import Dashboard from "@/components/Dashboard.jsx";
import {useContext, useState} from "react";
import { AuthContext } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import ProductPage from './components/ProductPage';
import {cn} from "@/lib/utils.js";
import InventoryPage from "@/components/Inventory.jsx";
import Register from "@/components/Register.jsx";
import UserHomePage from "@/components/UserHomePage.jsx";
import UserNavbar from "@/components/UserNavbar.jsx";
import CartPage from "@/components/cartPage.jsx";
import CheckoutPage from "./components/CheckoutPage.jsx";
import OrderPage from "@/components/OrdersPage.jsx"; // Corrected import path
import ContactUs from "@/components/ContactUs.jsx";
import CommunicationPage from "@/components/CommunicationPage.jsx"; // Import the new component

// Layout Component
const Layout = ({ children }) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userRole = user.role.replace('ROLE_', '').toLowerCase();

    return (
        <div className="min-h-screen bg-background">
            {userRole === 'admin' && (
                <>
                    <AdminNavbar onLogout={handleLogout} userId={user.id} />
                    <AdminSidebar onCollapsedChange={setSidebarCollapsed} />
                </>
            )}
            {userRole === 'user' && (
                <>
                    <UserNavbar onLogout={handleLogout} userId={user.id} />
                    <ContactUs /> {/* Add the ContactUs component here */}
                </>
            )}
            <main
                className={cn(
                    "pt-16 transition-all duration-300",
                    userRole === 'admin' && (sidebarCollapsed ? 'pl-20' : 'pl-64')
                )}
            >
                {children}
            </main>
        </div>
    );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/" replace />;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (user) {
        const userRole = user.role.replace('ROLE_', '').toLowerCase();
        return <Navigate to={userRole === 'admin' ? '/dashboard' : '/user-homepage'} replace />;
    }

    return children;
};

// Add this new component for admin-only routes
const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const userRole = user.role.replace('ROLE_', '').toLowerCase();
    if (userRole !== 'admin') {
        return <Navigate to="/user-homepage" replace />;
    }

    return children;
};

// In the App component, update the products route to use AdminRoute
function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <Routes>
                        {/* Public route - redirects if already logged in */}
                        <Route path="/" element={
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute>
                                <Layout>
                                    <CheckoutPage />
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Update the products route */}
                        <Route path="/products" element={
                            <AdminRoute>
                                <Layout>
                                    <ProductPage />
                                </Layout>
                            </AdminRoute>
                        } />
                        <Route path="/inventory" element={
                            <AdminRoute>
                                <Layout>
                                    <InventoryPage />
                                </Layout>
                            </AdminRoute>
                        } />

                        <Route path="/communication" element={
                            <AdminRoute>
                                <Layout>
                                    <CommunicationPage />
                                </Layout>
                            </AdminRoute>
                        } />

                        <Route path="/users" element={
                            <ProtectedRoute>
                                <Layout>
                                    <div className="p-8">
                                        <h2 className="text-3xl font-bold tracking-tight mb-4">Users</h2>
                                        <div className="bg-card rounded-lg border border-border p-6">
                                            <p className="text-muted-foreground">User management coming soon...</p>
                                        </div>
                                    </div>
                                </Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/communication" element={
                            <ProtectedRoute>
                                <Layout>
                                    <div className="p-8">
                                        <h2 className="text-3xl font-bold tracking-tight mb-4">Communication</h2>
                                        <div className="bg-card rounded-lg border border-border p-6">
                                            <p className="text-muted-foreground">Communication tools coming soon...</p>
                                        </div>
                                    </div>
                                </Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="/user-homepage" element={
                            <ProtectedRoute>
                                <Layout>
                                    <UserHomePage />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/my-orders" element={
                            <ProtectedRoute>
                                <Layout>
                                    <OrderPage />
                                </Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/cart" element={
                            <ProtectedRoute>
                                <Layout>
                                    <CartPage/>
                                </Layout>
                            </ProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
