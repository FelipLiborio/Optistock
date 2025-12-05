import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import './Report.css';

const Report = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [simulacoes, setSimulacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    economiaTotal: 0,
    custoAtualTotal: 0,
    custoOtimoTotal: 0,
    percentualEconomia: 0
  });

  useEffect(() => {
    loadReportData();
  }, [id]);

  const loadReportData = async () => {
    try {
      const projectData = await apiClient.get(`/projetos/${id}`);
      setProject(projectData);
      setSimulacoes(projectData.simulacoes || []);

      // Calcular estatísticas
      const sims = projectData.simulacoes || [];
      const economiaTotal = sims.reduce((sum, s) => sum + (s.economia_anual || 0), 0);
      const custoAtualTotal = sims.reduce((sum, s) => sum + (s.custo_total_atual || 0), 0);
      const custoOtimoTotal = sims.reduce((sum, s) => sum + (s.custo_total_otimo || 0), 0);
      const percentualEconomia = custoAtualTotal > 0 
        ? ((economiaTotal / custoAtualTotal) * 100).toFixed(1)
        : 0;

      setStats({
        economiaTotal,
        custoAtualTotal,
        custoOtimoTotal,
        percentualEconomia
      });
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      alert('Erro ao carregar relatório.');
      navigate(`/projeto/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTop5Produtos = () => {
    return [...simulacoes]
      .filter(s => s.economia_anual)
      .sort((a, b) => b.economia_anual - a.economia_anual)
      .slice(0, 5);
  };

  const handleExportPDF = () => {
    // Simples print do navegador - em produção usar biblioteca como jsPDF
    window.print();
  };

  if (loading) {
    return (
      <div className="report-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando relatório...</p>
        </div>
      </div>
    );
  }

  const top5 = getTop5Produtos();

  return (
    <div className="report-container">
      <div className="report-header no-print">
        <button className="btn-back" onClick={() => navigate(`/projeto/${id}`)}>
          ← Voltar
        </button>
        <h1>📊 Relatório de Economia</h1>
        <button className="btn-export" onClick={handleExportPDF}>
          📄 Exportar PDF
        </button>
      </div>

      <div className="report-content">
        {/* Cabeçalho do Projeto */}
        <div className="report-title">
          <h2>{project?.nome_grupo}</h2>
          <p className="report-subtitle">{project?.descricao}</p>
          <p className="report-date">
            Relatório gerado em {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="stats-grid">
          <div className="stat-card stat-economia">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Economia Total Anual</h3>
              <p className="stat-value">{formatCurrency(stats.economiaTotal)}</p>
              <span className="stat-badge positive">{stats.percentualEconomia}% de redução</span>
            </div>
          </div>

          <div className="stat-card stat-atual">
            <div className="stat-icon">📉</div>
            <div className="stat-content">
              <h3>Custo Atual Total</h3>
              <p className="stat-value">{formatCurrency(stats.custoAtualTotal)}</p>
              <span className="stat-label">Sem otimização</span>
            </div>
          </div>

          <div className="stat-card stat-otimo">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Custo Ótimo Total</h3>
              <p className="stat-value">{formatCurrency(stats.custoOtimoTotal)}</p>
              <span className="stat-label">Com Lote Econômico</span>
            </div>
          </div>

          <div className="stat-card stat-simulacoes">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total de Produtos</h3>
              <p className="stat-value">{simulacoes.length}</p>
              <span className="stat-label">Produtos analisados</span>
            </div>
          </div>
        </div>

        {/* Gráfico Comparativo */}
        {stats.custoAtualTotal > 0 && (
          <div className="comparison-chart">
            <h3>📊 Comparação de Custos</h3>
            <div className="chart-bars">
              <div className="chart-bar-group">
                <div className="chart-label">Custo Atual</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar bar-atual"
                    style={{ width: '100%' }}
                  >
                    <span className="bar-value">{formatCurrency(stats.custoAtualTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="chart-bar-group">
                <div className="chart-label">Custo Ótimo</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar bar-otimo"
                    style={{ width: `${(stats.custoOtimoTotal / stats.custoAtualTotal) * 100}%` }}
                  >
                    <span className="bar-value">{formatCurrency(stats.custoOtimoTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chart-savings">
              <span className="savings-label">Economia:</span>
              <span className="savings-value">{formatCurrency(stats.economiaTotal)}</span>
            </div>
          </div>
        )}

        {/* Top 5 Produtos */}
        {top5.length > 0 && (
          <div className="top-products">
            <h3>🏆 Top 5 Produtos com Maior Economia</h3>
            <div className="ranking-list">
              {top5.map((sim, index) => (
                <div key={sim.id} className="ranking-item">
                  <div className="ranking-position">{index + 1}º</div>
                  <div className="ranking-info">
                    <h4>{sim.nome_produto}</h4>
                    <div className="ranking-details">
                      <span>Lote Ótimo: {Math.round(sim.lote_otimo_calculado)} unidades</span>
                      <span className="separator">•</span>
                      <span>Demanda: {sim.demanda_anual.toLocaleString('pt-BR')} un/ano</span>
                    </div>
                  </div>
                  <div className="ranking-economy">
                    {formatCurrency(sim.economia_anual)}
                    <span className="economy-percent">
                      {((sim.economia_anual / sim.custo_total_atual) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela Completa */}
        {simulacoes.length > 0 && (
          <div className="full-table">
            <h3>📋 Detalhamento Completo</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Demanda Anual</th>
                  <th>Lote Atual</th>
                  <th>Lote Ótimo (LEC)</th>
                  <th>Custo Atual</th>
                  <th>Custo Ótimo</th>
                  <th>Economia</th>
                </tr>
              </thead>
              <tbody>
                {simulacoes.map((sim) => (
                  <tr key={sim.id}>
                    <td className="product-name">{sim.nome_produto}</td>
                    <td>{sim.demanda_anual.toLocaleString('pt-BR')}</td>
                    <td>{sim.lote_atual_empresa ? Math.round(sim.lote_atual_empresa) : '-'}</td>
                    <td className="highlight">{Math.round(sim.lote_otimo_calculado)}</td>
                    <td>{sim.custo_total_atual ? formatCurrency(sim.custo_total_atual) : '-'}</td>
                    <td>{formatCurrency(sim.custo_total_otimo)}</td>
                    <td className={sim.economia_anual > 0 ? 'positive' : ''}>
                      {sim.economia_anual ? formatCurrency(sim.economia_anual) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {simulacoes.length === 0 && (
          <div className="no-data">
            <p>Nenhuma simulação encontrada para gerar relatório.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate(`/projeto/${id}/nova-simulacao`)}
            >
              Criar Primeira Simulação
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
