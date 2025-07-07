import React, { useState } from 'react';
import { X, Save, Lock } from 'lucide-react';
import { User } from '../../../types/admin';
import { useAuth } from '../../../contexts/AuthContext';
import SocialFields from './form/SocialFields';
import { validateInstagram, formatWhatsApp } from '../../../utils/socialUtils';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<User>, newPassword?: string) => void;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    plan: user.plan,
    role: user.role,
    status: user.status,
    instagram: user.instagram || '',
    whatsapp: user.whatsapp || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.instagram && !validateInstagram(form.instagram)) {
      alert('Nome de usuário do Instagram inválido');
      return;
    }

    // Validate password change if active
    if (showPasswordChange) {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('As senhas não coincidem');
        return;
      }
      if (passwordForm.newPassword.length < 6) {
        alert('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
    }

    const updates = {
      ...form,
      whatsapp: formatWhatsApp(form.whatsapp)
    };

    onSave(
      user.id,
      updates,
      showPasswordChange ? passwordForm.newPassword : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Editar Usuário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Social Media */}
          <SocialFields
            instagram={form.instagram}
            whatsapp={form.whatsapp}
            onChange={(field, value) => setForm({ ...form, [field]: value })}
          />

          {/* Status e Plano */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plano
              </label>
              <select
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value as 'free' | 'monthly' | 'annual' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="free">Free</option>
                <option value="monthly">Mensal</option>
                <option value="annual">Anual</option>
              </select>
            </div>
          </div>

          {/* Alteração de Senha */}
          {isAdmin && (
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Lock className="h-4 w-4" />
                {showPasswordChange ? 'Cancelar alteração de senha' : 'Alterar senha do usuário'}
              </button>

              {showPasswordChange && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Digite a nova senha"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Confirme a nova senha"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}