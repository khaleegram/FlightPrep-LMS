
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast"

type Exam = {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    duration: number;
    subject: string;
}

export default function MockExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const db = getFirestore(app);
    const examsQuery = query(collection(db, "exams"), orderBy("createdAt", "desc"));
    
    const unsubExams = onSnapshot(examsQuery, (snapshot) => {
        const examsData: Exam[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
        setExams(examsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching exams: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch exams." });
        setIsLoading(false);
    });

    return () => unsubExams();
  }, [toast]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">Mock Exams</h1>
            <p className="text-muted-foreground">Select an exam to test your knowledge and prepare for the real thing.</p>
        </div>

        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : exams.length === 0 ? (
            <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                    There are no exams available at the moment. Please check back later.
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {exams.map(exam => (
                    <Card key={exam.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{exam.title}</CardTitle>
                                <Badge variant="secondary">{exam.subject}</Badge>
                            </div>
                            <CardDescription>
                                {exam.questionCount} questions • {exam.duration} minutes
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground">{exam.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/student/mock-exams/${exam.id}`}>
                                    Start Exam <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
    </div>
  )
}
