
"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendHorizonal, LoaderCircle, MessageSquarePlus, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { generateTutorResponse } from "@/ai/flows/generate-tutor-response"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

type Message = {
  id: string
  text: string
  sender: "user" | "ai"
}

type Conversation = {
    id: string;
    title: string;
    messages: Message[];
}

// Convert message format for the Genkit flow
const toFlowMessage = (msg: Message) => ({
    text: msg.text,
    role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model'
});

const initialConversation: Conversation = {
    id: "1",
    title: "New Chat",
    messages: [
        {
          id: "1",
          text: "Hello! I am your AI-powered aviation tutor. How can I help you prepare for your exams today?",
          sender: "ai",
        }
      ]
};


export default function AiTutorPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Load conversations from localStorage on initial render
  useEffect(() => {
    const storedConversations = localStorage.getItem("chatConversations");
    if (storedConversations) {
      const parsedConversations = JSON.parse(storedConversations);
      if(parsedConversations.length > 0){
        setConversations(parsedConversations);
        setActiveConversationId(parsedConversations[0].id);
      } else {
        startNewChat();
      }
    } else {
        startNewChat();
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
        localStorage.setItem("chatConversations", JSON.stringify(conversations));
    }
  }, [conversations]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [conversations, activeConversationId, isLoading]);

  const startNewChat = () => {
    const newId = `chat-${Date.now()}`;
    const newConversation: Conversation = {
        id: newId,
        title: "New Chat",
        messages: [{
            id: `msg-${Date.now()}`,
            text: "Hello! I am your AI-powered aviation tutor. How can I help you prepare for your exams today?",
            sender: "ai"
        }]
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
  }
  
  const deleteChat = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const newConversations = conversations.filter(c => c.id !== idToDelete);
    setConversations(newConversations);
    if(activeConversationId === idToDelete) {
        if(newConversations.length > 0) {
            setActiveConversationId(newConversations[0].id);
        } else {
            startNewChat();
        }
    }
    if(newConversations.length === 0) {
        localStorage.removeItem("chatConversations");
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !activeConversationId) return
    
    const userMessage: Message = { id: `msg-${Date.now()}`, text: input, sender: "user" };
    
    // Update the conversation with the user's message
    const updatedConversations = conversations.map(c => {
        if (c.id === activeConversationId) {
            const newMessages = [...c.messages, userMessage];
            // Update title if it's the first user message
            const newTitle = c.messages.filter(m => m.sender === 'user').length === 0 ? input.substring(0, 30) : c.title;
            return { ...c, messages: newMessages, title: newTitle };
        }
        return c;
    });
    setConversations(updatedConversations);

    const currentConversation = updatedConversations.find(c => c.id === activeConversationId);
    
    setInput("");
    setIsLoading(true);

    try {
        const history = currentConversation?.messages.slice(-11, -1).map(toFlowMessage) || [];
        
        const result = await generateTutorResponse({ question: input, history });

        const aiMessage: Message = { id: `msg-${Date.now() + 1}`, text: result.response, sender: "ai" };
        
        // Update the conversation with the AI's response
        setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return { ...c, messages: [...c.messages, aiMessage] };
            }
            return c;
        }));

    } catch (error) {
      console.error("AI Tutor Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error communicating with the AI Tutor. Please try again.",
      });
      // Optional: remove the user message if the AI fails
      setConversations(prev => prev.map(c => {
            if (c.id === activeConversationId) {
                return { ...c, messages: c.messages.filter(msg => msg.id !== userMessage.id) };
            }
            return c;
      }));

    } finally {
      setIsLoading(false);
    }
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar */}
        <Card className="w-1/4 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Chat History</h2>
                <Button variant="ghost" size="icon" onClick={startNewChat}>
                    <MessageSquarePlus className="h-5 w-5" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {conversations.map(c => (
                        <div key={c.id}
                             onClick={() => setActiveConversationId(c.id)}
                             className={`group flex justify-between items-center p-2 rounded-md cursor-pointer ${activeConversationId === c.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                        >
                            <p className="text-sm truncate">{c.title}</p>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={(e) => deleteChat(e, c.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </Card>

        {/* Main Chat Area */}
        <div className="w-3/4 flex flex-col">
            <header className="mb-4">
                <h1 className="text-2xl font-semibold md:text-3xl font-headline">AI Tutor</h1>
                <p className="text-muted-foreground">Your personal AI-powered aviation expert.</p>
            </header>

            <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-sm">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                    {activeConversation?.messages.map((message) => (
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
                        disabled={isLoading || !activeConversationId}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !activeConversationId}>
                        {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
                        <span className="sr-only">Send Message</span>
                    </Button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}
