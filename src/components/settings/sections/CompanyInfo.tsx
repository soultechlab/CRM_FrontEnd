import { Building } from 'lucide-react';
import React from 'react';
import { formatarCNPJ } from '../../../utils/formatters';

interface CompanyInfoProps {
    onChange: (field: string, value: string) => void;
    form: {
        company_name?: string;
        company_cnpj?: string;
        company_address?: string;
    };
}

export default function CompanyInfo({ 
    onChange,
    form
  }: CompanyInfoProps) {
    return (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                Informações da Empresa
            </h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                </label>
                <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => onChange('company_name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                </label>
                <input
                    type="text"
                    value={form.company_cnpj}
                    onChange={(e) => onChange('company_cnpj', formatarCNPJ(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                </label>
                <input
                    type="text"
                    value={form.company_address}
                    onChange={(e) => onChange('company_address', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
            </div>
        </div>
    );
}