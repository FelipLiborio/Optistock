import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        <header className="about-header">
          <h1>Sobre o Lote Econômico de Compra</h1>
          <p className="about-intro">Entenda como otimizamos seu estoque com base em cálculos científicos</p>
        </header>

        <div className="about-content">
          <section className="about-section">
            <div className="section-icon">🎯</div>
            <h2>O que é o OptiStock?</h2>
            <p>
              O OptiStock é uma ferramenta desenvolvida para auxiliar empresas na gestão eficiente de seus estoques,
              utilizando o método do <strong>Lote Econômico de Compra (LEC)</strong>, também conhecido como
              Fórmula de Wilson.
            </p>
            <p>
              Nossa plataforma permite que você calcule a quantidade ideal de itens a serem comprados, minimizando
              custos com armazenamento e pedidos, ao mesmo tempo que garante o atendimento da demanda.
            </p>
          </section>

          <section className="about-section highlight">
            <div className="section-icon">📊</div>
            <h2>Como funciona o LEC?</h2>
            <p>
              O Lote Econômico de Compra é calculado através da <strong>Fórmula de Wilson</strong>:
            </p>
            <div className="formula-box">
              <div className="formula">
                LEC = √(2 × D × S / H)
              </div>
              <div className="formula-legend">
                <div className="legend-item">
                  <span className="legend-var">D</span> = Demanda anual (unidades/ano)
                </div>
                <div className="legend-item">
                  <span className="legend-var">S</span> = Custo por pedido (R$)
                </div>
                <div className="legend-item">
                  <span className="legend-var">H</span> = Custo de manutenção (R$/unidade/ano)
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-icon">💡</div>
            <h2>Benefícios da Otimização</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <span className="benefit-icon">💰</span>
                <h3>Redução de Custos</h3>
                <p>Minimize gastos com armazenamento e pedidos desnecessários</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">📈</span>
                <h3>Eficiência</h3>
                <p>Encontre o ponto de equilíbrio ideal entre estoque e demanda</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">⚡</span>
                <h3>Agilidade</h3>
                <p>Tome decisões baseadas em dados concretos e cálculos precisos</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🎯</span>
                <h3>Precisão</h3>
                <p>Evite rupturas de estoque e excesso de produtos parados</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-icon">🔢</div>
            <h2>Nossa Metodologia</h2>
            <div className="methodology-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Coleta de Dados</h3>
                  <p>Você fornece informações sobre demanda, custos de pedido e manutenção</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Cálculo do LEC</h3>
                  <p>Aplicamos a Fórmula de Wilson para determinar o lote ideal</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Análise de Custos</h3>
                  <p>Calculamos custos totais e comparamos com seu cenário atual</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Relatórios</h3>
                  <p>Geramos visualizações e relatórios detalhados para tomada de decisão</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-icon">🛠️</div>
            <h2>Tecnologias Utilizadas</h2>
            <p>
              O OptiStock foi desenvolvido com as mais modernas tecnologias para garantir
              performance, segurança e escalabilidade:
            </p>
            <div className="tech-grid">
              <div className="tech-category">
                <h3>Frontend</h3>
                <div className="tech-items">
                  <div className="tech-item">
                    <span className="tech-icon">⚛️</span>
                    <span className="tech-name">React 19.2</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🎨</span>
                    <span className="tech-name">Material-UI</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">📊</span>
                    <span className="tech-name">Recharts</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🚀</span>
                    <span className="tech-name">Vite</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🔀</span>
                    <span className="tech-name">React Router</span>
                  </div>
                </div>
              </div>
              <div className="tech-category">
                <h3>Backend</h3>
                <div className="tech-items">
                  <div className="tech-item">
                    <span className="tech-icon">🐍</span>
                    <span className="tech-name">Python</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">⚡</span>
                    <span className="tech-name">FastAPI</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🐘</span>
                    <span className="tech-name">PostgreSQL</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🔢</span>
                    <span className="tech-name">NumPy</span>
                  </div>
                  <div className="tech-item">
                    <span className="tech-icon">🔐</span>
                    <span className="tech-name">JWT Auth</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-icon">📚</div>
            <h2>Funcionalidades Principais</h2>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div className="feature-content">
                  <h3>Gerenciamento de Projetos</h3>
                  <p>Crie e organize múltiplos projetos de otimização de estoque</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div className="feature-content">
                  <h3>Simulações Avançadas</h3>
                  <p>Execute simulações com diferentes parâmetros e compare resultados</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div className="feature-content">
                  <h3>Relatórios Visuais</h3>
                  <p>Visualize gráficos interativos de custos e análises comparativas</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div className="feature-content">
                  <h3>Cálculo do Lote Econômico</h3>
                  <p>Determine automaticamente a quantidade ideal de compra usando a Fórmula de Wilson</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div className="feature-content">
                  <h3>Análise de Custos</h3>
                  <p>Calcule custos de pedido, manutenção e custo total anual</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-check">✓</span>
                <div className="feature-content">
                  <h3>Autenticação Segura</h3>
                  <p>Sistema completo de login e registro com proteção de dados</p>
                </div>
              </div>
            </div>
          </section>

          <section className="about-section">
            <div className="section-icon">🎓</div>
            <h2>Sobre o Projeto</h2>
            <p>
              O OptiStock foi desenvolvido como uma solução completa para gestão e otimização de estoques,
              integrando conceitos de logística, pesquisa operacional e desenvolvimento web moderno.
            </p>
            <p>
              Este projeto demonstra a aplicação prática de algoritmos de otimização em um contexto
              empresarial real, oferecendo uma interface intuitiva e funcional para tomada de decisões
              estratégicas baseadas em dados.
            </p>
            <div className="project-stats">
              <div className="stat-card">
                <div className="stat-value">100%</div>
                <div className="stat-label">Open Source</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">API REST</div>
                <div className="stat-label">Arquitetura</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">React</div>
                <div className="stat-label">Interface Moderna</div>
              </div>
            </div>
          </section>

          <section className="about-section cta-section">
            <div className="section-icon">🚀</div>
            <h2>Pronto para otimizar?</h2>
            <p>
              Comece agora mesmo criando seus projetos e descubra quanto você pode economizar
              com a gestão inteligente de estoque!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
