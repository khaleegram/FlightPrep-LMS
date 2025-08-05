
"use client"

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BadgeCheck, BookOpen, Target, Users } from "lucide-react"

const kpiData = [
    { title: "Exams Completed", value: "1,402", change: "+15% this month", icon: BadgeCheck },
    { title: "Active Students", value: "327", change: "24 active today", icon: Users },
    { title: "Avg. Score", value: "81%", change: "+1.2% this month", icon: Target },
    { title: "Questions Answered", value: "70,100", change: "+10k this month", icon: BookOpen },
]

const passFailData = [
  { month: "Jan", passed: 88, failed: 12 },
  { month: "Feb", passed: 92, failed: 8 },
  { month: "Mar", passed: 95, failed: 5 },
  { month: "Apr", passed: 90, failed: 10 },
  { month: "May", passed: 85, failed: 15 },
  { month: "Jun", passed: 91, failed: 9 },
]

const scoreDistributionData = [
    { range: "0-50%", count: 18 },
    { range: "51-70%", count: 45 },
    { range: "71-90%", count: 120 },
    { range: "91-100%", count: 98 },
]

const difficultSubjectsData = [
    { subject: "Meteorology", avgScore: 68 },
    { subject: "Instruments", avgScore: 71 },
    { subject: "Nav Aids", avgScore: 74 },
    { subject: "Air Law", avgScore: 78 },
    { subject: "Gen Nav", avgScore: 80 },
]

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">Platform Analytics</h1>
            <p className="text-muted-foreground">An overview of student engagement and performance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.change}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Exam Pass/Fail Rates</CardTitle>
                <CardDescription>Monthly trend of student exam outcomes.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={passFailData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                             contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="passed" stroke="hsl(var(--primary))" name="Passed" unit="%" strokeWidth={2} />
                        <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" name="Failed" unit="%" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>How student scores are bucketed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scoreDistributionData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                           <Tooltip
                             contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                            }}
                           />
                           <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Number of Students" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Most Difficult Subjects</CardTitle>
                    <CardDescription>Subjects with the lowest average scores.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={difficultSubjectsData} layout="vertical">
                           <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                           <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                           <YAxis type="category" dataKey="subject" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                           <Tooltip
                             contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                            }}
                           />
                           <Bar dataKey="avgScore" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Average Score" unit="%" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
