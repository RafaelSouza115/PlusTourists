var nome_funcionario = document.getElementById('nome_funcionario');

if (sessionStorage.NOME_FUNCIONARIO) {
  nome_funcionario.innerHTML = 'Olá, ' + sessionStorage.NOME_FUNCIONARIO + '!';
}

// async function selectsFiltros() {
//   try {
//     const response = await fetch(`/dashboard/selects-ano-estado`);

//     if (!response.ok) {
//       throw new Error(`Falha em buscar dados dos filtros: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Dados do dashboard:', data);
//     const selectEstado = document.querySelector('#filtroEstado');
//     const selectAno = document.querySelector('#filtroAno');

//     selectEstado.innerHTML = `<option value="">Selecione o estado</option>`;
//     selectAno.innerHTML = `<option value="">Selecione o ano</option>`;

//     data.forEach((estado) => {
//       selectEstado.innerHTML += `
//         <option value="${estado.nome_estado}">
//           ${estado.nome_estado}
//         </option>
//       `;
//     });

//     data.forEach((ano) => {
//       selectAno.innerHTML += `
//         <option value="${ano.ano}">
//           ${ano.ano}
//         </option>
//       `;
//     });
//   } catch (error) {
//     console.error('Erro ao obter dados dos filtros:', error);
//   }
// }

async function plotarMaiorPaisEmissor() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';
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

async function plotarMesesMenosTuristas() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';
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

async function plotarMesTopComEvento() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';
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

async function plotarPrincipalViaAcesso() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';
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

async function plotarEventosTuristasPorMes() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';
  const response = await fetch(
    `/dashboard/eventos-turistas-por-mes?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
  );
  const dados = await response.json();

  let nomesMes = [];
  let totalEventos = [];
  let totalTuristas = [];
  for (let i = 0; i < dados.length; i++) {
    nomesMes.push(dados[i].nome_mes);
    totalEventos.push(dados[i].total_eventos);
    totalTuristas.push(dados[i].total_turistas);
  }

  console.log(nomesMes);
  console.log(totalEventos);
  console.log(totalTuristas);

  /* Gráfico de barras + linha */
  const ctx = document.getElementById('idTuristasEventos');
  new Chart(ctx, {
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
}

async function plotarTuristasPorViaAcesso() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';
  const response = await fetch(
    `/dashboard/turistas-por-via-acesso?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
  );
  const dados = await response.json();

  console.log(dados);

  /* Gráfico de Donut */
  const ctx2 = document.getElementById('idChegadas');
  new Chart(ctx2, {
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
  //arrumar como valor aparece em tela
  totalVias.innerHTML = `${dados.total_geral}`;

  const percentualArea = document.getElementById('percentualArea');
  const percentualTerrestre = document.getElementById('percentualTerrestre');
  const percentualMaritima = document.getElementById('percentualMaritima');
  const percentualFluvial = document.getElementById('percentualFluvial');
  const totalArea = document.getElementById('totalArea');
  const totalTerrestre = document.getElementById('totalTerrestre');
  const totalMaritima = document.getElementById('totalMaritima');
  const totalFluvial = document.getElementById('totalFluvial');

  percentualArea.innerHTML = `${dados.percentual_aerea}%`;
  percentualTerrestre.innerHTML = `${dados.percentual_terrestre}%`;
  percentualMaritima.innerHTML = `${dados.percentual_maritima}%`;
  percentualFluvial.innerHTML = `${dados.percentual_fluvial}%`;
  totalArea.innerHTML = `(${dados.total_aerea})`;
  totalTerrestre.innerHTML = `(${dados.total_terrestre})`;
  totalMaritima.innerHTML = `(${dados.total_maritima})`;
  totalFluvial.innerHTML = `(${dados.total_fluvial})`;
}

async function top5PaisesCompleto() {
  var ano = 2025;
  var nomeEstado = 'São Paulo';

  const response = await fetch(
    `/dashboard/top5-paises-completo?ano=${encodeURIComponent(ano)}&nomeEstado=${encodeURIComponent(nomeEstado)}`
  );
  const dados = await response.json();

  console.log(dados);

  const primeiroPais = document.getElementById('primeiroPais');
  const percentualPrimeiroPais = document.getElementById('percentualPrimeiroPais');
  const estadosMaisVisitadosPrimeiro = document.getElementById('estadosMaisVisitadosPrimeiro');
  const estadosMenosVisitadosPrimeiro = document.getElementById('estadosMenosVisitadosPrimeiro');
  const mesMaisVisitadoPrimeiro = document.getElementById('mesMaisVisitadoPrimeiro');
  const mesMenosVisitadoPrimeiro = document.getElementById('mesMenosVisitadoPrimeiro');

  const segundoPais = document.getElementById('segundoPais');
  const percentualSegundoPais = document.getElementById('percentualSegundoPais');
  const estadosMaisVisitadosSegundo = document.getElementById('estadosMaisVisitadosSegundo');
  const estadosMenosVisitadosSegundo = document.getElementById('estadosMenosVisitadosSegundo');
  const mesMaisVisitadoSegundo = document.getElementById('mesMaisVisitadoSegundo');
  const mesMenosVisitadoSegundo = document.getElementById('mesMenosVisitadoSegundo');

  const terceiroPais = document.getElementById('terceiroPais');
  const percentualTerceiroPais = document.getElementById('percentualTerceiroPais');
  const estadosMaisVisitadosTerceiro = document.getElementById('estadosMaisVisitadosTerceiro');
  const estadosMenosVisitadosTerceiro = document.getElementById('estadosMenosVisitadosTerceiro');
  const mesMaisVisitadoTerceiro = document.getElementById('mesMaisVisitadoTerceiro');
  const mesMenosVisitadoTerceiro = document.getElementById('mesMenosVisitadoTerceiro');

  const quartoPais = document.getElementById('quartoPais');
  const percentualQuartoPais = document.getElementById('percentualQuartoPais');
  const estadosMaisVisitadosQuarto = document.getElementById('estadosMaisVisitadosQuarto');
  const estadosMenosVisitadosQuarto = document.getElementById('estadosMenosVisitadosQuarto');
  const mesMaisVisitadoQuarto = document.getElementById('mesMaisVisitadoQuarto');
  const mesMenosVisitadoQuarto = document.getElementById('mesMenosVisitadoQuarto');

  const quintoPais = document.getElementById('quintoPais');
  const percentualQuintoPais = document.getElementById('percentualQuintoPais');
  const estadosMaisVisitadosQuinto = document.getElementById('estadosMaisVisitadosQuinto');
  const estadosMenosVisitadosQuinto = document.getElementById('estadosMenosVisitadosQuinto');
  const mesMaisVisitadoQuinto = document.getElementById('mesMaisVisitadoQuinto');
  const mesMenosVisitadoQuinto = document.getElementById('mesMenosVisitadoQuinto');

  primeiroPais.innerHTML = `${dados[0].pais}`;
  percentualPrimeiroPais.innerHTML = `${dados[0].participacao_percentual}%`;
  estadosMaisVisitadosPrimeiro.innerHTML = `${dados[0].estado_mais_1}, ${dados[0].estado_mais_2} e ${dados[0].estado_mais_3}`;
  estadosMenosVisitadosPrimeiro.innerHTML = `${dados[0].estado_menos_1}, ${dados[0].estado_menos_2} e ${dados[0].estado_menos_3}`;
  mesMaisVisitadoPrimeiro.innerHTML = `${dados[0].mes_mais_visita}`;
  mesMenosVisitadoPrimeiro.innerHTML = `${dados[0].mes_menos_visita}`;

  segundoPais.innerHTML = `${dados[1].pais}`;
  percentualSegundoPais.innerHTML = `${dados[1].participacao_percentual}%`;
  estadosMaisVisitadosSegundo.innerHTML = `${dados[1].estado_mais_1}, ${dados[1].estado_mais_2} e ${dados[1].estado_mais_3}`;
  estadosMenosVisitadosSegundo.innerHTML = `${dados[1].estado_menos_1}, ${dados[1].estado_menos_2} e ${dados[1].estado_menos_3}`;
  mesMaisVisitadoSegundo.innerHTML = `${dados[1].mes_mais_visita}`;
  mesMenosVisitadoSegundo.innerHTML = `${dados[1].mes_menos_visita}`;

  terceiroPais.innerHTML = `${dados[2].pais}`;
  percentualTerceiroPais.innerHTML = `${dados[2].participacao_percentual}%`;
  estadosMaisVisitadosTerceiro.innerHTML = `${dados[2].estado_mais_1}, ${dados[2].estado_mais_2} e ${dados[2].estado_mais_3}`;
  estadosMenosVisitadosTerceiro.innerHTML = `${dados[2].estado_menos_1}, ${dados[2].estado_menos_2} e ${dados[2].estado_menos_3}`;
  mesMaisVisitadoTerceiro.innerHTML = `${dados[2].mes_mais_visita}`;
  mesMenosVisitadoTerceiro.innerHTML = `${dados[2].mes_menos_visita}`;

  quartoPais.innerHTML = `${dados[3].pais}`;
  percentualQuartoPais.innerHTML = `${dados[3].participacao_percentual}%`;
  estadosMaisVisitadosQuarto.innerHTML = `${dados[3].estado_mais_1}, ${dados[3].estado_mais_2} e ${dados[3].estado_mais_3}`;
  estadosMenosVisitadosQuarto.innerHTML = `${dados[3].estado_menos_1}, ${dados[3].estado_menos_2} e ${dados[3].estado_menos_3}`;
  mesMaisVisitadoQuarto.innerHTML = `${dados[3].mes_mais_visita}`;
  mesMenosVisitadoQuarto.innerHTML = `${dados[3].mes_menos_visita}`;

  quintoPais.innerHTML = `${dados[4].pais}`;
  percentualQuintoPais.innerHTML = `${dados[4].participacao_percentual}%`;
  estadosMaisVisitadosQuinto.innerHTML = `${dados[4].estado_mais_1}, ${dados[4].estado_mais_2} e ${dados[4].estado_mais_3}`;
  estadosMenosVisitadosQuinto.innerHTML = `${dados[4].estado_menos_1}, ${dados[4].estado_menos_2} e ${dados[4].estado_menos_3}`;
  mesMaisVisitadoQuinto.innerHTML = `${dados[4].mes_mais_visita}`;
  mesMenosVisitadoQuinto.innerHTML = `${dados[4].mes_menos_visita}`;
  quintoPais.innerHTML = `${dados[4].pais}`;
}

async function plotarDados() {
  plotarMaiorPaisEmissor();
  plotarMesesMenosTuristas();
  plotarMesTopComEvento();
  plotarPrincipalViaAcesso();
  plotarEventosTuristasPorMes();
  plotarTuristasPorViaAcesso();
  top5PaisesCompleto();
}

document.addEventListener('DOMContentLoaded', function () {
  plotarDados();
});
