import React, { useState, useEffect, useRef } from "react";
import AppNavbar from "../components/common/Navbar";
import axios from "axios";
import WalletComponent from "../pages/WalletComponent";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, InputGroup } from 'react-bootstrap'; // <-- Added InputGroup here // Added Alert, Spinner, Badge
import Loader from '../components/common/Loader'; // Import Loader
import Footer from '../components/common/Footer'; // Import Footer
import PasswordStrengthMeter from '../components/common/PasswordStrengthMeter';

// --- Redux Imports ---
import { useDispatch, useSelector } from 'react-redux';
import {
    updateUserProfile,
    changeUserPassword,
    uploadProofDocument,
    clearProfileStatus // Action to clear specific profile status/errors
} from '../redux/features/authSlice';

import { API_URL } from '../config/constants';

const stripePromise = loadStripe(
    "pk_test_51RFOTpCedU17Fc7wGrEfO14CXtqFurHULvCFQccgYf5DgPnJ9VIAOJw5RjWrlfgeXoHs6IVPqFqQDUfIRoOcii7K00cHFKj2Hy"
);
const styles = {
    root: {
        "--primary": "#1E88E5",
        "--primary-light": "#90CAF9",
        "--secondary": "#00ACC1",
        "--secondary-light": "#80DEEA",
        "--accent": "#43A047",
        "--accent-light": "#A5D6A7",
        "--danger": "#E53935",
        "--danger-light": "#EF9A9A",
        "--warning": "#FFC107",
        "--neutral-bg": "#F9FAFB",
        "--card-bg": "#FFFFFF",
        "--text-primary": "#212121",
        "--text-secondary": "#757575",
        "--border": "#E0E0E0",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        backgroundColor: "var(--card-bg)",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
    },
    profileHeader: {
        background: "linear-gradient(120deg, var(--primary), var(--secondary))",
        height: "150px",
        borderRadius: "12px 12px 0 0",
    },
    profileImgContainer: {
        position: "relative",
        marginTop: "-75px",
        zIndex: 1,
    },
    profileImg: {
        width: "150px",
        height: "150px",
        border: "5px solid white",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
    },
    editAvatar: {
        position: "absolute",
        bottom: "0",
        right: "0",
        backgroundColor: "var(--primary)",
        border: "none",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        color: "white",
    },
    heading: {
        fontFamily: "'Poppins', sans-serif",
    },
    verifiedBadge: {
        backgroundColor: "var(--accent-light)",
        color: "var(--accent)",
        padding: "0.5em 0.8em",
        borderRadius: "6px",
        fontWeight: 500,
    },
    primaryBtn: {
        backgroundColor: "var(--primary)",
        borderColor: "var(--primary)",
        boxShadow: "0 2px 5px rgba(30, 136, 229, 0.2)",
        transition: "all 0.3s ease",
    },
    secondaryBtn: {
        backgroundColor: "var(--secondary)",
        borderColor: "var(--secondary)",
        boxShadow: "0 2px 5px rgba(0, 172, 193, 0.2)",
    },
    tabItem: {
        cursor: "pointer",
        padding: "1rem",
        borderRadius: "8px",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "rgba(30, 136, 229, 0.05)",
        },
    },
    activeTab: {
        backgroundColor: "var(--primary-light)",
        color: "var(--primary)",
    },
    formControl: {
        borderRadius: "8px",
        borderColor: "var(--border)",
        padding: "0.6rem 1rem",
    },
    formLabel: {
        color: "var(--text-secondary)",
        fontWeight: 500,
        marginBottom: "0.5rem",
    },
    documentPreview: {
        maxWidth: "100%",
        maxHeight: "200px",
        objectFit: "contain",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        backgroundColor: "#f8f9fa",
    },
};

function ProfileComponent() {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    // --- Select state from Redux store ---
    const {
        user, // Get user data directly from Redux
        status: authStatus, // General auth status
        profileUpdateStatus, profileUpdateError,
        passwordChangeStatus, passwordChangeError,
        documentUploadStatus, documentUploadError
    } = useSelector(state => state.auth);

    // --- Local State for UI Control and Forms ---
    const [activeSection, setActiveSection] = useState('personal');
    const [isEditing, setIsEditing] = useState(false);
    // Local state for the *editing* form, initialized from Redux state
    const [editFormData, setEditFormData] = useState({});
    // Local state for password change form
    const [passwordFormData, setPasswordFormData] = useState({
        currentPassword: '', newPassword: '', confirmPassword: ''
    });
    // Local state for document upload
    const [selectedFile, setSelectedFile] = useState(null);
    const [proofType, setProofType] = useState(''); // Local state for selection before upload

    // --- Initialize edit form data and proof type from Redux user state ---
    useEffect(() => {
        if (user) {
            console.log("user", user);
            
            console.log("imagePath",user.imagePath);
            
            if (isEditing) {
                // Populate edit form only when entering edit mode or if user changes
                if (!editFormData._id || editFormData._id !== user.id) {
                    setEditFormData({
                        _id: user.id, // Needed for update request
                        fullName: user.fullName || '',
                        email: user.email || '', // Usually email shouldn't be editable here
                        phone: user.phone || '',
                        address: user.address || '',
                    });
                }
            } else {
                setEditFormData({}); // Clear local edit state when not editing
            }
            // Always try to set proof type from Redux state
            setProofType(user.proofType || '');
        } else {
            // Handle case where user is somehow null after initial load (e.g., error during verifyAuth)
            setEditFormData({});
            setProofType('');
        }
    }, [user, isEditing]); // Rerun when user (from Redux) or edit mode changes

    // --- Clear specific profile errors on mount/unmount ---
    useEffect(() => {
        dispatch(clearProfileStatus());
        return () => {
            dispatch(clearProfileStatus());
        };
    }, [dispatch]);

    // --- Form Input Handlers ---
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
        if (profileUpdateError) dispatch(clearProfileStatus());
    };

    const handlePasswordFormChange = (e) => {
        const { name, value } = e.target;
        setPasswordFormData(prev => ({ ...prev, [name]: value }));
        if (passwordChangeError) dispatch(clearProfileStatus());
    };

    const handleProofTypeChange = (e) => {
        setProofType(e.target.value);
        setSelectedFile(null); // Reset file if type changes
        if (documentUploadError) dispatch(clearProfileStatus());
    };

    const handleFileSelection = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setSelectedFile(null); // Clear selection if user cancels
            return;
        }
        // Validation...
        if (file.size > 5 * 1024 * 1024) { alert("File size exceeds 5MB limit"); return; }
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) { alert("Invalid file type (JPG, PNG, JPEG only)."); return; }

        setSelectedFile(file);
        if (documentUploadError) dispatch(clearProfileStatus());

        // --- Trigger upload immediately after selection ---
        // Optional: You could have a separate "Upload" button appear instead
        handleDocumentUpload(file);
    };

    const handleSelectFileClick = () => {
        if (!proofType) {
            alert("Please select a document type first.");
            return;
        }
        // Clear any previously selected file before opening dialog
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset the input value
            fileInputRef.current.click();
        }
    };

    // --- Action Handlers ---
    const toggleEdit = () => {
        setIsEditing(!isEditing);
        dispatch(clearProfileStatus()); // Clear errors when toggling edit mode
    };

    const showToast = (message, type = 'success') => {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
          toastContainer = document.createElement('div');
          toastContainer.id = 'toast-container';
          toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
          document.body.appendChild(toastContainer);
        }
        
        const toastElement = document.createElement('div');
        toastElement.className = `toast-${type} show`;
        toastElement.innerHTML = `
          <div class="toast-icon"><i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i></div>
          <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toastElement);
        
        setTimeout(() => {
          toastElement.classList.add('toast-fade-out');
          setTimeout(() => {
            toastContainer.removeChild(toastElement);
          }, 300);
        }, 3000);
      };

    const saveChanges = () => { // Removed async, handled by thunk
        console.log('Dispatching updateUserProfile with:', editFormData);
        dispatch(updateUserProfile(editFormData))
            .unwrap()
            .then(() => {
                alert("Profile updated successfully!");
                setIsEditing(false); // Exit edit mode on success
            })
            .catch((err) => {
                console.error("Profile update failed in component:", err);
                // Error state is already set in Redux (profileUpdateError)
                // Alert is handled by the Alert component reading Redux state
            });
    };

    const handlePasswordChangeSubmit = (e) => { // Removed async
        e.preventDefault();
        if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
            dispatch(clearProfileStatus()); // Clear previous status first
            // Set error directly (or create a dedicated sync action)
            dispatch({ type: 'auth/changeUserPassword/rejected', payload: "New passwords do not match." });
            return;
        }
        console.log('Dispatching changeUserPassword');
        dispatch(changeUserPassword(passwordFormData))
            .unwrap()
            .then((message) => {
                alert(message || "Password changed successfully!");
                setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form
            })
            .catch((err) => {
                console.error("Password change failed in component:", err);
                // Error state (passwordChangeError) is set by the rejected thunk
            });
    };

    const handleDocumentUpload = (fileToUpload) => {
        if (!fileToUpload) {
            console.error("Upload handler called without a file.");
            return;
        }
        if (!proofType) { // Double check type
            alert("Please select the document type.");
            return;
        }

        console.log("Profile.jsx: User state before creating FormData:", user.id); // <-- ADD THIS LOG

        if (!user || !user.id) { // <-- ADD THIS CHECK
            console.error("Upload Error: User ID is missing in Redux state!");
            alert("Could not upload document: User information is missing. Please refresh.");
            return;
        }

        const formData = new FormData();
        formData.append("proof", fileToUpload); // Use the passed file
        formData.append("userId", user.id);
        formData.append("proofType", proofType);

        console.log('Dispatching uploadProofDocument');
        dispatch(uploadProofDocument({ formData }))
            .unwrap()
            .then((payload) => {
                alert(payload.message || "Document uploaded successfully! It will be reviewed.");
                setSelectedFile(null); // Clear file selection on success
                // User state updated by reducer
            })
            .catch((err) => {
                console.error("Document upload failed in component:", err);
                setSelectedFile(null); // Clear file selection on error too
                // Error state set by reducer
            });
    };

    // --- Verification Badge Logic (using Redux user state) ---
    const getVerificationStatusBadge = () => {
        if (!user) return null;
        const status = user.verified || 'pending';
        // ... (badge logic remains the same as before) ...
        switch (status) {
            case 'approved': return <Badge bg="success" style={styles.verifiedBadge}><i className="bi bi-check-circle-fill me-1"></i> Approved</Badge>;
            case 'rejected': return <Badge bg="danger" style={styles.verifiedBadge}><i className="bi bi-x-circle-fill me-1"></i> Rejected</Badge>;
            case 'pending': default: return <Badge bg="warning" text="dark" style={styles.verifiedBadge}><i className="bi bi-hourglass-split me-1"></i> Pending Verification</Badge>;
        }
    };

    // --- Render Logic ---
    // Use general authStatus for initial page load check
    if (authStatus === 'loading' || authStatus === 'idle' || !user) {
        return (
            <>
                <AppNavbar />
                <Loader fullScreen text="Loading Profile..." />
                <Footer />
            </>
        );
    }

    // Derive specific loading states for buttons/disabling inputs
    const isSavingProfile = profileUpdateStatus === 'loading';
    const isChangingPassword = passwordChangeStatus === 'loading';
    const isUploadingDocument = documentUploadStatus === 'loading';

    return (
        <div style={{ backgroundColor: 'var(--neutral-bg)' }}>
            <AppNavbar />
            <div style={styles.root} className="container py-5">
                <Row>
                    {/* Left Column */}
                    <Col lg={4} className="mb-4">
                        {/* Profile Card */}
                        <Card style={styles.card} className="mb-4 shadow-sm">
                            <div style={styles.profileHeader}></div>
                            <Card.Body className="text-center pt-0">
                                {/* Profile Image */}
                                <div style={styles.profileImgContainer} className="d-inline-block">
                                    <img src={user.imagePath || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=random`} className="rounded-circle" alt="Profile" style={styles.profileImg} />
                                    <Button style={styles.editAvatar} title="Change Profile Picture" size="sm" disabled> {/* TODO: Implement upload */}
                                        <i className="bi bi-camera-fill"></i>
                                    </Button>
                                </div>
                                {/* Name, Address, Status */}
                                <h4 style={styles.heading} className="mt-3 mb-1">{user.fullName}</h4>
                                <p className="text-secondary mb-2">
                                    {user.address ? <><i className="bi bi-geo-alt-fill me-1"></i>{user.address}</> : "Address not set"}
                                </p>
                                <div className="mb-3">{getVerificationStatusBadge()}</div>
                                {/* Edit/Save Buttons */}
                                <div className="d-grid gap-2">
                                    {!isEditing ? (
                                        <Button variant="primary" style={styles.primaryBtn} onClick={toggleEdit} disabled={isSavingProfile}>
                                            <i className="bi bi-pencil-fill me-2"></i>Edit Profile
                                        </Button>
                                    ) : (
                                        <Button variant="success" style={{ ...styles.primaryBtn, backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={saveChanges} disabled={isSavingProfile}>
                                            {isSavingProfile ? <><Spinner size="sm" className="me-2" />Saving...</> : <><i className="bi bi-check-lg me-1"></i>Save Changes</>}
                                        </Button>
                                    )}
                                    {isEditing && (
                                        <Button variant="outline-secondary" onClick={toggleEdit} disabled={isSavingProfile}>Cancel</Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Navigation Tabs */}
                        <Card style={styles.card} className="shadow-sm">
                            <div className="card-body p-4">
                                <h5 style={styles.heading} className="mb-3">Profile Management</h5>

                                {/* Personal Info Tab */}
                                <div
                                    style={{ ...styles.tabItem, ...(activeSection === 'personal' ? styles.activeTab : {}) }}
                                    className="mb-2 d-flex align-items-center"
                                    onClick={() => setActiveSection('personal')}
                                >
                                    <i className="bi bi-person-fill me-3 fs-5"></i>
                                    <div>
                                        <h6 className="mb-0" style={styles.heading}>Personal Info</h6>
                                        <small className="text-secondary">Manage your details</small>
                                    </div>
                                </div>

                                {/* Security Tab */}
                                <div
                                    style={{ ...styles.tabItem, ...(activeSection === 'security' ? styles.activeTab : {}) }}
                                    className="mb-2 d-flex align-items-center"
                                    onClick={() => setActiveSection('security')}
                                >
                                    <i className="bi bi-shield-lock-fill me-3 fs-5"></i>
                                    <div>
                                        <h6 className="mb-0" style={styles.heading}>Security</h6>
                                        <small className="text-secondary">Update password</small>
                                    </div>
                                </div>

                                {/* Wallet Tab */}
                                <div
                                    style={{ ...styles.tabItem, ...(activeSection === 'wallet' ? styles.activeTab : {}) }}
                                    className="mb-2 d-flex align-items-center"
                                    onClick={() => setActiveSection('wallet')}
                                >
                                    <i className="bi bi-wallet2 me-3 fs-5"></i>
                                    <div>
                                        <h6 className="mb-0" style={styles.heading}>Wallet</h6>
                                        <small className="text-secondary">Manage your funds</small>
                                    </div>
                                </div>

                                {/* Documents Tab */}
                                <div
                                    style={{ ...styles.tabItem, ...(activeSection === 'documents' ? styles.activeTab : {}) }}
                                    className="mb-2 d-flex align-items-center"
                                    onClick={() => setActiveSection('documents')}
                                >
                                    <i className="bi bi-file-earmark-text-fill me-3 fs-5"></i>
                                    <div>
                                        <h6 className="mb-0" style={styles.heading}>Documents</h6>
                                        <small className="text-secondary">Upload verification</small>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Right Column */}
                    <Col lg={8}>
                        {/* Personal Information Section */}
                        {activeSection === 'personal' && (
                            <Card style={styles.card} className="mb-4 shadow-sm">
                                <Card.Body className="p-4">
                                    {/* Section Header */}
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 style={styles.heading} className="card-title mb-0"><i className="bi bi-person-fill me-2 text-primary"></i>Personal Information</h4>
                                        {/* Add Edit/Save Button Logic Here */}
                                        {!isEditing ? (
                                            <Button
                                                variant="outline-primary" // Use outline for edit
                                                size="sm"
                                                className="rounded-pill px-3"
                                                onClick={toggleEdit}
                                                disabled={isSavingProfile} // Disable if any profile save is in progress
                                            >
                                                <i className="bi bi-pencil-fill me-1"></i>
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="d-flex gap-2"> {/* Group Save/Cancel */}
                                                <Button
                                                    variant="success" // Use success for save
                                                    size="sm"
                                                    className="rounded-pill px-3"
                                                    onClick={saveChanges}
                                                    disabled={isSavingProfile} // Disable while saving
                                                >
                                                    {isSavingProfile ? (
                                                        <>
                                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <><i className="bi bi-check-lg me-1"></i>Save</>
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="outline-secondary" // Cancel button
                                                    size="sm"
                                                    className="rounded-pill px-3"
                                                    onClick={toggleEdit} // Calls toggleEdit to exit editing mode
                                                    disabled={isSavingProfile} // Disable while saving
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Profile Update Error Alert */}
                                    {profileUpdateError && <Alert variant="danger" dismissible onClose={() => dispatch(clearProfileStatus())}><i className="bi bi-exclamation-triangle-fill me-2"></i>{profileUpdateError}</Alert>}
                                    {/* Form using editFormData when editing, or user data when viewing */}
                                    <Form>
                                        <Row className="g-3 mb-3">
                                            <Col md={12}> {/* Full Name */}
                                                <Form.Group controlId="displayFullName">
                                                    <Form.Label style={styles.formLabel}>Full Name</Form.Label>
                                                    <Form.Control type="text" name="fullName"
                                                        value={isEditing ? editFormData.fullName : user.fullName}
                                                        onChange={handleEditFormChange} disabled={!isEditing || isSavingProfile} style={styles.formControl} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className="g-3 mb-3">
                                            <Col md={6}> {/* Email */}
                                                <Form.Group controlId="displayEmail">
                                                    <Form.Label style={styles.formLabel}>Email Address</Form.Label>
                                                    <InputGroup><InputGroup.Text><i className="bi bi-envelope"></i></InputGroup.Text>
                                                        <Form.Control type="email" name="email"
                                                            value={isEditing ? editFormData.email : user.email}
                                                            onChange={handleEditFormChange} disabled={!isEditing || isSavingProfile} style={styles.formControl} />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}> {/* Phone */}
                                                <Form.Group controlId="displayPhone">
                                                    <Form.Label style={styles.formLabel}>Phone Number</Form.Label>
                                                    <InputGroup><InputGroup.Text><i className="bi bi-telephone"></i></InputGroup.Text>
                                                        <Form.Control type="tel" name="phone"
                                                            value={isEditing ? editFormData.phone : user.phone || ''}
                                                            onChange={handleEditFormChange} disabled={!isEditing || isSavingProfile} style={styles.formControl} />
                                                    </InputGroup>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        {/* Address */}
                                        <Form.Group className="mb-3" controlId="displayAddress">
                                            <Form.Label style={styles.formLabel}>Address</Form.Label>
                                            <InputGroup><InputGroup.Text><i className="bi bi-geo-alt"></i></InputGroup.Text>
                                                <Form.Control as="textarea" name="address" rows={3}
                                                    value={isEditing ? editFormData.address : user.address || ''}
                                                    onChange={handleEditFormChange} disabled={!isEditing || isSavingProfile} style={styles.formControl} />
                                            </InputGroup>
                                        </Form.Group>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <Card style={styles.card} className="mb-4 shadow-sm">
                                <Card.Body className="p-4">
                                    <h4 style={styles.heading} className="card-title mb-4"><i className="bi bi-shield-lock-fill me-2 text-primary"></i>Change Password</h4>
                                    {/* Password Change Error/Success Alerts */}
                                    {passwordChangeError && <Alert variant="danger" dismissible onClose={() => dispatch(clearProfileStatus())}><i className="bi bi-exclamation-triangle-fill me-2"></i>{passwordChangeError}</Alert>}
                                    {passwordChangeStatus === 'succeeded' && <Alert variant="success" dismissible onClose={() => dispatch(clearProfileStatus())}><i className="bi bi-check-circle-fill me-2"></i>Password updated successfully!</Alert>}
                                    {/* Password Change Form */}
                                    <Form onSubmit={handlePasswordChangeSubmit}>
                                        {/* Current Password */}
                                        <Form.Group className="mb-3" controlId="currentPassword"><Form.Label style={styles.formLabel}>Current Password</Form.Label><InputGroup><InputGroup.Text><i className="bi bi-key"></i></InputGroup.Text><Form.Control type="password" name="currentPassword" value={passwordFormData.currentPassword} onChange={handlePasswordFormChange} style={styles.formControl} required disabled={isChangingPassword} /></InputGroup></Form.Group>
                                        {/* New Password */}
                                        <Form.Group className="mb-3" controlId="newPassword"><Form.Label style={styles.formLabel}>New Password</Form.Label><InputGroup><InputGroup.Text><i className="bi bi-lock"></i></InputGroup.Text><Form.Control type="password" name="newPassword" value={passwordFormData.newPassword} onChange={handlePasswordFormChange} style={styles.formControl} required disabled={isChangingPassword} /></InputGroup><PasswordStrengthMeter password={passwordFormData.newPassword} /><Form.Text className="text-muted">Min 8 chars, upper, lower, number, symbol.</Form.Text></Form.Group>
                                        {/* Confirm New Password */}
                                        <Form.Group className="mb-4" controlId="confirmPassword"><Form.Label style={styles.formLabel}>Confirm New Password</Form.Label><InputGroup><InputGroup.Text><i className="bi bi-lock-fill"></i></InputGroup.Text><Form.Control type="password" name="confirmPassword" value={passwordFormData.confirmPassword} onChange={handlePasswordFormChange} style={styles.formControl} required disabled={isChangingPassword} /></InputGroup></Form.Group>
                                        {/* Submit Button */}
                                        <Button type="submit" variant="primary" style={styles.primaryBtn} disabled={isChangingPassword}>
                                            {isChangingPassword ? <><Spinner size="sm" className="me-2" />Updating...</> : <><i className="bi bi-check-circle me-2"></i>Update Password</>}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        )}

                        {/* Wallet Section (Keep as is, uses Stripe Elements) */}
                        {activeSection === 'wallet' && (
                            <Elements stripe={stripePromise}>
                                <WalletComponent onClose={() => setActiveSection('personal')} />
                            </Elements>
                        )}

                        {/* Documents Section */}
                        {activeSection === 'documents' && (
                            <Card style={styles.card} className="mb-4 shadow-sm">
                                <Card.Body className="p-4">
                                    <h4 style={styles.heading} className="card-title mb-4"><i className="bi bi-file-earmark-text-fill me-2 text-primary"></i>Verification Documents</h4>
                                    {/* Document Upload Error/Success Alerts */}
                                    {documentUploadError && <Alert variant="danger" dismissible onClose={() => dispatch(clearProfileStatus())}><i className="bi bi-exclamation-triangle-fill me-2"></i>{documentUploadError}</Alert>}
                                    {documentUploadStatus === 'succeeded' && <Alert variant="success" dismissible onClose={() => dispatch(clearProfileStatus())}><i className="bi bi-check-circle-fill me-2"></i>Document uploaded successfully! Status set to Pending.</Alert>}
                                    {/* Document Display and Upload Form */}
                                    <Row className="mb-4">
                                        {/* Existing Document Display Section */}
                                        {user.proof && ( // Conditionally render this block only if user.proof has a value
                                            <Col md={6} className="mb-3">
                                                <Card className="h-100 shadow-sm"> {/* Added shadow */}
                                                    <Card.Body>
                                                        {/* Header */}
                                                        <div className="d-flex align-items-center mb-3 pb-3 border-bottom">
                                                            <div
                                                                className="me-3 flex-shrink-0"
                                                                style={{
                                                                    width: '45px',
                                                                    height: '45px',
                                                                    backgroundColor: 'rgba(30, 136, 229, 0.1)', // Use theme variable if preferred
                                                                    borderRadius: '8px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                }}
                                                            >
                                                                {/* Choose icon based on file type if possible, default to text */}
                                                                <i className={`bi ${user.proof.endsWith('.pdf') ? 'bi-file-earmark-pdf' : 'bi-file-earmark-image'} fs-4 text-primary`}></i>
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-semibold">Uploaded Verification Document</h6>
                                                                <small className="text-secondary text-capitalize">
                                                                    {user.proofType || 'Document'} {/* Display proofType */}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        {/* Document Preview */}
                                                        {/* Attempt to show image preview, provide fallback message for non-images like PDF */}
                                                        <div className="text-center mb-3 document-preview-container">
                                                            <img
                                                                // Construct the full URL to the image on the backend server
                                                                src={`${API_URL || 'http://localhost:3000'}/images/${user.proof}`}
                                                                alt="Document Preview"
                                                                style={styles.documentPreview} // Use your defined styles
                                                                // Add error handling for non-image files or load failures
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none'; // Hide the broken image icon
                                                                    const parent = e.target.parentNode;
                                                                    // Avoid adding multiple fallbacks if already present
                                                                    if (!parent.querySelector('.preview-fallback')) {
                                                                        const fallbackElement = document.createElement('div');
                                                                        fallbackElement.className = 'preview-fallback p-4 text-center'; // Add class for potential future targeting
                                                                        fallbackElement.style = "border: 1px dashed var(--border); border-radius: 8px; background-color: rgba(0,0,0,0.02);";
                                                                        fallbackElement.innerHTML = `
                                    <i class="bi bi-eye-slash fs-1 text-secondary"></i>
                                    <p class="mt-2 mb-0 small text-secondary">Preview not available for this file type.</p>
                                `;
                                                                        parent.appendChild(fallbackElement);
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Status Badge and View Button */}
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            {getVerificationStatusBadge()} {/* Use the existing function */}
                                                            <Button
                                                                variant="outline-primary" // Changed variant for better visibility
                                                                size="sm"
                                                                // Construct the full URL for viewing/downloading
                                                                onClick={() => window.open(`${API_URL || 'http://localhost:3000'}/images/${user.proof}`, '_blank')}
                                                                title="View Full Document"
                                                            >
                                                                <i className="bi bi-eye me-1"></i>
                                                                View
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        )}
                                        {/* Upload Form */}
                                        <Col md={user.proof ? 6 : 12} className="mb-3">
                                            <Card className="h-100 border-dashed" style={{ borderStyle: 'dashed', borderColor: 'var(--border)' }}>
                                                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                                                    {/* ... Upload Icon, Title, Help Text ... */}
                                                    <div style={{/* icon styles */ }}><i className="bi bi-upload fs-4 text-primary"></i></div>
                                                    <h6 style={styles.heading}>{user.proof ? "Update" : "Upload"} Document</h6>
                                                    <p className="text-secondary small mb-3">Supports PDF, JPG, PNG (Max: 5MB).</p>

                                                    {/* Document Type Selection */}
                                                    <Form.Group className="mb-3 w-100">
                                                        <Form.Label style={styles.formLabel}>Document Type</Form.Label>
                                                        <Form.Select value={proofType} onChange={handleProofTypeChange} style={styles.formControl} disabled={isUploadingDocument}>
                                                            <option value="">-- Select Type --</option>
                                                            <option value="driving license">Driver's License</option>
                                                            <option value="passport">Passport</option>
                                                        </Form.Select>
                                                    </Form.Group>

                                                    {/* Status Messages */}
                                                    {documentUploadStatus === 'succeeded' && <Alert variant="success" className="w-100 py-2"><i className="bi bi-check-circle me-2"></i>Document uploaded successfully!</Alert>}
                                                    {documentUploadError && <Alert variant="danger" className="w-100 py-2"><i className="bi bi-exclamation-triangle me-2"></i>{documentUploadError}</Alert>}

                                                    {/* Display Selected File Name */}
                                                    {selectedFile && !isUploadingDocument && <p className="small text-muted mb-2">Selected: {selectedFile.name}</p>}

                                                    {/* Hidden File Input */}
                                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileSelection} />

                                                    {/* Button to Trigger File Selection */}
                                                    <Button
                                                        variant="primary"
                                                        style={styles.primaryBtn}
                                                        onClick={handleSelectFileClick} // <-- Calls function to click hidden input
                                                        disabled={isUploadingDocument || !proofType} // <-- Disabled only if uploading or no type selected
                                                    >
                                                        {isUploadingDocument ? (
                                                            <>
                                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="bi bi-paperclip me-2"></i> {/* Changed Icon */}
                                                                {user.proof ? "Select New Document" : "Select Document"}
                                                            </>
                                                        )}
                                                    </Button>
                                                    {/* Removed the old button that tried to do the upload directly */}

                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    {/* Info/Help Text Alerts (keep as is) */}
                                    <Alert variant="info" className="mt-3"><i className="bi bi-info-circle me-2"></i>Document verification helps secure your account...</Alert>
                                    {user.verified === "rejected" && <Alert variant="danger" className="mt-3"><i className="bi bi-exclamation-triangle me-2"></i>Your previous document was rejected...</Alert>}
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </div>
            <Footer /> {/* Add Footer */}
        </div>
    );
}

export default ProfileComponent;
