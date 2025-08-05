
"use client";

import Link from "next/link"
import {
  ArrowUpRight,
  BookCopy,
  FileText,
  BadgePercent,
  Users,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
        <h1 className="text-2xl font-semibold md:text-3xl font-headline">Admin Dashboard</h1>
        <Card>
            <CardHeader>
                <CardTitle>Welcome to FlightPrep LMS™</CardTitle>
                <CardDescription>
                    This is your administrative dashboard. Use the navigation on the left to manage curriculum, create exams, and manage users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Get started by adding departments and subjects in the <Link href="/admin/curriculum" className="text-primary underline">Curriculum Management</Link> section.</p>
            </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No students have been added yet.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                    <BookCopy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No questions in the bank.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Exams Created</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No exams have been created.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Pass Rate</CardTitle>
                    <BadgePercent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">N/A</div>
                    <p className="text-xs text-muted-foreground">No exam results yet.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
