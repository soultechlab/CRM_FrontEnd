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

type ModelCategory = 'contratos' | 'permuta' | 'eventos' | 'ensaios' | 'outros';

export function DocumentEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Parâmetros do modelo
  const [modelName] = useState(searchParams.get('name') || 'Novo Modelo');
  const [modelCategory] = useState(searchParams.get('category') as ModelCategory || 'contratos');
  const [modelDescription] = useState(searchParams.get('description') || '');
  
  // Estados do editor
  const [content, setContent] = useState('<p>Digite aqui o conteúdo do seu modelo...</p>');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedSize, setSelectedSize] = useState('14');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isSaving, setIsSaving] = useState(false);

  // Função para sanitizar conteúdo
  const sanitizeContent = (content: string) => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'blockquote', 'hr', 'span'],
      ALLOWED_ATTR: ['style']
    });
  };

  // Função para salvar e restaurar seleção
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
    // Configurar editor como editável apenas na primeira renderização
    if (editorRef.current) {
      editorRef.current.innerHTML = sanitizeContent(content);
      // Focar no final do conteúdo
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Adicionar listener para mudanças na seleção
      const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Verificar se a seleção está dentro do editor
          if (editorRef.current?.contains(range.commonAncestorContainer)) {
            // Atualizar estados baseado na seleção atual
            const parentElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
              ? range.commonAncestorContainer.parentElement
              : range.commonAncestorContainer as Element;
            
            if (parentElement) {
              const computedStyle = window.getComputedStyle(parentElement);
              
              // Atualizar fonte se disponível
              const fontFamily = computedStyle.fontFamily;
              if (fontFamily) {
                setSelectedFont(fontFamily.replace(/['"]/g, ''));
              }
              
              // Atualizar tamanho se disponível
              const fontSize = computedStyle.fontSize;
              if (fontSize) {
                const sizeInPx = parseInt(fontSize);
                setSelectedSize(sizeInPx.toString());
              }
              
              // Atualizar cor se disponível
              const color = computedStyle.color;
              if (color) {
                // Converter RGB para hex se necessário
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
      
      // Verificar se há texto selecionado
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Se há seleção, aplicar o comando
        if (!range.collapsed) {
          document.execCommand(command, false, value);
        } else {
          // Se não há seleção, aplicar para nova digitação
          document.execCommand(command, false, value);
        }
      } else {
        // Fallback para quando não há seleção
        document.execCommand(command, false, value);
      }
      
      setContent(sanitizeContent(editorRef.current.innerHTML));
    }
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    if (editorRef.current) {
      editorRef.current.focus();
      
      // Salvar seleção atual
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (!range.collapsed) {
          // Há texto selecionado - aplicar fonte
          document.execCommand('fontName', false, font);
        } else {
          // Não há seleção - aplicar para próxima digitação
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
          // Salvar seleção
          const savedRange = saveSelection();
          
          // Aplicar tamanho diretamente via CSS
          const selectedContent = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = `${size}px`;
          span.appendChild(selectedContent);
          range.insertNode(span);
          
          // Restaurar seleção no conteúdo modificado
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          restoreSelection(newRange);
        } else {
          // Para nova digitação, usar execCommand
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
      
      // Primeiro, tentar o comando padrão
      const success = document.execCommand(command, false);
      
      if (!success) {
        // Se falhar, criar lista manualmente
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          
          // Criar elemento de lista
          const listElement = document.createElement(type);
          const listItem = document.createElement('li');
          
          if (!range.collapsed) {
            // Se há texto selecionado, colocar na lista
            const selectedContent = range.extractContents();
            listItem.appendChild(selectedContent);
          } else {
            // Se não há seleção, criar item vazio
            listItem.innerHTML = '&nbsp;';
          }
          
          listElement.appendChild(listItem);
          range.insertNode(listElement);
          
          // Posicionar cursor dentro do item da lista
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
        
        // Tentar comando padrão primeiro
        const success = document.execCommand('formatBlock', false, 'blockquote');
        
        if (!success) {
          // Se falhar, criar blockquote manualmente
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
          
          // Posicionar cursor dentro do blockquote
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
        
        // Tentar comando padrão primeiro
        const success = document.execCommand('insertHorizontalRule');
        
        if (!success) {
          // Se falhar, criar HR manualmente
          const hr = document.createElement('hr');
          hr.style.margin = '1em 0';
          hr.style.border = 'none';
          hr.style.borderTop = '1px solid #ccc';
          
          range.insertNode(hr);
          
          // Posicionar cursor após o HR
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
      // Converter HTML para PDF (simulação)
      const htmlToPdf = async (htmlContent: string) => {
        // Aqui você implementaria a conversão HTML para PDF
        // Por exemplo, usando jsPDF ou similar
        const blob = new Blob([htmlContent], { type: 'text/html' });
        return new File([blob], `${modelName}.html`, { type: 'text/html' });
      };
      
      // Criar arquivo a partir do conteúdo
      const file = await htmlToPdf(content);
      
      // Salvar o modelo usando a mesma estrutura do modal
      const modelData = {
        name: modelName,
        category: modelCategory,
        description: modelDescription || `Modelo criado com o editor em ${new Date().toLocaleDateString()}`,
        file: file
      };
      
      // Aqui você chamaria a função de salvar modelo
      // Por exemplo: await salvarModelo(modelData);
      console.log('Salvando modelo:', modelData);
      
      // Mostrar notificação de sucesso
      toast.success('Modelo salvo com sucesso!');
      
      // Redirecionar para a página de modelos
      navigate('/modelos');
    } catch (error) {
      console.error('Erro ao salvar modelo:', error);
      toast.error('Erro ao salvar modelo. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    // Criar um blob com o conteúdo HTML
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
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${modelName}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/modelos')}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{modelName}</h1>
                <p className="text-sm text-gray-500">Editor de Modelo</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center py-3 space-x-1">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-8">
            <div
              ref={editorRef}
              contentEditable
              onInput={(e) => setContent(sanitizeContent(e.currentTarget.innerHTML))}
              onKeyDown={(e) => {
                // Melhorar comportamento das listas com Enter
                if (e.key === 'Enter') {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const listItem = range.startContainer.parentElement?.closest('li');
                    
                    if (listItem) {
                      // Se estiver em uma lista e o item estiver vazio, sair da lista
                      if (listItem.textContent?.trim() === '') {
                        e.preventDefault();
                        const list = listItem.parentElement;
                        if (list) {
                          // Criar parágrafo após a lista
                          const p = document.createElement('p');
                          p.innerHTML = '<br>';
                          list.parentNode?.insertBefore(p, list.nextSibling);
                          
                          // Remover item vazio
                          listItem.remove();
                          
                          // Focar no novo parágrafo
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
              className="min-h-[600px] outline-none prose prose-sm max-w-none document-editor"
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
    </div>
  );
}