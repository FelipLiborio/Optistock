from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

# Cria a aplicação FastAPI
app = FastAPI(
    title="OptiStock API", description="API para otimização de estoque", version="1.0.0"
)


# Registra as rotas
app.include_router(auth.router)


@app.get("/")
async def root():
    """
    Endpoint raiz da API.
    """
    return {"mensagem": "API OptiStock - Sistema de Otimização de Estoque"}
