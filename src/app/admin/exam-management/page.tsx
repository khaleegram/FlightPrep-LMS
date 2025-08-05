
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
import { MoreHorizontal, LoaderCircle, FileUp, Sparkles, BookCheck, FilePlus2, ListPlus } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExamFromSource } from "@/ai/flows/create-exam-from-source";
import { createExam as createExamFromBankWithAI } from "@/ai/flows/create-exam-from-bank";
import { createExam as createExamManually } from "@/ai/flows/create-exam";
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { listSubjects, Subject, listDepartments, Department } from "@/ai/flows/manage-subjects";
import { analyzeDocument, AnalyzeDocumentOutput } from "@/ai/flows/analyze-document";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type Exam = {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    duration: number;
    createdAt: string;
}

type Question = {
    id: string;
    questionText: string;
    subject: string;
    department: string;
};

const createFromSourceFormSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    duration: z.coerce.number().int().positive("Duration must be a positive number."),
    prompt: z.string().min(20, "Prompt must be detailed enough for the AI to understand."),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    sourceFile: z.instanceof(FileList).refine(files => files?.length > 0, "A source file is required."),
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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeDocumentOutput | null>(null);
    const [sourceDataUri, setSourceDataUri] = useState<string | null>(null);

    const form = useForm<z.infer<typeof createFromSourceFormSchema>>({
        resolver: zodResolver(createFromSourceFormSchema),
        defaultValues: { title: "", description: "", duration: 60, prompt: "", difficulty: "Medium" },
    });

    const { register, handleSubmit, setValue, formState, watch, reset } = form;
    const sourceFile = watch("sourceFile");

    useEffect(() => {
        if (sourceFile && sourceFile.length > 0) {
            const file = sourceFile[0];
            if (file.size > 20 * 1024 * 1024) { // 20MB limit
                 toast({ variant: "destructive", title: "File Too Large", description: "Please upload a file smaller than 20MB." });
                 return;
            }
            setIsAnalyzing(true);
            setAnalysisResult(null);
            fileToDataUri(file).then(dataUri => {
                setSourceDataUri(dataUri);
                analyzeDocument({ sourceDataUri: dataUri })
                    .then(result => {
                        setValue("title", result.title);
                        setValue("description", result.description);
                        setAnalysisResult(result);
                    })
                    .catch(error => {
                        toast({ variant: "destructive", title: "Analysis Failed", description: error.message });
                    })
                    .finally(() => setIsAnalyzing(false));
            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceFile, setValue, toast]);


    const onSubmit = async (values: z.infer<typeof createFromSourceFormSchema>) => {
        setIsSubmitting(true);
        try {
            if (!sourceDataUri) {
                throw new Error("Source file data URI is not available.");
            }
            const input = { ...values, sourceDataUri };
            const result = await createExamFromSource(input);

            if (result.success) {
                toast({ title: "Exam Created by AI", description: result.message });
                onExamCreated();
                reset();
                setAnalysisResult(null);
                setSourceDataUri(null);
                setOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Failed to create exam", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    AI-Generate from Source
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary"/> AI Content Generator</DialogTitle>
                        <DialogDescription>Generate a new exam and questions from a source document (e.g., PDF study guide). Upload a file to begin.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid gap-2"><Label htmlFor="sourceFile">Source Document (PDF, up to 20MB)</Label><div className="flex items-center gap-2 p-3 border-dashed border-2 rounded-lg justify-center text-muted-foreground"><FileUp className="h-6 w-6"/><Input id="sourceFile" type="file" accept="application/pdf" {...register("sourceFile")} className="text-sm border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"/></div>
                        {formState.errors.sourceFile && <p className="text-sm text-destructive">{formState.errors.sourceFile.message}</p>}
                        </div>
                        
                        {(isAnalyzing || analysisResult) && (
                             <Card>
                                <CardContent className="pt-6">
                                    {isAnalyzing && (
                                        <div className="flex items-center gap-2 text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" /> <p>Analyzing document...</p></div>
                                    )}
                                    {analysisResult && (
                                        <Alert>
                                            <Sparkles className="h-4 w-4" />
                                            <AlertTitle>Analysis Complete</AlertTitle>
                                            <AlertDescription>{analysisResult.summary}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="grid gap-2"><Label htmlFor="title">Exam Title</Label><Input id="title" {...register("title")} placeholder="AI will suggest a title..." />{formState.errors.title && <p className="text-sm text-destructive">{formState.errors.title.message}</p>}</div>
                             <div className="grid gap-2"><Label htmlFor="description">Short Description</Label><Input id="description" {...register("description")} placeholder="AI will suggest a description..." />{formState.errors.description && <p className="text-sm text-destructive">{formState.errors.description.message}</p>}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label htmlFor="duration">Duration (minutes)</Label><Input id="duration" type="number" {...register("duration")} />{formState.errors.duration && <p className="text-sm text-destructive">{formState.errors.duration.message}</p>}</div>
                            <div className="grid gap-2"><Label htmlFor="difficulty">Difficulty</Label><Controller control={form.control} name="difficulty" render={({ field }) => (<Select onValueChange={field.onChange} defaultValue={field.value}><SelectTrigger id="difficulty"><SelectValue placeholder="Select difficulty..." /></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent></Select>)} /></div>
                        </div>
                        <div className="grid gap-2"><Label htmlFor="prompt">AI Prompt</Label><Textarea id="prompt" {...register("prompt")} placeholder="Example: Generate a 15-question quiz from the uploaded handout on 'High-Speed Flight'. Focus on the concepts of Mach number and shockwaves." className="min-h-32"/>{formState.errors.prompt && <p className="text-sm text-destructive">{formState.errors.prompt.message}</p>}</div>
                    </div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose><Button type="submit" disabled={isSubmitting || isAnalyzing || !analysisResult}>{isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />} {isSubmitting ? "Generating Content..." : "Generate with AI"}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const CreateExamFromBankAIDialog = ({ onExamCreated }: { onExamCreated: () => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof createFromBankAIFormSchema>>({
        resolver: zodResolver(createFromBankAIFormSchema),
        defaultValues: { title: "", description: "", duration: 60, prompt: "", questionCount: 10, },
    });

    const onSubmit = async (values: z.infer<typeof createFromBankAIFormSchema>) => {
        setIsSubmitting(true);
        try {
            const result = await createExamFromBankWithAI(values);

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
                <Button variant="outline">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI-Assemble from Bank
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

const CreateExamManuallyDialog = ({ onExamCreated, allQuestions }: { onExamCreated: () => void, allQuestions: Question[] }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
    const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);

    const form = useForm<z.infer<typeof createManuallyFormSchema>>({
        resolver: zodResolver(createManuallyFormSchema),
        defaultValues: { title: "", description: "", duration: 60, questionIds: [] },
    });

    useEffect(() => {
        if(open) {
            listDepartments().then(setAvailableDepartments);
        }
    }, [open]);

    const { setValue } = form;

    useEffect(() => {
        if (selectedDepartment) {
            listSubjects({ department: selectedDepartment }).then(subjects => {
                setAvailableSubjects(subjects);
                setSelectedSubject(""); 
                setValue("questionIds", []);
            });
        } else {
            setAvailableSubjects([]);
            setSelectedSubject("");
             setValue("questionIds", []);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartment]);


    const filteredQuestions = useMemo(() => {
        if (!selectedDepartment || !selectedSubject) return [];
        return allQuestions.filter(q => q.department === selectedDepartment && q.subject === selectedSubject);
    }, [allQuestions, selectedDepartment, selectedSubject]);

    useEffect(() => {
        setValue("questionIds", []);
    }, [selectedSubject, setValue]);


    const selectedIds = form.watch("questionIds");

    const onSubmit = async (values: z.infer<typeof createManuallyFormSchema>) => {
        setIsSubmitting(true);
        try {
            const input = { ...values };
            const result = await createExamManually(input);

            if (result.success) {
                toast({ title: "Exam Created", description: result.message });
                onExamCreated();
                form.reset();
                setSelectedDepartment("");
                setSelectedSubject("");
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
                    <ListPlus className="mr-2 h-4 w-4" />
                    Create Manually
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create Exam Manually</DialogTitle>
                        <DialogDescription>Build an exam by hand-picking questions from the bank. ({selectedIds.length} selected)</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-8">
                        <div className="space-y-4 col-span-1 md:col-span-2">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label htmlFor="title-manual">Exam Title</Label><Input id="title-manual" {...form.register("title")} placeholder="e.g., PPL Final Practice Exam" />{form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}</div>
                                <div className="grid gap-2"><Label htmlFor="duration-manual">Duration (minutes)</Label><Input id="duration-manual" type="number" {...form.register("duration")} />{form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}</div>
                            </div>
                            <div className="grid gap-2"><Label htmlFor="description-manual">Short Description</Label><Textarea id="description-manual" {...form.register("description")} placeholder="A brief summary of the exam's content." rows={2}/>{form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}</div>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2">
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger><SelectValue placeholder="Select a department..." /></SelectTrigger>
                                    <SelectContent>
                                        {availableDepartments.map(dep => <SelectItem key={dep.id} value={dep.name}>{dep.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label>Subject</Label>
                                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedDepartment}>
                                    <SelectTrigger><SelectValue placeholder="Select a subject..." /></SelectTrigger>
                                    <SelectContent>
                                        {availableSubjects.map(sub => <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <Label>Select Questions</Label>
                            <Controller
                                name="questionIds"
                                control={form.control}
                                render={({ field }) => (
                                    <ScrollArea className="h-60 mt-2 w-full rounded-md border">
                                        <Table>
                                             <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]"></TableHead>
                                                    <TableHead>Question</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredQuestions.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                            {selectedDepartment && selectedSubject ? "No questions found for this subject." : "Please select a department and subject."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredQuestions.map(q => (
                                                    <TableRow key={q.id}>
                                                        <TableCell><Checkbox checked={field.value?.includes(q.id)} onCheckedChange={(checked) => {
                                                            return checked ? field.onChange([...(field.value || []), q.id]) : field.onChange(field.value?.filter((value) => value !== q.id))
                                                        }} /></TableCell>
                                                        <TableCell className="font-medium">{q.questionText}</TableCell>
                                                        <TableCell><Badge variant="outline">{q.subject}</Badge></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                )}
                            />
                            {form.formState.errors.questionIds && <p className="text-sm text-destructive mt-2">{form.formState.errors.questionIds.message}</p>}
                        </div>

                    </div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose><Button type="submit" disabled={isSubmitting}>{isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />} {isSubmitting ? "Saving Exam..." : "Save Exam"}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function ExamManagementPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const db = getFirestore(app);
        const examsQuery = query(collection(db, "exams"), orderBy("createdAt", "desc"));
        const questionsQuery = query(collection(db, "questions"), orderBy("createdAt", "desc"));

        const unsubExams = onSnapshot(examsQuery, (snapshot) => {
            const examsData: Exam[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
            setExams(examsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching exams: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch exams." });
            setIsLoading(false);
        });
        
        const unsubQuestions = onSnapshot(questionsQuery, (snapshot) => {
            const questionsData: Question[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
            setAllQuestions(questionsData);
        }, (error) => {
            console.error("Error fetching questions: ", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch questions for manual creation." });
        });

        return () => {
            unsubExams();
            unsubQuestions();
        };
    }, [toast]);
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl font-headline">Exam Management</h1>
                    <p className="text-muted-foreground">Create, view, and manage mock exams using AI-powered tools.</p>
                </div>
                <div className="flex items-center gap-2">
                    <CreateExamManuallyDialog onExamCreated={() => {}} allQuestions={allQuestions} />
                    <CreateExamFromBankAIDialog onExamCreated={() => {}} />
                    <CreateExamFromSourceDialog onExamCreated={() => {}} />
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
                                            No exams found. Use one of the creation methods to get started.
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
