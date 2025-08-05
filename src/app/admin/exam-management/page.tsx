
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
import { MoreHorizontal, LoaderCircle, FileUp, Sparkles, BookCheck, FilePlus2 } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExamFromSource, CreateExamFromSourceInput } from "@/ai/flows/create-exam-from-source";
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

const createFromSourceFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    duration: z.coerce.number().int().positive("Duration must be a positive number."),
    prompt: z.string().min(20, "Prompt must be detailed enough for the AI to understand."),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    sourceFile: z.instanceof(FileList).optional(),
});

const createFromBankFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    duration: z.coerce.number().int().positive("Duration must be a positive number."),
    prompt: z.string().min(20, "Prompt must be detailed enough for the AI to understand."),
    questionCount: z.coerce.number().int().min(1, "Must have at least 1 question."),
});

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const CreateExamFromSourceDialog = ({ onExamCreated }: { onExamCreated: () => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof createFromSourceFormSchema>>({
        resolver: zodResolver(createFromSourceFormSchema),
        defaultValues: { title: "", description: "", duration: 60, prompt: "", difficulty: "Medium", sourceFile: undefined },
    });

    const onSubmit = async (values: z.infer<typeof createFromSourceFormSchema>) => {
        setIsSubmitting(true);
        try {
             let sourceDataUri: string | undefined = undefined;
            if (values.sourceFile && values.sourceFile.length > 0) {
                const file = values.sourceFile[0];
                if (file.size > 4 * 1024 * 1024) { // 4MB limit
                     toast({ variant: "destructive", title: "File Too Large", description: "Please upload a file smaller than 4MB." });
                     setIsSubmitting(false);
                     return;
                }
                sourceDataUri = await fileToDataUri(file);
            }

            const input: CreateExamFromSourceInput = { ...values, sourceDataUri };
            const result = await createExamFromSource(input);

            if (result.success) {
                toast({ title: "Exam Created by AI", description: result.message });
                onExamCreated();
                form.reset();
                setOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create exam", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create from Source
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/> AI Content Generator</DialogTitle>
                        <DialogDescription>Generate a new exam and questions from a source document (e.g., PDF study guide) or a detailed prompt.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2"><Label htmlFor="title">Exam Title</Label><Input id="title" {...form.register("title")} placeholder="e.g., CPL Aerodynamics Midterm" />{form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}</div>
                             <div className="grid gap-2"><Label htmlFor="description">Short Description</Label><Input id="description" {...form.register("description")} placeholder="A brief summary of the exam's content." />{form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="duration">Duration (minutes)</Label><Input id="duration" type="number" {...form.register("duration")} />{form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}</div>
                            <div className="grid gap-2"><Label htmlFor="difficulty">Difficulty</Label><Controller control={form.control} name="difficulty" render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger id="difficulty"><SelectValue placeholder="Select difficulty..." /></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select>)} /></div>
                        </div>
                        <div className="grid gap-2"><Label htmlFor="sourceFile">Source Document (Optional)</Label><div className="flex items-center gap-2 p-3 border-dashed border-2 rounded-lg justify-center text-muted-foreground"><FileUp className="h-6 w-6"/><Input id="sourceFile" type="file" {...form.register("sourceFile")} className="text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"/></div><p className="text-xs text-muted-foreground">Upload a PDF/text file. AI will parse questions or generate new ones from it.</p></div>
                        <div className="grid gap-2"><Label htmlFor="prompt">AI Prompt</Label><Textarea id="prompt" {...form.register("prompt")} placeholder="Example: Generate a 15-question quiz from the uploaded handout on 'High-Speed Flight'. Focus on the concepts of Mach number and shockwaves." className="min-h-32"/>{form.formState.errors.prompt && <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>}</div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose><Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />} {isSubmitting ? "Generating Content..." : "Generate with AI"}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


const CreateExamFromBankDialog = ({ onExamCreated }: { onExamCreated: () => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof createFromBankFormSchema>>({
        resolver: zodResolver(createFromBankFormSchema),
        defaultValues: { title: "", description: "", duration: 60, prompt: "", questionCount: 10, },
    });

    const onSubmit = async (values: z.infer<typeof createFromBankFormSchema>) => {
        setIsSubmitting(true);
        try {
            const input: CreateExamInput = { ...values };
            const result = await createExam(input);

            if (result.success) {
                toast({ title: "Exam Assembled by AI", description: result.message });
                onExamCreated();
                form.reset();
                setOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create exam", description: error.message || "An unexpected error occurred." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <BookCheck className="mr-2 h-4 w-4" />
                    Create from Bank
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/> AI Exam Assembler</DialogTitle>
                        <DialogDescription>Build a new exam by having the AI select relevant questions from the existing question bank based on your prompt.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2"><Label htmlFor="title-bank">Exam Title</Label><Input id="title-bank" {...form.register("title")} placeholder="e.g., PPL Final Practice Exam" />{form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}</div>
                             <div className="grid gap-2"><Label htmlFor="description-bank">Short Description</Label><Input id="description-bank" {...form.register("description")} placeholder="A general knowledge PPL exam." />{form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="duration-bank">Duration (minutes)</Label><Input id="duration-bank" type="number" {...form.register("duration")} />{form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}</div>
                            <div className="grid gap-2"><Label htmlFor="questionCount-bank">Number of Questions</Label><Input id="questionCount-bank" type="number" {...form.register("questionCount")} />{form.formState.errors.questionCount && <p className="text-sm text-destructive">{form.formState.errors.questionCount.message}</p>}</div>
                        </div>
                        <div className="grid gap-2"><Label htmlFor="prompt-bank">AI Prompt</Label><Textarea id="prompt-bank" {...form.register("prompt")} placeholder="Example: Create a 25-question exam for private pilots focusing on meteorology and weather chart interpretation." className="min-h-24"/>{form.formState.errors.prompt && <p className="text-sm text-destructive">{form.formState.errors.prompt.message}</p>}</div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose><Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />} {isSubmitting ? "Assembling Exam..." : "Build Exam with AI"}</Button></DialogFooter>
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
                    <p className="text-muted-foreground">Create, view, and manage mock exams using AI-powered tools.</p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateExamFromSourceDialog onExamCreated={() => {}} />
                    <CreateExamFromBankDialog onExamCreated={() => {}} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Exams</CardTitle>
                    <CardDescription>A list of all exams currently available on the platform.</CardDescription>
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
                                            No exams found. Use one of the AI agents to create one.
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
                                                    <DropdownMenuItem>Edit Exam</DropdownMenuItem>
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
