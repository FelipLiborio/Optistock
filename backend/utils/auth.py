import jwt
from datetime import datetime, timedelta
import os
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


class TokenManager:
    """
    Gerenciador de tokens JWT para autenticação.
    """

    def __init__(self):
        """
        Inicializa o gerenciador de tokens.
        """
        self.secret_key = os.getenv("JWT_SECRET_KEY", "sua-chave-secreta-padrao")
        self.algorithm = "HS256"
        self.expiration_hours = 24

    def criar_token(self, id_usuario: int) -> str:
        """
        Cria um token JWT com expiração.

        Args:
            id_usuario: ID do usuário.

        Returns:
            Token JWT.
        """
        payload = {
            "id": id_usuario,
            "exp": datetime.utcnow() + timedelta(hours=self.expiration_hours),
            "iat": datetime.utcnow(),
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)

    def validar_token(self, token: str) -> int:
        """
        Valida o token JWT e retorna o ID do usuário.

        Args:
            token: Token JWT.

        Returns:
            ID do usuário.

        Raises:
            ValueError: Se o token estiver expirado ou inválido.
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload["id"]
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expirado")
        except jwt.InvalidTokenError:
            raise ValueError("Token inválido")

    def obter_id_usuario(self, token: str) -> Optional[int]:
        """
        Obtém o ID do usuário do token sem lançar exceção.

        Args:
            token: Token JWT.

        Returns:
            ID do usuário ou None se o token for inválido.
        """
        try:
            return self.validar_token(token)
        except ValueError:
            return None


# Instância global para reutilização
token_manager = TokenManager()


def obter_usuario_atual(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> int:
    """
    Dependency para extrair e validar o token do header Authorization.

    Args:
        credentials: Credenciais HTTP Bearer extraídas automaticamente

    Returns:
        ID do usuário autenticado.

    Raises:
        HTTPException: Se o token for inválido ou não fornecido.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = credentials.credentials

    try:
        return token_manager.validar_token(token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
