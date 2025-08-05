
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, LoaderCircle } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast";
import { createExam, CreateExamInput } from "@/ai/flows/create-exam";
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';

type Exam = {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    duration: number;
    createdAt: string;
}

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    duration: z.coerce.number().int().positive("Duration must be a positive number."),
    questionCount: z.coerce.number().int().min(5, "Exam must have at least 5 questions."),
    prompt: z.string().min(20, "Prompt must be detailed enough for the AI to understand."),
});

const CreateExamDialog = ({ onExamCreated }: { onExamCreated: () => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 60,
            questionCount: 10,
            prompt: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const input: CreateExamInput = { ...values };
            const result = await createExam(input);

            if (result.success) {
                toast({
                    title: "Exam Created by AI",
                    description: result.message,
                });
                onExamCreated();
                form.reset();
                setOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to create exam",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Exam with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create New Exam with AI</DialogTitle>
                        <DialogDescription>
                            Describe the exam you want to create, and our AI agent will select the most relevant questions for you from the question bank.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="title">Exam Title</Label>
                                <Input id="title" {...form.register("title")} placeholder="e.g., PPL Air Law Final Exam" />
                                {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Input id="description" {...form.register("description")} placeholder="A brief summary of the exam's content." />
                                {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input id="duration" type="number" {...form.register("duration")} />
                                {form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="questionCount">Number of Questions</Label>
                                <Input id="questionCount" type="number" {...form.register("questionCount")} />
                                {form.formState.errors.questionCount && <p className="text-sm text-destructive">{form.formState.errors.questionCount.message}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="prompt">AI Prompt</Label>
                            <Textarea 
                                id="prompt" 
                                {...form.register("prompt")} 
                                placeholder="Example: Create a CPL-level exam focusing on meteorology, especially interpreting TAF and METAR reports. Include a few questions about high-altitude weather phenomena." 
                                className="min-h-32"
                            />
                            {form.formState.errors.prompt && <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                             {isSubmitting ? "Building Exam..." : "Build Exam with AI"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function ExamManagementPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const db = getFirestore(app);
        const q = query(collection(db, "exams"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const examsData: Exam[] = [];
            querySnapshot.forEach((doc) => {
                examsData.push({ id: doc.id, ...doc.data() } as Exam);
            });
            setExams(examsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching exams: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch exams from the database.",
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl font-headline">Exam Management</h1>
                    <p className="text-muted-foreground">Create, view, and manage mock exams.</p>
                </div>
                <CreateExamDialog onExamCreated={() => {}} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Exams</CardTitle>
                    <CardDescription>A list of all exams currently available on the platform, created by the AI agent.</CardDescription>
                </CardHeader>
                <CardContent>
                     {isLoading ? (
                         <div className="flex justify-center items-center h-48">
                            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                         </div>
                     ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam Title</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="w-[120px] text-center">Questions</TableHead>
                                    <TableHead className="w-[120px] text-center">Duration</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No exams found. Use the AI agent to create one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    exams.map(exam => (
                                    <TableRow key={exam.id}>
                                        <TableCell className="font-medium">{exam.title}</TableCell>
                                        <TableCell className="text-muted-foreground">{exam.description}</TableCell>
                                        <TableCell className="text-center">{exam.questionCount}</TableCell>
                                        <TableCell className="text-center">{exam.duration} min</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )))}
                            </TableBody>
                        </Table>
                     )}
                </CardContent>
            </Card>
        </div>
    )
}
