import React from 'react';
import { FunnelChart, Funnel, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter } from 'lucide-react';

interface FunnelData {
  name: string;
  value: number;
  color: string;
}

interface ConversionFunnelChartProps {
  data: FunnelData[];
}

export default function ConversionFunnelChart({ data }: ConversionFunnelChartProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Funil de Conversão</h2>
        <Filter className="h-5 w-5 text-gray-500" />
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}