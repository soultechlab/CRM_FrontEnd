import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Save, 
  Download, 
  ArrowLeft,
  Type,
  Palette,
  List,
  ListOrdered,
  Quote,
  Minus,
  CheckCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import jsPDF from 'jspdf';
import { criarTemplateDocumentoFromHtml } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { mapCategoryToApi } from '../../utils/categoryMapping';
import { DownloadFormatModal } from './components/DownloadFormatModal';

type ModelCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';

export function DocumentEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editorRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [modelName] = useState(searchParams.get('name') || 'Novo Modelo');
  const [modelCategory] = useState(searchParams.get('category') as ModelCategory || 'contratos');
  const [modelDescription] = useState(searchParams.get('description') || '');
  
  const [content, setContent] = useState('<p>Digite aqui o conteúdo do seu modelo...</p>');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedSize, setSelectedSize] = useState('14');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const sanitizeContent = (content: string) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'hr', 'span'],
      ALLOWED_ATTR: ['style']
    });
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  };

  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = sanitizeContent(content);
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          if (editorRef.current?.contains(range.commonAncestorContainer)) {
            const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
              ? range.commonAncestorContainer.parentElement
              : range.commonAncestorContainer as Element;
            
            if (parentElement) {
              const computedStyle = window.getComputedStyle(parentElement);
              
              const fontFamily = computedStyle.fontFamily;
              if (fontFamily) {
                setSelectedFont(fontFamily.replace(/['"]/g, ''));
              }
              
              const fontSize = computedStyle.fontSize;
              if (fontSize) {
                const sizeInPx = parseInt(fontSize);
                setSelectedSize(sizeInPx.toString());
              }
              
              const color = computedStyle.color;
              if (color) {
                const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (rgbMatch) {
                  const hex = "#" + ((1 << 24) + (parseInt(rgbMatch[1]) << 16) + (parseInt(rgbMatch[2]) << 8) + parseInt(rgbMatch[3])).toString(16).slice(1);
                  setSelectedColor(hex);
                }
              }
            }
          }
        }
      };
      
      document.addEventListener('selectionchange', handleSelectionChange);
      
      return () => {
        document.removeEventListener('selectionchange', handleSelectionChange);
      };
    }
  }, []);

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        
        if (!range.collapsed) {
          document.execCommand(command, false, value);
        } else {
          
          document.execCommand(command, false, value);
        }
      } else {
        
        document.execCommand(command, false, value);
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (editorRef.current) {
      editorRef.current.focus();
      
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (!range.collapsed) {
          
          document.execCommand('fontName', false, font);
        } else {
          
          document.execCommand('fontName', false, font);
        }
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (!range.collapsed) {
          
          const savedRange = saveSelection();
          
          
          const selectedContent = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = `${size}px`;
          span.appendChild(selectedContent);
          range.insertNode(span);
          
          
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          restoreSelection(newRange);
        } else {
          
          document.execCommand('fontSize', false, '3');
          document.execCommand('insertHTML', false, `<span style="font-size: ${size}px;"></span>`);
        }
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (!range.collapsed) {
          document.execCommand('foreColor', false, color);
        } else {
          document.execCommand('foreColor', false, color);
        }
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleList = (type: 'ul' | 'ol') => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList';
      
      
      const success = document.execCommand(command, false);
      
      if (!success) {
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          
          const listElement = document.createElement(type);
          const listItem = document.createElement('li');
          
          if (!range.collapsed) {
            
            const selectedContent = range.extractContents();
            listItem.appendChild(selectedContent);
          } else {
            
            listItem.innerHTML = '&nbsp;';
          }
          
          listElement.appendChild(listItem);
          range.insertNode(listElement);
          
          
          const newRange = document.createRange();
          newRange.setStart(listItem, 0);
          newRange.setEnd(listItem, listItem.childNodes.length);
          
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleBlockquote = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        
        const success = document.execCommand('formatBlock', false, 'blockquote');
        
        if (!success) {
          
          const blockquote = document.createElement('blockquote');
          blockquote.style.margin = '1em 0';
          blockquote.style.paddingLeft = '1em';
          blockquote.style.borderLeft = '3px solid #ccc';
          blockquote.style.fontStyle = 'italic';
          
          if (!range.collapsed) {
            const selectedContent = range.extractContents();
            blockquote.appendChild(selectedContent);
          } else {
            blockquote.innerHTML = 'Citação...';
          }
          
          range.insertNode(blockquote);
          
          
          const newRange = document.createRange();
          newRange.selectNodeContents(blockquote);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleHorizontalRule = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        
        const success = document.execCommand('insertHorizontalRule');
        
        if (!success) {
          
          const hr = document.createElement('hr');
          hr.style.margin = '1em 0';
          hr.style.border = 'none';
          hr.style.borderTop = '1px solid #ccc';
          
          range.insertNode(hr);
          
          
          const newRange = document.createRange();
          newRange.setStartAfter(hr);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${modelName}</title>
            <style>
              body { 
                font-family: ${selectedFont}, sans-serif; 
                font-size: ${selectedSize}px; 
                color: ${selectedColor};
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
              }
            </style>
          </head>
          <body>
            ${sanitizeContent(content)}
          </body>
        </html>
      `;
      
      const templateData = {
        name: modelName,
        category: mapCategoryToApi(modelCategory),
        html_content: htmlContent,
        description: modelDescription || `Modelo criado com o editor em ${new Date().toLocaleDateString()}`,
        default_fields: '[]',
        is_active: true,
        is_default: false,
        type: 'custom' as const,
        styles: {
          font_family: selectedFont,
          font_size: parseInt(selectedSize),
          color: selectedColor
        }
      };
      
      await criarTemplateDocumentoFromHtml(templateData, user);
      toast.success('Modelo salvo com sucesso!');
      navigate('/modelos');
    } catch (error) {
      toast.error('Erro ao salvar modelo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateHtmlContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${modelName}</title>
          <style>
            body { 
              font-family: ${selectedFont}, sans-serif; 
              font-size: ${selectedSize}px; 
              color: ${selectedColor};
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          ${sanitizeContent(content)}
        </body>
      </html>
    `;
  };

  const handleDownloadHTML = () => {
    const htmlContent = generateHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloadModalOpen(false);
  };

  const handleDownloadPDF = async () => {
    try {
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      
      const margin = 20;
      const pageWidth = 210;
      const contentWidth = pageWidth - 2 * margin;
      
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sanitizeContent(content);
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(modelName, margin, margin + 10);
      
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      
      const lines = pdf.splitTextToSize(textContent, contentWidth);
      
      let currentY = margin + 25;
      const lineHeight = 7;
      const pageHeight = 297;
      const maxY = pageHeight - margin;
      
      
      for (let i = 0; i < lines.length; i++) {
        if (currentY + lineHeight > maxY) {
          
          pdf.addPage();
          currentY = margin + 10;
        }
        
        pdf.text(lines[i], margin, currentY);
        currentY += lineHeight;
      }
      
      
      pdf.save(`${modelName}.pdf`);
      
      setIsDownloadModalOpen(false);
      toast.success('PDF gerado e baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      
      const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${modelName}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotPromptForConvert/>
      <w:DoNotDisplayGridlines/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt;
      margin: 72pt 72pt 72pt 72pt;
      mso-header-margin: 35.4pt;
      mso-footer-margin: 35.4pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: '${selectedFont}', Arial, sans-serif;
      font-size: ${selectedSize}pt;
      line-height: 1.6;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 12pt;
      color: #000000;
    }
    p {
      margin: 6pt 0;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <h1>${modelName}</h1>
    ${sanitizeContent(content)}
  </div>
</body>
</html>`;
      
      
      const blob = new Blob(['\ufeff', htmlContent], { 
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${modelName}.doc`;
      a.click();
      URL.revokeObjectURL(url);
      
      setIsDownloadModalOpen(false);
      toast.success('Arquivo Word baixado com sucesso! (formato .doc compatível)');
    } catch (error) {
      toast.error('Erro ao gerar arquivo Word. Tente novamente.');
    }
  };

  const handleDownload = () => {
    setIsDownloadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{
        __html: `
          .document-editor {
            caret-color: black !important;
          }
          .document-editor:focus {
            outline: none !important;
          }
          .document-editor * {
            direction: ltr !important;
            unicode-bidi: normal !important;
          }
          .document-editor p {
            margin: 0.5em 0;
          }
          .document-editor ul {
            margin: 1em 0;
            padding-left: 2em;
            list-style-type: disc;
          }
          .document-editor ol {
            margin: 1em 0;
            padding-left: 2em;
            list-style-type: decimal;
          }
          .document-editor li {
            margin: 0.25em 0;
            padding-left: 0.5em;
          }
          .document-editor blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 3px solid #ccc;
            font-style: italic;
            color: #666;
          }
          .document-editor hr {
            margin: 1em 0;
            border: none;
            border-top: 1px solid #ccc;
          }
        `
      }} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-2 sm:gap-0 py-2 sm:py-0">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/modelos')}
                className="mr-2 sm:mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{modelName}</h1>
                <p className="text-xs sm:text-sm text-gray-500">Editor de Modelo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Modelo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-wrap items-center py-2 sm:py-3 gap-1 sm:space-x-1">
            {/* Font and Size */}
            <div className="flex items-center space-x-2 mr-4">
              <Type className="h-4 w-4 text-gray-500" />
              <select
                value={selectedFont}
                onChange={(e) => handleFontChange(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
              
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm w-16"
              >
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
                <option value="28">28</option>
                <option value="32">32</option>
              </select>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center space-x-1 mr-4">
              <button
                onClick={() => execCommand('bold')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => execCommand('italic')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => execCommand('underline')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Sublinhado"
              >
                <Underline className="h-4 w-4" />
              </button>
            </div>

            {/* Color */}
            <div className="flex items-center space-x-2 mr-4">
              <Palette className="h-4 w-4 text-gray-500" />
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 mr-4">
              <button
                onClick={() => execCommand('justifyLeft')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => execCommand('justifyCenter')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => execCommand('justifyRight')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                <AlignRight className="h-4 w-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 mr-4">
              <button
                onClick={() => handleList('ul')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Lista com marcadores"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleList('ol')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Lista numerada"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* Quote and HR */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleBlockquote}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Citação"
              >
                <Quote className="h-4 w-4" />
              </button>
              <button
                onClick={handleHorizontalRule}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Linha horizontal"
              >
                <Minus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-md sm:rounded-lg shadow-sm border">
          <div className="p-3 sm:p-8">
            <div
              ref={editorRef}
              contentEditable
              onInput={(e) => setContent(sanitizeContent(e.currentTarget.innerHTML))}
              onKeyDown={(e) => {
                
                if (e.key === 'Enter') {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const listItem = range.startContainer.parentElement?.closest('li');
                    
                    if (listItem) {
                      
                      if (listItem.textContent?.trim() === '') {
                        e.preventDefault();
                        const list = listItem.parentElement;
                        if (list) {
                          
                          const p = document.createElement('p');
                          p.innerHTML = '<br>';
                          list.parentNode?.insertBefore(p, list.nextSibling);
                          
                          
                          listItem.remove();
                          
                          
                          const newRange = document.createRange();
                          newRange.setStart(p, 0);
                          selection.removeAllRanges();
                          selection.addRange(newRange);
                        }
                      }
                    }
                  }
                }
              }}
              className="min-h-[300px] sm:min-h-[600px] outline-none prose prose-sm max-w-none document-editor"
              style={{ 
                fontFamily: selectedFont, 
                fontSize: `${selectedSize}px`, 
                color: selectedColor,
                lineHeight: '1.6',
                direction: 'ltr',
                textAlign: 'left',
                unicodeBidi: 'normal',
                whiteSpace: 'pre-wrap',
                caretColor: 'black'
              }}
              suppressContentEditableWarning={true}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <DownloadFormatModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onDownloadPDF={handleDownloadPDF}
        onDownloadDOCX={handleDownloadDOCX}
        modelName={modelName}
      />
    </div>
  );
}
