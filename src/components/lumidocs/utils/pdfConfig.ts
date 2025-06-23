import { pdfjs } from 'react-pdf';

const configurePdfWorker = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
};

configurePdfWorker();

export { pdfjs };