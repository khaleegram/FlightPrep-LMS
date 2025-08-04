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
import { ArrowRight } from "lucide-react"

// In a real app, this would come from a database
const exams = [
    { id: "1", title: "PPL Air Law Mock Exam", questions: 50, duration: "60 mins", subject: "Air Law", description: "Test your knowledge of aviation regulations and legal requirements for Private Pilot License holders." },
    { id: "2", title: "CPL Meteorology Practice Test", questions: 40, duration: "45 mins", subject: "Meteorology", description: "Assess your understanding of weather patterns, forecasts, and their impact on flight for the CPL." },
    { id: "3", title: "EASA Part-66 Module 1 - Mathematics", questions: 100, duration: "120 mins", subject: "Mathematics", description: "A comprehensive test on the fundamental mathematical concepts required for aircraft maintenance engineers." },
    { id: "4", title: "ATPL Human Performance & Limitations", questions: 60, duration: "75 mins", subject: "Human Performance", description: "Examine the psychological and physiological factors affecting aircrew performance." },
    { id: "5", title: "Instrument Rating (IR) Exam", questions: 80, duration: "90 mins", subject: "Instruments", description: "Prepare for your Instrument Rating with this in-depth mock exam covering IFR procedures and navigation." },
    { id: "6", title: "Principles of Flight (CPL)", questions: 50, duration: "60 mins", subject: "Aerodynamics", description: "Evaluate your grasp of the core principles of aerodynamics and aircraft flight characteristics." },
];

export default function MockExamsPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">Mock Exams</h1>
            <p className="text-muted-foreground">Select an exam to test your knowledge and prepare for the real thing.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map(exam => (
                <Card key={exam.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle>{exam.title}</CardTitle>
                            <Badge variant="secondary">{exam.subject}</Badge>
                        </div>
                        <CardDescription>
                            {exam.questions} questions • {exam.duration}
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
    </div>
  )
}
