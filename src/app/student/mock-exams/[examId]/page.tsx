"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Timer } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Mock data - in a real app, this would be fetched based on examId
const MOCK_EXAM_DATA = {
  id: "1",
  title: "PPL Air Law Mock Exam",
  questions: [
    { id: 1, text: "What is the minimum visibility required for a VFR flight in Class G airspace above 1,200 feet AGL but below 10,000 feet MSL during the day?", options: ["1 statute mile", "3 statute miles", "5 statute miles"], correctAnswer: "1 statute mile" },
    { id: 2, text: "An aircraft on a VFR flight plan is required to be equipped with a transponder with Mode C capability in which airspace?", options: ["Class A airspace", "Class B airspace", "Class D airspace"], correctAnswer: "Class B airspace" },
    { id: 3, text: "What action must a pilot take when crossing a runway?", options: ["Receive a specific clearance to cross", "Flash landing lights", "Proceed if no traffic is observed"], correctAnswer: "Receive a specific clearance to cross" },
  ],
  duration: 60 * 2, // 2 minutes for demo
};

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const { examId } = params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(MOCK_EXAM_DATA.duration);

  const exam = MOCK_EXAM_DATA; // In a real app, fetch exam data
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // In a real app, you'd save results to a database
    localStorage.setItem(`exam_results_${examId}`, JSON.stringify({ answers, questions: exam.questions }));
    router.push(`/student/mock-exams/${examId}/results`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
