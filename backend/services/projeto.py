from Connections.postgre import postgreConnection
from models.projeto import ProjetoCriar, ProjetoAtualizar, ProjetoResponse
import psycopg2.extras
from typing import List, Optional


class ProjetoService:
    """
    Serviço para gerenciamento de projetos.
    """

    def __init__(self):
        """
        Inicializa o serviço de projetos.
        """
        self.db = postgreConnection()

    def criar_projeto(self, projeto: ProjetoCriar, id_usuario: int) -> ProjetoResponse:
        """
        Cria um novo projeto para um usuário.

        Args:
            projeto: Dados do projeto.
            id_usuario: ID do usuário dono do projeto.

        Returns:
            Dados do projeto criado.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            cursor.execute(
                """
                INSERT INTO projeto (id_usuario, nome_grupo, descricao)
                VALUES (%s, %s, %s)
                RETURNING id_grupo, id_usuario, nome_grupo, descricao, data_criacao
                """,
                (id_usuario, projeto.nome_grupo, projeto.descricao),
            )

            result = cursor.fetchone()
            conn.commit()

            return ProjetoResponse(
                id_grupo=result["id_grupo"],
                id_usuario=result["id_usuario"],
                nome_grupo=result["nome_grupo"],
                descricao=result["descricao"],
                data_criacao=str(result["data_criacao"]),
            )
        except Exception as e:
            conn.rollback()
            raise Exception(f"Erro ao criar projeto: {str(e)}")
        finally:
            cursor.close()

    def listar_projetos_usuario(self, id_usuario: int) -> List[ProjetoResponse]:
        """
        Lista todos os projetos de um usuário.

        Args:
            id_usuario: ID do usuário.

        Returns:
            Lista de projetos do usuário.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            cursor.execute(
                """
                SELECT id_grupo, id_usuario, nome_grupo, descricao, data_criacao
                FROM projeto
                WHERE id_usuario = %s
                ORDER BY data_criacao DESC
                """,
                (id_usuario,),
            )

            projetos = cursor.fetchall()

            return [
                ProjetoResponse(
                    id_grupo=p["id_grupo"],
                    id_usuario=p["id_usuario"],
                    nome_grupo=p["nome_grupo"],
                    descricao=p["descricao"],
                    data_criacao=str(p["data_criacao"]),
                )
                for p in projetos
            ]
        except Exception as e:
            raise Exception(f"Erro ao listar projetos: {str(e)}")
        finally:
            cursor.close()

    def obter_projeto(
        self, id_grupo: int, id_usuario: int
    ) -> Optional[ProjetoResponse]:
        """
        Obtém um projeto específico do usuário.

        Args:
            id_grupo: ID do projeto.
            id_usuario: ID do usuário (para validar propriedade).

        Returns:
            Dados do projeto ou None se não encontrado.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            cursor.execute(
                """
                SELECT id_grupo, id_usuario, nome_grupo, descricao, data_criacao
                FROM projeto
                WHERE id_grupo = %s AND id_usuario = %s
                """,
                (id_grupo, id_usuario),
            )

            projeto = cursor.fetchone()

            if not projeto:
                return None

            return ProjetoResponse(
                id_grupo=projeto["id_grupo"],
                id_usuario=projeto["id_usuario"],
                nome_grupo=projeto["nome_grupo"],
                descricao=projeto["descricao"],
                data_criacao=str(projeto["data_criacao"]),
            )
        except Exception as e:
            raise Exception(f"Erro ao obter projeto: {str(e)}")
        finally:
            cursor.close()

    def atualizar_projeto(
        self, id_grupo: int, id_usuario: int, dados: ProjetoAtualizar
    ) -> Optional[ProjetoResponse]:
        """
        Atualiza um projeto do usuário.

        Args:
            id_grupo: ID do projeto.
            id_usuario: ID do usuário (para validar propriedade).
            dados: Dados para atualização.

        Returns:
            Dados do projeto atualizado ou None se não encontrado.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            # Monta a query dinamicamente apenas com campos fornecidos
            campos_atualizacao = []
            valores = []

            if dados.nome_grupo is not None:
                campos_atualizacao.append("nome_grupo = %s")
                valores.append(dados.nome_grupo)

            if dados.descricao is not None:
                campos_atualizacao.append("descricao = %s")
                valores.append(dados.descricao)

            if not campos_atualizacao:
                # Nenhum campo para atualizar
                return self.obter_projeto(id_grupo, id_usuario)

            valores.extend([id_grupo, id_usuario])

            query = f"""
                UPDATE projeto
                SET {', '.join(campos_atualizacao)}
                WHERE id_grupo = %s AND id_usuario = %s
                RETURNING id_grupo, id_usuario, nome_grupo, descricao, data_criacao
            """

            cursor.execute(query, valores)
            result = cursor.fetchone()
            conn.commit()

            if not result:
                return None

            return ProjetoResponse(
                id_grupo=result["id_grupo"],
                id_usuario=result["id_usuario"],
                nome_grupo=result["nome_grupo"],
                descricao=result["descricao"],
                data_criacao=str(result["data_criacao"]),
            )
        except Exception as e:
            conn.rollback()
            raise Exception(f"Erro ao atualizar projeto: {str(e)}")
        finally:
            cursor.close()

    def deletar_projeto(self, id_grupo: int, id_usuario: int) -> bool:
        """
        Deleta um projeto do usuário.

        Args:
            id_grupo: ID do projeto.
            id_usuario: ID do usuário (para validar propriedade).

        Returns:
            True se deletado, False se não encontrado.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(
                """
                DELETE FROM projeto
                WHERE id_grupo = %s AND id_usuario = %s
                """,
                (id_grupo, id_usuario),
            )

            conn.commit()
            return cursor.rowcount > 0
        except Exception as e:
            conn.rollback()
            raise Exception(f"Erro ao deletar projeto: {str(e)}")
        finally:
            cursor.close()

    def close(self):
        """
        Fecha a conexão com o banco de dados.
        """
        self.db.close()
