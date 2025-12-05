const API_BASE_URL = '/api';

/**
 * Serviço de projetos
 */
class ProjetoService {
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async listarProjetos() {
        const response = await fetch(`${API_BASE_URL}/projetos/`, {
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao listar projetos');
        }

        return data;
    }

    async criarProjeto(nome_grupo, descricao) {
        const response = await fetch(`${API_BASE_URL}/projetos/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ nome_grupo, descricao })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao criar projeto');
        }

        return data;
    }

    async obterProjeto(id_grupo) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_grupo}`, {
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao buscar projeto');
        }

        return data;
    }

    async atualizarProjeto(id_grupo, dados) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_grupo}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao atualizar projeto');
        }

        return data;
    }

    async deletarProjeto(id_grupo) {
        const response = await fetch(`${API_BASE_URL}/projetos/${id_grupo}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        if (response.status === 204) {
            return true;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao deletar projeto');
        }

        return true;
    }
}

export default new ProjetoService();
