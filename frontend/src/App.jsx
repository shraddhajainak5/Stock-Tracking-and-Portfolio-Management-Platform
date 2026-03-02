// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Keep AuthProvider temporarily if components still rely on it, but aim to remove
import ThemeProvider from './components/common/ThemeProvider'; // Your Theme Provider
import Loader from './components/common/Loader';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import { verifyAuth } from './redux/features/authSlice';// Needed for Protected/Admin Routes

// --- Page Imports ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketOverview from "./components/dashboard/MarketOverview";
import WatchlistPreview from "./components/dashboard/WatchlistPreview/WatchlistPreview"
import PortfolioSummary from './components/dashboard/Portfolio/PortfolioSummary';
import ProfilePage from "./pages/Profile";
import About from "./components/dashboard/About";
import StockDetailPage from './pages/StockDetailPage';
import Chat from './pages/Chat';
import StockListingPage from './pages/StockListingPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// -- user imports --

// --- Admin Page Imports ---
import AdminDashboardPage from './pages/AdminDashboard/AdminDashboardPage';
import UsersManagementPage from './components/admin/UsersManagementPage';
import UserVerificationPage from './components/admin/UserVerificationPage';
import StocksManagementPage from './components/admin/StocksManagementPage';

// --- Broker Page Imports ---
import BrokerDashboardPage from './pages/BrokerDashboard/BrokerDashboardPage';
import ClientsManagementPage from './pages/BrokerDashboard/ClientsManagementPage';
import TransactionsPage from './pages/BrokerDashboard/TransactionsPage';
import BrokerRegisterPage from './pages/BrokerRegisterPage';

// Stock Analysis Pages
import StockAnalysisPage, {
    StockAnalysisTabsPage,
    StockAnalysisCustomPage
} from './pages/StockAnalysisPage';

import { initTheme } from './config/themeConfig';
import useAuth from './hooks/useAuth';
import './App.css';
import './assets/styles/theme.css';
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe('pk_test_51RFOTpCedU17Fc7wGrEfO14CXtqFurHULvCFQccgYf5DgPnJ9VIAOJw5RjWrlfgeXoHs6IVPqFqQDUfIRoOcii7K00cHFKj2Hy');


// ==========================
// Protected Route (User)
// ==========================
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, status } = useSelector(state => state.auth);
    const location = useLocation();

    console.log(`ProtectedRoute Check: Status=${status}, IsAuth=${isAuthenticated}`);

    // Show loader if status is 'loading' OR if 'idle' but authentication might still succeed (token exists)
    if (status === 'loading' || (status === 'idle' && isAuthenticated)) {
        console.log("ProtectedRoute: Auth status loading/idle (verification pending), showing loader.");
        return <Loader fullScreen text="Verifying Authentication..." />;
    }

    // If definitely not authenticated (after loading/idle check), redirect
    if (!isAuthenticated) {
        console.log("ProtectedRoute: Not authenticated, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated, render the requested component
    console.log("ProtectedRoute: Authenticated, rendering children.");
    return children;
};

// ==========================
// Admin Route
// ==========================
const AdminRoute = ({ children }) => {
    const { isAuthenticated, status, user } = useSelector(state => state.auth);
    const location = useLocation();

    console.log(`AdminRoute Check: Status=${status}, IsAuth=${isAuthenticated}, UserType=${user?.type}`);

    // Show loader if status is 'loading' OR if 'idle' but authentication might still succeed
    if (status === 'loading' || (status === 'idle' && isAuthenticated)) {
        console.log("AdminRoute: Auth status loading/idle (verification pending), showing loader.");
        return <Loader fullScreen text="Verifying Authentication..." />;
    }

    // If definitely not authenticated
    if (!isAuthenticated) {
        console.log("AdminRoute: Not authenticated, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated, now check role
    if (user?.type !== 'admin') {
        console.log("AdminRoute: User is authenticated but not admin, redirecting to user dashboard.");
        return <Navigate to="/dashboard" replace />; // Redirect non-admins
    }

    // Authenticated and is an admin
    console.log("AdminRoute: Authenticated and Admin, rendering children.");
    return children;
};

// ==========================
// Broker Route
// ==========================
const BrokerRoute = ({ children }) => {
    const { isAuthenticated, status, user } = useSelector(state => state.auth);
    const location = useLocation();

    console.log(`BrokerRoute Check: Status=${status}, IsAuth=${isAuthenticated}, UserType=${user?.type}`);

    // Show loader if status is 'loading' OR if 'idle' but authentication might still succeed
    if (status === 'loading' || (status === 'idle' && isAuthenticated)) {
        console.log("BrokerRoute: Auth status loading/idle (verification pending), showing loader.");
        return <Loader fullScreen text="Verifying Authentication..." />;
    }

    // If definitely not authenticated
    if (!isAuthenticated) {
        console.log("BrokerRoute: Not authenticated, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated, now check role
    if (user?.type !== 'broker') {
        console.log("BrokerRoute: User is authenticated but not broker, redirecting to user dashboard.");
        return <Navigate to="/dashboard" replace />; // Redirect non-brokers
    }

    // Authenticated and is a broker
    console.log("BrokerRoute: Authenticated and Broker, rendering children.");
    return children;
};

// --- Component for defining routes ---
const AppRoutes = () => {
    return (
        <div>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/broker-register" element={<BrokerRegisterPage />} />
                <Route path="/stocks/:symbol" element={<StockDetailPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                {/* Note: We don't need :token in the route for OTP */}
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* New Stock Analysis Pages */}
                <Route path="/stock-analysis" element={<StockAnalysisPage />} />
                <Route path="/stock-analysis/:symbol" element={<StockAnalysisPage />} />
                <Route path="/stock-tabs" element={<StockAnalysisTabsPage />} />
                <Route path="/stock-tabs/:symbol" element={<StockAnalysisTabsPage />} />
                <Route path="/stock-custom" element={<StockAnalysisCustomPage />} />
                <Route path="/stock-custom/:symbol" element={<StockAnalysisCustomPage />} />

                {/* Protected User Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/news"
                    element={
                        <ProtectedRoute>
                            <MarketOverview />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/stocks"
                    element={
                        <ProtectedRoute>
                            <StockListingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/watchlist"
                    element={
                        <ProtectedRoute>
                            <WatchlistPreview />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/portfolio"
                    element={
                        <ProtectedRoute>
                            <PortfolioSummary />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboardPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <UsersManagementPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/verify-users"
                    element={
                        <AdminRoute>
                            <UserVerificationPage />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/stocks"
                    element={
                        <AdminRoute>
                            <StocksManagementPage />
                        </AdminRoute>
                    }
                />

                {/* Broker Routes */}
                <Route
                    path="/broker/dashboard"
                    element={
                        <BrokerRoute>
                            <BrokerDashboardPage />
                        </BrokerRoute>
                    }
                />
                <Route
                    path="/broker/clients"
                    element={
                        <BrokerRoute>
                            <ClientsManagementPage />
                        </BrokerRoute>
                    }
                />
                <Route
                    path="/broker/transactions"
                    element={
                        <BrokerRoute>
                            <TransactionsPage />
                        </BrokerRoute>
                    }
                />

                {/* Redirect to admin dashboard if admin accesses /dashboard */}
                <Route
                    path="/admin"
                    element={<Navigate to="/admin/dashboard" replace />}
                />

                {/* Redirect to broker dashboard if broker accesses /broker */}
                <Route
                    path="/broker"
                    element={<Navigate to="/broker/dashboard" replace />}
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Chat />
        </div>
    );
};


const App = () => {

    const dispatch = useDispatch();
    // Select the token from the initial state to decide if verification is needed
    const token = useSelector(state => state.auth.token); // Read token directly


    // Initialize theme on app load
    useEffect(() => {
        // Call initTheme directly
        initTheme();
    }, []);

    // Verify authentication token on initial app load if a token exists
    useEffect(() => {
        if (token) {
            console.log("App Mount: Token exists in initial state, dispatching verifyAuth.");
            dispatch(verifyAuth());
        } else {
            console.log("App Mount: No token in initial state, skipping verification.");
            // No need to dispatch anything, initial state is already { isAuthenticated: false, status: 'idle' }
        }
        // Run only once on mount, or if dispatch/token changes (token shouldn't change here after init)
    }, [dispatch, token]); // Depend on token presence from initial state load

    return (

        <AuthProvider>
            <ThemeProvider>
                <AppRoutes />
            </ThemeProvider>
        </AuthProvider>
    );
};

export default App;

