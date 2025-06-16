import { ConnectButton } from "../../components/ConnectButton";
import { PromptInput } from "../../components/PromptInput";

export default function Home() {
  return (
    <main className="min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">🧠 SmartSplit</h1>
      <ConnectButton />
      <PromptInput />
    </main>
  );
}