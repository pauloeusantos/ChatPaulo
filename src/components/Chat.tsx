'use client'

import { useChat } from 'ai/react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useEffect, useState } from 'react'
import { Send, Loader2} from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Defina a interface para a mensagem
interface Message {
  role: string;
  content: string;
  id: string;
}

export function Chat() {
  const { messages: initialMessages, input, handleInputChange, isLoading, error, reload, stop } = useChat({
    api: '/api/chat',
  });
  
  // Defina o estado de mensagens com o tipo correto
  const [messages, setMessages] = useState<Message[]>(initialMessages || []); // Inicialize o estado de mensagens

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    console.log('Mensagens atualizadas:', messages);
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, autoScroll])

  useEffect(() => {
    if (error) {
      console.error('Erro no chat:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [error, toast])


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    if (isLoading) return; 

    try {
      const userMessage: Message = { role: 'user', content: input, id: Date.now().toString() };
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
      
      // Atualize o estado de mensagens corretamente
      setMessages(prevMessages => [
        ...prevMessages,
        userMessage,
        { role: 'assistant', content: data.content, id: Date.now().toString() }
      ]);
      
      // Simule um evento de entrada para limpar o campo de entrada
      handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>); 
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  return (
    <Card className="w-full max-w-[400px] h-[700px] grid grid-rows-[auto_1fr_auto]">
      <CardHeader>
        
        <CardDescription>Sinta-se à vontade para conversar! Suas mensagens não serão salvas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full pr-4 overflow-auto" >
          {messages.map((message, index) => (
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
  )
}