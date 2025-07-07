import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

interface SubscriberData {
  month: string;
  free: number;
  monthly: number;
  annual: number;
}

interface SubscriberBarChartProps {
  data: SubscriberData[];
}

export default function SubscriberBarChart({ data }: SubscriberBarChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Comparativo de Assinantes</h2>
        <Users className="h-5 w-5 text-gray-500" />
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="free" name="Plano Free" fill="#94A3B8" />
            <Bar dataKey="monthly" name="Plano Mensal" fill="#4F46E5" />
            <Bar dataKey="annual" name="Plano Anual" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}