// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabaseErp } from '../lib/supabaseErp';

const AuthContext = createContext(null);

// ✅ Hook personnalisé - exporté nommé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // =====================================================
  // 1. RECHERCHER UN UTILISATEUR PAR EMAIL
  // =====================================================
  const findUserByEmail = async (email) => {
    try {
      const { data, error } = await supabaseErp
        .from('erp_profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur recherche utilisateur:', error);
      return null;
    }
  };

  // =====================================================
  // 2. RÉCUPÉRATION DU PROFIL
  // =====================================================
  const fetchProfile = async (userId) => {
    if (!userId) return null;
    
    try {
      const { data, error } = await supabaseErp
        .from('erp_profiles')
        .select('id, full_name, role, email, telephone')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur récupération profil:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('❌ Erreur fetchProfile:', err);
      return null;
    }
  };

  // =====================================================
  // 3. CRÉER UN PROFIL PAR DÉFAUT
  // =====================================================
  const createDefaultProfile = async (user) => {
    try {
      const fullName = user?.user_metadata?.full_name || 
                       user?.user_metadata?.name || 
                       user?.email?.split('@')[0] || 
                       'Utilisateur';

      const defaultProfile = {
        id: user.id,
        full_name: fullName,
        email: user.email,
        role: 'user',
        password_hash: 'Ulysse2026!',
        can_login: true,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseErp
        .from('erp_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log('⚠️ Profil déjà existant, récupération...');
          return await fetchProfile(user.id);
        }
        throw error;
      }
      
      console.log('✅ Profil créé:', data.full_name);
      return data;
    } catch (err) {
      console.error('❌ Erreur création profil:', err);
      return null;
    }
  };

  // =====================================================
  // 4. LOGIN SIMPLE (via erp_profiles)
  // =====================================================
  const simpleLogin = async (email, password) => {
    try {
      console.log('🔐 [useAuth] Tentative de login simple pour:', email);

      const userData = await findUserByEmail(email);
      
      if (!userData) {
        return { success: false, error: 'Email non trouvé' };
      }

      if (userData.can_login === false) {
        return { success: false, error: 'Compte désactivé. Contactez l\'administrateur.' };
      }

      if (userData.password_hash && userData.password_hash !== password) {
        return { success: false, error: 'Mot de passe incorrect' };
      }

      if (!userData.password_hash) {
        const defaultPassword = 'Ulysse2026!';
        await supabaseErp
          .from('erp_profiles')
          .update({ 
            password_hash: defaultPassword,
            can_login: true 
          })
          .eq('id', userData.id);
      }

      await supabaseErp
        .from('erp_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      const userProfile = {
        id: userData.id,
        full_name: userData.full_name,
        email: userData.email,
        role: userData.role,
        telephone: userData.telephone
      };

      setUser(userProfile);
      setProfile(userProfile);
      localStorage.setItem('app_user', JSON.stringify(userProfile));

      console.log('✅ [useAuth] Login simple réussi pour:', email);
      return { success: true, user: userProfile };

    } catch (error) {
      console.error('❌ [useAuth] Erreur login simple:', error);
      return { success: false, error: error.message || 'Erreur de connexion' };
    }
  };

  // =====================================================
  // 5. LOGIN SUPABASE AUTH
  // =====================================================
  const supabaseLogin = async (email, password) => {
    try {
      console.log('🔐 [useAuth] Tentative de login Supabase pour:', email);

      const { data, error } = await supabaseErp.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        const profileData = await fetchProfile(data.user.id);
        if (profileData) {
          setProfile(profileData);
          localStorage.setItem('app_user', JSON.stringify(profileData));
        } else {
          const newProfile = await createDefaultProfile(data.user);
          if (newProfile) {
            setProfile(newProfile);
            localStorage.setItem('app_user', JSON.stringify(newProfile));
          }
        }
        setUser(data.user);
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Erreur de connexion' };
    } catch (error) {
      console.error('❌ Erreur Supabase login:', error);
      return { success: false, error: error.message };
    }
  };

  // =====================================================
  // 6. DÉCONNEXION
  // =====================================================
  const signOut = async () => {
    try {
      setLoading(true);
      
      await supabaseErp.auth.signOut();
      
      localStorage.removeItem('app_user');
      
      setUser(null);
      setProfile(null);
      setError(null);
      
      console.log('✅ Déconnexion réussie');
    } catch (err) {
      console.error('❌ Erreur déconnexion:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // 7. RAFRAÎCHIR LE PROFIL
  // =====================================================
  const refreshProfile = async () => {
    if (!user) return null;
    const profileData = await fetchProfile(user.id);
    if (profileData) setProfile(profileData);
    return profileData;
  };

  // =====================================================
  // 8. INITIALISATION
  // =====================================================
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const savedUser = localStorage.getItem('app_user');
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (mounted && userData) {
              setUser(userData);
              setProfile(userData);
              setLoading(false);
              setInitialized(true);
              return;
            }
          } catch (e) {
            localStorage.removeItem('app_user');
          }
        }

        const { data: { session }, error: sessionError } = await supabaseErp.auth.getSession();

        if (sessionError) throw sessionError;

        if (mounted && session?.user) {
          console.log('🔍 Utilisateur connecté (Supabase):', session.user.email);
          setUser(session.user);
          
          let profileData = await fetchProfile(session.user.id);
          
          if (profileData) {
            setProfile(profileData);
          } else {
            console.warn('⚠️ Aucun profil trouvé, création...');
            profileData = await createDefaultProfile(session.user);
            if (profileData) {
              setProfile(profileData);
            }
          }
        }

      } catch (err) {
        console.error('❌ Erreur initialization:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabaseErp.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const profileData = await fetchProfile(currentUser.id);
          if (profileData) setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // =====================================================
  // 9. RÔLES ET PERMISSIONS
  // =====================================================
  const isAdmin = profile?.role === 'admin' || profile?.role === 'gerant';
  const isManager = profile?.role === 'gerant' || profile?.role === 'admin';
  const isImprimeur = profile?.role === 'imprimeur';
  const isDesigner = profile?.role === 'designer';
  const isPoseur = profile?.role === 'poseur';
  const isAgentFinancier = profile?.role === 'agent_financier';
  const isCommercial = profile?.role === 'commercial';

  // =====================================================
  // 10. VALEUR DU CONTEXTE
  // =====================================================
  const value = {
    user,
    profile,
    loading,
    error,
    initialized,
    signOut,
    refreshProfile,
    simpleLogin,
    supabaseLogin,
    role: profile?.role || null,
    isAuthenticated: !!user && !!profile,
    fullName: profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur',
    email: user?.email || '',
    isAdmin,
    isManager,
    isImprimeur,
    isDesigner,
    isPoseur,
    isAgentFinancier,
    isCommercial,
    canCreate: isAdmin || isManager || isCommercial,
    canEdit: isAdmin || isManager,
    canDelete: isAdmin,
    canViewStats: isAdmin || isManager || isImprimeur,
    canManageTeam: isAdmin || isManager,
    canManageFinances: isAdmin || isManager || isAgentFinancier,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export default pour le provider
export default AuthProvider;