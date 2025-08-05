
'use server';

/**
 * @fileOverview A set of flows to provide analytics data for the admin dashboard.
 * 
 * - getKpiData: Fetches key performance indicators.
 * - getPassFailData: Fetches exam pass/fail rates.
 * - getScoreDistributionData: Fetches score distribution data.
 * - getDifficultSubjectsData: Fetches data on the most difficult subjects.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { adminDb } from '@/lib/firebase-admin';
import { startOfMonth, subMonths, format } from 'date-fns';

// KPI Data Flow
const KpiDataSchema = z.object({
    title: z.string(),
    value: z.string(),
    change: z.string(),
    icon: z.string(),
});
const KpiDataOutputSchema = z.array(KpiDataSchema);
export type KpiDataOutput = z.infer<typeof KpiDataOutputSchema>;

export async function getKpiData(): Promise<KpiDataOutput> {
    return getKpiDataFlow();
}

const getKpiDataFlow = ai.defineFlow(
    {
      name: 'getKpiDataFlow',
      inputSchema: z.void(),
      outputSchema: KpiDataOutputSchema,
    },
    async () => {
        const usersSnapshot = await adminDb.collection('users').where('role', '==', 'Student').get();
        const questionsSnapshot = await adminDb.collection('questions').get();
        const examsCompletedSnapshot = await adminDb.collection('examResults').get();

        const totalStudents = usersSnapshot.size;
        const totalQuestions = questionsSnapshot.size;
        const totalExamsCompleted = examsCompletedSnapshot.size;

        const allScores = examsCompletedSnapshot.docs.map(doc => doc.data().score);
        const avgScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

        return [
            { title: "Exams Completed", value: totalExamsCompleted.toLocaleString(), change: "", icon: "BadgeCheck" },
            { title: "Active Students", value: totalStudents.toLocaleString(), change: "", icon: "Users" },
            { title: "Avg. Score", value: `${avgScore.toFixed(0)}%`, change: "", icon: "Target" },
            { title: "Questions in Bank", value: totalQuestions.toLocaleString(), change: "", icon: "BookOpen" },
        ];
    }
);


// Pass/Fail Data Flow
const PassFailDataSchema = z.object({
    month: z.string(),
    passed: z.number(),
    failed: z.number(),
});
const PassFailDataOutputSchema = z.array(PassFailDataSchema);
export type PassFailDataOutput = z.infer<typeof PassFailDataOutputSchema>;

export async function getPassFailData(): Promise<PassFailDataOutput> {
    return getPassFailDataFlow();
}

const getPassFailDataFlow = ai.defineFlow(
    {
      name: 'getPassFailDataFlow',
      inputSchema: z.void(),
      outputSchema: PassFailDataOutputSchema,
    },
    async () => {
        const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
        const snapshot = await adminDb.collection('examResults')
            .where('submittedAt', '>=', sixMonthsAgo.toISOString())
            .get();

        const monthlyData: {[key: string]: { passed: number, failed: number }} = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const date = new Date(data.submittedAt);
            const month = format(date, 'MMM');
            
            if (!monthlyData[month]) {
                monthlyData[month] = { passed: 0, failed: 0 };
            }

            if (data.score >= 75) {
                monthlyData[month].passed++;
            } else {
                monthlyData[month].failed++;
            }
        });

        // Ensure all last 6 months are present, even if no data
        for (let i = 5; i >= 0; i--) {
            const monthName = format(subMonths(new Date(), i), 'MMM');
            if(!monthlyData[monthName]) {
                monthlyData[monthName] = { passed: 0, failed: 0 };
            }
        }

        return Object.entries(monthlyData).map(([month, data]) => ({
            month,
            passed: data.passed,
            failed: data.failed,
        }));
    }
);

// Score Distribution Data Flow
const ScoreDistributionSchema = z.object({
    range: z.string(),
    count: z.number(),
});
const ScoreDistributionOutputSchema = z.array(ScoreDistributionSchema);
export type ScoreDistributionOutput = z.infer<typeof ScoreDistributionOutputSchema>;

export async function getScoreDistributionData(): Promise<ScoreDistributionOutput> {
    return getScoreDistributionDataFlow();
}

const getScoreDistributionDataFlow = ai.defineFlow(
    {
      name: 'getScoreDistributionDataFlow',
      inputSchema: z.void(),
      outputSchema: ScoreDistributionOutputSchema,
    },
    async () => {
        const snapshot = await adminDb.collection('examResults').get();
        const distribution = {
            "0-50%": 0,
            "51-70%": 0,
            "71-90%": 0,
            "91-100%": 0,
        };

        snapshot.docs.forEach(doc => {
            const score = doc.data().score;
            if (score <= 50) distribution["0-50%"]++;
            else if (score <= 70) distribution["51-70%"]++;
            else if (score <= 90) distribution["71-90%"]++;
            else distribution["91-100%"]++;
        });

        return Object.entries(distribution).map(([range, count]) => ({ range, count }));
    }
);

// Difficult Subjects Data Flow
const DifficultSubjectsSchema = z.object({
    subject: z.string(),
    avgScore: z.number(),
});
const DifficultSubjectsOutputSchema = z.array(DifficultSubjectsSchema);
export type DifficultSubjectsOutput = z.infer<typeof DifficultSubjectsOutputSchema>;

export async function getDifficultSubjectsData(): Promise<DifficultSubjectsOutput> {
    return getDifficultSubjectsDataFlow();
}

const getDifficultSubjectsDataFlow = ai.defineFlow(
    {
      name: 'getDifficultSubjectsDataFlow',
      inputSchema: z.void(),
      outputSchema: DifficultSubjectsOutputSchema,
    },
    async () => {
        const snapshot = await adminDb.collection('examResults').get();
        const subjectsData: {[key: string]: { totalScore: number, count: number }} = {};

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            const subject = data.subject || "General";
            if (!subjectsData[subject]) {
                subjectsData[subject] = { totalScore: 0, count: 0 };
            }
            subjectsData[subject].totalScore += data.score;
            subjectsData[subject].count++;
        });

        return Object.entries(subjectsData)
            .map(([subject, data]) => ({
                subject,
                avgScore: parseFloat((data.totalScore / data.count).toFixed(2)),
            }))
            .sort((a, b) => a.avgScore - b.avgScore) // Sort by lowest score first
            .slice(0, 5); // Return top 5 most difficult
    }
);
