from fastapi import APIRouter, HTTPException, status, Header
from models.projeto import (
    ProjetoCriar,
    ProjetoAtualizar,
    ProjetoResponse,
    ProjetoComSimulacoesResponse,
)
from services.projeto import ProjetoService
from services.simulacao import SimulacaoService
from utils.auth import token_manager
from typing import List

router = APIRouter(prefix="/projetos", tags=["Projetos"])

projeto_service = ProjetoService()
simulacao_service = SimulacaoService()


@router.post("/", response_model=ProjetoResponse, status_code=status.HTTP_201_CREATED)
async def criar_projeto(projeto: ProjetoCriar, authorization: str = Header(None)):
    """
    Cria um novo projeto para o usuário autenticado.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        return projeto_service.criar_projeto(projeto, id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar projeto: {str(e)}",
        )


@router.get("/", response_model=List[ProjetoResponse])
async def listar_projetos(authorization: str = Header(None)):
    """
    Lista todos os projetos do usuário autenticado.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        return projeto_service.listar_projetos_usuario(id_usuario)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar projetos: {str(e)}",
        )


@router.get("/{id_grupo}", response_model=ProjetoComSimulacoesResponse)
async def obter_projeto(id_grupo: int, authorization: str = Header(None)):
    """
    Obtém um projeto específico do usuário autenticado com suas simulações.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
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
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter projeto: {str(e)}",
        )


@router.put("/{id_grupo}", response_model=ProjetoResponse)
async def atualizar_projeto(
    id_grupo: int, dados: ProjetoAtualizar, authorization: str = Header(None)
):
    """
    Atualiza um projeto do usuário autenticado.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        projeto = projeto_service.atualizar_projeto(id_grupo, id_usuario, dados)

        if not projeto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado"
            )

        return projeto
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar projeto: {str(e)}",
        )


@router.delete("/{id_grupo}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_projeto(id_grupo: int, authorization: str = Header(None)):
    """
    Deleta um projeto do usuário autenticado.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        deletado = projeto_service.deletar_projeto(id_grupo, id_usuario)

        if not deletado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado"
            )

        return None
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar projeto: {str(e)}",
        )
