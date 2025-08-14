# SPS Group Frontend

## Estrutura do Projeto

```
sps-group-front-end/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx          # Cabeçalho com navegação
│   │   │   └── Layout.jsx          # Layout principal das páginas
│   │   ├── AuthGuard.jsx           # Guarda de autenticação
│   │   ├── CustomInput.jsx         # Input customizado com validação
│   │   └── ProtectedRoute.jsx      # Rota protegida
│   ├── contexts/
│   │   └── AuthContext.jsx         # Contexto de autenticação
│   ├── hooks/
│   │   ├── useApi.js               # Hook para gerenciar chamadas da API
│   │   └── useForm.js              # Hook para gerenciar formulários
│   ├── pages/
│   │   ├── authTabs.jsx            # Página de login/registro
│   │   ├── Home.jsx                # Página inicial
│   │   ├── Profile.jsx             # Página de perfil
│   │   └── UsersManagement.jsx     # Gerenciamento de usuários
│   ├── services/
│   │   └── api.js                  # Serviços da API organizados
│   ├── utils/
│   │   └── storage.js              # Utilitários de armazenamento
│   ├── App.jsx                     # Componente principal
│   └── index.js                    # Ponto de entrada
├── public/                         # Arquivos estáticos
├── tailwind.config.js              # Configuração do Tailwind CSS
└── package.json
```

## Funcionalidades

### Autenticação
- Login com email e senha
- Registro de novos usuários
- Sistema de autenticação JWT
- Proteção de rotas

### Interface
- Design responsivo com Tailwind CSS
- Layout consistente com cabeçalho de navegação
- Formulários com validação e tratamento de erros
- Componentes reutilizáveis

### Gerenciamento de Estado
- Context API para autenticação
- Hooks customizados para formulários e API
- Gerenciamento de estado local e global

## Tecnologias Utilizadas

- **React 18** - Biblioteca de interface
- **React Router** - Roteamento da aplicação
- **Tailwind CSS** - Framework de estilização
- **Axios** - Cliente HTTP para API
- **Context API** - Gerenciamento de estado

## Como Executar

1. Instalar dependências:
```bash
npm install
```

2. Iniciar o servidor:
vá ate a pasta sps-group-back-end e execute o comando:
```bash
node ./server.js
```

3. Volte para a pasta sps-group-front-end e execute o comando:
```bash
npm run start
```

## Usuário Padrão

O sistema cria automaticamente um usuário administrador:
- Email: admin@sps.com
- Senha: admin123
- Tipo: admin

## Estrutura de Componentes

### Hooks Customizados
- **useApi**: Gerencia chamadas da API com loading e tratamento de erros
- **useForm**: Gerencia estado de formulários com validação

### Serviços
- **authService**: Operações de autenticação (login, registro)
- **userService**: Operações de usuário (CRUD)

### Layout
- **Header**: Cabeçalho com navegação e informações do usuário
- **Layout**: Wrapper principal para páginas autenticadas

## Padrões de Desenvolvimento

- Componentes funcionais com hooks
- Separação clara de responsabilidades
- Reutilização de código através de hooks customizados
- Tratamento consistente de erros
- Design responsivo e acessível
