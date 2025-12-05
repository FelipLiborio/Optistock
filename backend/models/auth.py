from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UsuarioRegistro(BaseModel):
    """
    Modelo para registro de novo usuário.
    """
    nome: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    senha: str = Field(..., min_length=6, max_length=200)


class UsuarioLogin(BaseModel):
    """
    Modelo para login de usuário.
    """
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    """
    Modelo para resposta com token de autenticação.
    """
    token: str
    mensagem: str


class UsuarioResponse(BaseModel):
    """
    Modelo para resposta com dados do usuário (sem senha).
    """
    id_usuario: int
    nome: str
    email: str
    data_criacao: str
