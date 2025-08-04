"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

const data = [
  { name: "Air Law", score: 52 },
  { name: "Meteorology", score: 88 },
  { name: "Navigation", score: 72 },
  { name: "Instruments", score: 65 },
  { name: "Principles of Flight", score: 78 },
  { name: "Aircraft Systems", score: 91 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-card border rounded-lg shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-primary">{`Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
  
    return null;
  };

export function ProgressChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance by Subject</CardTitle>
        <CardDescription>Breakdown of your recent mock exam scores.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-30}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1 }}
              content={<CustomTooltip />}
            />
            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
