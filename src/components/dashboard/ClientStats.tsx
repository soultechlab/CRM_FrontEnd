import React from 'react';
import { Users, UserPlus, Repeat, Star } from 'lucide-react';

const stats = [
  {
    title: 'New Clients',
    value: '12',
    change: '+20%',
    trend: 'up',
    icon: UserPlus,
    color: 'text-green-500',
  },
  {
    title: 'Returning Clients',
    value: '24',
    change: '+15%',
    trend: 'up',
    icon: Repeat,
    color: 'text-blue-500',
  },
  {
    title: 'Client Satisfaction',
    value: '4.8',
    subtitle: 'out of 5',
    icon: Star,
    color: 'text-yellow-500',
  },
];

export default function ClientStats() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Client Analytics</h2>
        <Users className="h-5 w-5 text-gray-500" />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-white ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-sm text-gray-500">{stat.subtitle}</p>
                    )}
                  </div>
                </div>
              </div>
              {stat.change && (
                <div className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}