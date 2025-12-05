const API_BASE_URL = '/api';

/**
 * Serviço de simulações
 */
class SimulacaoService {
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async listarSimulacoes(id_projeto) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_projeto}/simulacoes/`, {
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao listar simulações');
        }

        return data;
    }

    async criarSimulacao(id_projeto, dados) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_projeto}/simulacoes/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao criar simulação');
        }

        return data;
    }

    async obterSimulacao(id_projeto, id_simulacao) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_projeto}/simulacoes/${id_simulacao}`, {
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao buscar simulação');
        }

        return data;
    }

    async atualizarSimulacao(id_projeto, id_simulacao, dados) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_projeto}/simulacoes/${id_simulacao}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao atualizar simulação');
        }

        return data;
    }

    async deletarSimulacao(id_projeto, id_simulacao) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_projeto}/simulacoes/${id_simulacao}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (response.status === 204) {
            return true;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao deletar simulação');
        }

        return true;
    }

    async obterAnaliseMatematica(id_projeto, id_simulacao) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_projeto}/simulacoes/${id_simulacao}/analise-matematica`, {
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao obter análise matemática');
        }

        return data;
    }

    async obterDadosGrafico(id_projeto, id_simulacao, q_min = 10, q_max = 200, pontos = 100) {
        const response = await fetch(
            `${API_BASE_URL}/projetos/${id_projeto}/simulacoes/${id_simulacao}/grafico?q_min=${q_min}&q_max=${q_max}&pontos=${pontos}`,
            {
                headers: this.getAuthHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao obter dados do gráfico');
        }

        return data;
    }
}

export default new SimulacaoService();
