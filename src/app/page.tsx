import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';

export default function LoginPage() {
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
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
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
                <Input id="password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Button type="submit" className="w-full">
                  <Link href="/student/dashboard">Student Login</Link>
                </Button>
                <Button variant="outline" className="w-full">
                 <Link href="/admin/dashboard">Admin Login</Link>
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
