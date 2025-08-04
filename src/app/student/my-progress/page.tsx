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
import { Award, BookOpen, Clock, Target } from "lucide-react"

const progressStats = [
  { title: "Exams Taken", value: "12", icon: BookOpen },
  { title: "Hours Studied", value: "48", icon: Clock },
  { title: "Average Score", value: "82%", icon: Target },
  { title: "Best Subject", value: "Aircraft Systems", icon: Award },
];

const examHistory = [
  {
    exam: "PPL Air Law Mock Exam",
    date: "2024-07-15",
    score: 92,
    status: "Passed",
  },
  {
    exam: "CPL Meteorology Practice Test",
    date: "2024-07-12",
    score: 78,
    status: "Passed",
  },
  {
    exam: "EASA Part-66 Module 1",
    date: "2024-07-10",
    score: 65,
    status: "Failed",
  },
  {
    exam: "Navigation General",
    date: "2024-07-05",
    score: 85,
    status: "Passed",
  },
  {
    exam: "Instruments & Electronics",
    date: "2024-07-01",
    score: 75,
    status: "Passed",
  },
   {
    exam: "Aircraft Systems Mock",
    date: "2024-06-28",
    score: 95,
    status: "Passed",
  },
];

export default function MyProgressPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">My Progress</h1>
        <p className="text-muted-foreground">Track your performance and exam history.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {progressStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
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
                        {examHistory.map((item) => (
                        <TableRow key={item.exam}>
                            <TableCell>
                                <div className="font-medium">{item.exam}</div>
                                <div className="text-sm text-muted-foreground">{item.date}</div>
                            </TableCell>
                            <TableCell className="text-center font-bold">{item.score}%</TableCell>
                            <TableCell className="text-center">
                                <Badge variant={item.status === 'Passed' ? 'default': 'destructive'}>{item.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">Review</Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  )
}
