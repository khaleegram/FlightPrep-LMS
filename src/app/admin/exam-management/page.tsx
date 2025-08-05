
"use client"

import { useState, useMemo } from "react"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreHorizontal, PlusCircle, LoaderCircle, ChevronsUpDown, Check, X } from "lucide-react"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast";
import { createExam, CreateExamInput } from "@/ai/flows/create-exam";

const MOCK_QUESTIONS = [
    { id: '1', text: "What is the minimum visibility for VFR in Class G airspace above 1,200 feet AGL?", subject: "Air Law", value: "1", label: "What is the minimum visibility for VFR..."},
    { id: '2', text: "What does 'ISA' stand for in meteorology?", subject: "Meteorology", value: "2", label: "What does 'ISA' stand for..."},
    { id: '3', text: "Describe the function of a magneto in a piston engine.", subject: "Aircraft Systems", value: "3", label: "Describe the function of a magneto..."},
    { id: '4', text: "What are the four forces acting on an aircraft in flight?", subject: "Principles of Flight", value: "4", label: "What are the four forces..."},
    { id: '5', text: "What is the purpose of a rudder on an airplane?", subject: "Principles of Flight", value: "5", label: "What is the purpose of a rudder..."},
    { id: '6', text: "Define 'Absolute Altitude'.", subject: "Navigation", value: "6", label: "Define 'Absolute Altitude'."},
];

const MOCK_EXAMS = [
    { id: '1', title: "PPL Air Law Mock Exam", questions: 50, duration: 60, subject: "Air Law"},
    { id: '2', title: "CPL Meteorology Practice Test", questions: 40, duration: 45, subject: "Meteorology"},
    { id: '3', title: "EASA Part-66 Module 1", questions: 100, duration: 120, subject: "Mathematics"},
];

const formSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    duration: z.coerce.number().int().positive("Duration must be a positive number."),
    questionIds: z.array(z.string()).min(1, "You must select at least one question."),
});

const CreateExamDialog = ({ onExamCreated }: { onExamCreated: () => void }) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: 60,
            questionIds: [],
        },
    });

    const selectedQuestions = form.watch("questionIds");

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const input: CreateExamInput = { ...values };
            const result = await createExam(input);

            if (result.success) {
                toast({
                    title: "Exam Created",
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
                    Create New Exam
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Create New Exam</DialogTitle>
                        <DialogDescription>
                            Build a new mock exam by selecting questions from the bank.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-8">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Exam Title</Label>
                            <Input id="title" {...form.register("title")} placeholder="e.g., PPL Final Exam" />
                             {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...form.register("description")} placeholder="A brief description of the exam's content and purpose." />
                             {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input id="duration" type="number" {...form.register("duration")} />
                                {form.formState.errors.duration && <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Questions</Label>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                    >
                                        {selectedQuestions.length > 0
                                            ? `${selectedQuestions.length} question(s) selected`
                                            : "Select questions..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search questions..." />
                                        <CommandList>
                                            <CommandEmpty>No questions found.</CommandEmpty>
                                            <CommandGroup>
                                                {MOCK_QUESTIONS.map((question) => (
                                                    <CommandItem
                                                        key={question.value}
                                                        value={question.label}
                                                        onSelect={() => {
                                                            const currentIds = form.getValues("questionIds");
                                                            const newIds = currentIds.includes(question.id)
                                                                ? currentIds.filter(id => id !== question.id)
                                                                : [...currentIds, question.id];
                                                            form.setValue("questionIds", newIds, { shouldValidate: true });
                                                        }}
                                                    >
                                                        <Check
                                                            className={`mr-2 h-4 w-4 ${selectedQuestions.includes(question.id) ? "opacity-100" : "opacity-0"}`}
                                                        />
                                                        {question.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                             {form.formState.errors.questionIds && <p className="text-sm text-destructive">{form.formState.errors.questionIds.message}</p>}

                             {selectedQuestions.length > 0 && (
                                <div className="p-2 border rounded-md max-h-40 overflow-y-auto">
                                    <div className="grid gap-1">
                                        {selectedQuestions.map(id => {
                                            const q = MOCK_QUESTIONS.find(mq => mq.id === id);
                                            return (
                                                <Badge key={id} variant="secondary" className="flex justify-between items-center">
                                                    <span className="truncate">{q?.label}</span>
                                                    <button type="button" onClick={() => form.setValue("questionIds", selectedQuestions.filter(qid => qid !== id))}>
                                                        <X className="h-3 w-3 ml-2" />
                                                    </button>
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                             {isSubmitting ? "Saving..." : "Save Exam"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function ExamManagementPage() {
    const [exams, setExams] = useState(MOCK_EXAMS);

    const handleExamCreated = () => {
        // In a real app, re-fetch exams from the backend
        console.log("Exam created, refreshing list...");
    }
    
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl font-headline">Exam Management</h1>
                    <p className="text-muted-foreground">Create, view, and manage mock exams.</p>
                </div>
                <CreateExamDialog onExamCreated={handleExamCreated} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Exams</CardTitle>
                    <CardDescription>A list of all exams currently available on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Exam Title</TableHead>
                                <TableHead className="w-[150px]">Subject</TableHead>
                                <TableHead className="w-[120px] text-center">Questions</TableHead>
                                <TableHead className="w-[120px] text-center">Duration</TableHead>
                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {exams.map(exam => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell><Badge variant="outline">{exam.subject}</Badge></TableCell>
                                    <TableCell className="text-center">{exam.questions}</TableCell>
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
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
