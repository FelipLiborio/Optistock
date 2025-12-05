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
