const API_BASE_URL = '/api';

/**
 * Serviço de autenticação
 */
class AuthService {
    async login(email, senha) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao fazer login');
        }

        return data;
    }

    async register(email, senha) {
        const response = await fetch(`${API_BASE_URL}/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao registrar');
        }

        return data;
    }

    async getUserData() {
        const token = this.getToken();
        if (!token) {
            throw new Error('Token não encontrado');
        }

        const response = await fetch(`${API_BASE_URL}/auth/usuario/${token}`);

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Erro ao buscar dados do usuário');
        }

        return data;
    }

    getUserDataFromToken(token) {
        try {
            // Decodifica o JWT (parte do payload)
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));

            return {
                id: decodedPayload.id,
                email: decodedPayload.email,
                exp: decodedPayload.exp
            };
        } catch (error) {
            console.error('Erro ao decodificar token:', error);
            return null;
        }
    }

    isTokenExpired(token) {
        const userData = this.getUserDataFromToken(token);
        if (!userData || !userData.exp) return true;

        // exp está em segundos, Date.now() em milissegundos
        return Date.now() >= userData.exp * 1000;
    }

    setToken(token) {
        localStorage.setItem('token', token);
    }

    getToken() {
        return localStorage.getItem('token');
    }

    removeToken() {
        localStorage.removeItem('token');
    }

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Verifica se o token está expirado
        if (this.isTokenExpired(token)) {
            this.removeToken();
            return false;
        }

        return true;
    }
}

export default new AuthService();
