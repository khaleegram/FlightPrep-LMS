
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import {
  BookCopy,
  FileText,
  BadgePercent,
  Users,
  LoaderCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Stats = {
    students: number;
    questions: number;
    exams: number;
    avgPassRate: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const db = getFirestore(app);
        const fetchStats = async () => {
            try {
                const studentsCol = collection(db, "users");
                const studentsQuery = query(studentsCol, where("role", "==", "Student"));
                const studentsSnap = await getCountFromServer(studentsQuery);

                const questionsSnap = await getCountFromServer(collection(db, "questions"));
                const examsSnap = await getCountFromServer(collection(db, "exams"));
                
                // For average pass rate, we need to fetch results
                const resultsSnap = await getDocs(collection(db, "examResults"));
                let passedCount = 0;
                resultsSnap.forEach(doc => {
                    if (doc.data().score >= 75) {
                        passedCount++;
                    }
                });
                const avgPassRate = resultsSnap.size > 0 ? ((passedCount / resultsSnap.size) * 100).toFixed(0) + "%" : "N/A";


                setStats({
                    students: studentsSnap.data().count,
                    questions: questionsSnap.data().count,
                    exams: examsSnap.data().count,
                    avgPassRate: avgPassRate
                });
            } catch (e) {
                console.error("Error fetching admin stats: ", e);
            } finally {
                setIsLoading(false);
            }
        };

        // This is a simplified version. For real-time updates, you'd use onSnapshot for each.
        // But for dashboard cards, a single fetch on load is often sufficient.
        fetchStats();

    }, []);

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
             {isLoading || !stats ? (
                Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <div className="h-5 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded-md w-12 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.students}</div>
                            <p className="text-xs text-muted-foreground">Registered on the platform.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                            <BookCopy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.questions}</div>
                            <p className="text-xs text-muted-foreground">In the question bank.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Exams Created</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.exams}</div>
                             <p className="text-xs text-muted-foreground">Available for students.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Pass Rate</CardTitle>
                            <BadgePercent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avgPassRate}</div>
                            <p className="text-xs text-muted-foreground">Across all completed exams.</p>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    </div>
  )
}
