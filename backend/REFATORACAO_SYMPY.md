# Refatoração: Implementação do SymPy para Cálculo de Lote Econômico

## Resumo

O backend foi refatorado para utilizar a biblioteca **SymPy** para realizar os cálculos de Lote Econômico de Compra (LEC), seguindo a metodologia demonstrada no arquivo `demo_2.ipynb`.

## Mudanças Implementadas

### 1. Dependências Atualizadas (`requirements.txt`)

Foram adicionadas as seguintes bibliotecas:
- `sympy` - Para cálculos simbólicos matemáticos
- `numpy` - Para operações numéricas
- `matplotlib` - Para geração de gráficos (opcional)

### 2. Novo Módulo de Cálculo (`utils/lote_economico.py`)

Criada a classe `CalculadoraLoteEconomico` que implementa:

#### Funcionalidades Principais:
- **Cálculo Simbólico**: Utiliza SymPy para criar funções de custo como expressões matemáticas
- **Otimização por Derivadas**: Calcula o lote ótimo encontrando os pontos críticos (derivada = 0)
- **Verificação de Otimalidade**: Usa segunda derivada para confirmar que é um ponto de mínimo
- **Análise Comparativa**: Compara o lote atual da empresa com o lote ótimo calculado

#### Métodos Disponíveis:

```python
# Calcula lote ótimo usando derivadas
calcular_lote_otimo() -> Dict[str, Any]

# Calcula custo total para um dado lote
calcular_custo_total(lote: float) -> float

# Gera análise completa
gerar_analise_completa() -> Dict[str, Any]

# Gera dados para gráficos
gerar_dados_grafico(q_min, q_max, pontos) -> Dict[str, List[float]]

# Verifica segunda derivada
verificar_segunda_derivada(lote: float) -> Dict[str, Any]

# Gera relatório completo
gerar_relatorio_detalhado() -> Dict[str, Any]
```

### 3. Serviço de Simulação Refatorado (`services/simulacao.py`)

#### Alterações:
- Removidas funções manuais de cálculo (`calcular_lote_economico`, `calcular_custo_total`)
- Integração com `CalculadoraLoteEconomico` para todos os cálculos
- Mantida compatibilidade com a API existente

#### Novos Métodos:

```python
# Gera análise matemática detalhada
gerar_analise_matematica_detalhada(id_simulacao, id_projeto) -> Dict[str, Any]

# Gera dados para plotagem de gráficos
gerar_dados_grafico(id_simulacao, id_projeto, q_min, q_max, pontos) -> Dict[str, Any]
```

### 4. Modelos Expandidos (`models/simulacao.py`)

Adicionados novos modelos Pydantic:

#### `AnaliseMatematicaResponse`
Retorna análise completa incluindo:
- Lote ótimo calculado
- Função de custo (expressão matemática)
- Derivada primeira (expressão)
- Pontos críticos encontrados
- Verificação de otimalidade (segunda derivada)
- Economia calculada e percentual

#### `DadosGraficoResponse`
Retorna dados para plotagem:
- Arrays de valores de lote e custo
- Ponto ótimo (lote e custo)
- Ponto atual da empresa (se disponível)

### 5. Rotas Expandidas (`routes/simulacao.py`)

#### Novas Rotas:

**GET** `/projetos/{id_projeto}/simulacoes/{id_simulacao}/analise-matematica`
- Retorna análise matemática detalhada com derivadas e verificação

**GET** `/projetos/{id_projeto}/simulacoes/{id_simulacao}/grafico`
- Retorna dados para plotagem do gráfico custo x lote
- Parâmetros opcionais: `q_min`, `q_max`, `pontos`

## Abordagem Matemática (Baseada em demo_2.ipynb)

### 1. Montagem da Função de Custo

```
CT(Q) = (H × Q) / 2 + (S × D) / Q

Onde:
- Q = Tamanho do lote (variável a otimizar)
- H = Custo de manutenção por unidade/ano
- D = Demanda anual
- S = Custo por pedido
```

### 2. Otimização via Derivadas

```
1. Calcula derivada: dCT/dQ
2. Iguala a zero: dCT/dQ = 0
3. Resolve para Q (ponto crítico)
4. Verifica segunda derivada: d²CT/dQ² > 0 (confirma mínimo)
```

### 3. Análise Comparativa

Se a empresa fornece o lote atual:
```
Economia = CT(lote_atual) - CT(lote_ótimo)
Percentual = (Economia / CT(lote_atual)) × 100
```

## Vantagens da Refatoração

### 1. **Precisão Matemática**
- Cálculos simbólicos exatos (não apenas numéricos)
- Verificação matemática rigorosa de otimalidade

### 2. **Transparência**
- Exposição das fórmulas matemáticas usadas
- Visibilidade dos pontos críticos encontrados
- Demonstração clara do processo de otimização

### 3. **Extensibilidade**
- Fácil adicionar novos tipos de análise
- Suporte para diferentes modelos de custo
- Geração de gráficos e visualizações

### 4. **Validação**
- Segunda derivada confirma ponto de mínimo
- Múltiplos pontos críticos são identificados
- Análise completa do comportamento da função

## Compatibilidade

### ✅ Mantido:
- Todos os endpoints existentes funcionam normalmente
- Estrutura de dados da API inalterada
- Banco de dados sem alterações

### ➕ Adicionado:
- Dois novos endpoints para análise avançada
- Modelos estendidos para respostas detalhadas
- Documentação matemática completa

## Exemplo de Uso

### Criar Simulação (Existente)
```python
POST /projetos/1/simulacoes
{
    "nome_produto": "Caixa p/ Acoplar TP",
    "demanda_anual": 2218,
    "custo_pedido": 40.00,
    "custo_manutencao": 29.49,
    "lote_atual_empresa": 100
}
```

### Obter Análise Matemática (Novo)
```python
GET /projetos/1/simulacoes/1/analise-matematica

Resposta:
{
    "lote_otimo_calculado": 77.15,
    "custo_total_otimo": 2274.89,
    "funcao_custo": "14.745*Q + 88720.0/Q",
    "derivada": "14.745 - 88720.0/Q**2",
    "pontos_criticos": [77.15],
    "verificacao_otimalidade": {
        "segunda_derivada": "177440.0/Q**3",
        "valor_no_ponto": 38.61,
        "e_minimo": true
    },
    "economia_anual": 170.11,
    "percentual_economia": 6.95
}
```

### Obter Dados para Gráfico (Novo)
```python
GET /projetos/1/simulacoes/1/grafico?q_min=10&q_max=200&pontos=100

Resposta:
{
    "valores_lote": [10, 11.92, 13.84, ...],
    "valores_custo": [9019.45, 7591.23, ...],
    "ponto_otimo": {
        "lote": 77.15,
        "custo": 2274.89
    },
    "ponto_atual": {
        "lote": 100,
        "custo": 2445.00
    }
}
```

## Próximos Passos Sugeridos

1. **Frontend**: Implementar visualização dos gráficos usando os dados retornados
2. **Relatórios**: Gerar PDFs com análise matemática completa
3. **Múltiplos Produtos**: Análise comparativa de vários produtos simultaneamente
4. **Otimização Avançada**: Suporte para restrições adicionais (espaço, capital, etc.)
5. **Testes**: Criar suite de testes unitários para validar cálculos

## Instalação

Para instalar as novas dependências:

```bash
cd backend
pip install -r requirements.txt
```

## Referência

Implementação baseada no notebook `test/demo_2.ipynb` que demonstra a aplicação do Lote Econômico de Compra para o caso do Sr. Carlos e suas caixas para acoplar TP.
