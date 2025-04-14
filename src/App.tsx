import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { AgendamentoProvider } from './contexts/AgendamentoContext';
import { FinanceiroProvider } from './contexts/FinanceiroContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppProvider>
          <FinanceiroProvider>
            <AgendamentoProvider>
              <CurrencyProvider>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
              </CurrencyProvider>
            </AgendamentoProvider>
          </FinanceiroProvider>
        </AppProvider>
      </UserProvider>
      <ToastContainer />
    </AuthProvider>
  );
}