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
    console.log('=== PROCESSANDO PDF ===');
    console.log('Tamanho do buffer:', pdfBuffer.byteLength);
    console.log('Número de assinantes:', signersData.length);
    
    // Carregar o PDF existente
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();
    
    console.log('PDF carregado com sucesso:');
    console.log('- Número de páginas:', pages.length);
    console.log('- Dimensões das páginas:', pages.map((page, index) => ({
      page: index + 1,
      width: page.getSize().width,
      height: page.getSize().height
    })));
    
    // Embedar fonte padrão
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Processar cada assinante
    console.log('Iniciando processamento dos campos...');
    
    for (let signerIndex = 0; signerIndex < signersData.length; signerIndex++) {
      const signer = signersData[signerIndex];
      console.log(`\nProcessando assinante ${signerIndex + 1}:`, {
        nome: signer.nome,
        email: signer.email,
        camposCount: signer.fields.length
      });
      
      for (let fieldIndex = 0; fieldIndex < signer.fields.length; fieldIndex++) {
        const field = signer.fields[fieldIndex];
        
        console.log(`  Campo ${fieldIndex + 1}:`, {
          type: field.type,
          page: field.position.page,
          position: { x: field.position.x, y: field.position.y },
          customText: field.customText
        });
        
        // Pular campos de assinatura (serão processados pela Autentique)
        if (field.type === 'assinatura') {
          console.log('    → Pulando campo de assinatura');
          continue;
        }
        
        const pageIndex = field.position.page - 1;
        console.log(`    → Índice da página: ${pageIndex} (página ${field.position.page})`);
        
        if (pageIndex < 0 || pageIndex >= pages.length) {
          console.error(`    → ERRO: Página ${field.position.page} não existe! PDF tem ${pages.length} páginas`);
          continue;
        }
        
        const page = pages[pageIndex];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        console.log(`    → Dimensões da página: ${pageWidth}x${pageHeight}`);
        
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
        
        console.log(`    → Valor do campo: "${value}"`);
        
        if (!value) {
          console.log('    → Campo vazio, pulando');
          continue;
        }
        
        // Calcular tamanho da fonte baseado na altura do campo (mais conservador)
        const fontSize = Math.min(fieldHeight * 0.7, 14);
        console.log(`    → Tamanho da fonte inicial: ${fontSize}`);
        
        // Verificar se o texto cabe na largura do campo
        const textWidth = font.widthOfTextAtSize(value, fontSize);
        let finalFontSize = fontSize;
        
        if (textWidth > fieldWidth) {
          // Reduzir fonte se necessário
          finalFontSize = (fieldWidth / textWidth) * fontSize;
          finalFontSize = Math.max(finalFontSize, 8); // Tamanho mínimo
          console.log(`    → Fonte ajustada para: ${finalFontSize}`);
        }
        
        // Posicionar texto exatamente onde está no preview (canto superior esquerdo do campo)
        const textX = x;
        const textY = y - finalFontSize; // Ajustar para baseline da fonte
        
        console.log(`    → Posição final: x=${textX}, y=${textY}`);
        console.log(`    → Desenhando texto: "${value}"`);
        
        try {
          // Desenhar o texto
          page.drawText(value, {
            x: textX,
            y: textY,
            size: finalFontSize,
            font: field.type === 'nome' ? boldFont : font,
            color: rgb(0, 0, 0),
          });
          console.log('    → ✅ Texto desenhado com sucesso');
        } catch (drawError) {
          console.error('    → ❌ Erro ao desenhar texto:', drawError);
          throw drawError;
        }
        
        // Remover bordas de debug - texto deve aparecer limpo no PDF
      }
    }
    
    // Retornar PDF modificado
    console.log('\n=== FINALIZANDO PDF ===');
    console.log('Salvando PDF modificado...');
    
    const savedPdf = await pdfDoc.save();
    console.log('✅ PDF processado com sucesso!');
    console.log('Tamanho final:', savedPdf.length, 'bytes');
    
    return savedPdf;
  } catch (error) {
    console.error('\n❌ ERRO AO PROCESSAR PDF:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
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
    console.error('Erro ao carregar PDF:', error);
    throw new Error(`Falha ao carregar PDF: ${error instanceof Error ? error.message : 'Erro de rede'}`);
  }
}

export function createBlobFromUint8Array(data: Uint8Array): Blob {
  return new Blob([data], { type: 'application/pdf' });
}

export function createFileFromBlob(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: 'application/pdf' });
}