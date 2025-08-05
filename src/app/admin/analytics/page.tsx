
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getKpiData, getPassFailData, getScoreDistributionData, getDifficultSubjectsData } from "@/ai/flows/get-analytics-data";
import type { Icon } from "lucide-react";
import { BadgeCheck, BookOpen, Target, Users } from "lucide-react";

const iconMap: { [key: string]: Icon } = {
    BadgeCheck,
    Users,
    Target,
    BookOpen,
};

export default async function AnalyticsPage() {
    const kpiData = await getKpiData();
    const passFailData = await getPassFailData();
    const scoreDistributionData = await getScoreDistributionData();
    const difficultSubjectsData = await getDifficultSubjectsData();

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">Platform Analytics</h1>
            <p className="text-muted-foreground">An overview of student engagement and performance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi) => {
                const IconComponent = iconMap[kpi.icon];
                return (
                    <Card key={kpi.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                            {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground">{kpi.change}</p>
                        </CardContent>
                    </Card>
                );
            })}
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
