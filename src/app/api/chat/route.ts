import { StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';

export const runtime = 'edge';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
       
        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: 'Mensagens inválidas' }), { status: 400 });
        }

        console.log('Mensagens enviadas:', messages);

      
        const response = await hf.chatCompletion({
            model: 'mistralai/Mistral-7B-Instruct-v0.2', // Modelo que suporta português ou usar o 'gpt2' .
            messages: messages.map((message: { role: string; content: string }) => ({ role: message.role, content: message.content })),
            max_tokens: 100,
        });

        console.log('Resposta da API:', response);

       
        return new Response(JSON.stringify({ content: response.choices[0].message.content }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500 });
    }
}