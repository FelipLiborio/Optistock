from Connections.postgre import postgreConnection
from models.auth import UsuarioRegistro, UsuarioLogin, TokenResponse, UsuarioResponse
from utils.auth import TokenManager
import hashlib
import psycopg2.extras
from typing import Optional


class AuthService:
    """
    Serviço de autenticação de usuários.
    """

    def __init__(self):
        """
        Inicializa o serviço de autenticação.
        """
        self.db = postgreConnection()
        self.token_manager = TokenManager()

    def _hash_senha(self, senha: str) -> str:
        """
        Gera hash SHA256 da senha.

        Args:
            senha: Senha em texto plano.

        Returns:
            Hash da senha.
        """
        return hashlib.sha256(senha.encode()).hexdigest()

    def registrar_usuario(self, usuario: UsuarioRegistro) -> TokenResponse:
        """
        Registra um novo usuário no banco de dados.

        Args:
            usuario: Dados do usuário para registro.

        Returns:
            TokenResponse com o ID do usuário como token.

        Raises:
            ValueError: Se o email já estiver cadastrado.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            # Verifica se o email já existe
            cursor.execute(
                "SELECT id_usuario FROM usuarios WHERE email = %s", (usuario.email,)
            )
            if cursor.fetchone():
                raise ValueError("Email já cadastrado")

            # Hash da senha
            senha_hash = self._hash_senha(usuario.senha)

            # Insere o novo usuário
            cursor.execute(
                """
                INSERT INTO usuarios (nome, email, senha)
                VALUES (%s, %s, %s)
                RETURNING id_usuario
                """,
                (usuario.nome, usuario.email, senha_hash),
            )

            result = cursor.fetchone()
            conn.commit()

            token = self.token_manager.criar_token(result["id_usuario"])

            return TokenResponse(token=token, mensagem="Usuário registrado com sucesso")
        except ValueError:
            raise
        except Exception as e:
            conn.rollback()
            raise Exception(f"Erro ao registrar usuário: {str(e)}")
        finally:
            cursor.close()

    def fazer_login(self, credenciais: UsuarioLogin) -> TokenResponse:
        """
        Autentica um usuário e retorna o token (ID do usuário).

        Args:
            credenciais: Email e senha do usuário.

        Returns:
            TokenResponse com o ID do usuário como token.

        Raises:
            ValueError: Se as credenciais forem inválidas.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            # Hash da senha fornecida
            senha_hash = self._hash_senha(credenciais.senha)

            # Busca o usuário
            cursor.execute(
                """
                SELECT id_usuario, nome, email
                FROM usuarios
                WHERE email = %s AND senha = %s
                """,
                (credenciais.email, senha_hash),
            )

            usuario = cursor.fetchone()

            if not usuario:
                raise ValueError("Email ou senha inválidos")

            token = self.token_manager.criar_token(usuario["id_usuario"])

            return TokenResponse(token=token, mensagem="Login realizado com sucesso")
        except ValueError:
            raise
        except Exception as e:
            raise Exception(f"Erro ao fazer login: {str(e)}")
        finally:
            cursor.close()

    def obter_usuario_por_token(self, token: str) -> Optional[UsuarioResponse]:
        """
        Obtém os dados de um usuário pelo token.

        Args:
            token: Token criptografado do usuário.

        Returns:
            Dados do usuário ou None se não encontrado.
        """
        conn = self.db.get_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            # Valida o token e obtém o ID
            id_usuario = self.token_manager.validar_token(token)

            cursor.execute(
                """
                SELECT id_usuario, nome, email, data_criacao
                FROM usuarios
                WHERE id_usuario = %s
                """,
                (id_usuario,),
            )

            usuario = cursor.fetchone()

            if not usuario:
                return None

            return UsuarioResponse(
                id_usuario=usuario["id_usuario"],
                nome=usuario["nome"],
                email=usuario["email"],
                data_criacao=str(usuario["data_criacao"]),
            )
        except Exception as e:
            raise Exception(f"Erro ao obter usuário: {str(e)}")
        finally:
            cursor.close()

    def close(self):
        """
        Fecha a conexão com o banco de dados.
        """
        self.db.close()
