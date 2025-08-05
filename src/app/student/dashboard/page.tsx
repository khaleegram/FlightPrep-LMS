
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProgressChart } from "@/components/progress-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { app } from "@/lib/firebase"

type Exam = {
    id: string;
    title: string;
    questions: number;
    duration: string;
    subject: string;
};

type LeaderboardUser = {
    rank: number;
    name: string;
    score: number;
    avatar: string;
}

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(true);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);

  useEffect(() => {
    const db = getFirestore(app);
    
    // Fetch exams
    const examsQuery = query(collection(db, "exams"), orderBy("createdAt", "desc"), limit(3));
    const unsubExams = onSnapshot(examsQuery, (snapshot) => {
        const examsData: Exam[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
        setExams(examsData);
        setIsLoadingExams(false);
    }, (error) => {
        console.error("Error fetching exams: ", error);
        setIsLoadingExams(false);
    });

    // Fetch leaderboard
    const usersQuery = query(collection(db, "users"), orderBy("leaderboardScore", "desc"), limit(3));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersData: LeaderboardUser[] = snapshot.docs.map((doc, index) => ({
            rank: index + 1,
            name: doc.data().displayName,
            score: doc.data().leaderboardScore,
            avatar: doc.data().displayName.split(' ').map((n: string) => n[0]).join(''),
        }));
        setLeaderboard(usersData);
        setIsLoadingLeaderboard(false);
    }, (error) => {
        console.error("Error fetching leaderboard: ", error);
        setIsLoadingLeaderboard(false);
    });


    return () => {
        unsubExams();
        unsubUsers();
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 md:gap-8">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Welcome Back, Student!</h1>
            <p className="text-muted-foreground">Ready to conquer the skies? Let's get started.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
                <ProgressChart />
            </div>
            <div className="lg:col-span-3">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Leaderboard</CardTitle>
                        <CardDescription>See how you rank among your peers.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {isLoadingLeaderboard ? <p>Loading leaderboard...</p> : leaderboard.length === 0 ? <p className="text-muted-foreground text-sm">No players on the leaderboard yet.</p> :
                        leaderboard.map(player => (
                            <div key={player.rank} className="flex items-center gap-4">
                                <div className="font-bold text-primary w-4 text-center">{player.rank}</div>
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>{player.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium leading-none">{player.name}</p>
                                </div>
                                <div className="ml-auto font-medium">{player.score} pts</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>

        <div>
            <h2 className="text-xl font-semibold md:text-2xl font-headline mb-4">Available Mock Exams</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoadingExams ? <p>Loading exams...</p> : exams.length === 0 ? <p className="text-muted-foreground text-sm">No exams available yet. Check back soon!</p> :
                exams.map(exam => (
                    <Card key={exam.id}>
                        <CardHeader>
                            <CardTitle>{exam.title}</CardTitle>
                            <CardDescription>
                                <Badge variant="secondary">{exam.subject}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <p className="text-sm text-muted-foreground">{exam.questions} questions</p>
                            <p className="text-sm text-muted-foreground">{exam.duration} mins</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full bg-accent hover:bg-accent/90">
                                <Link href={`/student/mock-exams/${exam.id}`}>Start Exam</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  )
}
