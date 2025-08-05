
"use client"

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
import { Button } from "@/components/ui/button"
import { ProgressChart } from "@/components/progress-chart"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Clock, Target, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { app } from "@/lib/firebase"
import { format } from "date-fns"


type ExamHistoryItem = {
    id: string;
    examTitle: string;
    submittedAt: string;
    score: number;
    status: 'Passed' | 'Failed';
};

export default function MyProgressPage() {
    const { user } = useAuth();
    const [examHistory, setExamHistory] = useState<ExamHistoryItem[]>([]);
    const [stats, setStats] = useState({
        examsTaken: 0,
        avgScore: "N/A",
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const db = getFirestore(app);
        const resultsQuery = query(
            collection(db, "examResults"),
            where("userId", "==", user.uid),
            orderBy("submittedAt", "desc")
        );

        const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
            const history: ExamHistoryItem[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    examTitle: data.examTitle,
                    submittedAt: format(new Date(data.submittedAt), "PPP"),
                    score: data.score,
                    status: data.score >= 75 ? 'Passed' : 'Failed',
                };
            });

            setExamHistory(history);
            
            const totalExams = history.length;
            const totalScore = history.reduce((acc, item) => acc + item.score, 0);
            const avgScore = totalExams > 0 ? (totalScore / totalExams).toFixed(0) + "%" : "N/A";
            
            setStats({
                examsTaken: totalExams,
                avgScore: avgScore,
            });

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">My Progress</h1>
        <p className="text-muted-foreground">Track your performance and exam history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <LoaderCircle className="h-6 w-6 animate-spin"/> : stats.examsTaken}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <LoaderCircle className="h-6 w-6 animate-spin"/> : stats.avgScore}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Studied</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
               <p className="text-xs text-muted-foreground">(coming soon)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">N/A</div>
               <p className="text-xs text-muted-foreground">(coming soon)</p>
            </CardContent>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProgressChart />
        <Card>
            <CardHeader>
                <CardTitle>Exam History</CardTitle>
                <CardDescription>A log of all your completed mock exams.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Exam</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin"/></TableCell></TableRow>
                        ) : examHistory.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    You haven't taken any exams yet.
                                    <Button asChild variant="link" className="p-1">
                                      <Link href="/student/mock-exams">Take one now!</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ) : (
                            examHistory.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="font-medium">{item.examTitle}</div>
                                    <div className="text-sm text-muted-foreground">{item.submittedAt}</div>
                                </TableCell>
                                <TableCell className="text-center font-bold">{item.score}%</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={item.status === 'Passed' ? 'default': 'destructive'}>{item.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                     <Button asChild variant="outline" size="sm">
                                        <Link href={`/student/mock-exams/${item.id}/results`}>Review</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  )
}
