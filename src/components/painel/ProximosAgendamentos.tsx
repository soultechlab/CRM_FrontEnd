import React from 'react';
import { Calendar, ArrowRight, Phone, Instagram, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAgendamentos } from '../../contexts/AgendamentoContext';
import { Agendamento } from '../../types';

export default function ProximosAgendamentos() {
  const navigate = useNavigate();
  const { agendamentos } = useAgendamentos();

  // Ordenar agendamentos por data e hora e limitar a 5
  const proximosAgendamentos = (agendamentos || [])
    .filter(agendamento => new Date(`${agendamento.data}T${agendamento.hora}`) >= new Date())
    .sort((a, b) => {
      const dataA = new Date(`${a.data}T${a.hora}`);
      const dataB = new Date(`${b.data}T${b.hora}`);
      return dataA.getTime() - dataB.getTime();
    })
    .slice(0, 5);

  const formatarData = (data: string) => {
    return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
  };

  const criarLinkWhatsApp = (telefone: string | null) => {
    if (!telefone) return undefined;
    const numeroLimpo = telefone.replace(/\D/g, '');
    return `https://wa.me/55${numeroLimpo}`;
  };

  const criarLinkInstagram = (instagram: string | null) => {
    if (!instagram) return "";
    const usuario = instagram.replace('@', '');
    return `https://instagram.com/${usuario}`;
  };

  const irParaAgendamentos = () => {
    navigate(`/calendario`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Próximos Agendamentos</h2>
        <Calendar className="h-5 w-5 text-gray-500" />
      </div>

      {proximosAgendamentos.length > 0 ? (
        <div className="space-y-4">
          {proximosAgendamentos.map((agendamento) => (
            <div
              key={agendamento.id}
              className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <button
                    onClick={() => irParaAgendamentos()}
                    className="font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {agendamento.cliente.nome}
                  </button>
                  <p className="text-sm text-gray-600">{agendamento.tipo}</p>
                  <p className="text-sm text-gray-500">{agendamento.local}</p>

                  {/* Links de contato */}
                  <div className="mt-2 flex items-center gap-3">
                    {agendamento.cliente.telefone && (
                      <a
                        href={criarLinkWhatsApp(agendamento.cliente.telefone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-xs">WhatsApp</span>
                      </a>
                    )}
                    {agendamento.cliente.instagram && (
                      <a
                        href={criarLinkInstagram(agendamento.cliente.instagram)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 flex items-center gap-1"
                      >
                        <Instagram className="h-4 w-4" />
                        <span className="text-xs">Instagram</span>
                      </a>
                    )}
                    {agendamento.cliente.email && (
                      <a
                        href={`mailto:${agendamento.cliente.email}`}
                        className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4" />
                        <span className="text-xs">Email</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatarData(agendamento.data)}</p>
                  <p className="text-sm text-gray-500">{agendamento.hora}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum agendamento próximo</p>
        </div>
      )}

      <button
        onClick={() => navigate('/calendario')}
        className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 py-2"
      >
        Ver todos os agendamentos
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}