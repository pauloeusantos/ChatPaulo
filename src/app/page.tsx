import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 justify-center items-center">
      <h1 className="text-3xl font-bold mb-8">Bem-vindo ao Chat do PH</h1>
      <Chat />
    </div>
  );
}
