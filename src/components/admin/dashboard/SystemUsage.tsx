import React from 'react';
import { Calendar, Users, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SystemUsageProps {
  usage: {
    totalClients: number;
    totalAppointments: number;
    totalTransactions: number;
  };
  growthData: Array<{
    month: string;
    clients: number;
    appointments: number;
    transactions: number;
  }>;
}

export default function SystemUsage({ usage, growthData }: SystemUsageProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Uso do Sistema</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Clientes</p>
              <p className="text-2xl font-bold text-purple-700">{usage.totalClients}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Agendamentos</p>
              <p className="text-2xl font-bold text-blue-700">{usage.totalAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Transações</p>
              <p className="text-2xl font-bold text-green-700">{usage.totalTransactions}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="clients" name="Clientes" stroke="#9333EA" />
            <Line type="monotone" dataKey="appointments" name="Agendamentos" stroke="#3B82F6" />
            <Line type="monotone" dataKey="transactions" name="Transações" stroke="#10B981" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}