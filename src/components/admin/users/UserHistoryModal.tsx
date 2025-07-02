import React from 'react';
import { X, History } from 'lucide-react';
import { User } from '../../../types/admin';
import { formatarDataHoraBR, tempoDecorrido } from '../../../utils/dateUtils';

interface UserHistoryModalProps {
  user: User;
  history: Array<{
    id: string;
    action: string;
    timestamp: string;
    changes: Record<string, any>;
  }>;
  onClose: () => void;
}

export default function UserHistoryModal({ user, history, onClose }: UserHistoryModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Histórico de Alterações</h2>
            <p className="text-sm text-gray-500">{user.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <History className="h-5 w-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-sm text-gray-500">
                          {formatarDataHoraBR(entry.timestamp)}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {tempoDecorrido(entry.timestamp)}
                      </span>
                    </div>
                    {Object.entries(entry.changes).map(([key, value]) => (
                      <div key={key} className="mt-2 text-sm">
                        <span className="font-medium">{key}:</span>{' '}
                        <span className="text-gray-600">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma alteração registrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}