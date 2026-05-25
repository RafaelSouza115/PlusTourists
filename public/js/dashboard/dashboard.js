var nome_funcionario = document.getElementById('nome_funcionario');
var graficoTuristasEventos = null;
var graficoChegadas = null;

if (sessionStorage.NOME_FUNCIONARIO) {
  nome_funcionario.innerHTML = 'Olá, ' + sessionStorage.NOME_FUNCIONARIO + '!';
}

async function selectsFiltros() {
  try {
    const response = await fetch(`/dashboard/selects-ano-estado`);

    if (!response.ok) {
      throw new Error(`Falha em buscar dados dos filtros: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados do dashboard:', data);
    const selectEstado = document.querySelector('#filtroEstado');
    const selectAno = document.querySelector('#filtroAno');
    const estadosUnicos = [...new Set(data.map((item) => item.nome_estado).filter(Boolean))];
    const anosUnicos = [...new Set(data.map((item) => String(item.ano)).filter(Boolean))].sort();

    selectEstado.innerHTML = `<option value="">Selecione o estado</option>`;
    selectAno.innerHTML = `<option value="">Selecione o ano</option>`;

    estadosUnicos.forEach((nomeEstado) => {
      selectEstado.innerHTML += `
        <option value="${nomeEstado}">
          ${nomeEstado}
        </option>
      `;
    });

    anosUnicos.forEach((ano) => {
      selectAno.innerHTML += `
        <option value="${ano}">
          ${ano}
        </option>
      `;
    });

    if (anosUnicos.includes('2025')) {
      selectAno.value = '2025';
    }

    if (estadosUnicos.includes('São Paulo')) {
      selectEstado.value = 'São Paulo';
    }
  } catch (error) {
    console.error('Erro ao obter dados dos filtros:', error);
  }
}

function obterFiltrosAtuais() {
  const selectAno = document.getElementById('filtroAno');
  const selectEstado = document.getElementById('filtroEstado');

  return {
    ano: selectAno.value || '2025',
    nomeEstado: selectEstado.value || 'São Paulo',
  };
}

async function plotarMaiorPaisEmissor(ano, nomeEstado) {
  console.log('Plotando KPIs...');
  const maiorPaisEmissor = document.getElementById('MaiorPaisEmissor');
  const percentualMaiorPaisEmissor = document.getElementById('PercentualMaiorPaisEmissor');
  const destinoMenosVisitado = document.getElementById('DestinoMenosVisitado');

  try {
    const response = await fetch(
      `/dashboard/dados-kpi-turistas?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );

    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }

    const data = await response.json();
    console.log('Dados da KPI maior país emissor:', data);

    maiorPaisEmissor.innerHTML = data.maiorPaisEmissor || 'Sem dados';
    percentualMaiorPaisEmissor.innerHTML = `${data.percentualMaiorPaisEmissor || 0}%`;
    destinoMenosVisitado.innerHTML = data.destinoMenosVisitado || 'Sem dados';
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    maiorPaisEmissor.innerHTML = 'Erro';
    percentualMaiorPaisEmissor.innerHTML = '--';
    destinoMenosVisitado.innerHTML = 'Erro ao carregar';
  }
}

async function plotarMesesMenosTuristas(ano, nomeEstado) {
  try {
    const response = await fetch(
      `/dashboard/meses-menos-turistas?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );
    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }
    const data = await response.json();
    console.log('Dados dos meses com menos turistas:', data);
    const mesesMenor = document.getElementById('mesesMenor');
    mesesMenor.innerHTML =
      `${data.mes_menos_1}, ${data.mes_menos_2} e ${data.mes_menos_3}` || 'Sem dados';
  } catch (error) {
    console.error('Erro ao obter dados dos meses com menos turistas:', error);
    const mesesMenor = document.getElementById('mesesMenor');
    mesesMenor.innerHTML = 'Erro ao carregar';
  }
}

async function plotarMesTopComEvento(ano, nomeEstado) {
  try {
    const response = await fetch(
      `/dashboard/mes-top-com-evento?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );
    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }
    const data = await response.json();
    console.log('Dados do mês com mais turistas e evento:', data);
    const mesTopEvento = document.querySelector('#mesTopEvento');
    const nomeEvento = document.querySelector('#nomeEvento');
    mesTopEvento.innerHTML = data.mes_mais_visitado || 'Sem dados';
    nomeEvento.innerHTML = data.evento_maior_publico || 'Sem dados';
  } catch (error) {
    console.error('Erro ao obter dados do mês com mais turistas e evento:', error);
    const mesTopEvento = document.querySelector('#mesTopEvento');
    const nomeEvento = document.querySelector('#nomeEvento');
    mesTopEvento.innerHTML = 'Erro ao carregar';
    nomeEvento.innerHTML = 'Erro ao carregar';
  }
}

async function plotarPrincipalViaAcesso(ano, nomeEstado) {
  try {
    const response = await fetch(
      `/dashboard/principal-via-acesso?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );
    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }
    const data = await response.json();
    console.log('Dados da principal via de acesso:', data);
    const principalViaAcesso = document.querySelector('#principalViaAcesso');

    if (!data.principal_via_acesso) {
      principalViaAcesso.innerHTML = 'Sem dados';
    } else {
      principalViaAcesso.innerHTML = `${data.principal_via_acesso} ${data.percentual_via_acesso || 0}%`;
    }
  } catch (error) {
    console.error('Erro ao obter dados da principal via de acesso:', error);
    const principalViaAcesso = document.querySelector('#principalViaAcesso');

    principalViaAcesso.innerHTML = 'Erro ao carregar';
  }
}

async function plotarEventosTuristasPorMes(ano, nomeEstado) {
  try {
    const response = await fetch(
      `/dashboard/eventos-turistas-por-mes?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );

    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }

    const dados = await response.json();
    const nomesMes = dados.map((item) => item.nome_mes);
    const totalEventos = dados.map((item) => item.total_eventos);
    const totalTuristas = dados.map((item) => item.total_turistas);

    console.log(nomesMes);
    console.log(totalEventos);
    console.log(totalTuristas);

    const ctx = document.getElementById('idTuristasEventos');

    if (graficoTuristasEventos) {
      graficoTuristasEventos.destroy();
    }

    graficoTuristasEventos = new Chart(ctx, {
      data: {
        labels: nomesMes,
        datasets: [
          {
            type: 'line',
            label: 'Número de Eventos',
            data: totalEventos,
            borderColor: '#2563eb',
            backgroundColor: 'transparent',
            pointBackgroundColor: '#2563eb',
            pointRadius: 4,
            tension: 0.3,
            yAxisID: 'y1',
          },
          {
            type: 'bar',
            label: 'Número de Turistas',
            data: totalTuristas,
            backgroundColor: '#16a34a',
            borderRadius: 4,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false } },
        scales: {
          y: {
            type: 'linear',
            position: 'left',
            ticks: { color: '#888', font: { size: 10 } },
            grid: { color: '#f0f0f0' },
          },
          y1: {
            type: 'linear',
            position: 'right',
            ticks: { color: '#2563eb', font: { size: 10 } },
            grid: { drawOnChartArea: false },
          },
          x: {
            ticks: { color: '#888', font: { size: 10 } },
            grid: { display: false },
          },
        },
      },
    });
  } catch (error) {
    console.error('Erro ao obter dados do gráfico de eventos e turistas:', error);
  }
}

async function plotarTuristasPorViaAcesso(ano, nomeEstado) {
  try {
    const response = await fetch(
      `/dashboard/turistas-por-via-acesso?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );

    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }

    const dados = await response.json();

    console.log(dados);

    const ctx2 = document.getElementById('idChegadas');

    if (graficoChegadas) {
      graficoChegadas.destroy();
    }

    graficoChegadas = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Via Aérea', 'Via Terrestre', 'Via Marítima', 'Via Fluvial'],
        datasets: [
          {
            data: [
              dados.percentual_aerea,
              dados.percentual_terrestre,
              dados.percentual_maritima,
              dados.percentual_fluvial,
            ],
            backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#9333ea'],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: false,
        cutout: '68%',
        plugins: { legend: { display: false } },
      },
    });

    const totalVias = document.getElementById('totalVias');
    const percentualArea = document.getElementById('percentualArea');
    const percentualTerrestre = document.getElementById('percentualTerrestre');
    const percentualMaritima = document.getElementById('percentualMaritima');
    const percentualFluvial = document.getElementById('percentualFluvial');
    const totalArea = document.getElementById('totalArea');
    const totalTerrestre = document.getElementById('totalTerrestre');
    const totalMaritima = document.getElementById('totalMaritima');
    const totalFluvial = document.getElementById('totalFluvial');

    totalVias.innerHTML = `${dados.total_geral}`;
    percentualArea.innerHTML = `${dados.percentual_aerea}%`;
    percentualTerrestre.innerHTML = `${dados.percentual_terrestre}%`;
    percentualMaritima.innerHTML = `${dados.percentual_maritima}%`;
    percentualFluvial.innerHTML = `${dados.percentual_fluvial}%`;
    totalArea.innerHTML = `(${dados.total_aerea})`;
    totalTerrestre.innerHTML = `(${dados.total_terrestre})`;
    totalMaritima.innerHTML = `(${dados.total_maritima})`;
    totalFluvial.innerHTML = `(${dados.total_fluvial})`;
  } catch (error) {
    console.error('Erro ao obter dados de turistas por via de acesso:', error);
  }
}

async function top5PaisesCompleto(ano, nomeEstado) {
  try {
    const response = await fetch(
      `/dashboard/top5-paises-completo?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
    );

    if (!response.ok) {
      throw new Error(`Falha na requisição: ${response.status}`);
    }

    const dados = await response.json();
    console.log(dados);

    const campos = [
      ['primeiro', 0],
      ['segundo', 1],
      ['terceiro', 2],
      ['quarto', 3],
      ['quinto', 4],
    ];

    campos.forEach(([prefixo, indice]) => {
      const base = prefixo.charAt(0).toUpperCase() + prefixo.slice(1);
      const dado = dados[indice];

      document.getElementById(`${prefixo}Pais`).innerHTML = dado?.pais || 'Sem dados';
      document.getElementById(`percentual${base}Pais`).innerHTML = dado
        ? `${dado.participacao_percentual}%`
        : 'Sem dados';
      document.getElementById(`estadosMaisVisitados${base}`).innerHTML = dado
        ? `${dado.estado_mais_1}, ${dado.estado_mais_2} e ${dado.estado_mais_3}`
        : 'Sem dados';
      document.getElementById(`estadosMenosVisitados${base}`).innerHTML = dado
        ? `${dado.estado_menos_1}, ${dado.estado_menos_2} e ${dado.estado_menos_3}`
        : 'Sem dados';
      document.getElementById(`mesMaisVisitado${base}`).innerHTML = dado?.mes_mais_visita || 'Sem dados';
      document.getElementById(`mesMenosVisitado${base}`).innerHTML = dado?.mes_menos_visita || 'Sem dados';
    });
  } catch (error) {
    console.error('Erro ao obter dados do top 5 de países:', error);
  }
}

async function plotarDados() {
  const { ano, nomeEstado } = obterFiltrosAtuais();

  plotarMaiorPaisEmissor(ano, nomeEstado);
  plotarMesesMenosTuristas(ano, nomeEstado);
  plotarMesTopComEvento(ano, nomeEstado);
  plotarPrincipalViaAcesso(ano, nomeEstado);
  plotarEventosTuristasPorMes(ano, nomeEstado);
  plotarTuristasPorViaAcesso(ano, nomeEstado);
  top5PaisesCompleto(ano, nomeEstado);
}

async function aplicarFiltros() {
  await plotarDados();
}

async function limparFiltros() {
  const selectAno = document.getElementById('filtroAno');
  const selectEstado = document.getElementById('filtroEstado');

  selectAno.value = '2025';
  selectEstado.value = 'São Paulo';

  await plotarDados();
}

async function inicializarDashboard() {
  await selectsFiltros();
  await buscarDados();
  await plotarDados();
}

window.addEventListener('DOMContentLoaded', inicializarDashboard);
