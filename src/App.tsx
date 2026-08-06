import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Stock } from './pages/Stock';
import { Depots } from './pages/Depots';
import { Categories } from './pages/Categories';
import { MobileViewProvider } from './contexts/MobileViewContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <MobileViewProvider>
          <Navigation>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/depots" element={<Depots />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </Navigation>
        </MobileViewProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App
