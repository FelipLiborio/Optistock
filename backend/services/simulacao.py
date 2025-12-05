from Connections.postgre import postgreConnection
from models.simulacao import SimulacaoCriar, SimulacaoAtualizar, SimulacaoResponse
from utils.lote_economico import CalculadoraLoteEconomico
from typing import List, Optional, Dict, Any


class SimulacaoService:
    """
    Serviço para operações de simulação.
    """

    def __init__(self):
        self.db = postgreConnection()

    def criar_simulacao(
        self, simulacao: SimulacaoCriar, id_projeto: int
    ) -> SimulacaoResponse:
        """
        Cria uma nova simulação usando SymPy para cálculos matemáticos.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Cria calculadora com SymPy
            calculadora = CalculadoraLoteEconomico(
                demanda_anual=simulacao.demanda_anual,
                custo_pedido=simulacao.custo_pedido,
                custo_manutencao=simulacao.custo_manutencao,
                lote_atual=simulacao.lote_atual_empresa,
            )

            # Gera análise completa usando SymPy
            analise = calculadora.gerar_analise_completa()

            query = """
                INSERT INTO simulacoes (
                    id_projeto, nome_produto, demanda_anual, custo_pedido,
                    custo_manutencao, lote_atual_empresa, lote_otimo_calculado,
                    custo_total_atual, custo_total_otimo, economia_anual
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, data_simulacao
            """

            cursor.execute(
                query,
                (
                    id_projeto,
                    simulacao.nome_produto,
                    simulacao.demanda_anual,
                    simulacao.custo_pedido,
                    simulacao.custo_manutencao,
                    analise["lote_atual_empresa"],
                    analise["lote_otimo_calculado"],
                    analise["custo_total_atual"],
                    analise["custo_total_otimo"],
                    analise["economia_anual"],
                ),
            )

            result = cursor.fetchone()
            conn.commit()

            return SimulacaoResponse(
                id=result[0],
                id_projeto=id_projeto,
                nome_produto=simulacao.nome_produto,
                demanda_anual=simulacao.demanda_anual,
                custo_pedido=simulacao.custo_pedido,
                custo_manutencao=simulacao.custo_manutencao,
                lote_atual_empresa=analise["lote_atual_empresa"],
                lote_otimo_calculado=analise["lote_otimo_calculado"],
                custo_total_atual=analise["custo_total_atual"],
                custo_total_otimo=analise["custo_total_otimo"],
                economia_anual=analise["economia_anual"],
                data_simulacao=result[1],
            )

        finally:
            cursor.close()

    def listar_simulacoes_projeto(self, id_projeto: int) -> List[SimulacaoResponse]:
        """
        Lista todas as simulações de um projeto.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            query = """
                SELECT id, id_projeto, nome_produto, demanda_anual, custo_pedido,
                       custo_manutencao, lote_atual_empresa, lote_otimo_calculado,
                       custo_total_atual, custo_total_otimo, economia_anual,
                       data_simulacao
                FROM simulacoes
                WHERE id_projeto = %s
                ORDER BY data_simulacao DESC
            """

            cursor.execute(query, (id_projeto,))
            simulacoes = cursor.fetchall()

            return [
                SimulacaoResponse(
                    id=s[0],
                    id_projeto=s[1],
                    nome_produto=s[2],
                    demanda_anual=s[3],
                    custo_pedido=s[4],
                    custo_manutencao=s[5],
                    lote_atual_empresa=s[6],
                    lote_otimo_calculado=s[7],
                    custo_total_atual=s[8],
                    custo_total_otimo=s[9],
                    economia_anual=s[10],
                    data_simulacao=s[11],
                )
                for s in simulacoes
            ]

        finally:
            cursor.close()

    def obter_simulacao(
        self, id_simulacao: int, id_projeto: int
    ) -> Optional[SimulacaoResponse]:
        """
        Obtém uma simulação específica de um projeto.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            query = """
                SELECT id, id_projeto, nome_produto, demanda_anual, custo_pedido,
                       custo_manutencao, lote_atual_empresa, lote_otimo_calculado,
                       custo_total_atual, custo_total_otimo, economia_anual,
                       data_simulacao
                FROM simulacoes
                WHERE id = %s AND id_projeto = %s
            """

            cursor.execute(query, (id_simulacao, id_projeto))
            s = cursor.fetchone()

            if not s:
                return None

            return SimulacaoResponse(
                id=s[0],
                id_projeto=s[1],
                nome_produto=s[2],
                demanda_anual=s[3],
                custo_pedido=s[4],
                custo_manutencao=s[5],
                lote_atual_empresa=s[6],
                lote_otimo_calculado=s[7],
                custo_total_atual=s[8],
                custo_total_otimo=s[9],
                economia_anual=s[10],
                data_simulacao=s[11],
            )

        finally:
            cursor.close()

    def atualizar_simulacao(
        self, id_simulacao: int, id_projeto: int, dados: SimulacaoAtualizar
    ) -> Optional[SimulacaoResponse]:
        """
        Atualiza uma simulação usando SymPy para recalcular valores.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Primeiro, busca os dados atuais
            simulacao_atual = self.obter_simulacao(id_simulacao, id_projeto)
            if not simulacao_atual:
                return None

            # Prepara os novos valores
            nome_produto = dados.nome_produto or simulacao_atual.nome_produto
            demanda_anual = dados.demanda_anual or simulacao_atual.demanda_anual
            custo_pedido = dados.custo_pedido or simulacao_atual.custo_pedido
            custo_manutencao = (
                dados.custo_manutencao or simulacao_atual.custo_manutencao
            )
            lote_atual_empresa = (
                dados.lote_atual_empresa
                if dados.lote_atual_empresa is not None
                else simulacao_atual.lote_atual_empresa
            )

            # Recalcula usando SymPy
            calculadora = CalculadoraLoteEconomico(
                demanda_anual=demanda_anual,
                custo_pedido=custo_pedido,
                custo_manutencao=custo_manutencao,
                lote_atual=lote_atual_empresa,
            )

            analise = calculadora.gerar_analise_completa()

            query = """
                UPDATE simulacoes
                SET nome_produto = %s,
                    demanda_anual = %s,
                    custo_pedido = %s,
                    custo_manutencao = %s,
                    lote_atual_empresa = %s,
                    lote_otimo_calculado = %s,
                    custo_total_atual = %s,
                    custo_total_otimo = %s,
                    economia_anual = %s
                WHERE id = %s AND id_projeto = %s
                RETURNING data_simulacao
            """

            cursor.execute(
                query,
                (
                    nome_produto,
                    demanda_anual,
                    custo_pedido,
                    custo_manutencao,
                    analise["lote_atual_empresa"],
                    analise["lote_otimo_calculado"],
                    analise["custo_total_atual"],
                    analise["custo_total_otimo"],
                    analise["economia_anual"],
                    id_simulacao,
                    id_projeto,
                ),
            )

            result = cursor.fetchone()
            if not result:
                return None

            conn.commit()

            return SimulacaoResponse(
                id=id_simulacao,
                id_projeto=id_projeto,
                nome_produto=nome_produto,
                demanda_anual=demanda_anual,
                custo_pedido=custo_pedido,
                custo_manutencao=custo_manutencao,
                lote_atual_empresa=analise["lote_atual_empresa"],
                lote_otimo_calculado=analise["lote_otimo_calculado"],
                custo_total_atual=analise["custo_total_atual"],
                custo_total_otimo=analise["custo_total_otimo"],
                economia_anual=analise["economia_anual"],
                data_simulacao=result[0],
            )

        finally:
            cursor.close()

    def deletar_simulacao(self, id_simulacao: int, id_projeto: int) -> bool:
        """
        Deleta uma simulação.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            query = "DELETE FROM simulacoes WHERE id = %s AND id_projeto = %s"
            cursor.execute(query, (id_simulacao, id_projeto))
            conn.commit()

            return cursor.rowcount > 0

        finally:
            cursor.close()

    def gerar_analise_matematica_detalhada(
        self, id_simulacao: int, id_projeto: int
    ) -> Optional[Dict[str, Any]]:
        """
        Gera análise matemática detalhada de uma simulação usando SymPy.
        Inclui derivadas, pontos críticos e verificação de otimalidade.
        """
        simulacao = self.obter_simulacao(id_simulacao, id_projeto)
        if not simulacao:
            return None

        calculadora = CalculadoraLoteEconomico(
            demanda_anual=simulacao.demanda_anual,
            custo_pedido=simulacao.custo_pedido,
            custo_manutencao=simulacao.custo_manutencao,
            lote_atual=simulacao.lote_atual_empresa,
        )

        return calculadora.gerar_relatorio_detalhado()

    def gerar_dados_grafico(
        self,
        id_simulacao: int,
        id_projeto: int,
        q_min: float = 10,
        q_max: float = 200,
        pontos: int = 100,
    ) -> Optional[Dict[str, Any]]:
        """
        Gera dados para plotagem do gráfico de custo x lote.
        """
        simulacao = self.obter_simulacao(id_simulacao, id_projeto)
        if not simulacao:
            return None

        calculadora = CalculadoraLoteEconomico(
            demanda_anual=simulacao.demanda_anual,
            custo_pedido=simulacao.custo_pedido,
            custo_manutencao=simulacao.custo_manutencao,
            lote_atual=simulacao.lote_atual_empresa,
        )

        dados_grafico = calculadora.gerar_dados_grafico(q_min, q_max, pontos)

        # Adiciona pontos de interesse
        dados_grafico["ponto_otimo"] = {
            "lote": simulacao.lote_otimo_calculado,
            "custo": simulacao.custo_total_otimo,
        }

        if simulacao.lote_atual_empresa:
            dados_grafico["ponto_atual"] = {
                "lote": simulacao.lote_atual_empresa,
                "custo": simulacao.custo_total_atual,
            }

        return dados_grafico
