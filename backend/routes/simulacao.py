from fastapi import APIRouter, HTTPException, status, Depends
from models.simulacao import (
    SimulacaoCriar,
    SimulacaoAtualizar,
    SimulacaoResponse,
    AnaliseMatematicaResponse,
    DadosGraficoResponse,
)
from services.simulacao import SimulacaoService
from services.projeto import ProjetoService
from utils.auth import obter_usuario_atual
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
    id_projeto: int, 
    simulacao: SimulacaoCriar, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Cria uma nova simulação para o projeto.
    """
    try:
        validar_acesso_projeto(id_projeto, id_usuario)
        return simulacao_service.criar_simulacao(simulacao, id_projeto)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar simulação: {str(e)}",
        )


@router.get(
    "/{id_simulacao}/analise-matematica", response_model=AnaliseMatematicaResponse
)
async def obter_analise_matematica(
    id_projeto: int, id_simulacao: int, id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Obtém análise matemática detalhada de uma simulação.
    Inclui derivadas, pontos críticos, verificação de otimalidade.
    """
    try:
        validar_acesso_projeto(id_projeto, id_usuario)
        analise = simulacao_service.gerar_analise_matematica_detalhada(
            id_simulacao, id_projeto
        )

        if not analise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return AnaliseMatematicaResponse(**analise)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar análise matemática: {str(e)}",
        )


@router.get("/{id_simulacao}/grafico", response_model=DadosGraficoResponse)
async def obter_dados_grafico(
    id_projeto: int,
    id_simulacao: int,
    q_min: float = 10,
    q_max: float = 200,
    pontos: int = 100,
    id_usuario: int = Depends(obter_usuario_atual),
):
    """
    Obtém dados para plotagem do gráfico de custo x lote.
    """
    try:
        validar_acesso_projeto(id_projeto, id_usuario)
        dados = simulacao_service.gerar_dados_grafico(
            id_simulacao, id_projeto, q_min, q_max, pontos
        )

        if not dados:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return DadosGraficoResponse(**dados)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao gerar dados do gráfico: {str(e)}",
        )


@router.get("/", response_model=List[SimulacaoResponse])
async def listar_simulacoes(
    id_projeto: int, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Lista todas as simulações do projeto.
    """
    try:
        validar_acesso_projeto(id_projeto, id_usuario)
        return simulacao_service.listar_simulacoes_projeto(id_projeto)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar simulações: {str(e)}",
        )


@router.get("/{id_simulacao}", response_model=SimulacaoResponse)
async def obter_simulacao(
    id_projeto: int, 
    id_simulacao: int, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Obtém uma simulação específica do projeto.
    """
    try:
        validar_acesso_projeto(id_projeto, id_usuario)
        simulacao = simulacao_service.obter_simulacao(id_simulacao, id_projeto)

        if not simulacao:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return simulacao
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
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Atualiza uma simulação do projeto.
    """
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar simulação: {str(e)}",
        )


@router.delete("/{id_simulacao}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_simulacao(
    id_projeto: int, 
    id_simulacao: int, 
    id_usuario: int = Depends(obter_usuario_atual)
):
    """
    Deleta uma simulação do projeto.
    """
    try:
        validar_acesso_projeto(id_projeto, id_usuario)
        deletado = simulacao_service.deletar_simulacao(id_simulacao, id_projeto)

        if not deletado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Simulação não encontrada",
            )

        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao deletar simulação: {str(e)}",
        )