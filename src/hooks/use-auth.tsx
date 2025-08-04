"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        const userIsAdmin = !!idTokenResult.claims.isAdmin;
        setUser(user);
        setIsAdmin(userIsAdmin);
        
        const isAuthPage = pathname === '/' || pathname === '/signup' || pathname === '/flightprepsignup';
        
        if (isAuthPage) {
          router.push(userIsAdmin ? '/admin/dashboard' : '/student/dashboard');
        } else if (pathname.startsWith('/admin') && !userIsAdmin) {
          // If a non-admin tries to access an admin page, redirect them
          router.push('/student/dashboard');
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        const isProtectedRoute = !['/', '/signup', '/flightprepsignup'].includes(pathname);
        if (isProtectedRoute) {
          router.push('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {loading ? <div className="flex h-screen items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

    