
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
import { Award, BookOpen, Clock, Target } from "lucide-react"
import Link from "next/link"

const progressStats = [
  { title: "Exams Taken", value: "0", icon: BookOpen },
  { title: "Hours Studied", value: "0", icon: Clock },
  { title: "Average Score", value: "N/A", icon: Target },
  { title: "Best Subject", value: "N/A", icon: Award },
];

const examHistory: any[] = [];

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
                        {examHistory.length === 0 ? (
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
