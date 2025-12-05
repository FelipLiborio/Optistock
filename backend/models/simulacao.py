from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class SimulacaoBase(BaseModel):
    """
    Modelo base para simulação.
    """

    nome_produto: str = Field(..., min_length=1, max_length=255)
    demanda_anual: float = Field(..., gt=0)
    custo_pedido: float = Field(..., gt=0)
    custo_manutencao: float = Field(..., gt=0)
    lote_atual_empresa: Optional[float] = Field(None, gt=0)


class SimulacaoCriar(SimulacaoBase):
    """
    Modelo para criar uma simulação.
    """

    pass


class SimulacaoResponse(SimulacaoBase):
    """
    Modelo de resposta para simulação.
    """

    id: int
    id_projeto: int
    lote_otimo_calculado: float
    custo_total_atual: Optional[float]
    custo_total_otimo: float
    economia_anual: Optional[float]
    data_simulacao: datetime

    class Config:
        from_attributes = True


class SimulacaoAtualizar(BaseModel):
    """
    Modelo para atualizar uma simulação.
    """

    nome_produto: Optional[str] = Field(None, min_length=1, max_length=255)
    demanda_anual: Optional[float] = Field(None, gt=0)
    custo_pedido: Optional[float] = Field(None, gt=0)
    custo_manutencao: Optional[float] = Field(None, gt=0)
    lote_atual_empresa: Optional[float] = Field(None, gt=0)


class AnaliseMatematicaResponse(BaseModel):
    """
    Modelo de resposta para análise matemática detalhada.
    Inclui informações sobre derivadas, otimização e verificação.
    """

    lote_otimo_calculado: float
    custo_total_otimo: float
    funcao_custo: str
    derivada: str
    pontos_criticos: List[float]
    lote_atual_empresa: Optional[float]
    custo_total_atual: Optional[float]
    economia_anual: Optional[float]
    percentual_economia: Optional[float]
    verificacao_otimalidade: Dict[str, Any]
    parametros: Dict[str, float]

    class Config:
        from_attributes = True


class DadosGraficoResponse(BaseModel):
    """
    Modelo de resposta para dados de gráfico.
    """

    valores_lote: List[float]
    valores_custo: List[float]
    ponto_otimo: Dict[str, float]
    ponto_atual: Optional[Dict[str, float]]

    class Config:
        from_attributes = True
