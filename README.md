# SPS Group - Prova Técnica

## 🎯 Desafio Técnico

Este projeto implementa um sistema completo de autenticação e gerenciamento de usuários, desenvolvido como prova técnica para a SPS Group. O sistema atende aos seguintes requisitos:

### ✅ Funcionalidades Implementadas

- **Login Seguro**: Autenticação com geração de token JWT
- **CRUD Completo**: Cadastrar, listar, editar e excluir usuários
- **Campos Obrigatórios**: email, nome, type, password
- **Validação de Email**: Bloqueio de e-mails duplicados
- **Acesso Restrito**: Todas as rotas e páginas só acessíveis após login

### 🏗️ Arquitetura do Sistema

O projeto está dividido em duas partes principais:

1. **Backend (Node.js - API RESTful)**
2. **Frontend (React.js)**

---

## 📁 Estrutura do Projeto

```
SPS-Group-Prova-tecnica/
├── sps-group-back-end/          # API RESTful em Node.js
├── sps-group-front-end/         # Interface React.js
└── README.md                    # Este arquivo
```

---

## 🔧 Backend (sps-group-back-end/)

### Resumo das Funcionalidades

O backend implementa uma API RESTful completa com as seguintes características:

- **Banco de Dados em Memória**: Implementação própria para armazenamento de usuários
- **Usuário Admin Pré-cadastrado**: Credenciais padrão (admin@sps.com / admin123)
- **Rotas Protegidas**: Todas as rotas exigem autenticação JWT
- **Validação Robusta**: Uso de express-validator para validação de dados
- **Segurança**: Hash de senhas com bcrypt e controle de acesso por tipo de usuário

### Endpoints Implementados

- `POST /auth/login` - Gera token JWT
- `POST /users` - Cadastra usuário (validação de email único)
- `GET /users` - Lista usuários
- `PUT /users/:id` - Edita usuário
- `DELETE /users/:id` - Exclui usuário

### Tecnologias Utilizadas

- Node.js com Express
- JWT para autenticação
- bcrypt para hash de senhas
- express-validator para validação
- Jest para testes unitários

---

## 🎨 Frontend (sps-group-front-end/)

### Resumo das Funcionalidades

O frontend oferece uma interface moderna e responsiva com:

- **Sistema de Autenticação**: Login/registro com Context API
- **Rotas Protegidas**: Navegação controlada por autenticação
- **Gerenciamento de Usuários**: Interface completa para CRUD
- **Design Responsivo**: Tailwind CSS para estilização
- **Componentes Reutilizáveis**: Arquitetura modular e escalável

### Características Técnicas

- **Hooks Customizados**: useApi e useForm para gerenciamento de estado
- **Context API**: Gerenciamento global de autenticação
- **React Router**: Navegação entre páginas
- **Axios**: Cliente HTTP para comunicação com API
- **Validação**: Formulários com validação em tempo real

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js instalado
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd SPS-Group-Prova-tecnica
   ```

2. **Configure e execute o Backend**
   ```bash
   cd sps-group-back-end
   npm install
   node ./server.js
   ```
   O servidor estará rodando na porta 4000

3. **Configure e execute o Frontend**
   ```bash
   cd ../sps-group-front-end
   npm install
   npm run start
   ```
   A aplicação estará disponível em http://localhost:3000

### Credenciais de Acesso

- **Email**: admin@sps.com
- **Senha**: admin123
- **Tipo**: admin

---

## 🧪 Testes

### Backend
```bash
cd sps-group-back-end
npm test
```

### Frontend
```bash
cd sps-group-front-end
npm test
```

---

## 📋 Checklist de Implementação

- [x] POST /auth/login - Gera token JWT
- [x] POST /users - Cadastra usuário (validação de email único)
- [x] GET /users - Lista usuários
- [x] PUT /users/:id - Edita usuário
- [x] DELETE /users/:id - Exclui usuário
- [x] Banco de dados em memória implementado
- [x] Usuário admin pré-cadastrado
- [x] Rotas protegidas com JWT
- [x] Interface React com autenticação
- [x] Páginas protegidas no frontend
- [x] Validação de dados
- [x] Tratamento de erros
- [x] Testes unitários

---

## 🎯 Critérios de Avaliação

- **Funcionalidade (50%)**: ✅ Sistema completo e funcional
- **Código Limpo e Boas Práticas (30%)**: ✅ Arquitetura organizada e padrões consistentes
- **Usabilidade e Segurança (20%)**: ✅ Interface intuitiva e medidas de segurança implementadas

---

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de dados com express-validator
- Controle de acesso baseado em tipo de usuário
- Rotas protegidas no frontend e backend

---


## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido por mim como uma prova técnica para a SPS Group, demonstrando habilidades em:

- Desenvolvimento full-stack
- Arquitetura de APIs RESTful
- Desenvolvimento React moderno
- Implementação de segurança
- Boas práticas de desenvolvimento
- Testes unitários

---

*Projeto desenvolvido com foco em qualidade, segurança e usabilidade, atendendo a todos os requisitos especificados no desafio técnico.*