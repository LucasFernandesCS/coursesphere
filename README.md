# CourseSphere

[![Backend CI](https://github.com/LucasFernandesCS/coursesphere/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/LucasFernandesCS/coursesphere/actions/workflows/backend-ci.yml)

CourseSphere é uma aplicação web para gestão colaborativa de cursos online. O projeto possui uma API REST para autenticação, gerenciamento de cursos e gerenciamento de aulas.

A stack escolhida para esta implementação foi Node.js com TypeScript no backend, utilizando Express, Prisma ORM, PostgreSQL e autenticação JWT.

> A stack sugerida originalmente era Rails + React, porém o backend foi desenvolvido com Node.js + TypeScript por ser uma stack de maior produtividade para esta entrega, mantendo uma arquitetura organizada em camadas, validações, autenticação, testes e regras de negócio bem definidas.

## Tecnologias

### Backend

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- Docker Compose
- JWT
- bcryptjs
- Zod
- Vitest
- Supertest

### Frontend

O frontend será desenvolvido com:

- React
- TypeScript
- Vite
- Axios
- React Router

## Estrutura do projeto

```txt
coursesphere/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.ts
    src/
      config/
      controllers/
      errors/
      middlewares/
      repositories/
      routes/
      services/
      utils/
      app.ts
      server.ts
    tests/
      controllers/
      repositories/
      services/
    Dockerfile
    package.json
    tsconfig.json
  frontend/
  docker-compose.yml
  README.md
```

## Arquitetura do backend

O backend segue uma arquitetura em camadas:

```txt
Controller -> Service -> Repository -> Prisma
```

### Controller

Responsável por lidar com requisições HTTP, parâmetros, corpo da requisição e respostas.

### Service

Responsável pelas regras de negócio da aplicação.

Exemplos:

- Verificar se um e-mail já está cadastrado.
- Validar se o usuário é criador de um curso.
- Validar datas de início e fim de um curso.
- Validar status de uma aula.
- Impedir alterações não autorizadas.

### Repository

Responsável pelo acesso ao banco de dados.

### Prisma

ORM utilizado para comunicação com o PostgreSQL.

## Requisitos implementados

### Autenticação

- Registro de usuário.
- Login com e-mail e senha.
- Geração de token JWT.
- Rota protegida para obter o usuário autenticado.
- Middleware de autenticação.

### Courses

- Criar curso.
- Listar cursos do usuário autenticado.
- Buscar curso por ID.
- Atualizar curso.
- Excluir curso.
- Apenas o criador pode atualizar ou excluir um curso.

### Lessons

- Criar aula dentro de um curso.
- Listar aulas de um curso.
- Buscar aula por ID.
- Atualizar aula.
- Excluir aula.
- Apenas o criador do curso pode criar, atualizar ou excluir aulas daquele curso.
- Validação de status da aula: `draft` ou `published`.
- Validação de URL de vídeo.

### Testes

Foram implementados testes para:

- Health check da API.
- Repositories.
- Services.
- Endpoints HTTP.

## Como rodar o projeto

### Pré-requisitos

É necessário ter instalado:

- Docker
- Docker Compose
- Node.js
- npm

## Configuração do backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` dentro de `backend`:

```env
DATABASE_URL="postgresql://coursesphere:coursesphere@localhost:5432/coursesphere_dev?schema=public"
JWT_SECRET="coursesphere_secret"
PORT=3000
```

## Subir o banco de dados

Na raiz do projeto:

```bash
docker compose up -d postgres
```

## Rodar migrations

Dentro da pasta `backend`:

```bash
npx prisma migrate dev
```

## Rodar seed

Dentro da pasta `backend`:

```bash
npm run prisma:seed
```

O seed cria um usuário de teste:

```txt
Email: lucas@example.com
Senha: 123456
```

## Rodar o backend localmente

Dentro da pasta `backend`:

```bash
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3000
```

## Rodar backend com Docker Compose

Na raiz do projeto:

```bash
docker compose up --build postgres backend
```

## Rodar testes

Com o banco PostgreSQL rodando, entre na pasta `backend` e execute:

```bash
npm run test
```

## Gerar build do backend

Dentro da pasta `backend`:

```bash
npm run build
```

## Scripts disponíveis no backend

Executa o backend em modo desenvolvimento:

```bash
npm run dev
```

Compila o TypeScript para JavaScript na pasta `dist`:

```bash
npm run build
```

Executa a versão compilada do backend:

```bash
npm start
```

Executa os testes automatizados:

```bash
npm run test
```

Executa os testes em modo watch:

```bash
npm run test:watch
```

Executa as migrations do Prisma:

```bash
npm run prisma:migrate
```

Abre o Prisma Studio:

```bash
npm run prisma:studio
```

Popula o banco com dados iniciais:

```bash
npm run prisma:seed
```

## Rotas da API

### Health check

```http
GET /
```

Resposta:

```json
{
  "message": "CourseSphere API is running"
}
```

## Auth

### Registrar usuário

```http
POST /auth/register
```

Body:

```json
{
  "name": "Lucas Fernandes",
  "email": "lucas@example.com",
  "password": "123456"
}
```

### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "lucas@example.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "user": {
    "id": "user-id",
    "name": "Lucas Fernandes",
    "email": "lucas@example.com",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

### Obter usuário autenticado

```http
GET /auth/me
```

Header:

```txt
Authorization: Bearer jwt-token
```

## Courses

Todas as rotas de cursos exigem autenticação.

Header:

```txt
Authorization: Bearer jwt-token
```

### Criar curso

```http
POST /courses
```

Body:

```json
{
  "name": "Node.js Fundamentals",
  "description": "Curso introdutório de Node.js",
  "startDate": "2026-06-01",
  "endDate": "2026-07-01"
}
```

### Listar cursos do usuário autenticado

```http
GET /courses
```

### Buscar curso por ID

```http
GET /courses/:id
```

### Atualizar curso

```http
PATCH /courses/:id
```

Body:

```json
{
  "name": "Node.js Advanced",
  "description": "Curso avançado de Node.js"
}
```

### Excluir curso

```http
DELETE /courses/:id
```

## Lessons

Todas as rotas de aulas exigem autenticação.

Header:

```txt
Authorization: Bearer jwt-token
```

### Criar aula em um curso

```http
POST /courses/:courseId/lessons
```

Body:

```json
{
  "title": "Introdução ao Node.js",
  "status": "draft",
  "videoUrl": "https://example.com/node-intro"
}
```

### Listar aulas de um curso

```http
GET /courses/:courseId/lessons
```

### Buscar aula por ID

```http
GET /lessons/:id
```

### Atualizar aula

```http
PATCH /lessons/:id
```

Body:

```json
{
  "title": "Introdução ao Node.js Atualizada",
  "status": "published",
  "videoUrl": "https://example.com/node-updated"
}
```

### Excluir aula

```http
DELETE /lessons/:id
```

## Regras de negócio

### Usuários

- Nome é obrigatório.
- E-mail é obrigatório.
- E-mail deve ser único.
- Senha é obrigatória.
- Senha é armazenada com hash.

### Cursos

- Nome é obrigatório.
- Nome deve ter pelo menos 3 caracteres.
- Data de início é obrigatória.
- Data de fim é obrigatória.
- Data de fim deve ser igual ou posterior à data de início.
- Todo curso pertence a um usuário criador.
- Apenas o criador pode atualizar ou excluir o curso.

### Aulas

- Título é obrigatório.
- Título deve ter pelo menos 3 caracteres.
- Status deve ser `draft` ou `published`.
- URL de vídeo é opcional.
- Se informada, a URL de vídeo deve ser válida.
- Toda aula pertence a um curso.
- Apenas o criador do curso pode criar, atualizar ou excluir aulas daquele curso.

## Testando no Postman

### Login

```http
POST http://localhost:3000/auth/login
```

Body:

```json
{
  "email": "lucas@example.com",
  "password": "123456"
}
```

Copie o token retornado e utilize nas rotas protegidas com o header:

```txt
Authorization: Bearer SEU_TOKEN
```

## Status atual

- Backend implementado.
- Autenticação implementada.
- CRUD de cursos implementado.
- CRUD de aulas implementado.
- Testes automatizados implementados.
- Seed implementado.
- Frontend ainda será desenvolvido.
