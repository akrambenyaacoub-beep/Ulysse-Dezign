// src/pages/ClientRegister.jsx
import { useState } from 'react';
import { supabaseWeb } from '../lib/supabaseWeb';  // ← Changé
import { useNavigate, Link } from 'react-router-dom';

export default function ClientRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    telephone: '',
    adresse: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (!formData.telephone) {
      setError('Le numéro de téléphone est obligatoire');
      setLoading(false);
      return;
    }

    try {
      // Vérifier si l'email existe déjà
      const { data: existing } = await supabaseWeb  // ← Changé
        .from('web_clients')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle();

      if (existing) {
        setError('Cet email est déjà utilisé');
        setLoading(false);
        return;
      }

      // Créer le client
      const { error: insertError } = await supabaseWeb  // ← Changé
        .from('web_clients')
        .insert([{
          email: formData.email,
          password: formData.password,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          adresse: formData.adresse || null
        }]);

      if (insertError) {
        console.error('Erreur insertion:', insertError);
        setError('Erreur lors de l\'inscription');
        setLoading(false);
        return;
      }

      alert('✅ Inscription réussie ! Connectez-vous maintenant.');
      navigate('/client/login');
      
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'inscription');
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
            Créer un <span className="text-[#F0C75E]">compte</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Inscrivez-vous pour passer commande</p>
        </div>

        <div className="bg-[#0D1F3C]/80 backdrop-blur-sm border border-[#1A3A6B] rounded-xl p-6 md:p-8">
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Téléphone *</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+216 XX XXX XXX"
                className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Mot de passe *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Confirmer *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1">Adresse</label>
              <textarea
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-lg bg-[#0A1628] border border-[#1A3A6B] text-white text-sm"
                placeholder="Votre adresse complète..."
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 p-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#F0C75E] to-[#d4aa3a] text-[#0a1628] font-bold hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>

            <div className="text-center pt-3">
              <Link to="/client/login" className="text-[#F0C75E] text-sm hover:underline">
                Déjà un compte ? Se connecter
              </Link>
              <br />
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