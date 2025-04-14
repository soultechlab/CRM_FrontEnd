import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { date: '01/03', revenue: 1200 },
  { date: '02/03', revenue: 940 },
  { date: '03/03', revenue: 1500 },
  { date: '04/03', revenue: 1800 },
  { date: '05/03', revenue: 1600 },
  { date: '06/03', revenue: 2100 },
  { date: '07/03', revenue: 1900 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Revenue Trend</h2>
        <TrendingUp className="h-5 w-5 text-gray-500" />
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`R$ ${value}`, 'Revenue']}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4F46E5" 
              strokeWidth={2}
              dot={{ fill: '#4F46E5' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}