"use client";

import { useState } from "react";
import axios from "axios";
import { useBasket } from "..//store/useBasket";

export const PromptInput = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAmount, setBasket } = useBasket();

  const handleSubmit = async () => {
    if (!prompt) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/generate-basket", {
        prompt,
      });

      const { amount, basket } = res.data;
      setAmount(amount);
      setBasket(basket);
    } catch (err) {
      console.error("❌ AI Error:", err);
      alert("Failed to generate basket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <textarea
        className="w-full p-3 border rounded-lg text-black"
        rows={3}
        placeholder='e.g. "I want to split 100 USDC into trending memecoins"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Generate Basket 💡"}
      </button>
    </div>
  );
};