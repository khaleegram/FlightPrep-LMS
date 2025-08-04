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

const exams = [
    { id: "1", title: "PPL Air Law Mock Exam", questions: 50, duration: "60 mins", subject: "Air Law" },
    { id: "2", title: "CPL Meteorology Practice Test", questions: 40, duration: "45 mins", subject: "Meteorology" },
    { id: "3", title: "EASA Part-66 Module 1", questions: 100, duration: "120 mins", subject: "Mathematics" },
];

const leaderboard = [
    { rank: 1, name: "Amelia Earhart", score: 5400, avatar: "AE" },
    { rank: 2, name: "Charles Lindbergh", score: 5150, avatar: "CL" },
    { rank: 3, name: "Bessie Coleman", score: 4900, avatar: "BC" },
];

export default function StudentDashboard() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
        <div>
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">Welcome Back, Student!</h1>
            <p className="text-muted-foreground">Ready to conquer the skies? Let&apos;s get started.</p>
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
                        {leaderboard.map(player => (
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
                {exams.map(exam => (
                    <Card key={exam.title}>
                        <CardHeader>
                            <CardTitle>{exam.title}</CardTitle>
                            <CardDescription>
                                <Badge variant="secondary">{exam.subject}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <p className="text-sm text-muted-foreground">{exam.questions} questions</p>
                            <p className="text-sm text-muted-foreground">{exam.duration}</p>
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
