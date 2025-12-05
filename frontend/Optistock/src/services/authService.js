import { apiClient } from './api';

const TOKEN_KEY = 'optistock_token';

/**
 * Serviço de autenticação
 */
export const authService = {
    /**
     * Faz login do usuário
     */
    async login(email, senha) {
        try {
            const response = await apiClient.post('/auth/login', { email, senha });
            if (response.token) {
                this.setToken(response.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Registra um novo usuário
     */
    async register(nome, email, senha) {
        try {
            const response = await apiClient.post('/auth/register', { nome, email, senha });
            if (response.token) {
                this.setToken(response.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Obtém dados do usuário pelo token
     */
    async getUserData(token) {
        try {
            return await apiClient.get(`/auth/usuario/${token}`);
        } catch (error) {
            // Token expirado ou inválido
            this.logout();
            throw error;
        }
    },

    /**
     * Armazena o token no localStorage
     */
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Obtém o token do localStorage
     */
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Remove o token e faz logout
     */
    logout() {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Valida o token verificando os dados do usuário
     */
    async validateToken() {
        const token = this.getToken();
        if (!token) return false;

        try {
            await this.getUserData(token);
            return true;
        } catch (error) {
            return false;
        }
    },
};
