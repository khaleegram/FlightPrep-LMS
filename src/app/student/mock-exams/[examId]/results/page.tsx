
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

type Question = {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
};

type ExamResults = {
  answers: Record<number, string>;
  questions: Question[];
};

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
                topic: "Air Law" // This would be dynamic in a real app
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
  const { examId } = params;
  const [results, setResults] = useState<ExamResults | null>(null);

  useEffect(() => {
    const savedResults = localStorage.getItem(`exam_results_${examId}`);
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    } else {
      // Handle case where there are no results, e.g., redirect
      router.push('/student/dashboard');
    }
  }, [examId, router]);

  if (!results) {
    return (
        <div className="flex justify-center items-center h-64">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  const { answers, questions } = results;
  const correctAnswersCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const score = Math.round((correctAnswersCount / questions.length) * 100);
  const isPassed = score >= 75;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Exam Results</CardTitle>
          <CardDescription>You {isPassed ? "Passed" : "Failed"}</CardDescription>
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="text-6xl font-black" style={{ color: isPassed ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}>
                {score}%
            </div>
          </div>
          <Progress value={score} className="w-full mt-4" />
          <p className="text-muted-foreground mt-2">
            You answered {correctAnswersCount} out of {questions.length} questions correctly.
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
