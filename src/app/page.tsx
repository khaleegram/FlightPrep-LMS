"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent, role: 'student' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Success', description: 'Logged in successfully!' });
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
        toast({ title: 'Success', description: 'Logged in successfully!' });
        router.push('/student/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: error.message,
        });
    } finally {
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
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <form>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
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
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Button type="submit" className="w-full" onClick={(e) => handleLogin(e, 'student')} disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Student Login'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={(e) => handleLogin(e, 'admin')} disabled={isLoading}>
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
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                  <GoogleIcon className="mr-2 h-4 w-4" />
                  Sign in with Google
              </Button>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block xl:col-span-3">
        <Image
          src="https://placehold.co/1200x900.png"
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
