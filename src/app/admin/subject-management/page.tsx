
"use client"

import { useState, useEffect, useMemo } from "react"
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
import { addSubject, listSubjects, Subject, AddSubjectInput, addDepartment, listDepartments, Department } from "@/ai/flows/manage-subjects";
import { LoaderCircle, Library, Building } from "lucide-react";

const addSubjectFormSchema = z.object({
    department: z.string({ required_error: "Please select a department." }),
    name: z.string().min(3, "Subject name must be at least 3 characters long."),
});

const addDepartmentFormSchema = z.object({
    name: z.string().min(5, "Department name must be at least 5 characters long."),
});

type GroupedSubjects = {
    [key: string]: Subject[];
}

export default function SubjectsPage() {
    const { toast } = useToast();
    const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);
    const [isSubmittingDept, setIsSubmittingDept] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const subjectForm = useForm<z.infer<typeof addSubjectFormSchema>>({
        resolver: zodResolver(addSubjectFormSchema),
        defaultValues: { name: "", department: undefined },
    });

     const departmentForm = useForm<z.infer<typeof addDepartmentFormSchema>>({
        resolver: zodResolver(addDepartmentFormSchema),
        defaultValues: { name: "" },
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [subjectList, departmentList] = await Promise.all([
                listSubjects(),
                listDepartments()
            ]);
            setSubjects(subjectList);
            setDepartments(departmentList);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: `Could not fetch data: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const groupedSubjects = useMemo(() => subjects.reduce((acc, subject) => {
        const { department } = subject;
        if (!acc[department]) {
            acc[department] = [];
        }
        acc[department].push(subject);
        return acc;
    }, {} as GroupedSubjects), [subjects]);


    const onSubjectSubmit = async (values: z.infer<typeof addSubjectFormSchema>) => {
        setIsSubmittingSubject(true);
        try {
            const input: AddSubjectInput = { name: values.name, department: values.department };
            const result = await addSubject(input);

            if (result.success) {
                toast({ title: "Subject Added", description: result.message });
                subjectForm.reset();
                await fetchData();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to add subject", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsSubmittingSubject(false);
        }
    };

    const onDepartmentSubmit = async (values: z.infer<typeof addDepartmentFormSchema>) => {
        setIsSubmittingDept(true);
        try {
            const result = await addDepartment(values);
            if (result.success) {
                toast({ title: "Department Added", description: result.message });
                departmentForm.reset();
                await fetchData();
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
             toast({ variant: "destructive", title: "Failed to add department", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsSubmittingDept(false);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">Subjects & Departments</h1>
                <p className="text-muted-foreground">Manage your institution's organizational structure.</p>
            </div>
             <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card>
                    <form onSubmit={departmentForm.handleSubmit(onDepartmentSubmit)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5"/>Add New Department</CardTitle>
                            <CardDescription>Create a new department (e.g., Flying School).</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                           <div className="grid gap-2">
                                <Label htmlFor="dept-name">Department Name</Label>
                                <Input id="dept-name" {...departmentForm.register("name")} placeholder="e.g., Cabin Crew" />
                                {departmentForm.formState.errors.name && <p className="text-sm text-destructive">{departmentForm.formState.errors.name.message}</p>}
                           </div>
                           <Button type="submit" disabled={isSubmittingDept}>
                                {isSubmittingDept && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmittingDept ? "Adding..." : "Add Department"}
                           </Button>
                        </CardContent>
                    </form>
                </Card>
                 <Card>
                    <form onSubmit={subjectForm.handleSubmit(onSubjectSubmit)}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Library className="h-5 w-5"/>Add New Subject</CardTitle>
                            <CardDescription>Create a new subject within a department.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                           <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Controller
                                    control={subjectForm.control}
                                    name="department"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger id="department">
                                                <SelectValue placeholder="Select a department..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map(dep => <SelectItem key={dep.id} value={dep.name}>{dep.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {subjectForm.formState.errors.department && <p className="text-sm text-destructive">{subjectForm.formState.errors.department.message}</p>}
                           </div>
                           <div className="grid gap-2">
                                <Label htmlFor="name">Subject Name</Label>
                                <Input id="name" {...subjectForm.register("name")} placeholder="e.g., Aerodynamics" />
                                {subjectForm.formState.errors.name && <p className="text-sm text-destructive">{subjectForm.formState.errors.name.message}</p>}
                           </div>
                           <Button type="submit" disabled={isSubmittingSubject}>
                                {isSubmittingSubject && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmittingSubject ? "Adding..." : "Add Subject"}
                           </Button>
                        </CardContent>
                    </form>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Curriculum Overview</CardTitle>
                    <CardDescription>All available departments and their subjects.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : departments.length === 0 ? (
                         <div className="text-center text-muted-foreground py-12">No departments or subjects found. Add one to get started.</div>
                    ) : (
                        <div className="space-y-6">
                            {departments.map((department) => (
                                <div key={department.id}>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 border-b pb-2">
                                        <Building className="h-5 w-5 text-muted-foreground" />
                                        {department.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {groupedSubjects[department.name] ? groupedSubjects[department.name].map(subject => (
                                            <div key={subject.id} className="bg-muted text-muted-foreground rounded-md px-3 py-1 text-sm font-medium flex items-center gap-1">
                                                <Library className="h-3 w-3" />
                                                {subject.name}
                                            </div>
                                        )) : (
                                            <p className="text-sm text-muted-foreground italic">No subjects added to this department yet.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

