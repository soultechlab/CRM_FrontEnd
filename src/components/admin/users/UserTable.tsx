import React from 'react';
import { Edit2, Trash2, Shield } from 'lucide-react';
import { User } from '../../../types/admin';
import { formatarDataBR } from '../../../utils/dateUtils';
import SocialButtons from './social/SocialButtons';

interface UserTableProps {
  users: User[];
  onDelete: (id: string) => void;
  onEdit: (user: User) => void;
  onUserClick: (user: User) => void;
}

export default function UserTable({ users, onDelete, onEdit, onUserClick }: UserTableProps) {
  // Sort users to show admin first
  const sortedUsers = [...users].sort((a, b) => {
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Usuário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Contato
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Plano
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Cadastro
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedUsers.map((user) => (
            <tr key={user.id} className={`hover:bg-gray-50 ${
              user.role === 'admin' ? 'bg-blue-50' : ''
            }`}>
              <td className="px-6 py-4">
                <button
                  onClick={() => onUserClick(user)}
                  className="text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600 group-hover:text-blue-800">
                      {user.name}
                    </span>
                    {user.role === 'admin' && (
                      <Shield className="h-4 w-4 text-blue-600" title="Administrador" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.role === 'admin' && (
                    <div className="text-xs text-blue-600 mt-1">
                      Controle total da plataforma
                    </div>
                  )}
                </button>
              </td>
              <td className="px-6 py-4">
                <SocialButtons whatsapp={user.whatsapp} instagram={user.instagram} />
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.plan === 'lifetime' 
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.plan === 'lifetime' ? 'Vitalício' : user.plan}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatarDataBR(user.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => onDelete(user.id)}
                      className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}