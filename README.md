# Game Explorer

Esta web app, desenvolcida com o propósito de consumir e integrar diversas REST API, tem como finalidade a pesquisa de jogos (acessíveis através de diversas plataformas), que disponibiliza ao utilizador alguma informação detalhada sobre o jogo pesquisado, o trailer do jogo (através do Youtube) e streams ativas relacionadas ao mesmo (através do Twitch).

## Identificação do Grupo

Este projeto foi desenvolvido por:

- **Diogo Eiras Morais Nº29324**

### Repositório GitHub
- [https://github.com/DMorais04/SIR-TP1.git](https://github.com/DMorais04/SIR-TP1.git)

### Endereço de Publicação
- [https://sir-tp1-n29324.onrender.com](https://sir-tp1-n29324.onrender.com)

### APIs Utilizadas

O projeto integra três APIs principais, sendo que cada uma delas atua em função da String introduzida na barra de pesquisa:

1. **RAWG API (https://rawg.io/apidocs)**: Fornece dados detalhados sobre jogos (nome, plataformas, gêneros e imagens)
   
2. **YouTube Data API v3 (https://developers.google.com/youtube/v3)**: Utilizada para pesquisar trailers de jogos no YouTube. A pesquisa é feita através de uma consulta que inclui o nome do jogo e a palavra "trailer", retornando o vídeo mais relevante.

3. **Twitch API (https://dev.twitch.tv/docs)**: Utilizada para pesquisar streams de jogos. Ao contrário das duas anteriores, esta API requer um token de acesso para autenticação. As streams disponbilizadas podem ser reproduzidas (incluindo simultaneamente).

### Encadeamento das APIs

A sequência de procedimentos que leva à execução da aplicação é a seguinte:

1. O utilizador pesquisa um jogo.
2. A **RAWG API** é chamada para obter informações sobre o jogo.
3. Através dos dados do jogo obtidos, a **YouTube API** é chamada para pesquisar o trailer mais relevante relacionado ao jogo.
4. Feito isso, a **Twitch API** utiliza o nome do jogo (retornado pela **RAWG API**) para pesquisar as streams ativas no momento da pesquisa.

### Bibliotecas e Frameworks

- **JavaScript**: Utilizado para a lógica de interação com as APIs e manipulação do DOM.
- **HTML e CSS**: Para a construção da interface do utilizador e para a estilização da página.
- **Fetch API**: Usada para fazer requisições HTTP assíncronas às APIs.
- **Promises/async-await**: Para lidar com operações assíncronas e garantir que os dados sejam carregados corretamente.

## Como Executar o Projeto

### Requisitos

Antes de executar o projeto, é necessário configurar algumas chaves de API:

#### RAWG API
1. Aceder a [RAWG API Docs](https://rawg.io/apidocs).
2. Clique em **Get API Key**.
3. Efetue o Login na plataforma ou registe-se na mesma caso não possua conta.
4. Aceda ao menu no canto superior direito e clique na opção **Get an API key**
5. A API Key é então apresentada ao utilizador. 

#### YouTube Data API v3
1. Aceder a **YouTube Data API v3**: Obtenha sua chave de API em [Google Developers Console](https://console.developers.google.com/).
2. Do lado esquerdo da barra de pesquisa, clique em **Selecionar Projeto**. Clique em **Novo Projeto**. Aí criarás um novo projeto preenchendo apenas o campo **Nome**.
3. Por baixo da barra de pesquisa clique em **+ ATIVAR APIS E SERVIÇOS**.
4. Feito isso, na barra de pesquisa introduza **YouTube Data API v3**.
5. Na API encontrada clique na opção **ATIVAR**.
6. Após isso, será redirecionado para uma nova página onde deverá clicar em **CRIAR CREDENCIAIS** para gerar a API_KEY.
7. Em **Que dados você acessará?** selecione **Dados Públicos**. Em seguida finalize o processo de criação de credenciais. Aí já possuirá a sua API_KEY.

#### Twitch API
Para aceder às funcionalidades desta API é necessário obter um **Access Token**, obtido através do **Client ID** e do **Client Secret**. O **Client Secret** tem prazo de validade pelo que, quando este expirar, terá que renovar o **Access Token**, através da criação de um novo **Client Secret**. Caso seja a primeira vez que efetue a obtenção destes, siga todos os passos mencionados abaixo. Caso contrário, siga apenas a partir do ponto 6. 

1. Aceder a [Twitch Developer Console](https://dev.twitch.tv/console/apps).
2. Faça Login ou Registe-se na Twitch caso não esteja conectado e/ou registado na plataforma.
3. Clique em **+ Registre seu aplicativo**.
4. Introduza o **Nome** do seu aplicativo e a **URLs de redirecionamento OAuth** (http://localhost:5000/callback).
5. Selecione a Categoria **Website Integration** e o Tipo de Cliente **Confidencial**. Feito isso clique em **Criar**. Após a criação do aplicativo, o utilizador será encaminhado novamente para Consola.
6. Na Consola, clique na opção **Gerenciar** referente ao aplicativo criado. Aí o utilizador será encaminhado para as propriedades do aplicativo criado.
7. Agora, nas propriedades do aplicativo, no fundo da página, clique em **Novo Segredo/New Secret**. Aí será gerado o Client Secret.
8. O Client ID já é visível assim que entra na página das propriedades do aplicativo. 

### Passos para Executar Localmente

1. Clone este repositório:

   ```bash
   git clone https://github.com/DMorais04/SIR-TP1.git

2. Entre na pasta do projeto:

   ```bash
   cd nome-da-pasta-do-projeto

3. Instale as dependências necessárias:

   ```bash
   npm install

4. Configure as API key, substituindo-as nas primeiras quatro linhas do ficheiro **base.js**.
   
5. Após tudo instalado e configurado, inicie o programa introduzindo:

   ```bash
   npm start

