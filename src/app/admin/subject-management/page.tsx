
"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addSubject, listSubjects, Subject, AddSubjectInput } from "@/ai/flows/manage-subjects";
import { LoaderCircle, Library } from "lucide-react";

const departments = ['Flying School', 'Aircraft Maintenance Engineering', 'Air Traffic Control', 'Cabin Crew', 'Prospective Students'] as const;

const addSubjectFormSchema = z.object({
    department: z.string({ required_error: "Please select a department." }),
    name: z.string().min(3, "Subject name must be at least 3 characters long."),
});

type GroupedSubjects = {
    [key: string]: Subject[];
}

export default function SubjectManagementPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const form = useForm<z.infer<typeof addSubjectFormSchema>>({
        resolver: zodResolver(addSubjectFormSchema),
        defaultValues: { name: "", department: undefined },
    });

    const fetchSubjects = async () => {
        setIsLoading(true);
        try {
            const subjectList = await listSubjects();
            setSubjects(subjectList);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: `Could not fetch subjects: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const groupedSubjects = subjects.reduce((acc, subject) => {
        const { department } = subject;
        if (!acc[department]) {
            acc[department] = [];
        }
        acc[department].push(subject);
        return acc;
    }, {} as GroupedSubjects);


    const onSubmit = async (values: z.infer<typeof addSubjectFormSchema>) => {
        setIsSubmitting(true);
        try {
            const input: AddSubjectInput = { name: values.name, department: values.department };
            const result = await addSubject(input);

            if (result.success) {
                toast({ title: "Subject Added", description: result.message });
                form.reset();
                await fetchSubjects();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to add subject", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">Subject Management</h1>
                <p className="text-muted-foreground">Add and organize subjects within each department.</p>
            </div>
             <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader>
                                <CardTitle>Add New Subject</CardTitle>
                                <CardDescription>Create a new subject for a specific department.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                               <div className="grid gap-2">
                                    <Label htmlFor="department">Department</Label>
                                    <Controller
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger id="department">
                                                    <SelectValue placeholder="Select a department..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {form.formState.errors.department && <p className="text-sm text-destructive">{form.formState.errors.department.message}</p>}
                               </div>
                               <div className="grid gap-2">
                                    <Label htmlFor="name">Subject Name</Label>
                                    <Input id="name" {...form.register("name")} placeholder="e.g., Aerodynamics" />
                                    {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                               </div>
                               <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "Adding..." : "Add Subject"}
                               </Button>
                            </CardContent>
                        </form>
                    </Card>
                </div>
                <div className="md:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Existing Subjects</CardTitle>
                            <CardDescription>All available subjects, grouped by department.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : Object.keys(groupedSubjects).length === 0 ? (
                                 <div className="text-center text-muted-foreground py-12">No subjects found. Add one to get started.</div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedSubjects).map(([department, subjectList]) => (
                                        <div key={department}>
                                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                                <Library className="h-5 w-5 text-primary" />
                                                {department}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {subjectList.map(subject => (
                                                    <div key={subject.id} className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-sm">
                                                        {subject.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
