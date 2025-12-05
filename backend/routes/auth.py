from fastapi import APIRouter, HTTPException, status
from models.auth import (
    UsuarioRegistro,
    UsuarioLogin,
    TokenResponse,
    UsuarioResponse,
)
from services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticação"])

# Instancia o serviço de autenticação
auth_service = AuthService()


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def registrar(usuario: UsuarioRegistro):
    """
    Registra um novo usuário no sistema.

    Args:
        usuario: Dados do usuário (nome, email, senha).

    Returns:
        Token de autenticação (ID do usuário).
    """
    try:
        token = auth_service.registrar_usuario(usuario)
        return token
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar usuário: {str(e)}",
        )


@router.post("/login", response_model=TokenResponse)
async def login(credenciais: UsuarioLogin):
    """
    Realiza o login de um usuário.

    Args:
        credenciais: Email e senha do usuário.

    Returns:
        Token de autenticação (ID do usuário).
    """
    try:
        token = auth_service.fazer_login(credenciais)
        return token
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao fazer login: {str(e)}",
        )


@router.get("/usuario/{token}", response_model=UsuarioResponse)
async def obter_usuario(token: str):
    """
    Obtém os dados de um usuário pelo token.

    Args:
        token: Token de autenticação do usuário.

    Returns:
        Dados do usuário.
    """
    try:
        usuario = auth_service.obter_usuario_por_token(token)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
            )
        return usuario
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter usuário: {str(e)}",
        )
