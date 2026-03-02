// src/components/common/Sidebar.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    
    // IMPORTANT: Strictly check for string "approved" since your schema uses string values
    const isApproved = user?.verified === "approved";
    
    useEffect(() => {
        // Debug logging to troubleshoot verification issues
        console.log("Sidebar - User verification value:", user?.verified);
        console.log("Sidebar - Type of verified value:", typeof user?.verified);
        console.log("Sidebar - Is approved:", isApproved);
    }, [user, isApproved]);
    
    const handleVerificationRequired = (e) => {
        e.preventDefault();
        if (user?.verified === "rejected") {
            alert("Your account verification was rejected. Please contact support for assistance.");
        } else {
            alert("Your account is pending verification. This feature will be available once your account is approved.");
        }
        navigate('/profile');
    };

    return (
        <div className="sidebar">
            <Link to="/dashboard" className="sidebar-item">
                <i className="bi bi-speedometer2 me-2"></i> Dashboard
            </Link>
            
            {isApproved ? (
                <Link to="/portfolio" className="sidebar-item">
                    <i className="bi bi-briefcase me-2"></i> Portfolio
                </Link>
            ) : (
                <a href="#" className="sidebar-item disabled" onClick={handleVerificationRequired}>
                    <i className="bi bi-briefcase me-2"></i> Portfolio <i className="bi bi-lock-fill ms-2 small"></i>
                </a>
            )}
            
            {isApproved ? (
                <Link to="/watchlist" className="sidebar-item">
                    <i className="bi bi-star me-2"></i> Watchlist
                </Link>
            ) : (
                <a href="#" className="sidebar-item disabled" onClick={handleVerificationRequired}>
                    <i className="bi bi-star me-2"></i> Watchlist <i className="bi bi-lock-fill ms-2 small"></i>
                </a>
            )}
            
            <Link to="/transactions" className="sidebar-item">
                <i className="bi bi-arrow-left-right me-2"></i> Transactions
            </Link>
            
            <Link to="/profile" className="sidebar-item">
                <i className="bi bi-person me-2"></i> Profile
            </Link>
            
            {!isApproved && (
                <Link to="/profile" className="sidebar-item text-warning">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> 
                    {user?.verified === "rejected" ? 'Verification Rejected' : 'Complete Verification'}
                </Link>
            )}
            
            <Link to="/logout" className="sidebar-item">
                <i className="bi bi-box-arrow-right me-2"></i> Logout
            </Link>
        </div>
    );
};

export default Sidebar;