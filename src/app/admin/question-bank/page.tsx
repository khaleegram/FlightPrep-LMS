
"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { MoreHorizontal, PlusCircle, Trash2, LoaderCircle } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast";
import { addQuestion, AddQuestionInput } from "@/ai/flows/add-question";
import { getFirestore, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase';

type Question = {
    id: string;
    questionText: string;
    subject: string;
    createdAt: string;
}

const formSchema = z.object({
    questionText: z.string().min(10, "Question must be at least 10 characters long."),
    subject: z.string().min(3, "Subject is required."),
    options: z.array(z.object({ value: z.string().min(1, "Option cannot be empty.") })).min(2, "At least two options are required."),
    correctAnswer: z.string({ required_error: "You must select a correct answer." }),
});

const CreateQuestionDialog = ({ onQuestionAdded }: { onQuestionAdded: () => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionText: "",
            subject: "",
            options: [{ value: "" }, { value: "" }],
            correctAnswer: undefined,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "options",
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const input: AddQuestionInput = {
                questionText: values.questionText,
                subject: values.subject,
                options: values.options.map(o => o.value),
                correctAnswer: values.correctAnswer,
            };

            const result = await addQuestion(input);

            if (result.success) {
                toast({
                    title: "Question Added",
                    description: result.message,
                });
                onQuestionAdded();
                form.reset();
                setOpen(false);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to add question",
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
                    Create New Question
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create New Question</DialogTitle>
                        <DialogDescription>
                            Add a new question to the question bank for use in mock exams.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid gap-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" {...form.register("subject")} placeholder="e.g., Air Law" />
                             {form.formState.errors.subject && <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="questionText">Question Text</Label>
                            <Textarea id="questionText" {...form.register("questionText")} placeholder="Enter the full question text here..." />
                             {form.formState.errors.questionText && <p className="text-sm text-destructive">{form.formState.errors.questionText.message}</p>}
                        </div>
                        
                        <div className="grid gap-3">
                            <Label>Answer Options</Label>
                             <Controller
                                control={form.control}
                                name="correctAnswer"
                                render={({ field }) => (
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="grid gap-3"
                                    >
                                        {fields.map((item, index) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                 <RadioGroupItem value={form.watch(`options.${index}.value`)} id={`r${index}`} />
                                                <Input
                                                    placeholder={`Option ${index + 1}`}
                                                    {...form.register(`options.${index}.value`)}
                                                    className="flex-1"
                                                />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}
                            />
                            {form.formState.errors.options && <p className="text-sm text-destructive">Each option must have a value.</p>}
                            {form.formState.errors.correctAnswer && <p className="text-sm text-destructive">{form.formState.errors.correctAnswer.message}</p>}

                            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                             {isSubmitting ? "Saving..." : "Save Question"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function QuestionBankPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const db = getFirestore(app);
        const q = query(collection(db, "questions"), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const questionsData: Question[] = [];
            querySnapshot.forEach((doc) => {
                questionsData.push({ id: doc.id, ...doc.data() } as Question);
            });
            setQuestions(questionsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching questions: ", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not fetch questions from the database.",
            });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl font-headline">Question Bank</h1>
                    <p className="text-muted-foreground">Manage all questions for mock exams across all subjects.</p>
                </div>
                <CreateQuestionDialog onQuestionAdded={() => {}} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Questions</CardTitle>
                    <CardDescription>A list of all questions currently in the system.</CardDescription>
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
                                    <TableHead>Question</TableHead>
                                    <TableHead className="w-[150px]">Subject</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            No questions found. Try seeding the database from the dashboard.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    questions.map(q => (
                                    <TableRow key={q.id}>
                                        <TableCell className="font-medium">{q.questionText}</TableCell>
                                        <TableCell><Badge variant="outline">{q.subject}</Badge></TableCell>
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
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
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
