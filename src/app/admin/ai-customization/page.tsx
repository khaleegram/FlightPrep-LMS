
"use client"

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { customizeAITutor, CustomizeAITutorInput } from "@/ai/flows/customize-ai-tutor";
import { LoaderCircle, FileUp } from "lucide-react";

const departments = ['Flying School', 'Aircraft Maintenance Engineering', 'Air Traffic Control', 'Cabin Crew', 'Prospective Students'] as const;

const formSchema = z.object({
    department: z.enum(departments, {
        required_error: "Please select a department to customize.",
    }),
    customPrompt: z.string().min(50, "The custom prompt must be at least 50 characters long.").optional().or(z.literal('')),
    knowledgeBaseUpdate: z.string().min(20, "The knowledge base update must be at least 20 characters long.").optional().or(z.literal('')),
    pdfHandout: z.instanceof(FileList).optional(),
}).refine(data => data.customPrompt || data.knowledgeBaseUpdate || (data.pdfHandout && data.pdfHandout.length > 0), {
    message: "You must provide a custom prompt, a knowledge base update, or upload a PDF.",
    path: ["customPrompt"], // you can pick any field to display this error
});

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export default function AiCustomizationPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            department: undefined,
            customPrompt: "",
            knowledgeBaseUpdate: "",
            pdfHandout: undefined,
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            let pdfDataUri: string | undefined = undefined;
            if (values.pdfHandout && values.pdfHandout.length > 0) {
                const file = values.pdfHandout[0];
                if(file.type !== 'application/pdf') {
                    toast({
                        variant: "destructive",
                        title: "Invalid File Type",
                        description: "Please upload a valid PDF file.",
                    });
                     setIsSubmitting(false);
                    return;
                }
                pdfDataUri = await fileToDataUri(file);
            }

            const input: CustomizeAITutorInput = {
                department: values.department,
                customPrompt: values.customPrompt || "",
                knowledgeBaseUpdate: values.knowledgeBaseUpdate || "",
                pdfDataUri,
            };

            const result = await customizeAITutor(input);

            if (result.success) {
                toast({
                    title: "AI Tutor Updated",
                    description: result.message,
                });
                form.reset();
            } else {
                throw new Error(result.message);
            }

        } catch (error: any) {
             toast({
                variant: "destructive",
                title: "Customization Failed",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl font-headline">AI Tutor Customization</h1>
                <p className="text-muted-foreground">Tailor the AI tutor's personality, knowledge, and instructions.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Customization Settings</CardTitle>
                        <CardDescription>
                            Select a department and provide the instructions, knowledge updates, or PDF handouts.
                            The changes will apply to the AI tutor for that specific department.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-2">
                             <Label htmlFor="department">Department</Label>
                             <Controller
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <Label htmlFor="custom-prompt">AI System Prompt (Optional)</Label>
                            <Textarea 
                                id="custom-prompt"
                                placeholder="e.g., You are a friendly and encouraging tutor for the Flying School. You always use analogies related to flight..."
                                className="min-h-32"
                                {...form.register("customPrompt")}
                            />
                            {form.formState.errors.customPrompt && <p className="text-sm text-destructive">{form.formState.errors.customPrompt.message}</p>}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="knowledge-base">Knowledge Base Update (Optional)</Label>
                            <Textarea 
                                id="knowledge-base"
                                placeholder="Provide new information, corrections, or specific data points to add to the tutor's knowledge. For example: The new required passing grade for the PPL exam is 75%..."
                                className="min-h-32"
                                {...form.register("knowledgeBaseUpdate")}
                            />
                             {form.formState.errors.knowledgeBaseUpdate && <p className="text-sm text-destructive">{form.formState.errors.knowledgeBaseUpdate.message}</p>}
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="pdf-handout">Upload PDF Handout (Optional)</Label>
                            <Input 
                                id="pdf-handout"
                                type="file"
                                accept="application/pdf"
                                {...form.register("pdfHandout")}
                            />
                            <p className="text-xs text-muted-foreground">Upload a PDF document to be added to the knowledge base.</p>
                             {form.formState.errors.pdfHandout && <p className="text-sm text-destructive">{form.formState.errors.pdfHandout.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? "Saving..." : "Save Customization"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
