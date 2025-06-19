'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SettingsProps {
  onUpdate: (settings: { solAmount: number; slippage: number }) => void;
}

export default function Settings({ onUpdate }: SettingsProps) {
  const [solAmount, setSolAmount] = useState(0.001);
  const [slippage, setSlippage] = useState(1.0);

  const handleUpdate = () => {
    onUpdate({ solAmount, slippage });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="solAmount">SOL Amount per Trade</Label>
        <Input
          type="number"
          id="solAmount"
          value={solAmount}
          onChange={(e) => setSolAmount(Number(e.target.value))}
          className="bg-slate-800/50 border-slate-700 text-slate-100"
          placeholder="0.001"
          step="0.001"
          min="0.001"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
        <Input
          type="number"
          id="slippage"
          value={slippage}
          onChange={(e) => setSlippage(Number(e.target.value))}
          className="bg-slate-800/50 border-slate-700 text-slate-100"
          placeholder="1.0"
          step="0.1"
          min="0.1"
          max="100"
        />
      </div>
      <Button
        onClick={handleUpdate}
        className="w-full"
      >
        Update Settings
      </Button>
    </div>
  );
} 