
"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Timer, LoaderCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getFirestore, doc, getDoc, collection, getDocs, where, query, addDoc, updateDoc, increment } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';


type Question = {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: string;
    subject: string;
};

type Exam = {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    questions: Question[];
    subject: string;
};

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const { examId } = params;
  const { user } = useAuth();
  const { toast } = useToast();

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!examId) return;
    const db = getFirestore(app);

    const fetchExam = async () => {
        try {
            const examRef = doc(db, 'exams', examId as string);
            const examSnap = await getDoc(examRef);

            if (!examSnap.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Exam not found.' });
                router.push('/student/dashboard');
                return;
            }
            
            const examData = examSnap.data();
            const questionIds = examData.questionIds || [];

            const questions: Question[] = [];
            if(questionIds.length > 0) {
                 const questionsQuery = query(collection(db, 'questions'), where('__name__', 'in', questionIds));
                 const questionsSnap = await getDocs(questionsQuery);
                 questionsSnap.forEach(doc => {
                     questions.push({ id: doc.id, ...doc.data() } as Question);
                 });
            }
            
            // Randomize question order
            questions.sort(() => Math.random() - 0.5);

            setExam({
                id: examSnap.id,
                ...examData,
                questions: questions,
            } as Exam);
            setTimeLeft(examData.duration * 60);

        } catch (error) {
            console.error("Error fetching exam:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load the exam.' });
        } finally {
            setIsLoading(false);
        }
    };

    fetchExam();
  }, [examId, router, toast]);

  const currentQuestion = exam?.questions[currentQuestionIndex];
  const progress = exam ? ((currentQuestionIndex + 1) / exam.questions.length) * 100 : 0;

  // Timer logic
  useEffect(() => {
    if (isLoading || !exam) return;
    
    if (timeLeft === 0) {
        handleSubmit();
        return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLoading, exam]);
  
  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!exam || !user) return;
    
    const correctAnswersCount = exam.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const score = Math.round((correctAnswersCount / exam.questions.length) * 100);

    try {
        const db = getFirestore(app);
        // 1. Save results to `examResults` collection
        const resultRef = await addDoc(collection(db, "examResults"), {
            userId: user.uid,
            examId: exam.id,
            examTitle: exam.title,
            subject: exam.subject,
            answers,
            score,
            submittedAt: new Date().toISOString(),
        });

        // 2. Update user's leaderboard score
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            leaderboardScore: increment(score) // Add score to existing total
        });
        
        toast({ title: 'Exam Submitted!', description: 'Your results have been saved.' });
        router.push(`/student/mock-exams/${resultRef.id}/results`);

    } catch (error) {
        console.error("Error submitting exam:", error);
        toast({ variant: 'destructive', title: 'Submission Error', description: 'Could not save your exam results.' });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (isLoading || !exam || !currentQuestion) {
      return (
          <div className="flex h-full w-full items-center justify-center">
             <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{exam.title}</CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <Timer className="h-5 w-5 text-primary" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <CardDescription>Question {currentQuestionIndex + 1} of {exam.questions.length}</CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="font-semibold text-lg">{currentQuestion.text}</p>
          <RadioGroup 
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
          >
            {currentQuestion.options.map(option => (
              <div key={option} className="flex items-center space-x-3 p-3 rounded-lg border has-[:checked]:bg-accent has-[:checked]:text-accent-foreground transition-colors">
                <RadioGroupItem value={option} id={`q${currentQuestion.id}-${option}`} />
                <Label htmlFor={`q${currentQuestion.id}-${option}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestionIndex < exam.questions.length - 1 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finish Exam
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to finish?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will submit your answers and end the exam. You cannot return to the questions after submitting.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={handleSubmit} className="bg-primary">Confirm & Submit</AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
