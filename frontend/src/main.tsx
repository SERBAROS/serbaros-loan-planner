import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './presentation/context/AuthContext';
import { ThemeProvider } from './presentation/context/ThemeContext';
import MuiThemeBridge from './presentation/MuiThemeBridge';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <MuiThemeBridge>
            <App />
          </MuiThemeBridge>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
