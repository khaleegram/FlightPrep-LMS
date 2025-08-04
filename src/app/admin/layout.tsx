"use client"

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  BookCopy,
  Bot,
  FileText,
  Home,
  LineChart,
  PanelLeft,
  Settings,
  Users,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import UserNav from '@/components/user-nav';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const navItems = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard", active: true },
    { href: "#", icon: BookCopy, label: "Question Bank" },
    { href: "#", icon: FileText, label: "Exam Management" },
    { href: "#", icon: Users, label: "User Management" },
    { href: "#", icon: Bot, label: "AI Customization" },
    { href: "#", icon: LineChart, label: "Analytics" },
    { href: "#", icon: Settings, label: "Settings" },
  ];

  const NavContent = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
            item.active
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  if (!user) return null; // Or a loading indicator

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-muted/20">
      <div className="hidden border-r bg-sidebar md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1.5-1.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.3-.8.8l1.8 8.4.5 2.3L7 18l1.8 2.2c.4.4 1 .4 1.4 0l1.4-1.4 1-1.1.8-1.8 2.4-5.2Z"/><path d="m2.5 2.5 2 2" /></svg>
              <span className="font-headline text-lg">FlightPrep LMS™</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavContent />
          </div>
          <div className="mt-auto p-4">
            <Card className="bg-sidebar-accent border-sidebar-border">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle className="text-sidebar-accent-foreground">Need Help?</CardTitle>
                <CardDescription className="text-sidebar-foreground/80">
                  Contact support for any issues or questions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full" variant="primary">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground border-sidebar-border p-0">
              <div className="flex h-14 items-center border-b border-sidebar-border px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1.5-1.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.3-.8.8l1.8 8.4.5 2.3L7 18l1.8 2.2c.4.4 1 .4 1.4 0l1.4-1.4 1-1.1.8-1.8 2.4-5.2Z"/><path d="m2.5 2.5 2 2" /></svg>
                  <span className="font-headline">FlightPrep LMS™</span>
                </Link>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search here */}
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
