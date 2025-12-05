import os
import psycopg2
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class postgreConnection:
    """
    Classe responsável por gerenciar a conexão com o banco de dados PostgreSQL.
    As credenciais são obtidas das variáveis de ambiente.
    """

    def __init__(self):
        """
        Inicializa a classe com as credenciais do banco de dados
        obtidas das variáveis de ambiente.
        """
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self._connection: Optional[psycopg2.extensions.connection] = None

    def get_connection(self) -> psycopg2.extensions.connection:
        """
        Retorna um objeto de conexão com o banco de dados PostgreSQL.
        
        Returns:
            psycopg2.extensions.connection: Objeto de conexão ativo com o banco de dados.
            
        Raises:
            ValueError: Se as credenciais obrigatórias não estiverem configuradas.
            psycopg2.Error: Se houver erro ao conectar com o banco de dados.
        """
        # Validação das credenciais
        if not all([self.database, self.user, self.password]):
            raise ValueError(
                "Credenciais do banco de dados não configuradas. "
                "Defina DB_NAME, DB_USER e DB_PASSWORD nas variáveis de ambiente."
            )

        # Se já existe uma conexão ativa, retorna ela
        if self._connection and not self._connection.closed:
            return self._connection

        # Cria uma nova conexão
        try:
            self._connection = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password
            )
            return self._connection
        except psycopg2.Error as e:
            raise psycopg2.Error(f"Erro ao conectar ao banco de dados: {str(e)}")

    def close(self):
        """
        Fecha a conexão com o banco de dados, se estiver aberta.
        """
        if self._connection and not self._connection.closed:
            self._connection.close()
            self._connection = None
