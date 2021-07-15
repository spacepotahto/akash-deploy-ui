import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import '@fontsource/roboto';
import { AccountProvider } from './utils/AccountContext';
import { App } from './components/App';

import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import deepOrange from '@material-ui/core/colors/deepOrange';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
    secondary: {
      main: deepOrange[900],
    },
  },
});

// Ensure Keplr is attached to window before app loads.
// https://docs.keplr.app/api/#how-to-detect-keplr suggests
// readyState "complete", so we can render on "load" to achieve
// the same effect.
window.addEventListener('load', (event) => {
  ReactDOM.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <AccountProvider>
          <App />
        </AccountProvider>
      </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
});