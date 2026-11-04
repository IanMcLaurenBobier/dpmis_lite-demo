import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../firebase/config';
import { UserAccount, UserRole } from '../types';
import { getUsers, getUserById, saveUserAccount, seedDatabase } from '../firebase/services';
import { INITIAL_USERS } from '../firebase/seedData';

interface AuthContextType {
  currentUser: UserAccount | null;
  activeRole: UserRole;
  isFirebaseConnected: boolean;
  switchRole: (role: UserRole) => void;
  loginAsDemo: (role: UserRole) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  reseed: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronously initialize user from stored session or default demo researcher
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const storedUserId = localStorage.getItem('dpmis_session_user_id');
      if (storedUserId) {
        const storedUsers = localStorage.getItem('dpmis_store_users');
        if (storedUsers) {
          const list: UserAccount[] = JSON.parse(storedUsers);
          const found = list.find(u => u.id === storedUserId || u.email.toLowerCase() === storedUserId.toLowerCase());
          if (found) return found;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_USERS.find(u => u.role === 'researcher') || INITIAL_USERS[0];
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Background non-blocking sync
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Non-blocking connection test
        testConnection().then(connected => {
          if (mounted) setIsFirebaseConnected(connected);
        }).catch(() => {});

        // Background seed check
        await seedDatabase();

        // Check if there is an existing session
        const storedUserId = localStorage.getItem('dpmis_session_user_id');
        if (storedUserId) {
          const found = await getUserById(storedUserId);
          if (mounted && found) {
            setCurrentUser(found);
          }
        }
      } catch (err) {
        console.warn('AuthContext background init note: ', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Firebase Auth listener for Google logins
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || '';
        // If it's the admin email, ensure admin role
        const isAdminEmail = email.toLowerCase() === 'patchypatchpatchy@gmail.com';
        
        let existing = await getUserById(email);
        if (!existing) {
          existing = {
            id: firebaseUser.uid,
            full_name: firebaseUser.displayName || 'Authorized User',
            email: email,
            role: isAdminEmail ? 'admin' : 'researcher',
            account_status: 'active',
            institution: 'Government Research Partner',
            department: 'Science & Technology Unit',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await saveUserAccount(existing);
        }
        setCurrentUser(existing);
        localStorage.setItem('dpmis_session_user_id', existing.id);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const switchRole = async (role: UserRole) => {
    const users = await getUsers();
    const candidate = users.find(u => u.role === role) || INITIAL_USERS.find(u => u.role === role);
    if (candidate) {
      setCurrentUser(candidate);
      localStorage.setItem('dpmis_session_user_id', candidate.id);
    }
  };

  const loginAsDemo = async (role: UserRole) => {
    await switchRole(role);
  };

  const loginWithEmail = async (email: string) => {
    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('dpmis_session_user_id', user.id);
    } else {
      // Create guest researcher account
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        email: email,
        role: 'researcher',
        account_status: 'active',
        institution: 'Philippine Research Institution',
        department: 'Science Faculty',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await saveUserAccount(newUser);
      setCurrentUser(newUser);
      localStorage.setItem('dpmis_session_user_id', newUser.id);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in popup cancelled or error: ', err);
    }
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    localStorage.removeItem('dpmis_session_user_id');
    // Switch to null or public mode
    setCurrentUser(null);
  };

  const reseed = async () => {
    await seedDatabase(true);
    window.location.reload();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole: currentUser?.role || 'researcher',
        isFirebaseConnected,
        switchRole,
        loginAsDemo,
        loginWithEmail,
        loginWithGoogle,
        logout,
        reseed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
