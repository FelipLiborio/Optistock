"""
Módulo de cálculo do Lote Econômico de Compra (LEC) usando SymPy.
Baseado na metodologia demonstrada no demo_2.ipynb.
"""

import sympy as sp
from typing import Dict, Any, List, Tuple
import numpy as np


class CalculadoraLoteEconomico:
    """
    Classe para realizar cálculos de Lote Econômico usando SymPy,
    seguindo a abordagem matemática demonstrada no notebook demo_2.ipynb.
    """

    def __init__(
        self,
        demanda_anual: float,
        custo_pedido: float,
        custo_manutencao: float,
        lote_atual: float = None,
    ):
        """
        Inicializa o calculador com os parâmetros do produto.

        Args:
            demanda_anual: Demanda anual do produto (D)
            custo_pedido: Custo por pedido (S)
            custo_manutencao: Custo de manutenção por unidade por ano (H)
            lote_atual: Lote atual utilizado pela empresa (opcional)
        """
        self.demanda_anual = float(demanda_anual)
        self.custo_pedido = float(custo_pedido)
        self.custo_manutencao = float(custo_manutencao)
        self.lote_atual = float(lote_atual) if lote_atual else None

        # Símbolo para a variável de otimização
        self.Q = sp.symbols("Q", positive=True, real=True)

        # Monta as funções de custo
        self._montar_funcoes()

    def _montar_funcoes(self):
        """
        Monta as funções de custo usando SymPy.
        """
        # Custo de manter estoque: (H * Q) / 2
        self.custo_estoque = (self.custo_manutencao * self.Q) / 2

        # Custo de pedido: (S * D) / Q
        self.custo_pedido_formula = (self.custo_pedido * self.demanda_anual) / self.Q

        # Função de custo total: CT = Custo Estoque + Custo Pedido
        self.funcao_custo_total = self.custo_estoque + self.custo_pedido_formula

    def calcular_lote_otimo(self) -> Dict[str, Any]:
        """
        Calcula o lote ótimo usando derivadas com SymPy.

        Returns:
            Dicionário com:
                - lote_otimo: valor do lote econômico
                - derivada: expressão da derivada
                - pontos_criticos: todos os pontos críticos encontrados
        """
        # Calcula a derivada da função de custo total
        derivada = sp.diff(self.funcao_custo_total, self.Q)

        # Encontra os pontos críticos (onde derivada = 0)
        pontos_criticos = sp.solve(derivada, self.Q)

        # Filtra apenas pontos positivos e reais
        lote_otimo = None
        for ponto in pontos_criticos:
            if ponto.is_real and ponto > 0:
                lote_otimo = float(ponto)
                break

        return {
            "lote_otimo": round(lote_otimo, 2) if lote_otimo else None,
            "derivada": str(derivada),
            "pontos_criticos": [float(p) for p in pontos_criticos if p.is_real],
            "funcao_custo": str(self.funcao_custo_total),
        }

    def calcular_custo_total(self, lote: float) -> float:
        """
        Calcula o custo total anual para um dado tamanho de lote.

        Args:
            lote: Tamanho do lote

        Returns:
            Custo total anual
        """
        # Substitui Q pelo valor do lote na fórmula
        custo = self.funcao_custo_total.subs(self.Q, lote)
        return round(float(custo), 2)

    def gerar_analise_completa(self) -> Dict[str, Any]:
        """
        Gera uma análise completa incluindo lote ótimo, custos e economia.

        Returns:
            Dicionário com análise completa
        """
        # Calcula lote ótimo
        resultado_otimizacao = self.calcular_lote_otimo()
        lote_otimo = resultado_otimizacao["lote_otimo"]

        # Calcula custo total ótimo
        custo_total_otimo = self.calcular_custo_total(lote_otimo)

        # Prepara resultado base
        analise = {
            "lote_otimo_calculado": lote_otimo,
            "custo_total_otimo": custo_total_otimo,
            "funcao_custo": resultado_otimizacao["funcao_custo"],
            "derivada": resultado_otimizacao["derivada"],
            "pontos_criticos": resultado_otimizacao["pontos_criticos"],
        }

        # Se há lote atual, calcula comparação
        if self.lote_atual:
            custo_total_atual = self.calcular_custo_total(self.lote_atual)
            economia_anual = custo_total_atual - custo_total_otimo
            percentual_economia = (economia_anual / custo_total_atual) * 100

            analise.update(
                {
                    "lote_atual_empresa": self.lote_atual,
                    "custo_total_atual": custo_total_atual,
                    "economia_anual": round(economia_anual, 2),
                    "percentual_economia": round(percentual_economia, 2),
                }
            )
        else:
            analise.update(
                {
                    "lote_atual_empresa": None,
                    "custo_total_atual": None,
                    "economia_anual": None,
                    "percentual_economia": None,
                }
            )

        return analise

    def gerar_dados_grafico(
        self, q_min: float = 10, q_max: float = 200, pontos: int = 100
    ) -> Dict[str, List[float]]:
        """
        Gera dados para plotagem do gráfico de custo x lote.

        Args:
            q_min: Valor mínimo de Q
            q_max: Valor máximo de Q
            pontos: Número de pontos para o gráfico

        Returns:
            Dicionário com listas de valores de Q e custos correspondentes
        """
        # Gera valores de Q
        valores_q = np.linspace(q_min, q_max, pontos)

        # Calcula custos para cada Q
        custos = [self.calcular_custo_total(q) for q in valores_q]

        return {
            "valores_lote": valores_q.tolist(),
            "valores_custo": custos,
        }

    def verificar_segunda_derivada(self, lote: float) -> Dict[str, Any]:
        """
        Verifica a segunda derivada para confirmar que é um ponto de mínimo.

        Args:
            lote: Valor do lote a verificar

        Returns:
            Dicionário com informações da segunda derivada
        """
        segunda_derivada = sp.diff(self.funcao_custo_total, self.Q, 2)
        valor_segunda_derivada = float(segunda_derivada.subs(self.Q, lote))

        return {
            "segunda_derivada": str(segunda_derivada),
            "valor_no_ponto": valor_segunda_derivada,
            "e_minimo": valor_segunda_derivada > 0,
        }

    def gerar_relatorio_detalhado(self) -> Dict[str, Any]:
        """
        Gera relatório completo com todas as informações matemáticas e análise.

        Returns:
            Dicionário com relatório completo
        """
        analise = self.gerar_analise_completa()
        verificacao = self.verificar_segunda_derivada(analise["lote_otimo_calculado"])

        relatorio = {
            **analise,
            "verificacao_otimalidade": verificacao,
            "parametros": {
                "demanda_anual": self.demanda_anual,
                "custo_pedido": self.custo_pedido,
                "custo_manutencao": self.custo_manutencao,
            },
        }

        return relatorio
