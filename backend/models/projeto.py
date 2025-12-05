from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProjetoCriar(BaseModel):
    """
    Modelo para criar um novo projeto.
    """

    nome_grupo: str = Field(..., min_length=1, max_length=120)
    descricao: Optional[str] = None


class ProjetoAtualizar(BaseModel):
    """
    Modelo para atualizar um projeto existente.
    """

    nome_grupo: Optional[str] = Field(None, min_length=1, max_length=120)
    descricao: Optional[str] = None


class ProjetoResponse(BaseModel):
    """
    Modelo para resposta com dados do projeto.
    """

    id_grupo: int
    id_usuario: int
    nome_grupo: str
    descricao: Optional[str]
    data_criacao: str


class ProjetoComSimulacoesResponse(BaseModel):
    """
    Modelo para resposta com dados do projeto incluindo simulações.
    """

    id_grupo: int
    id_usuario: int
    nome_grupo: str
    descricao: Optional[str]
    data_criacao: str
    simulacoes: List = []

    class Config:
        from_attributes = True
