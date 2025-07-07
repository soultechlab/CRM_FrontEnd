import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { validateInstagram, formatWhatsApp } from '../../utils/socialUtils';
import ErrorMessage from '../shared/ErrorMessage';
import BasicInfo from './sections/BasicInfo';
import PasswordChange from './sections/PasswordChange';
import SocialMedia from './sections/SocialMedia';
import PlanInfo from './sections/PlanInfo';
import CompanyInfo from './sections/CompanyInfo';

export default function UserSettings() {
  const { userData, updateUserData } = useUser();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [form, setForm] = useState({
    currentName: userData?.name || '',
    newName: '',
    current_password: '',
    new_password: '',
    confirm_new_password: '',
    company_name: userData?.company_name,
    company_cnpj: userData?.company_cnpj,
    company_address: userData?.company_address,
    instagram: userData?.instagram || '',
    whatsapp: userData?.whatsapp || '',
    website: userData?.website || '',
    facebook: userData?.facebook || '',
    twitter: userData?.twitter || '',
    youtube: userData?.youtube || '',
    cpf: userData?.cpf || ''
  });

  if (!userData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600">Carregando informações do usuário...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (form.name && form.name.length < 3) {
        throw new Error('O nome deve ter pelo menos 3 caracteres');
      }

      if (form.new_password) {
        if (!form.current_password) {
          throw new Error('Digite sua senha atual para alterá-la');
        }
        if (form.new_password.length < 6) {
          throw new Error('A nova senha deve ter pelo menos 6 caracteres');
        }
        if (form.new_password !== form.confirm_new_password) {
          throw new Error('As senhas não coincidem');
        }
      }

      if (form.instagram && !validateInstagram(form.instagram)) {
        throw new Error('Nome de usuário do Instagram inválido');
      }

      const updates = {
        newName: form.newName,
        instagram: form.instagram,
        whatsapp: formatWhatsApp(form.whatsapp),
        website: form.website,
        facebook: form.facebook,
        twitter: form.twitter,
        youtube: form.youtube,
        currentPassword: form.current_password,
        newPassword: form.new_password,
        newPasswordConfirmation: form.confirm_new_password,
        companyName: form.company_name,
        companyCnpj: form.company_cnpj,
        companyAddress: form.company_address,
        cpf: form.cpf
      };

      await updateUserData(updates);
      setSuccess('Perfil atualizado com sucesso!');
      
      setForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      }));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages */}
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Basic Info */}
        <BasicInfo
          email={userData.email}
          cpf={form.cpf}
          currentName={form.currentName}
          newName={form.newName}
          onNameChange={(value) => handleInputChange('newName', value)}
          onCpfChange={(value) => handleInputChange('cpf', value)}
        />

        {/* Company Info */}
        <CompanyInfo onChange={handleInputChange} form={form} />

        {/* Social Media */}
        <SocialMedia
          form={form}
          onChange={handleInputChange}
        />

        {/* Password Change */}
        <PasswordChange
          onChange={handleInputChange}
        />

        {/* Plan Info */}
        <PlanInfo
          plan={userData.plan}
          role={userData.role}
        />

        {/* Save Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}