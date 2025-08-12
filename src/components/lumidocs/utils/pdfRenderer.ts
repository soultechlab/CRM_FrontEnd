import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface FieldData {
  type: 'assinatura' | 'nome' | 'email' | 'cpf' | 'customizado';
  position: { x: number; y: number; page: number };
  width: number;
  height: number;
  value: string;
  customText?: string;
}

interface SignerData {
  nome: string;
  email: string;
  cpf: string;
  fields: FieldData[];
}

export async function fillPdfWithData(
  pdfBuffer: ArrayBuffer,
  signersData: SignerData[]
): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    // Embedar fonte padrão
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    for (let signerIndex = 0; signerIndex < signersData.length; signerIndex++) {
      const signer = signersData[signerIndex];
      
      for (let fieldIndex = 0; fieldIndex < signer.fields.length; fieldIndex++) {
        const field = signer.fields[fieldIndex];
        
        if (field.type === 'assinatura') {
          continue;
        }
        
        const pageIndex = field.position.page - 1;
        
        if (pageIndex < 0 || pageIndex >= pages.length) {
          continue;
        }
        
        const page = pages[pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        // Converter posições relativas (%) para absolutas
        const x = (field.position.x / 100) * pageWidth;
        const y = pageHeight - ((field.position.y / 100) * pageHeight);
        const fieldWidth = (field.width / 100) * pageWidth;
        const fieldHeight = (field.height / 100) * pageHeight;
        
        // Determinar valor baseado no tipo do campo
        let value = '';
        switch (field.type) {
          case 'nome':
            value = signer.nome;
            break;
          case 'email':
            value = signer.email;
            break;
          case 'cpf':
            value = formatCpf(signer.cpf);
            break;
          case 'customizado':
            value = field.customText || field.value || '';
            break;
          default:
            value = field.value || '';
        }
        
        if (!value) {
          continue;
        }
        
        const fontSize = Math.min(fieldHeight * 0.7, 14);
        
        const textWidth = font.widthOfTextAtSize(value, fontSize);
        let finalFontSize = fontSize;
        
        if (textWidth > fieldWidth) {
          finalFontSize = (fieldWidth / textWidth) * fontSize;
          finalFontSize = Math.max(finalFontSize, 8);
        }
        
        const textX = x;
        const textY = y - finalFontSize;
        
        try {
          page.drawText(value, {
            x: textX,
            y: textY,
            size: finalFontSize,
            font: field.type === 'nome' ? boldFont : font,
            color: rgb(0, 0, 0),
          });
        } catch (drawError) {
          throw drawError;
        }
      }
    }
    
    const savedPdf = await pdfDoc.save();
    return savedPdf;
  } catch (error) {
    throw new Error(`Falha ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

function formatCpf(cpf: string): string {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const numbers = cpf.replace(/\D/g, '');
  
  // Formata CPF
  if (numbers.length === 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

export async function loadPdfFromUrl(url: string): Promise<ArrayBuffer> {
  try {
    const response = await fetch(url, {
      headers: url.includes('localhost:8080') || url.includes('api') ? {
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
      } : {}
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  } catch (error) {
    throw new Error(`Falha ao carregar PDF: ${error instanceof Error ? error.message : 'Erro de rede'}`);
  }
}

export function createBlobFromUint8Array(data: Uint8Array): Blob {
  return new Blob([data], { type: 'application/pdf' });
}

export function createFileFromBlob(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: 'application/pdf' });
}