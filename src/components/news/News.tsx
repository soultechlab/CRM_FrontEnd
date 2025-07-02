import React from 'react';

export default function News() {
  const novidades = [
    {
      id: 5,
      titulo: 'Integração Google Agenda',
      descricao: "<b>Organize e gerencie sua agenda de forma mais eficiente com a integração com o Google Agenda!</b><br>com a nova funcionalidade de integração com o Google Agenda, você poderá sincronizar automaticamente os compromissos e sessões de fotos diretamente no seu sistema de gerenciamento. Isso garante que sua agenda esteja sempre atualizada e acessível, tanto no sistema quanto no Google Agenda. Diga adeus ao risco de perder eventos importantes e mantenha todos os seus agendamentos sincronizados, proporcionando mais organização e praticidade no seu dia a dia como fotógrafo.",
      data: 'Em Breve',
      imagem: 'https://i.imgur.com/8chmsek.png',
      futuro: true
    },
    {
      id: 4,
      titulo: 'Informações da Empresa',
      descricao: "<b>Caminhando para o futuro com sua agência!</b><br>Possui uma agência ou sonha em ter a sua própria? A LumiCRM está dando o primeiro passo para te ajudar nessa jornada, agora no menu 'configurações' é possível organizar as informações da sua empresa, e <b>(um spoiler!!)</b> muito em breve será possível fazer e gerenciar muito mais! Fiquem ligados 🫣",
      data: '26/02/2025',
      imagem: 'https://i.imgur.com/dynSrxf.png',
      futuro: false
    },
    {
      id: 3,
      titulo: 'Pagamentos Parcelados',
      descricao: "<b>Organize e gerencie pagamentos parcelados de forma eficiente!</b><br>Com a nova funcionalidade de parcelamento de transações financeiras, agora você pode organizar e controlar os pagamentos dos seus clientes de forma parcelada diretamente dentro do sistema. Quando um pagamento não pode ser quitado de uma vez, você pode definir de maneira simples como o cliente realizará o pagamento em várias parcelas, garantindo mais flexibilidade para o fluxo de caixa do seu negócio.",
      data: '05/02/2025',
      imagem: 'https://i.imgur.com/rNXSFrj.png',
      futuro: false
    },
    {
      id: 2,
      titulo: 'Clientes em Massa',
      descricao: "<b>Adicione clientes em massa de forma simples e rápida com arquivos CSV ou XLSX!</b><br> Agora, você pode importar seus clientes de forma eficiente e sem complicações, utilizando arquivos CSV ou XLSX. Se você já possui uma lista de clientes em planilhas, basta fazer o upload do arquivo e deixar o processo de importação por nossa conta. Com essa funcionalidade, você economiza tempo e elimina o esforço de adicionar clientes manualmente um a um. <br> <br>A ferramenta suporta a importação de diversos campos, como nome, e-mail, telefone, origem e outros dados essenciais para sua base de clientes. Você pode garantir que a importação será feita de forma precisa e organizada, mantendo todos os dados de maneira estruturada.",
      data: '05/02/2025',
      imagem: 'https://i.imgur.com/rK40K4S.png',
      futuro: false
    },
    {
      id: 1,
      titulo: 'Filtros de Clientes',
      descricao: "<b>Filtre seus clientes de forma prática e poderosa para otimizar suas decisões de negócio!</b> <br>Com a nossa nova funcionalidade de filtros avançados, você pode selecionar exatamente os clientes que deseja analisar com apenas alguns cliques. Agora, você pode segmentar sua base de clientes por diversos critérios, como status, aniversariantes, origem e data de cadastro. <br><br>Ao visualizar suas informações de maneira segmentada, você poderá criar ofertas e campanhas mais direcionadas, aumentando a eficácia de suas ações de marketing e vendas. Com essa nova ferramenta, você terá o controle total sobre os dados de seus clientes, tornando a análise mais eficiente e as decisões muito mais assertivas!",
      data: '05/02/2025',
      imagem: 'https://i.imgur.com/QAXjQdN.png',
      futuro: false
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Novidades</h1>

      <div className="space-y-6">
        {novidades.map((novidade) => (
          <div key={novidade.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="flex items-center px-6 py-2">
              <img
                src="https://i.imgur.com/v5kLKJP.png"
                alt="Logo do Sistema"
                className="h-12 w-12 rounded-full mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{novidade.titulo}</h2>
                <p
                  className={`text-sm ${novidade.futuro ? 'bg-yellow-100 text-yellow-800 px-2 rounded-md w-20 text-center' : 'text-gray-500'}`}
                >
                  {novidade.data}
                </p>
              </div>
            </div>

            <div className="px-6 py-2">
              <p className="text-gray-600" dangerouslySetInnerHTML={{ __html: novidade.descricao }} />
            </div>

            {novidade.imagem &&
              <a href={novidade.imagem} target='_blank'>
                <img
                  src={novidade.imagem}
                  alt={novidade.titulo}
                  className="w-2/3 h-auto object-cover p-6"
                />
              </a>
            }
          </div>
        ))}
      </div>
    </div>
  );
}