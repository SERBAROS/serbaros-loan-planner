import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './presentation/context/AuthContext';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { CookieConsentProvider } from './presentation/context/CookieConsentContext';
import { LegalDialogsProvider } from './presentation/context/LegalDialogsContext';
import MuiThemeBridge from './presentation/MuiThemeBridge';
import CookieConsentBanner from './presentation/components/CookieConsentBanner';
import LegalDialogs from './presentation/components/LegalDialogs';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <MuiThemeBridge>
            <LegalDialogsProvider>
              <CookieConsentProvider>
                <App />
                <CookieConsentBanner />
                <LegalDialogs />
              </CookieConsentProvider>
            </LegalDialogsProvider>
          </MuiThemeBridge>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
