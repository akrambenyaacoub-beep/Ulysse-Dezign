// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabaseErp } from '../lib/supabaseErp';
import { useAuth } from '../hooks/useAuth';
import { showAlert } from '../components/AlertModal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { simpleLogin, supabaseLogin, user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ 1. ESSAYER LE LOGIN SIMPLE (via erp_profiles)
      const simpleResult = await simpleLogin(email, password);
      
      if (simpleResult.success) {
        showAlert('success', '✅ Connexion réussie !');
        navigate('/dashboard');
        setLoading(false);
        return;
      }

      // ✅ 2. ESSAYER SUPABASE AUTH (fallback)
      const supabaseResult = await supabaseLogin(email, password);
      
      if (supabaseResult.success) {
        showAlert('success', '✅ Connexion réussie !');
        navigate('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
      }

    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      showAlert('error', '❌ Veuillez entrer votre email');
      return;
    }

    try {
      const { error } = await supabaseErp.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;
      showAlert('success', '📧 Email de réinitialisation envoyé !');
    } catch (err) {
      console.error('❌ Erreur réinitialisation:', err);
      showAlert('error', '❌ ' + err.message);
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
            Espace <span className="text-[#F0C75E]">Équipage</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Connectez-vous à votre espace de travail</p>
        </div>

        <div className="bg-[#0D1F3C]/80 backdrop-blur-sm border border-[#1A3A6B] rounded-xl p-6 md:p-8">
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email professionnel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E] transition"
                placeholder="nom@ulyssedezign.tn"
                required
                autoComplete="email"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white focus:outline-none focus:border-[#F0C75E] transition"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                💡 Mot de passe par défaut : <span className="text-[#F0C75E]">Ulysse2026!</span>
              </span>
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-[#F0C75E] hover:underline transition"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0a1628] font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#0a1628]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>

            <div className="text-center pt-4">
              <Link to="/" className="text-gray-500 text-sm hover:text-[#F0C75E] transition block">
                ← Retour à l'accueil
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">Espace réservé aux employés d'Ulysse DeZign</p>
          <p className="text-gray-600 text-xs mt-1">🔐 Connexion via ERP ou Supabase Auth</p>
        </div>
      </div>
    </div>
  );
}