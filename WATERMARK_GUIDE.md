# 🎨 Guia de Uso - Marca d'Água Personalizada

## 📋 O que foi implementado?

O modal de configuração de marca d'água agora tem **4 seções principais**:

### 1. ✍️ Texto da Marca d'Água
- Campo de entrada para digitar o texto
- Máximo de 255 caracteres
- Exemplo: "© Meu Estúdio 2024"

### 2. 📍 Posição
- 5 opções em botões grandes:
  - **Superior Esquerdo**
  - **Superior Direito**
  - **Inferior Esquerdo** ⭐ (padrão)
  - **Inferior Direito**
  - **Centro**

### 3. 📏 Tamanho da Fonte (NOVO!)
**Importante:** Esta seção tem um checkbox "Personalizar tamanho"

#### Opção A: Automático (checkbox desmarcado)
- O tamanho é calculado automaticamente baseado no tamanho da foto
- Aparece uma mensagem azul explicando isso
- **Recomendado para a maioria dos casos**

#### Opção B: Manual (checkbox marcado) ✨
- Aparece um **slider** (controle deslizante)
- Vai de 8px até 200px
- Mostra o valor atual em **destaque azul**
- Atualiza em tempo real no preview

### 4. 💧 Opacidade (NOVO!)
- **Slider** (controle deslizante) de 5% até 100%
- Controla a transparência da marca d'água
- **Padrão: 35%** (boa visibilidade sem cobrir muito a foto)
- Mostra o valor atual em **destaque azul**
- Atualiza em tempo real no preview

### 5. 👁️ Preview em Tempo Real (NOVO!)
- **Visualização ao vivo** de como ficará a marca d'água
- Atualiza conforme você mexe nos controles
- Mostra:
  - Texto
  - Posição
  - Tamanho (aproximado)
  - Opacidade

## 🎯 Como Usar

### Passo 1: Abrir o Modal
1. Visualize uma foto no projeto
2. Clique no menu de ações (⋮)
3. Selecione "Adicionar marca d'água" ou "Ajustar marca d'água"

### Passo 2: Configurar

```
┌─────────────────────────────────────────────┐
│ Configurar Marca d'Água                     │
│ nome-da-foto.jpg                            │
├─────────────────────────────────────────────┤
│                                             │
│ ✍️ Texto da Marca d'Água                    │
│ [© Meu Estúdio 2024________________]        │
│                                             │
│ 📍 Posição                                   │
│ [Superior    ] [Superior   ]                │
│ [Esquerdo    ] [Direito    ]                │
│ [Inferior    ] [Inferior   ] [Centro]       │
│ [Esquerdo    ] [Direito ✓  ]                │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ 📏 Tamanho da Fonte                   │   │
│ │                    [✓] Personalizar   │   │
│ │ ━━━━━━━━━●━━━━━━━━━━━━━━━━━━━         │   │
│ │ Pequeno     48px        Grande        │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ 💧 Opacidade da Marca d'Água          │   │
│ │ ━━━━━●━━━━━━━━━━━━━━━━━━━━━━━         │   │
│ │ Transparente  35%        Opaco        │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ ┌───────────────────────────────────────┐   │
│ │ 👁️ Preview da Marca d'Água             │   │
│ │ ┌─────────────────────────────────┐   │   │
│ │ │ [Imagem de exemplo]             │   │   │
│ │ │              © Meu Estúdio 2024 │   │   │
│ │ └─────────────────────────────────┘   │   │
│ └───────────────────────────────────────┘   │
│                                             │
│ 💡 A marca d'água será salva no bucket     │
│                                             │
├─────────────────────────────────────────────┤
│                [Cancelar] [Salvar Config]   │
└─────────────────────────────────────────────┘
```

### Passo 3: Salvar
- Clique em "Salvar Configuração"
- Aguarde o processamento (pode demorar alguns segundos)
- A foto será recarregada com a marca d'água

## ✅ Checklist de Funcionalidades

Quando abrir o modal, você DEVE ver:

- [ ] Campo de texto para a marca d'água
- [ ] 5 botões de posição (grid 2x3)
- [ ] Seção "Tamanho da Fonte" com:
  - [ ] Checkbox "Personalizar tamanho"
  - [ ] Slider que aparece/desaparece ao marcar o checkbox
  - [ ] Valor em destaque (ex: 48px)
- [ ] Seção "Opacidade" com:
  - [ ] Slider sempre visível
  - [ ] Valor em porcentagem (ex: 35%)
- [ ] Preview em tempo real mostrando a marca d'água
- [ ] Mensagem informativa em azul
- [ ] Botões "Cancelar" e "Salvar Configuração"

## 🐛 Troubleshooting

### Não vejo o slider de tamanho
**Solução:** Marque o checkbox "Personalizar tamanho"

### Não vejo o slider de opacidade
**Problema:** Possível erro de CSS ou componente não renderizado
**Verificar:**
1. Abra o console do navegador (F12)
2. Procure por erros em vermelho
3. Verifique se o Tailwind CSS está carregando

### Preview não atualiza
**Solução:** Tente mexer nos controles (slider ou texto)

### Modal não abre
**Verificar:**
1. Console do navegador por erros
2. Se o PhotoViewer está importando o WatermarkConfigModal
3. Se a foto tem `width` e `height` (RAW não suporta marca d'água)

## 🎨 Aparência Melhorada

As seções de **Tamanho da Fonte** e **Opacidade** agora têm:
- ✅ Fundo cinza claro
- ✅ Bordas arredondadas
- ✅ Ícones coloridos (azul)
- ✅ Valores em destaque
- ✅ Sliders estilizados
- ✅ Preview em tempo real

## 📸 Como Testar

1. Faça upload de algumas fotos em um projeto
2. Clique em uma foto para visualizar
3. Abra o menu de ações (⋮)
4. Clique em "Adicionar marca d'água"
5. **Verifique se TODOS os controles aparecem:**
   - Texto
   - 5 botões de posição
   - Checkbox + slider de tamanho
   - Slider de opacidade
   - Preview
6. Ajuste os valores e veja o preview mudar
7. Salve e aguarde o processamento
8. A foto será recarregada com a marca d'água aplicada

## 🚀 Próximos Passos

Após salvar, você pode:
- Visualizar a foto com marca d'água
- Ajustar novamente (o modal vai abrir com os valores salvos)
- Remover a marca d'água (opção no menu)
- Fazer download da foto com marca d'água
