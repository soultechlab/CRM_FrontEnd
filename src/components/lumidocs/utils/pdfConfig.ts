// Configuração do PDF.js para usar worker local
import { pdfjs } from 'react-pdf';

// Configurar worker local - versão 4.8.69
const configurePdfWorker = () => {
  // Usar worker local copiado para a pasta public
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  console.log('PDF.js configurado com worker local (versão 4.8.69)');
};

// Executar configuração imediatamente
configurePdfWorker();

export { pdfjs };