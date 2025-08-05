
"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z" />
        <path d="M12 2v10" />
        <path d="m4.93 4.93 7.07 7.07" />
        <path d="m2 12h10" />
        <path d="m4.93 19.07 7.07-7.07" />
        <path d="M12 22v-10" />
        <path d="m19.07 19.07-7.07-7.07" />
        <path d="M22 12h-10" />
        <path d="m19.07 4.93-7.07 7.07" />
      </svg>
    )
}

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
      <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
      >
          <path d="M12.01,2.02c-1.25-0.05-2.5,0.42-3.52,1.23c-1.39,1.11-2.45,2.7-2.68,4.59c-0.01,0.1,0.03,0.2,0.08,0.28 c0.05,0.08,0.13,0.13,0.22,0.14c0.75,0.09,1.52-0.03,2.23-0.3c0.75-0.29,1.44-0.78,1.96-1.4c0.78-0.93,1.23-2.11,1.19-3.32 c0-0.1-0.04-0.19-0.1-0.26C11.3,3.4,11.2,3.34,11.1,3.32C10,3.17,8.88,3.3,7.91,3.78c-1.5,0.74-2.63,2.12-2.95,3.81 c-0.1,0.56-0.13,1.13-0.08,1.69c0.23,2.5,1.72,4.64,3.88,5.85c0.8,0.44,1.68,0.73,2.59,0.85c0.88,0.11,1.77-0.07,2.59-0.52 c0.12-0.07,0.26-0.07,0.38,0c0.84,0.44,1.74,0.61,2.65,0.49c1.1-0.15,2.11-0.69,2.88-1.52c-1.74-1.12-2.82-3-2.92-5.11 c-0.04-0.96,0.24-1.92,0.79-2.73c0.84-1.24,2.11-2.03,3.53-2.2c0.09-0.01,0.18,0.02,0.25,0.09c0.07,0.06,0.12,0.15,0.12,0.24 c-0.01,1.48-0.66,2.89-1.75,3.89c-0.71,0.65-1.55,1.1-2.46,1.31c-0.81,0.18-1.64,0.08-2.39-0.26c-0.11-0.05-0.24-0.04-0.34,0.03 c-1.2,0.78-2.61,1.11-4.01,0.89c-1.53-0.23-2.91-1-3.9-2.22c-0.08-0.09-0.1-0.21-0.07-0.32c0.04-0.11,0.12-0.19,0.24-0.22 c0.5-0.12,1-0.12,1.49-0.01c1.02,0.23,1.98,0.7,2.78,1.38c0.71,0.6,1.25,1.39,1.56,2.26c0.07,0.19,0.26,0.31,0.46,0.31 c0.04,0,0.09-0.01,0.13-0.02c1.08-0.45,1.95-1.28,2.44-2.32c0.4-0.86,0.51-1.84,0.3-2.77c-0.2-0.87-0.67-1.63-1.33-2.2 C14.22,2.21,13.1,1.95,12.01,2.02z M15.15,2.62c0.84-0.42,1.82-0.56,2.76-0.39c0.94,0.18,1.79,0.66,2.43,1.39 c-0.78,0.53-1.4,1.28-1.75,2.16c-0.72,1.83,0.17,3.9,1.88,4.86c-0.02,0.02-0.03,0.04-0.05,0.06c-0.9,1.2-2.21,1.99-3.66,2.15 c-1.3,0.15-2.6-0.3-3.6-1.23c-1.23-1.14-1.9-2.72-1.88-4.36C11.31,5.2,12.91,3.48,15.15,2.62z"/>
      </svg>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleRoleBasedLogin = async (user: User, role: 'student' | 'admin') => {
    try {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
    
        if (role === 'admin') {
            if (idTokenResult.claims.isAdmin) {
                toast({ title: 'Success', description: 'Admin logged in successfully!' });
                router.push('/admin/dashboard');
            } else {
                await auth.signOut(); // Sign out non-admin user
                toast({
                    variant: 'destructive',
                    title: 'Access Denied',
                    description: 'You do not have permission to access the admin panel.',
                });
            }
        } else { // role === 'student'
            if (idTokenResult.claims.isStudent || !idTokenResult.claims.isAdmin) {
                toast({ title: 'Success', description: 'Logged in successfully!' });
                router.push('/student/dashboard');
            } else {
                await auth.signOut();
                toast({
                    variant: 'destructive',
                    title: 'Login Error',
                    description: 'This account is configured for admin access. Please use the Admin login tab.',
                });
            }
        }
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Error',
            description: `An error occurred during role verification: ${error.message}`,
        });
    } finally {
        setIsLoading(false);
    }
  }

  const handleLogin = async (e: React.FormEvent, role: 'student' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleRoleBasedLogin(userCredential.user, role);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'apple', role: 'student' | 'admin') => {
    setIsLoading(true);
    const authProvider = provider === 'google' ? googleProvider : appleProvider;
    try {
        const userCredential = await signInWithPopup(auth, authProvider);
        await handleRoleBasedLogin(userCredential.user, role);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message,
        });
        setIsLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:grid-cols-5">
      <div className="flex items-center justify-center py-12 xl:col-span-2">
        <div className="mx-auto grid w-[380px] gap-6 p-6">
          <div className="grid gap-4 text-center">
            <Logo />
            <p className="text-balance text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              <Card>
                <CardContent className="grid gap-4 pt-6">
                  <form onSubmit={(e) => handleLogin(e, 'student')}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email-student">Email</Label>
                        <Input
                          id="email-student"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center">
                          <Label htmlFor="password-student">Password</Label>
                          <Link
                            href="#"
                            className="ml-auto inline-block text-sm underline"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                        <Input 
                          id="password-student" 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Student Login'}
                        </Button>
                      </div>
                    </div>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleProviderSignIn('google', 'student')} disabled={isLoading}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleProviderSignIn('apple', 'student')} disabled={isLoading}>
                        <AppleIcon className="mr-2 h-4 w-4" />
                        Apple
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </div>
            </TabsContent>
            <TabsContent value="admin">
              <Card>
                <CardContent className="grid gap-4 pt-6">
                  <form onSubmit={(e) => handleLogin(e, 'admin')}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email-admin">Email</Label>
                        <Input
                          id="email-admin"
                          type="email"
                          placeholder="admin@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                          <Label htmlFor="password-admin">Password</Label>
                        <Input 
                          id="password-admin" 
                          type="password" 
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Admin Login'}
                        </Button>
                      </div>
                    </div>
                  </form>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                  </div>
                   <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full" onClick={() => handleProviderSignIn('google', 'admin')} disabled={isLoading}>
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Google
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleProviderSignIn('apple', 'admin')} disabled={isLoading}>
                        <AppleIcon className="mr-2 h-4 w-4" />
                        Apple
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="hidden bg-muted lg:block xl:col-span-3">
        <Image
          src="/images/avaition.png"
          alt="Aviation cockpit"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          data-ai-hint="aviation cockpit"
          priority
        />
      </div>
    </div>
  );
}
