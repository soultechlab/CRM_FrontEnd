import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Mocked authentication check
    console.log('Mocked onAuthStateChange triggered');
    const event = 'SIGNED_IN'; // Simulated event
    if (event === 'SIGNED_IN') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Autenticando...</h2>
        <p className="text-gray-600">Por favor, aguarde.</p>
      </div>
    </div>
  );
}
