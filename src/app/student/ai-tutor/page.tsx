
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendHorizonal } from "lucide-react"

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
    },
    {
      id: "2",
      text: "Can you explain the difference between True Airspeed (TAS) and Indicated Airspeed (IAS)?",
      sender: "user",
    },
    {
        id: "3",
        text: "Of course. **Indicated Airspeed (IAS)** is the speed shown on the aircraft's airspeed indicator. It's read directly from the instrument and is not corrected for errors. \n\n**True Airspeed (TAS)** is the actual speed of the aircraft through the air. It's calculated by correcting IAS for non-standard pressure and temperature. As you climb in altitude, the air density decreases, and the difference between IAS and TAS becomes greater.",
        sender: "ai"
    }
  ])
  const [input, setInput] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    // In the next step, we'll replace this with a call to our AI flow
    console.log("Sending message:", input)
    // Add user message to the chat
    setMessages([...messages, { id: Date.now().toString(), text: input, sender: "user" }])
    setInput("")
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
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about any aviation topic..."
                    className="flex-1"
                />
                <Button type="submit" size="icon">
                    <SendHorizonal className="h-5 w-5" />
                    <span className="sr-only">Send Message</span>
                </Button>
                </form>
            </div>
        </div>
    </div>
  )
}
