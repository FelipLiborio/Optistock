from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, projeto, simulacao
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

# Cria a aplicação FastAPI
app = FastAPI(
    title="OptiStock API",
    description="API para otimização de estoque",
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True},
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
app.include_router(auth.router)
app.include_router(projeto.router)
app.include_router(simulacao.router)


@app.get("/")
async def root():
    """
    Endpoint raiz da API.
    """
    return {"mensagem": "API OptiStock - Sistema de Otimização de Estoque"}
