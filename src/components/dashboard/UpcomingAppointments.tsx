import React from 'react';
import { Calendar } from 'lucide-react';

const appointments = [
  {
    id: 1,
    client: 'Maria Silva',
    date: '2024-03-20',
    time: '14:00',
    type: 'Wedding Photos',
    location: 'Jardim Botânico'
  },
  {
    id: 2,
    client: 'João Santos',
    date: '2024-03-22',
    time: '10:00',
    type: 'Family Session',
    location: 'Parque Ibirapuera'
  }
];

export default function UpcomingAppointments() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
        <Calendar className="h-5 w-5 text-gray-500" />
      </div>
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{appointment.client}</p>
                <p className="text-sm text-gray-600">{appointment.type}</p>
                <p className="text-sm text-gray-500">{appointment.location}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{appointment.date}</p>
                <p className="text-sm text-gray-500">{appointment.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}