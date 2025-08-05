
"use client";

import Link from "next/link"
import {
  ArrowUpRight,
  BookCopy,
  FileText,
  BadgePercent,
  Users,
  Database,
  Mail,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { seedDatabase } from "@/ai/flows/seed-database";
import { LoaderCircle } from "lucide-react";

const statCards = [
    { title: "Total Students", value: "1,250", change: "+20.1% from last month", icon: Users },
    { title: "Total Questions", value: "+10,350", change: "+180 since last week", icon: BookCopy },
    { title: "Exams Created", value: "+234", change: "+19% from last month", icon: FileText },
    { title: "Avg. Pass Rate", value: "78%", change: "+2% from last month", icon: BadgePercent },
];

const recentStudents = [
    { name: "Liam Johnson", email: "liam@example.com", department: "Flying School", date: "2023-06-23" },
    { name: "Olivia Smith", email: "olivia@example.com", department: "Aircraft Maintenance Engineering", date: "2023-06-24" },
    { name: "Noah Williams", email: "noah@example.com", department: "Air Traffic Control", date: "2023-06-25" },
    { name: "Emma Brown", email: "emma@example.com", department: "Cabin Crew", date: "2023-06-26" },
    { name: "James Jones", email: "james@example.com", department: "Prospective Student", date: "2023-06-27" },
];

const topDepartments = [
    { name: "Flying School", score: "92%", avatar: "FS" },
    { name: "Air Traffic Control", score: "88%", avatar: "ATC" },
    { name: "Aircraft Maintenance", score: "85%", avatar: "AME" },
];

const SeedDataCard = () => {
    const [isSeeding, setIsSeeding] = useState(false);
    const [adminEmail, setAdminEmail] = useState("");
    const { toast } = useToast();

    const handleSeed = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!adminEmail) {
            toast({
                variant: "destructive",
                title: "Email Required",
                description: "Please enter an email for the admin user.",
            });
            return;
        }

        setIsSeeding(true);
        try {
            const result = await seedDatabase({ adminEmail });
            if (result.success) {
                toast({
                    title: "Database Seeded!",
                    description: result.message,
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Seeding Failed",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <Card className="bg-accent/20 border-accent">
            <form onSubmit={handleSeed}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Create Admin User
                    </CardTitle>
                    <CardDescription>
                        Create a single administrative user in Firebase Auth and Firestore. This user will have `isAdmin` claims.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="admin-email">Admin Email</Label>
                        <div className="relative">
                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                id="admin-email"
                                type="email"
                                placeholder="admin@example.com"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                className="pl-9"
                                required
                             />
                        </div>
                     </div>
                    <Button type="submit" disabled={isSeeding || !adminEmail} className="w-full">
                        {isSeeding && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {isSeeding ? "Creating User..." : "Create Admin User"}
                    </Button>
                </CardContent>
            </form>
        </Card>
    )
}


export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {statCards.map(card => (
            <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.change}</p>
            </CardContent>
            </Card>
        ))}
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Student Registrations</CardTitle>
              <CardDescription>
                A list of students who recently joined the platform.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="#">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden xl:table-cell">
                    Department
                  </TableHead>
                  <TableHead className="text-right">Date Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentStudents.map(student => (
                    <TableRow key={student.email}>
                        <TableCell>
                            <div className="font-medium">{student.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                            {student.email}
                            </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                           <Badge variant="outline">{student.department}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{student.date}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
            <Card>
            <CardHeader>
                <CardTitle>Top Performing Departments</CardTitle>
                <CardDescription>
                Departments with the highest average scores this month.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
                {topDepartments.map(dept => (
                    <div key={dept.name} className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                            <AvatarFallback>{dept.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none">{dept.name}</p>
                        </div>
                        <div className="ml-auto font-medium text-primary">{dept.score}</div>
                    </div>
                ))}
            </CardContent>
            </Card>
            <SeedDataCard />
        </div>
      </div>
    </div>
  )
}
