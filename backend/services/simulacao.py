from Connections.postgre import postgreConnection
from models.simulacao import SimulacaoCriar, SimulacaoAtualizar, SimulacaoResponse
from typing import List, Optional
import math


class SimulacaoService:
    """
    Serviço para operações de simulação.
    """

    def __init__(self):
        self.db = postgreConnection()

    def calcular_lote_economico(
        self, demanda_anual: float, custo_pedido: float, custo_manutencao: float
    ) -> float:
        """
        Calcula o Lote Econômico de Compra (LEC) usando a fórmula de Wilson.
        LEC = sqrt((2 * D * S) / H)
        onde:
        D = demanda anual
        S = custo por pedido
        H = custo de manutenção por unidade por ano
        """
        lec = math.sqrt((2 * demanda_anual * custo_pedido) / custo_manutencao)
        return round(lec, 2)

    def calcular_custo_total(
        self,
        demanda_anual: float,
        custo_pedido: float,
        custo_manutencao: float,
        lote: float,
    ) -> float:
        """
        Calcula o custo total anual.
        CT = (D/Q) * S + (Q/2) * H
        onde:
        D = demanda anual
        Q = tamanho do lote
        S = custo por pedido
        H = custo de manutenção por unidade por ano
        """
        custo_pedidos = (demanda_anual / lote) * custo_pedido
        custo_estoque = (lote / 2) * custo_manutencao
        return round(custo_pedidos + custo_estoque, 2)

    def criar_simulacao(
        self, simulacao: SimulacaoCriar, id_projeto: int
    ) -> SimulacaoResponse:
        """
        Cria uma nova simulação.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            # Calcula o lote ótimo
            lote_otimo = self.calcular_lote_economico(
                simulacao.demanda_anual,
                simulacao.custo_pedido,
                simulacao.custo_manutencao,
            )

            # Calcula custo total ótimo
            custo_total_otimo = self.calcular_custo_total(
                simulacao.demanda_anual,
                simulacao.custo_pedido,
                simulacao.custo_manutencao,
                lote_otimo,
            )

            # Calcula custo total atual e economia (se lote atual foi fornecido)
            custo_total_atual = None
            economia_anual = None
            if simulacao.lote_atual_empresa:
                custo_total_atual = self.calcular_custo_total(
                    simulacao.demanda_anual,
                    simulacao.custo_pedido,
                    simulacao.custo_manutencao,
                    simulacao.lote_atual_empresa,
                )
                economia_anual = round(custo_total_atual - custo_total_otimo, 2)

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
                    simulacao.lote_atual_empresa,
                    lote_otimo,
                    custo_total_atual,
                    custo_total_otimo,
                    economia_anual,
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
                lote_atual_empresa=simulacao.lote_atual_empresa,
                lote_otimo_calculado=lote_otimo,
                custo_total_atual=custo_total_atual,
                custo_total_otimo=custo_total_otimo,
                economia_anual=economia_anual,
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
        Atualiza uma simulação.
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

            # Recalcula valores
            lote_otimo = self.calcular_lote_economico(
                demanda_anual, custo_pedido, custo_manutencao
            )

            custo_total_otimo = self.calcular_custo_total(
                demanda_anual, custo_pedido, custo_manutencao, lote_otimo
            )

            custo_total_atual = None
            economia_anual = None
            if lote_atual_empresa:
                custo_total_atual = self.calcular_custo_total(
                    demanda_anual, custo_pedido, custo_manutencao, lote_atual_empresa
                )
                economia_anual = round(custo_total_atual - custo_total_otimo, 2)

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
                    lote_atual_empresa,
                    lote_otimo,
                    custo_total_atual,
                    custo_total_otimo,
                    economia_anual,
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
                lote_atual_empresa=lote_atual_empresa,
                lote_otimo_calculado=lote_otimo,
                custo_total_atual=custo_total_atual,
                custo_total_otimo=custo_total_otimo,
                economia_anual=economia_anual,
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
