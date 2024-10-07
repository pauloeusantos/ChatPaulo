'use client'

import { useChat } from 'ai/react'
import { Card, CardContent, CardDescription, CardTitle, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useEffect, useState } from 'react'
import { Send, Loader2, CircleAlert } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 

interface Message {
  role: string;
  content: string;
  id: string;
}

export function Chat() {
  const { messages: initialMessages, input, handleInputChange, isLoading, error } = useChat({
    api: '/api/chat',
  });

  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [showAlert, setShowAlert] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Mensagens atualizadas:', messages)
  }, [messages]);

  useEffect(() => {
    if (error) {
      console.error('Erro no chat:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false); 
      }, 2000); 

      return () => clearTimeout(timer); 
    }
  }, [showAlert]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const userMessage: Message = { role: 'user', content: input, id: Date.now().toString() };
    await sendMessage(userMessage);
  }

  const sendMessage = async (userMessage: Message) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta da API:', errorText);
        throw new Error(`Erro na API: ${errorText}`);
      }

      const data = await response.json();
      console.log('Resposta da API:', data);

      setMessages(prevMessages => [
        ...prevMessages,
        userMessage,
        { role: 'assistant', content: data.content, id: Date.now().toString() }
      ]);

      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  return (
    <>
      {showAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-center">
          <Alert className="w-full max-w-md bg-black text-white"> 
            <CircleAlert className="size-5 fill-white" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Nenhuma mensagem será salva. Fique à vontade para conversar!
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Card className="w-full  max-w-[400px] h-[900px] grid grid-rows-[auto_1fr_auto] mt-16"> 
        <CardHeader>
          <CardTitle>Bem-vindo ao Chat do PH</CardTitle>
          <CardDescription>Sinta-se à vontade para conversar! Suas mensagens não serão salvas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[700px] w-full overflow-auto pr-4" ref={scrollAreaRef}>
            {messages.slice(-10).map((message, index) => (
              <div key={message.id || index} className={cn(
                "flex gap-3 text-sm mb-4",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "flex gap-3 max-w-[80%]",
                  message.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <Avatar>
                    <AvatarFallback>{message.role === 'user' ? 'YOU' : 'AI'}</AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "rounded-lg p-3",
                    message.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <p className="leading-relaxed break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form className="w-full space-y-2" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Input 
                placeholder="Type your message" 
                value={input} 
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
    </>
  )
}