from fastapi import APIRouter, HTTPException, status, Header
from models.simulacao import SimulacaoCriar, SimulacaoAtualizar, SimulacaoResponse
from services.simulacao import SimulacaoService
from services.projeto import ProjetoService
from utils.auth import token_manager
from typing import List

router = APIRouter(prefix="/projetos/{id_projeto}/simulacoes", tags=["Simulações"])

simulacao_service = SimulacaoService()
projeto_service = ProjetoService()


def validar_acesso_projeto(id_projeto: int, id_usuario: int):
    """
    Valida se o usuário tem acesso ao projeto.
    """
    projeto = projeto_service.obter_projeto(id_projeto, id_usuario)
    if not projeto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Projeto não encontrado ou você não tem acesso a ele",
        )


@router.post("/", response_model=SimulacaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_simulacao(
    id_projeto: int, simulacao: SimulacaoCriar, authorization: str = Header(None)
):
    """
    Cria uma nova simulação para o projeto.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        validar_acesso_projeto(id_projeto, id_usuario)

        return simulacao_service.criar_simulacao(simulacao, id_projeto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar simulação: {str(e)}",
        )


@router.get("/", response_model=List[SimulacaoResponse])
async def listar_simulacoes(id_projeto: int, authorization: str = Header(None)):
    """
    Lista todas as simulações do projeto.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        validar_acesso_projeto(id_projeto, id_usuario)

        return simulacao_service.listar_simulacoes_projeto(id_projeto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar simulações: {str(e)}",
        )


@router.get("/{id_simulacao}", response_model=SimulacaoResponse)
async def obter_simulacao(
    id_projeto: int, id_simulacao: int, authorization: str = Header(None)
):
    """
    Obtém uma simulação específica do projeto.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        validar_acesso_projeto(id_projeto, id_usuario)

        simulacao = simulacao_service.obter_simulacao(id_simulacao, id_projeto)

        if not simulacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return simulacao
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter simulação: {str(e)}",
        )


@router.put("/{id_simulacao}", response_model=SimulacaoResponse)
async def atualizar_simulacao(
    id_projeto: int,
    id_simulacao: int,
    dados: SimulacaoAtualizar,
    authorization: str = Header(None),
):
    """
    Atualiza uma simulação do projeto.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        validar_acesso_projeto(id_projeto, id_usuario)

        simulacao = simulacao_service.atualizar_simulacao(
            id_simulacao, id_projeto, dados
        )

        if not simulacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return simulacao
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar simulação: {str(e)}",
        )


@router.delete("/{id_simulacao}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_simulacao(
    id_projeto: int, id_simulacao: int, authorization: str = Header(None)
):
    """
    Deleta uma simulação do projeto.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token não fornecido"
        )

    token = authorization.replace("Bearer ", "")

    try:
        id_usuario = token_manager.validar_token(token)
        validar_acesso_projeto(id_projeto, id_usuario)

        deletado = simulacao_service.deletar_simulacao(id_simulacao, id_projeto)

        if not deletado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return None
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar simulação: {str(e)}",
        )
