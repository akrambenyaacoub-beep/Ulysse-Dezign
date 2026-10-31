// src/pages/ClientLogin.jsx
import { useState } from 'react';
import { supabaseWeb } from '../lib/supabaseWeb';  // ← Changé: supabase → supabaseWeb
import { useNavigate, Link } from 'react-router-dom';

export default function ClientLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Vérifier dans la table web_clients
      const { data, error } = await supabaseWeb  // ← Changé: supabase → supabaseWeb
        .from('web_clients')
        .select('*')
        .eq('email', loginData.email)
        .eq('password', loginData.password)
        .maybeSingle();

      if (error || !data) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
        return;
      }

      // Stocker la session client
      sessionStorage.setItem('client_session', JSON.stringify({
        id: data.id,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        adresse: data.adresse
      }));

      navigate('/client/dashboard');
      
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a3a] via-[#0d1f3c] to-[#0a1628] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#1359A9] to-[#F0C75E] flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl font-bold font-['Playfair_Display']">UD</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-['Playfair_Display']">
            Espace <span className="text-[#F0C75E]">Client</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-[#0D1F3C]/80 backdrop-blur-sm border border-[#1A3A6B] rounded-xl p-6 md:p-8">
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full p-3 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Mot de passe</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full p-3 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E]"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0a1628] font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Pas encore de compte ?{' '}
                <Link to="/client/register" className="text-[#F0C75E] hover:underline">
                  Créer un compte
                </Link>
              </p>
              <Link to="/" className="text-gray-500 text-xs hover:text-[#F0C75E] transition block mt-3">
                ← Retour à l'accueil
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}