from fastapi import APIRouter, HTTPException, status, Depends
from models.projeto import (
    ProjetoCriar,
    ProjetoAtualizar,
    ProjetoResponse,
    ProjetoComSimulacoesResponse,
)
from services.projeto import ProjetoService
from services.simulacao import SimulacaoService
from utils.auth import obter_usuario_atual
from typing import List

router = APIRouter(prefix="/projetos", tags=["Projetos"])

projeto_service = ProjetoService()
simulacao_service = SimulacaoService()


@router.post("/", response_model=ProjetoResponse, status_code=status.HTTP_201_CREATED)
async def criar_projeto(
    projeto: ProjetoCriar, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Cria um novo projeto para o usuário autenticado.
    """
    try:
        return projeto_service.criar_projeto(projeto, id_usuario)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar projeto: {str(e)}",
        )


@router.get("/", response_model=List[ProjetoResponse])
async def listar_projetos(id_usuario: int = Depends(obter_usuario_atual)):
    """
    Lista todos os projetos do usuário autenticado.
    """
    try:
        return projeto_service.listar_projetos_usuario(id_usuario)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar projetos: {str(e)}",
        )


@router.get("/{id_grupo}", response_model=ProjetoComSimulacoesResponse)
async def obter_projeto(
    id_grupo: int, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Obtém um projeto específico do usuário autenticado com suas simulações.
    """
    try:
        projeto = projeto_service.obter_projeto(id_grupo, id_usuario)

        if not projeto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado"
            )

        # Busca as simulações do projeto
        simulacoes = simulacao_service.listar_simulacoes_projeto(id_grupo)

        # Retorna projeto com simulações
        return ProjetoComSimulacoesResponse(
            id_grupo=projeto.id_grupo,
            id_usuario=projeto.id_usuario,
            nome_grupo=projeto.nome_grupo,
            descricao=projeto.descricao,
            data_criacao=projeto.data_criacao,
            simulacoes=simulacoes,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter projeto: {str(e)}",
        )


@router.put("/{id_grupo}", response_model=ProjetoResponse)
async def atualizar_projeto(
    id_grupo: int, 
    dados: ProjetoAtualizar, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Atualiza um projeto do usuário autenticado.
    """
    try:
        projeto = projeto_service.atualizar_projeto(id_grupo, id_usuario, dados)

        if not projeto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado"
            )

        return projeto
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar projeto: {str(e)}",
        )


@router.delete("/{id_grupo}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_projeto(
    id_grupo: int, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Deleta um projeto do usuário autenticado.
    """
    try:
        deletado = projeto_service.deletar_projeto(id_grupo, id_usuario)

        if not deletado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado"
            )

        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar projeto: {str(e)}",
        )