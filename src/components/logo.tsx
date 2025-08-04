import { Plane } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center justify-center gap-2"
      aria-label="FlightPrep LMS Home"
    >
      <Plane className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold font-headline">FlightPrep LMS™</h1>
    </Link>
  );
}
