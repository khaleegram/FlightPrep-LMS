"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false, isStudent: false });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
        const userIsAdmin = !!idTokenResult.claims.isAdmin;
        // Assume user is a student if they are not an admin.
        // For a new user signing up, they won't have claims yet.
        const userIsStudent = !userIsAdmin || !!idTokenResult.claims.isStudent;

        setUser(user);
        setIsAdmin(userIsAdmin);
        setIsStudent(userIsStudent);
        
        const isAuthPage = pathname === '/' || pathname === '/signup' || pathname === '/flightprepsignup';
        
        if (isAuthPage) {
          router.push(userIsAdmin ? '/admin/dashboard' : '/student/dashboard');
        } else if (pathname.startsWith('/admin') && !userIsAdmin) {
          // If a non-admin tries to access an admin page, redirect them
          router.push('/student/dashboard');
        } else if (pathname.startsWith('/student') && !userIsStudent) {
            // If a non-student tries to access a student page, redirect them
            router.push('/');
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        setIsStudent(false);
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
    <AuthContext.Provider value={{ user, loading, isAdmin, isStudent }}>
      {loading ? <div className="flex h-screen items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
