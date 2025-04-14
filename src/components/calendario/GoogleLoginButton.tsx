import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { atualizarUsuarioTokenGoogle } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';

const GoogleLoginButton = () => {
  const { user } = useAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const requestAccessToken = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/calendar",
      callback: (response: any) => {
        if (response.error) {
          console.error("Erro ao obter access token:", response);
          return;
        }
        const tokenData = {
          access_token: response.access_token,
          expires_in: response.expires_in,
          created: Math.floor(Date.now() / 1000)
        };
        atualizarUsuarioTokenGoogle(JSON.stringify(tokenData), user);
      },
    });
    tokenClient.requestAccessToken();
  };


  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // Ignora o credentialResponse (que é o ID token) e solicita o access token
          requestAccessToken();
        }}
        onError={() => console.log('Erro no login')}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
