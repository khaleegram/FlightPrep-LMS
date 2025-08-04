
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendHorizonal, LoaderCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateTutorResponse } from "@/ai/flows/generate-tutor-response"

type Message = {
  id: string
  text: string
  sender: "user" | "ai"
}

export default function AiTutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am your AI-powered aviation tutor. How can I help you prepare for your exams today?",
      sender: "ai",
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage: Message = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await generateTutorResponse({ question: input });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: result.response, sender: "ai" };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Tutor Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error communicating with the AI Tutor. Please try again.",
      });
      // Optional: remove the user message if the AI fails
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
        <header className="mb-4">
            <h1 className="text-2xl font-semibold md:text-3xl font-headline">AI Tutor</h1>
            <p className="text-muted-foreground">Your personal AI-powered aviation expert.</p>
        </header>

        <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-sm">
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={`flex items-start gap-4 ${
                        message.sender === "user" ? "justify-end" : ""
                    }`}
                    >
                    {message.sender === "ai" && (
                        <Avatar className="h-9 w-9 border-2 border-primary">
                            <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={`max-w-prose rounded-lg p-3 ${
                        message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.sender === "user" && (
                        <Avatar className="h-9 w-9 border-2 border-accent">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-4">
                      <Avatar className="h-9 w-9 border-2 border-primary">
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <div className="max-w-prose rounded-lg p-3 bg-muted">
                        <div className="flex items-center gap-2">
                           <LoaderCircle className="h-5 w-5 animate-spin" />
                           <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about any aviation topic..."
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                    <span className="sr-only">Send Message</span>
                </Button>
                </form>
            </div>
        </div>
    </div>
  )
}
