// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
// --- Redux Imports ---
import { Provider } from 'react-redux';
import { store } from './redux/store.js';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <Provider store={store}>
                <GoogleOAuthProvider clientId="935511845410-e7prvkk36f4m0e75e7vd5qutlp7h31pv.apps.googleusercontent.com">
                    <App />
                </GoogleOAuthProvider>
            </Provider>
        </Router>
    </React.StrictMode>,
);