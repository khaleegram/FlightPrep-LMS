import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Logo from "@/components/logo"

export default function SignupPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:grid-cols-5">
      <div className="hidden bg-muted lg:block xl:col-span-3">
        <Image
          src="https://placehold.co/1200x900.png"
          alt="Airplane wing"
          width="1920"
          height="1080"
          className="h-full w-full object-cover"
          data-ai-hint="airplane wing"
          priority
        />
      </div>
       <div className="flex items-center justify-center py-12 xl:col-span-2">
        <div className="mx-auto grid w-[380px] gap-6 p-6">
          <div className="grid gap-4 text-center">
            <Logo />
            <p className="text-balance text-muted-foreground">
              Join FlightPrep LMS™ to start your aviation training journey.
            </p>
          </div>
          <Card>
            <CardContent className="grid gap-4 pt-6">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Amelia Earhart" required />
              </div>
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
                <Label htmlFor="department">Department</Label>
                <Select required>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flying-school">Flying School</SelectItem>
                    <SelectItem value="maintenance">Aircraft Maintenance Engineering</SelectItem>
                    <SelectItem value="atc">Air Traffic Control</SelectItem>
                    <SelectItem value="cabin-crew">Cabin Crew</SelectItem>
                    <SelectItem value="prospective">Prospective Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                <Link href="/student/dashboard" className="w-full">Create an account</Link>
              </Button>
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
