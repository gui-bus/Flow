# Flow - Form Autofill Chrome Extension

Flow é uma extensão inteligente para Google Chrome desenvolvida em **WXT**, **React**, **TypeScript** e **Tailwind CSS** com o objetivo de simplificar e acelerar o preenchimento de candidaturas a vagas de emprego em plataformas como InHire e outras baseadas em formulários genéricos.

## Como Executar o Projeto em Desenvolvimento

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina (versão 18+ recomendada).

### 2. Instalar as dependências
No diretório raiz do projeto, execute:
```bash
npm install
```

### 3. Rodar a extensão no modo de desenvolvimento
Para inicializar o servidor de desenvolvimento do WXT, execute:
```bash
npm run dev
```
Isso iniciará o ambiente de recarregamento rápido e abrirá automaticamente uma instância do navegador com a extensão carregada.

---

## Como Fazer Build do Projeto

Para compilar a versão final de produção otimizada da extensão:
```bash
npm run build
```
O build de produção do manifesto Manifest V3 será gerado na pasta `.output/chrome-mv3`.

---

## Como Carregar no Google Chrome manualmente ("Load unpacked")

1. Abra o navegador Google Chrome.
2. Acesse a página de extensões digitando `chrome://extensions/` na barra de endereços.
3. Ative o **Modo do desenvolvedor** (Developer mode) no canto superior direito.
4. Clique no botão **Carregar sem compactação** (Load unpacked) no canto superior esquerdo.
5. Selecione a pasta `.output/chrome-mv3` gerada após a execução do comando de build/dev.
6. A extensão Flow agora estará ativa e disponível no seu navegador!

---

## Arquitetura Básica do Projeto

A arquitetura do projeto segue o modelo modular do WXT para Web Extensions:

* **`entrypoints/`**: Contém os pontos de entrada declarados da extensão.
  * `popup/`: Interface moderna em React do popup que exibe o resumo de campos encontrados e aciona o preenchimento automático.
  * `options/`: Página inteira para o cadastro e controle do Perfil de Usuário, contendo dados de contato, carreira e respostas demográficas sensíveis.
  * `background.ts`: Service Worker de segundo plano para rotinas de eventos globais.
  * `content.ts`: Script injetado nas páginas web para escanear a estrutura do DOM e executar a injeção física de dados nos inputs detectados.
* **`lib/`**: Lógica central e compartilhada de negócios:
  * `adapters/`: Módulos de detecção de campos customizados por plataforma. Inicialmente suporta `GenericAdapter` e `InHireAdapter`.
  * `fill.ts`: Manipulador robótico de preenchimento do DOM. Simula eventos reais de alteração (`input`, `change`, `blur`) e contorna inputs controlados por frameworks SPA como React e Vue.
  * `storage.ts`: Abstração de persistência local baseada no `chrome.storage.local`.
* **`types/`**: Contratos de tipos de dados rigorosos em TypeScript strict.
