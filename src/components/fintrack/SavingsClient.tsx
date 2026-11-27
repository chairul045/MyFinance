'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiggyBank, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import {
  createSavingsGoalAction,
  addSavingsContributionAction,
  toggleSavingsGoalCompletedAction,
  deleteSavingsGoalAction,
} from '@/actions/planning';
import { formatRupiah, formatDateIndo } from '@/lib/utils';
import { getJakartaDateString } from '@/lib/finance-calc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AccountWithBalance } from '@/types/fintrack';

export function SavingsClient({
  goals,
  accounts,
}: {
  goals: any[];
  accounts: AccountWithBalance[];
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState(getJakartaDateString());
  const [contribAmounts, setContribAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalCollected = goals.reduce((s, g) => s + g.collected_amount, 0);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await createSavingsGoalAction({
      name,
      target_amount: Number(targetAmount),
      target_date: targetDate,
      color: '#10b981',
    });
    if (!res.success) {
      setError(res.error || 'Gagal membuat target tabungan.');
      return;
    }
    setName('');
    setTargetAmount('');
    router.refresh();
  };

  const handleAddContrib = async (goalId: string) => {
    const val = Number(contribAmounts[goalId]);
    if (!val || val <= 0) return;
    const defaultAccountId = accounts.find((a) => a.is_active)?.id || accounts[0]?.id || null;
    const res = await addSavingsContributionAction({
      goal_id: goalId,
      account_id: defaultAccountId,
      amount: val,
      contribution_date: getJakartaDateString(),
      notes: 'Kontribusi tabungan',
    });
    if (res.success) {
      setContribAmounts((prev) => ({ ...prev, [goalId]: '' }));
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Target</p>
            <p className="text-xl font-extrabold mt-1">{formatRupiah(totalTarget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Terkumpul</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatRupiah(totalCollected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Sisa Target</p>
            <p className="text-xl font-extrabold text-blue-600 mt-1">
              {formatRupiah(Math.max(0, totalTarget - totalCollected))}
            </p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Buat Target Tabungan Baru</CardTitle>
          <CardDescription>Catat kontribusi tabungan tanpa menyebabkan saldo rekening terhitung ganda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Nama Target</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dana Darurat" required />
            </div>
            <div className="space-y-1.5">
              <Label>Nominal Target (Rp)</Label>
              <Input type="number" min="1" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal Target</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4" /> Tambah Target
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g) => (
          <Card key={g.id}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm">{g.name}</h3>
                    <Badge variant={g.is_completed ? 'success' : 'secondary'}>
                      {g.is_completed ? 'Selesai' : `${g.percent.toFixed(0)}%`}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Target: {formatDateIndo(g.target_date)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await toggleSavingsGoalCompletedAction(g.id, !g.is_completed);
                      router.refresh();
                    }}
                    title="Tandai Selesai"
                  >
                    <CheckCircle2 className={`w-4 h-4 ${g.is_completed ? 'text-emerald-600' : 'text-slate-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600"
                    onClick={async () => {
                      await deleteSavingsGoalAction(g.id);
                      router.refresh();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all"
                  style={{ width: `${Math.min(100, g.percent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>Terkumpul: <strong>{formatRupiah(g.collected_amount)}</strong></span>
                <span>Target: <strong>{formatRupiah(g.target_amount)}</strong></span>
              </div>

              {!g.is_completed && (
                <div className="flex gap-2 pt-2">
                  <Input
                    type="number"
                    min="1"
                    placeholder="Tambah kontribusi (Rp)"
                    value={contribAmounts[g.id] || ''}
                    onChange={(e) => setContribAmounts((prev) => ({ ...prev, [g.id]: e.target.value }))}
                  />
                  <Button size="sm" onClick={() => handleAddContrib(g.id)}>
                    Setor
                  </Button>
                </div>
              )}

              {g.contributions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 max-h-28 overflow-y-auto">
                  <p className="text-[11px] font-semibold text-slate-500">Riwayat Kontribusi</p>
                  {g.contributions.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="flex justify-between text-[11px] text-slate-500">
                      <span>{formatDateIndo(c.contribution_date)}</span>
                      <span className="font-semibold text-emerald-600">+{formatRupiah(c.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
