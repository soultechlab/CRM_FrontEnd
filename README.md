# LumiCRM - Sistema de Gerenciamento para Fotógrafos

## 📝 Sobre o Projeto

LumiCRM é um sistema de gerenciamento (CRM) desenvolvido especialmente para fotógrafos, permitindo o controle de clientes, agendamentos, finanças e muito mais.

## 🚀 Tecnologias Utilizadas

- React 18.3.1
- TypeScript
- Vite
- TailwindCSS
- Axios para requisições HTTP
- React Router DOM para navegação
- React Beautiful DnD para drag and drop
- Recharts para gráficos
- SweetAlert2 para alertas
- React Toastify para notificações
- Date-fns para manipulação de datas
- jsPDF para geração de PDFs

## 🛠️ Pré-requisitos

- Node.js (versão recomendada: 18.x ou superior)
- npm ou yarn
- Backend do LumiCRM rodando (porta padrão: 5174)

## 🔧 Instalação e Execução

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd CRM_FrontEnd
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
VITE_SUPABASE_URL=http://localhost:5174/
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

5. Para build de produção:
```bash
npm run build
# ou
yarn build
```

## 📁 Estrutura do Projeto

### Diretórios Principais

- `/src`: Código fonte principal
  - `/components`: Componentes React reutilizáveis
  - `/contexts`: Contextos React para gerenciamento de estado global
  - `/services`: Serviços e integrações com API
  - `/types`: Definições de tipos TypeScript
  - `/utils`: Funções utilitárias
  - `/hooks`: Custom hooks React
  - `/routes`: Configuração de rotas
  - `/constants`: Constantes e configurações
  - `/mocks`: Dados mockados para desenvolvimento
  - `/lib`: Bibliotecas e configurações de terceiros

### Arquivos Importantes

- `vite.config.ts`: Configuração do Vite
- `tailwind.config.js`: Configuração do TailwindCSS
- `tsconfig.json`: Configuração do TypeScript
- `package.json`: Dependências e scripts
- `vercel.json`: Configuração para deploy na Vercel

## 🌐 API e Endpoints

### Autenticação
- `POST /register`: Registro de novo usuário
- `POST /login`: Login de usuário
- `POST /logout`: Logout de usuário

### Usuários
- `GET /users`: Listar usuários
- `POST /users`: Criar novo usuário
- `PUT /users/:id`: Atualizar usuário
- `PUT /settings-user/:id`: Atualizar configurações do usuário

### Clientes
- `GET /clients`: Listar clientes
- `POST /clients`: Criar novo cliente
- `PUT /clients/:id`: Atualizar cliente
- `DELETE /clients/:id`: Excluir cliente

### Agendamentos
- `GET /appointments`: Listar agendamentos
- `POST /appointments`: Criar agendamento
- `PUT /appointments/:id`: Atualizar agendamento
- `DELETE /appointments/:id`: Excluir agendamento

### Finanças
- `GET /finances`: Listar transações
- `POST /finances`: Criar transação
- `PUT /finances/:id`: Atualizar transação
- `DELETE /finances/:id`: Excluir transação

## 🚀 Deploy

### Deploy na Vercel

1. Conecte seu repositório à Vercel
2. Configure as variáveis de ambiente na Vercel:
   - `VITE_SUPABASE_URL`: URL do seu backend
3. A Vercel detectará automaticamente que é um projeto Vite e configurará o build adequadamente

### Deploy Manual

1. Gere o build de produção:
```bash
npm run build
```

2. O build será gerado na pasta `/dist`
3. Configure seu servidor web (nginx, Apache) para servir os arquivos estáticos da pasta `/dist`
4. Configure o redirecionamento de todas as rotas para `index.html` (necessário para SPA)

## 🔒 Segurança

- Todas as requisições autenticadas devem incluir o token JWT no header:
```typescript
headers: {
  Authorization: `Bearer ${user?.token}`
}
```

- Senhas são enviadas apenas nos endpoints de autenticação
- Dados sensíveis não são armazenados em localStorage

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 📧 Contato

Para suporte ou dúvidas, entre em contato através de [email/contato].

---

Desenvolvido com ❤️ pela equipe LumiCRM
