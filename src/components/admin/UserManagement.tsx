import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { User } from '../../types/admin';
import { mockUsers } from '../../mocks/usersMock';
import UserTable from './users/UserTable';
import AddUserModal from './users/AddUserModal';
import EditUserModal from './users/EditUserModal';
import UserDetailsModal from './users/UserDetailsModal';
import { adicionarUsuario, atualizarUsuario, obterUsuarios } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    plan: 'all',
    status: 'all',
    role: 'all'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await obterUsuarios(user);
        setUsers(response);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
  
    fetchUsers();
  }, []);

  const handleAddUser = async (userData: any) => {
    const newUser: User = {
      id: '',
      name: userData.name,
      email: userData.email,
      role: userData.role as 'admin' | 'user',
      plan: userData.plan as 'free' | 'monthly' | 'annual',
      status: 'active',
      instagram: userData.instagram,
      whatsapp: userData.whatsapp,
      password: userData.password,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [...prev, newUser]);
    toast.success('Usuário adicionado com sucesso!');
    
    await adicionarUsuario(newUser, user);

    setShowAddModal(false);
  };

  const handleEditUser = async (userId: string, updates: Partial<User>, newPassword?: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, ...updates }
          : user
      )
    );

    toast.success('Usuário atualizado com sucesso!');

    await atualizarUsuario(userId, updates, user);

    if (newPassword) {
      console.log('Password would be updated here in a real application');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = filters.plan === 'all' || user.plan === filters.plan;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    const matchesRole = filters.role === 'all' || user.role === filters.role;

    return matchesSearch && matchesPlan && matchesStatus && matchesRole;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Filtros e Busca */}
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Todos os planos</option>
              <option value="free">Free</option>
              <option value="monthly">Mensal</option>
              <option value="annual">Anual</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <UserTable
          users={filteredUsers}
          onDelete={handleDeleteUser}
          onEdit={setUserToEdit}
          onUserClick={setSelectedUser}
        />
      </div>

      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddUser}
        />
      )}

      {userToEdit && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSave={handleEditUser}
        />
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}