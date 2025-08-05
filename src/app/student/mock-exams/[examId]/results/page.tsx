
"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, Bot, LoaderCircle, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { generateExamExplanation, GenerateExamExplanationInput } from '@/ai/flows/generate-exam-explanation';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, getDoc, collection, getDocs, where, query } from 'firebase/firestore';
import { app } from '@/lib/firebase';

type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  subject: string;
};

type ExamResult = {
  answers: Record<string, string>;
  score: number;
  examId: string;
  examTitle: string;
  submittedAt: string;
  userId: string;
  subject: string;
};

type FullResult = {
    result: ExamResult;
    questions: Question[];
}

const AiExplanation = ({ question, studentAnswer }: { question: Question, studentAnswer: string }) => {
    const [explanation, setExplanation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const fetchExplanation = async () => {
        setIsLoading(true);
        try {
            const input: GenerateExamExplanationInput = {
                question: question.text,
                studentAnswer: studentAnswer || "Not answered",
                correctAnswer: question.correctAnswer,
                topic: question.subject || "General Aviation",
            }
            const result = await generateExamExplanation(input);
            setExplanation(result.explanation);
        } catch (error) {
            console.error("Error fetching explanation:", error);
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: 'Could not fetch the explanation. Please try again.'
            })
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="mt-4">
            {explanation ? (
                 <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle className="font-bold">AI Explanation</AlertTitle>
                    <AlertDescription className="prose prose-sm max-w-none">
                        <p>{explanation}</p>
                    </AlertDescription>
                </Alert>
            ) : (
                <Button onClick={fetchExplanation} disabled={isLoading} size="sm" variant="outline">
                    {isLoading ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                           <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
                           Explain with AI
                        </>
                    )}
                </Button>
            )}
        </div>
    )
}


export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { examId: resultId } = params; // The ID is now the result document ID
  const [fullResult, setFullResult] = useState<FullResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!resultId) return;
    const db = getFirestore(app);

    const fetchResults = async () => {
        try {
            const resultRef = doc(db, 'examResults', resultId as string);
            const resultSnap = await getDoc(resultRef);

            if (!resultSnap.exists()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Exam result not found.' });
                router.push('/student/dashboard');
                return;
            }

            const resultData = resultSnap.data() as ExamResult;
            const examRef = doc(db, 'exams', resultData.examId);
            const examSnap = await getDoc(examRef);
            const questionIds = examSnap.data()?.questionIds || [];
            
            const questions: Question[] = [];
             if(questionIds.length > 0) {
                 const questionsQuery = query(collection(db, 'questions'), where('__name__', 'in', questionIds));
                 const questionsSnap = await getDocs(questionsQuery);
                 questionsSnap.forEach(doc => {
                     questions.push({ id: doc.id, ...doc.data() } as Question);
                 });
            }
            
            setFullResult({ result: resultData, questions });

        } catch (error) {
            console.error("Error fetching results: ", error);
             toast({ variant: 'destructive', title: 'Error', description: 'Could not load exam results.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchResults();

  }, [resultId, router, toast]);


  if (isLoading || !fullResult) {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }

  const { result, questions } = fullResult;
  const { answers, score } = result;
  const isPassed = score >= 75;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Exam Results</CardTitle>
          <CardDescription>{result.examTitle}</CardDescription>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="text-6xl font-black" style={{ color: isPassed ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
                {score}%
            </div>
          </div>
          <Progress value={score} className="w-full mt-4" />
           <p className="text-muted-foreground mt-2">
            You {isPassed ? "Passed" : "Failed"}
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {questions.map((question, index) => {
              const studentAnswer = answers[question.id];
              const isCorrect = studentAnswer === question.correctAnswer;
              return (
                <AccordionItem value={`item-${index}`} key={question.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3 w-full">
                        {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <span className="text-left flex-1">{question.text}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-8">
                        {question.options.map(option => (
                             <div key={option} className={`p-2 rounded-md border-2 ${
                                option === question.correctAnswer ? 'border-green-500 bg-green-500/10' : 
                                option === studentAnswer ? 'border-red-500 bg-red-500/10' : 'border-transparent'
                            }`}>
                                <p className="font-medium">{option}</p>
                                {option === question.correctAnswer && <p className="text-xs text-green-700 font-semibold">Correct Answer</p>}
                                {option === studentAnswer && option !== question.correctAnswer && <p className="text-xs text-red-700 font-semibold">Your Answer</p>}
                            </div>
                        ))}
                    </div>
                    <div className="pl-8">
                        <AiExplanation question={question} studentAnswer={studentAnswer} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

            <div className="mt-8 text-center">
                <Button asChild>
                    <Link href="/student/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
