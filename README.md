# 📦 OptiStock

> **Otimização de Estoques via Lote Econômico de Compra (EOQ)**  
> Aplicação Full Stack que utiliza Cálculo Diferencial para minimizar custos de estoque

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📋 Sumário

- [Contextualização](#-contextualização)
- [Modelagem Matemática](#-modelagem-matemática)
- [Arquitetura do Projeto](#️-arquitetura-do-projeto)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [Equipe de Desenvolvimento](#-equipe-de-desenvolvimento)

---

## 🎯 Contextualização

### A Persona: Sr. Carlos

**Sr. Carlos** é gerente de um armazém de médio porte que enfrenta um dilema clássico da gestão de estoques:

- **Comprar em grandes quantidades?**  
  → Reduz custos de pedido (frete, burocracia), mas aumenta gastos com armazenamento, seguro e capital parado.

- **Comprar em pequenas quantidades?**  
  → Minimiza custos de estoque, mas multiplica os custos de transação (frete frequente, processamento de pedidos).

**O Problema:** Sem uma abordagem científica, o Sr. Carlos toma decisões baseadas em intuição, resultando em:

- 💸 Desperdício de recursos financeiros
- 📦 Excesso ou falta de produtos
- 📉 Perda de competitividade

**A Solução:** O **OptiStock** aplica o modelo matemático do **Lote Econômico de Compra (EOQ)** para calcular automaticamente a quantidade ideal de pedido que **minimiza o custo total**, utilizando **Cálculo Diferencial** para encontrar o ponto ótimo.

---

## 📐 Modelagem Matemática

Esta seção detalha a fundamentação matemática do projeto, essencial para a disciplina de Cálculo.

### 1. Função Objetivo: Custo Total

O custo total de gestão de estoque é dado pela soma de dois componentes:

$$
CT(Q) = \frac{D \cdot S}{Q} + \frac{Q \cdot H}{2}
$$

**Onde:**

| Variável | Descrição |
|----------|-----------|
| $CT(Q)$ | Custo Total em função da quantidade $Q$ |
| $D$ | Demanda anual (unidades/ano) |
| $S$ | Custo por pedido (frete, processamento, etc.) |
| $Q$ | Quantidade de pedido (variável de decisão) |
| $H$ | Custo de manutenção por unidade ao ano |

**Interpretação:**

- **Termo 1:** $\frac{D \cdot S}{Q}$ = Custo de Pedido (inversamente proporcional a $Q$)
- **Termo 2:** $\frac{Q \cdot H}{2}$ = Custo de Manutenção (diretamente proporcional a $Q$)

### 2. Aplicação da Primeira Derivada

Para encontrar o **ponto crítico** (possível mínimo ou máximo), calculamos a derivada de $CT(Q)$ em relação a $Q$ e igualamos a zero:

$$
\frac{dCT}{dQ} = -\frac{D \cdot S}{Q^2} + \frac{H}{2} = 0
$$

**Resolvendo para $Q$:**

$$
\frac{D \cdot S}{Q^2} = \frac{H}{2}
$$

$$
Q^2 = \frac{2 \cdot D \cdot S}{H}
$$

$$
Q^* = \sqrt{\frac{2 \cdot D \cdot S}{H}}
$$

**Este é o Lote Econômico de Compra (EOQ).**

### 3. Verificação com a Segunda Derivada

Para garantir que $Q^*$ é um **mínimo global** (e não um máximo), aplicamos o **Teste da Segunda Derivada**:

$$
\frac{d^2CT}{dQ^2} = \frac{2 \cdot D \cdot S}{Q^3}
$$

**Análise:**

- Como $D$, $S$ e $Q$ são sempre positivos, temos:
  $$\frac{d^2CT}{dQ^2} > 0 \quad \forall Q > 0$$

- **Conclusão:** A concavidade da função é positiva, confirmando que $Q^*$ é um **ponto de mínimo global**.

### 4. Implementação com SymPy

No backend, utilizamos a biblioteca **SymPy** (Python) para realizar os cálculos simbólicos automaticamente:

```python
from sympy import symbols, diff, solve, simplify

Q, D, S, H = symbols('Q D S H', positive=True, real=True)

# Função de custo total
CT = (D * S) / Q + (Q * H) / 2

# Primeira derivada
primeira_derivada = diff(CT, Q)

# Resolução do ponto crítico
Q_otimo = solve(primeira_derivada, Q)[0]

# Segunda derivada para verificação
segunda_derivada = diff(CT, Q, 2)
```

**Vantagens:**

- ✅ Cálculos exatos (simbólicos)
- ✅ Verificação automática de otimalidade
- ✅ Geração de fórmulas para relatórios

---

## 🏗️ Arquitetura do Projeto

O **OptiStock** segue uma arquitetura **Full Stack moderna** com separação clara de responsabilidades:

```text
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  - Interface de usuário responsiva                          │
│  - Gráficos interativos (Recharts)                          │
│  - Formulários de simulação                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
┌───────────────────────┴─────────────────────────────────────┐
│                      BACKEND (Python/FastAPI)                │
│  - Cálculos matemáticos com SymPy                           │
│  - Lógica de negócio                                        │
│  - Autenticação JWT                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │ SQL
┌───────────────────────┴─────────────────────────────────────┐
│                   BANCO DE DADOS (PostgreSQL)                │
│  - Persistência de projetos e simulações                    │
│  - Histórico de otimizações                                 │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico Completo

| Camada | Tecnologia | Propósito |
|--------|------------|-----------|
| **Frontend** | React 18.3 + Vite | Interface de usuário |
| | Recharts | Visualização de gráficos |
| | React Router | Navegação SPA |
| | Material-UI (MUI) | Componentes UI |
| **Backend** | Python 3.11+ | Linguagem principal |
| | FastAPI | Framework REST API |
| | SymPy | Cálculo simbólico |
| | Psycopg2 | Comunicação com PostgreSQL |
| | Pydantic | Validação de dados |
| | Uvicorn | Servidor ASGI |
| **Banco de Dados** | PostgreSQL 16 | Persistência relacional |
| **DevOps** | Docker + Docker Compose | Containerização |
| | Jupyter Notebook | Testes e validações |

---

## 🚀 Como Rodar o Projeto

### Método 1: Docker Compose (Recomendado)

**Pré-requisitos:**

- Docker Desktop instalado ([Download](https://www.docker.com/products/docker-desktop))
- Git

**Passo a passo:**

```bash
# 1. Clone o repositório
git clone https://github.com/FelipLiborio/Optistock.git
cd Optistock

# 2. Configure as variáveis de ambiente
# Crie um arquivo .env na pasta backend/ com as seguintes variáveis:
# DATABASE_URL=postgresql://user:password@db:5432/optistock
# SECRET_KEY=sua-chave-secreta-aqui
# ALGORITHM=HS256
# ACCESS_TOKEN_EXPIRE_MINUTES=30

# 3. Suba os containers
docker-compose up --build

# 4. Aguarde a inicialização (pode levar 2-3 minutos)
```

**Acesse as aplicações:**

- 🌐 **Frontend:** [http://localhost:5173](http://localhost:5173)
- 🔧 **Backend (API):** [http://localhost:8000](http://localhost:8000)
- 📚 **Documentação da API:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Método 2: Instalação Manual

<!-- markdownlint-disable MD033 -->
<details>
<summary>📝 Clique para expandir as instruções de instalação manual</summary>

#### Backend (Python)

```bash
# Navegue até a pasta backend
cd backend

# Crie um ambiente virtual
python -m venv venv

# Ative o ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Configure as variáveis de ambiente
# Crie um arquivo .env com:
DATABASE_URL=postgresql://user:password@localhost:5432/optistock
SECRET_KEY=sua-chave-secreta-aqui

# Inicie o servidor
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend (React)

```bash
# Abra um novo terminal e navegue até a pasta frontend
cd frontend/Optistock

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

#### Banco de Dados (PostgreSQL)

```bash
# Certifique-se de ter o PostgreSQL instalado e rodando
# Crie o banco de dados
createdb optistock

# Execute as migrações (se aplicável)
```

</details>

---

## ✨ Funcionalidades

### 1. 👤 Gestão de Usuários

- ✅ Cadastro e autenticação via JWT
- ✅ Sessões seguras com refresh tokens
- ✅ Perfis individualizados

### 2. 📁 Gestão de Projetos

- ✅ CRUD completo de projetos de otimização
- ✅ Organização por grupos/categorias
- ✅ Histórico de modificações

### 3. 🧮 Simulação de Cenários

- ✅ Input de parâmetros (D, S, H, Lote Atual)
- ✅ Cálculo automático do EOQ usando SymPy
- ✅ Comparação "Cenário Atual vs. Otimizado"
- ✅ Análise de economia potencial

### 4. 📊 Dashboard Interativo

- ✅ Gráfico da função de custo total
- ✅ Marcação visual do ponto ótimo
- ✅ Indicador do lote atual da empresa
- ✅ Tooltip com informações detalhadas

### 5. 📈 Relatório de Economia

- ✅ Estatísticas agregadas (economia total anual)
- ✅ Ranking dos 5 produtos com maior economia
- ✅ Tabela comparativa completa
- ✅ Gráficos de barras (custo atual vs. otimizado)

### 6. 🔬 Análise Matemática Detalhada

- ✅ Exibição das derivadas (1ª e 2ª)
- ✅ Verificação de concavidade
- ✅ Demonstração do processo de otimização

---

## 📂 Estrutura de Pastas

```text
Optistock/
├── backend/                    # API REST em Python
│   ├── main.py                # Ponto de entrada da aplicação
│   ├── requirements.txt       # Dependências Python
│   ├── Connections/           # Conexão com banco de dados (Psycopg2)
│   ├── models/                # Modelos Pydantic
│   ├── routes/                # Endpoints da API
│   ├── services/              # Lógica de negócio
│   └── utils/                 # Utilitários (auth, cálculos)
│       └── lote_economico.py  # Implementação do EOQ com SymPy
│
├── frontend/
│   └── Optistock/             # Aplicação React
│       ├── src/
│       │   ├── components/    # Componentes reutilizáveis
│       │   ├── context/       # Context API (AuthContext)
│       │   ├── pages/         # Páginas da aplicação
│       │   │   ├── Home/
│       │   │   ├── Projects/
│       │   │   ├── ProjectDetails/
│       │   │   ├── Report.jsx
│       │   │   └── auth/
│       │   └── services/      # Chamadas à API
│       ├── package.json
│       └── vite.config.js
│
├── test/
│   └── demo.ipynb             # Jupyter Notebook para validações
│
├── docker-compose.yml         # Orquestração dos containers
└── README.md                  # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![SymPy](https://img.shields.io/badge/SymPy-3B5526?style=flat&logo=sympy&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=mui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-FF6384?style=flat&logo=chartdotjs&logoColor=white)

### DevOps

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=flat&logo=jupyter&logoColor=white)

---

## 📚 Referências Acadêmicas

1. **Harris, F. W.** (1913). *How Many Parts to Make at Once*. Factory, The Magazine of Management, 10(2), 135-136, 152.
2. **Wilson, R. H.** (1934). *A Scientific Routine for Stock Control*. Harvard Business Review, 13, 116-128.
3. **Stewart, J.** (2015). *Cálculo - Volume 1* (8ª ed.). São Paulo: Cengage Learning.
4. **Hillier, F. S., & Lieberman, G. J.** (2013). *Introdução à Pesquisa Operacional* (9ª ed.). Porto Alegre: AMGH Editora.

---

### 👥 Equipe de Desenvolvimento

### Felipe Libório

- GitHub: [@FelipLiborio](https://github.com/FelipLiborio)

### Gabriel  Góes

- GitHub: [@CoelhoGoes](https://github.com/CoelhoGoes)

### João Ricardo Almeida

- GitHub: [@jricass](https://github.com/jricass)

## 📝 Licença

Este projeto foi desenvolvido para fins educacionais como parte da disciplina de Cálculo.

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no repositório!
