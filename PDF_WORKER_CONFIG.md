# Configuração do Worker PDF.js

## Problema
O react-pdf versão 9.2.1 usa pdfjs-dist versão 4.8.69, mas o worker desta versão não existe nos CDNs públicos.

## Solução Implementada
Usamos o worker local da versão 4.8.69 que está instalada no projeto.

### Configuração Automática
- Script `copy-pdf-worker` copia o worker para `public/pdf.worker.min.js`
- Executado automaticamente nos comandos `dev` e `build`

### Arquivos Modificados
- `package.json`: Adicionado script de cópia automática
- `src/components/lumidocs/utils/pdfConfig.ts`: Configuração do worker local
- `public/pdf.worker.min.js`: Worker local copiado

### Como Funciona
1. Worker é copiado de `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`
2. Salvo como `public/pdf.worker.min.js` 
3. Configurado em `pdfConfig.ts` para usar `/pdf.worker.min.js`

### Para Desenvolvimento
O worker local é automaticamente copiado ao executar `npm run dev`.

### Para Produção
O worker local é incluído no build ao executar `npm run build`.

### Benefícios
- ✅ Sem dependências de CDN externo
- ✅ Versão exata compatível com react-pdf
- ✅ Funciona offline
- ✅ Configuração automática