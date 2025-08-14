# SPS Group Backend

## Estrutura do Projeto

```
sps-group-back-end/
├── config/
│   ├── database.js      # Configuração do banco de dados em memória
│   └── init.js          # Inicialização do sistema (usuário admin)
├── middlewares/
│   └── authMiddleware.js # Middleware de autenticação JWT
├── models/
│   └── User.js          # Modelo de usuário com métodos CRUD
├── routes/
│   ├── auth.js          # Rotas de autenticação (login, register)
│   └── users.js         # Rotas de gerenciamento de usuários
├── utils/
│   └── validators.js    # Validação de dados com express-validator
├── server.js            # Servidor principal
└── package.json
```

## Funcionalidades

### Autenticação
- Login com email e senha
- Registro de novos usuários
- Criação de usuários admin (apenas por administradores)

### Gerenciamento de Usuários
- Listar todos os usuários (apenas admin)
- Obter perfil do usuário logado
- Criar novos usuários (apenas admin)
- Atualizar dados do usuário
- Deletar usuários

### Segurança
- Autenticação JWT
- Hash de senhas com bcrypt
- Validação de dados com express-validator
- Controle de acesso baseado em tipo de usuário

## Como Executar

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente (.env):
```
JWT_SECRET=sua_chave_secreta_aqui
BCRYPT_SALT_ROUNDS=10
JWT_EXPIRES_IN=1d
PORT=4000
```

3. Executar servidor:
```bash
node ./server.js
```

## Usuário Padrão

O sistema cria automaticamente um usuário administrador:
- Email: admin@sps.com
- Senha: admin123
- Tipo: admin
