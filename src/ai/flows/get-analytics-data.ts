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


// Common auth policy for all analytics flows
const isAdminPolicy = {
    policy: async (auth: any, input: any) => {
      if (!auth) {
        throw new Error("Authentication required.");
      }
      if (!auth.custom?.isAdmin) {
        throw new Error("You must be an admin to perform this action.");
      }
    },
};

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
      auth: isAdminPolicy,
    },
    async () => {
        // In a real app, this data would be fetched and calculated from a database.
        return [
            { title: "Exams Completed", value: "1,402", change: "+15% this month", icon: "BadgeCheck" },
            { title: "Active Students", value: "327", change: "24 active today", icon: "Users" },
            { title: "Avg. Score", value: "81%", change: "+1.2% this month", icon: "Target" },
            { title: "Questions Answered", value: "70,100", change: "+10k this month", icon: "BookOpen" },
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
      auth: isAdminPolicy,
    },
    async () => {
        return [
            { month: "Jan", passed: 88, failed: 12 },
            { month: "Feb", passed: 92, failed: 8 },
            { month: "Mar", passed: 95, failed: 5 },
            { month: "Apr", passed: 90, failed: 10 },
            { month: "May", passed: 85, failed: 15 },
            { month: "Jun", passed: 91, failed: 9 },
        ];
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
      auth: isAdminPolicy,
    },
    async () => {
        return [
            { range: "0-50%", count: 18 },
            { range: "51-70%", count: 45 },
            { range: "71-90%", count: 120 },
            { range: "91-100%", count: 98 },
        ];
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
      auth: isAdminPolicy,
    },
    async () => {
        return [
            { subject: "Meteorology", avgScore: 68 },
            { subject: "Instruments", avgScore: 71 },
            { subject: "Nav Aids", avgScore: 74 },
            { subject: "Air Law", avgScore: 78 },
            { subject: "Gen Nav", avgScore: 80 },
        ];
    }
);
