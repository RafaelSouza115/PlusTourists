let planosPendentes = [];
let planosAprovados = [];
let planosPendentesFiltrados = [];
let planosAprovadosFiltrados = [];
const ITENS_POR_PAGINA = 6;
let paginaAtualPendentes = 1;
let paginaAtualAprovados = 1;
const id_empresa = sessionStorage.ID_EMPRESA;
function abreviarMes(data) {
  const mes = data
    .toLocaleDateString('pt-BR', {
      month: 'short',
    })
    .replace('.', '');

  return mes.charAt(0).toUpperCase() + mes.slice(1);
}

function mostrarAba(tipo, botao) {
  const secoes = document.querySelectorAll('.cards-section');

  secoes.forEach((sec) => {
    sec.style.display = 'none';
  });

  document.getElementById(tipo).style.display = 'block';

  document.querySelectorAll('.options button').forEach((btn) => {
    btn.classList.remove('destaque');
  });

  if (tipo === 'validados') {
    paginaAtualAprovados = 1;
  } else {
    paginaAtualPendentes = 1;
  }

  botao.classList.add('destaque');
}

function avancarCard(aba) {
  if (aba === 'validados') {
    if (pagValidados < 1) {
      pagValidados++;
      atualizarCarrossel('validados', pagValidados);
    }
  } else {
    if (pagPendentes < 1) {
      pagPendentes++;
      atualizarCarrossel('pendentes', pagPendentes);
    }
  }
}

function voltarCard(aba) {
  if (aba === 'validados') {
    if (pagValidados > 0) {
      pagValidados--;
      atualizarCarrossel('validados', pagValidados);
    }
  } else {
    if (pagPendentes > 0) {
      pagPendentes--;
      atualizarCarrossel('pendentes', pagPendentes);
    }
  }
}

function atualizarCarrossel(aba, paginaAtual) {
  let deslocamento = paginaAtual * 780;

  document.querySelector('#esteira-' + aba).style.transform = 'translateX(-' + deslocamento + 'px)';

  let containerBolinhas = document.querySelector('#bolinhas-' + aba);
  let listaBolas = containerBolinhas.querySelectorAll('.bola');

  listaBolas.forEach((bola) => bola.classList.remove('ativa'));
  listaBolas[paginaAtual].classList.add('ativa');
}

function abrirModal() {
  const desabilitarEstado = document.querySelector('#slEstado');
  desabilitarEstado.disabled = false;
  const desabilitarMunicipio = document.querySelector('#slMunicipio');
  desabilitarMunicipio.disabled = false;
  document.getElementById('modal-plano').style.display = 'flex';
}

function fecharModal() {
  document.getElementById('modal-plano').style.display = 'none';
  document.querySelector('.modal-form').reset();

  const eventosCriados = document.querySelectorAll('.modal-form .input-evento-selecionado');
  eventosCriados.forEach((input) => input.remove());
}

function adicionarEvento() {
  const container = document.querySelector('.linha-eventos').parentElement;

  const select = document.querySelector('.linha-eventos select');
  const textoEvento = select.options[select.selectedIndex].text;
  const valueEvento = select.options[select.selectedIndex].value;

  if (valueEvento == '0') {
  } else {
    const novoInput = document.createElement('div');
    novoInput.type = 'text';
    novoInput.className = 'input-evento-selecionado';
    novoInput.style = 'height: 46px; border-radius: 12px; padding: 12px; font-size: 14px';
    novoInput.innerHTML = textoEvento;
    novoInput.value = valueEvento;
    novoInput.readOnly = true;

    container.appendChild(novoInput);
  }
}

function preencherModal(plano) {
  const inicio = new Date(plano.inicio);
  const fim = new Date(plano.fim);
  document.getElementById('nomePlano').textContent = plano.nomePlano;
  document.getElementById('destino').textContent = plano.destino;
  document.getElementById('duracao').textContent = `${plano.duracao} dias`;
  document.getElementById('periodo').textContent = `${abreviarMes(inicio)} - ${abreviarMes(fim)}`;
  document.getElementById('destinoDetalhe').textContent = `${plano.destino} - ${plano.uf}`;
  document.getElementById('inicioEvento').textContent = plano.inicio;
  document.getElementById('fimEvento').textContent = plano.fim;
  const roteiro = document.getElementById('roteiro');
  roteiro.innerHTML = '';
  plano.eventos.forEach((evento) => {
    roteiro.innerHTML += `
        <div class="evento-card">
                    <div class="evento-header">
                        <h4>${evento.nome}</h4>
                        <span> Data do Evento:</span>
                        <p><strong>Inicio: </strong>${evento.inicioEvento}</p>
                        <p><strong>Fim: </strong>${evento.fimEvento}</p>
                    </div>
                    <div class="descricao-roteiro">
                        <div class="linha-info">
                            <span>Local: </span>
                            <p>${plano.destino}</p>
                        </div>
                        <div class="linha-info">
                            <span>Classificação: </span>
                            <p>${evento.classificacao}</p>
                        </div>
                    </div>
                </div>
        `;
  });
}

function modelAbrirAmpliar(idPlano) {
  const modal = document.getElementById('modal-roteiro');
  fetch(`/planos/detalhes/${idPlano}`)
    .then((res) => res.json())
    .then((dados) => {
      preencherModal(dados);
      modal.style.display = 'flex';
    });
}

function fecharModalRoteiro() {
  document.getElementById('modal-roteiro').style.display = 'none';
  document.querySelector('.modal-form').reset();

  const eventosCriados = document.querySelectorAll('.modal-form .input-evento-selecionado');
  eventosCriados.forEach((input) => input.remove());
}

function criarPlano() {
  const nomePlanoVar = iptNomePlano.value;
  const destinoVar = slMunicipio.value;
  const dataInicialVar = iptDataInicial.value;
  const dataFinalVar = iptDataFinal.value;
  const idEmpresavar = sessionStorage.ID_EMPRESA;
  const roteiroVar = document.querySelectorAll('.input-evento-selecionado');

  fetch('/planos/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nomePlanoServer: nomePlanoVar,
      destinoServer: destinoVar,
      dataInicialServer: dataInicialVar,
      dataFinalServer: dataFinalVar,
      idEmpresaServer: idEmpresavar,
      roteiroServer: Array.from(roteiroVar).map((input) => input.value),
    }),
  })
    .then(async (resposta) => {
      const data = await resposta.json();
      console.log('Resposta: ', resposta);

      if (resposta.ok) {
        console.log('Plano criado com sucesso');
        const botaoPendentes = document.querySelector('.options button:nth-child(2)');
        mostrarAba('pendentes', botaoPendentes);
        listarPlanos(id_empresa, 1);
        fecharModal();
      } else {
        throw data.mensagem;
      }
    })
    .catch((err) => {
      console.log('#Erro: ', err);
    });
  return false;
}

function listarEstados() {
  const select = document.querySelector('#slEstado');
  fetch('/planos/listarEstados', { cache: 'no-store' }).then(function (response) {
    if (response.ok) {
      response.json().then(function (resposta) {
        console.log(resposta);
        const fragmento = document.createDocumentFragment();
        for (let i = 0; i < resposta.length; i++) {
          const element = document.createElement('option');
          element.value = resposta[i].id_estado;
          element.innerHTML = resposta[i].nome_estado;
          fragmento.appendChild(element);
        }
        select.appendChild(fragmento);
      });
    }
  });
}
listarEstados();

function listarMunicipiosSelect() {
  const desabilitar = document.querySelector('#slEstado');
  desabilitar.disabled = true;
  const estado = document.querySelector('#slEstado').value;
  const select = document.querySelector('#slMunicipio');
  select.innerHTML = `
        <option value="#" disabled selected>
            Selecione o município de destino
        </option>
    `;
  fetch('/planos/listarMunicipios', { cache: 'no-store' }).then(function (response) {
    if (response.ok) {
      response.json().then(function (resposta) {
        console.log(resposta);
        const fragmento = document.createDocumentFragment();
        for (let i = 0; i < resposta.length; i++) {
          if (resposta[i].id_estado == estado) {
            const element = document.createElement('option');
            element.value = resposta[i].id_municipio;
            element.innerHTML = resposta[i].municipio;
            fragmento.appendChild(element);
          }
        }
        select.appendChild(fragmento);
      });
    }
  });
}

function listarEventosSelect() {
  const desabilitar = document.querySelector('#slMunicipio');
  desabilitar.disabled = true;
  const municipio = document.querySelector('#slMunicipio').value;
  const select = document.querySelector('#slEventos');
  select.innerHTML = `
        <option value="#" disabled selected>
            Selecione um evento
        </option>
    `;
  fetch('/planos/listarEventos', { cache: 'no-store' }).then(function (response) {
    if (response.ok) {
      response.json().then(function (resposta) {
        console.log(resposta);
        const fragmento = document.createDocumentFragment();
        for (let i = 0; i < resposta.length; i++) {
          if (resposta[i].id_municipio == municipio) {
            const element = document.createElement('option');
            element.value = resposta[i].id_evento;
            element.innerHTML = resposta[i].nome_evento;
            fragmento.appendChild(element);
          }
        }
        select.appendChild(fragmento);
      });
    }
  });
}

function renderizarCardsAprovados() {
  const wrapper = document.getElementById('cards-wrapper-validados');
  const indiceInicio = (paginaAtualAprovados - 1) * ITENS_POR_PAGINA;
  const indiceFim = indiceInicio + ITENS_POR_PAGINA;

  const pagina = planosAprovadosFiltrados.slice(indiceInicio, indiceFim);

  wrapper.innerHTML = '';

  if (planosAprovadosFiltrados.length === 0) {
    wrapper.innerHTML = '<p>Nenhum item encontrado.</p>';
    return;
  }

  pagina.forEach((plano) => {
    const card = document.createElement('article');
    const comeco = new Date(plano.inicio);
    const final = new Date(plano.fim);
    card.className = 'card';
    card.dataset.id = plano.id;

    card.innerHTML = `
        <h3>${plano.plano}</h3>
        <div class="info-item">
            <i class="ti ti-map-pin" style="color: #008000"></i>
            <p><strong>Destino:</strong><br>${plano.destino} - ${plano.uf}</p>
        </div>
        <div class="info-item">
            <i class="ti ti-clock-hour-11" style="color: #008000"></i>
            <p><strong>Duração:</strong><br>${plano.duracao} dias</p>
        </div>
        <div class="info-item no-border">
            <i class="ti ti-calendar-month" style="color: #008000"></i>
            <p><strong>Período:</strong><br>${abreviarMes(comeco)} - ${abreviarMes(final)}</p>
        </div>
        <div class="roteiro">
            <button class="btn-ampliar">
                <i class="ti ti-map-2" style="color: #008000"></i>Ampliar
                Roteiro
            </button>
        </div>
    `;

    card.querySelector('.btn-ampliar').addEventListener('click', () => {
      modelAbrirAmpliar(plano.idPlano);
    });
    wrapper.appendChild(card);
  });
  renderizarPaginacaoAprovados();
}

function renderizarCardsPendentes() {
  const wrapper = document.getElementById('cards-wrapper-pendentes');
  const indiceInicio = (paginaAtualPendentes - 1) * ITENS_POR_PAGINA;
  const indiceFim = indiceInicio + ITENS_POR_PAGINA;

  const pagina = planosPendentesFiltrados.slice(indiceInicio, indiceFim);

  wrapper.innerHTML = '';

  if (planosPendentesFiltrados.length === 0) {
    wrapper.innerHTML = `
                <div style="grid-column:1/-1; display:flex; flex-direction:column;
                            align-items:center; justify-content:center;
                            color:#9ca3af; gap:0.5rem; height:100%;">
                    <p style="font-size:0.9rem; font-weight:600;">Nenhum plano encontrado.</p>
                </div>`;
    return;
  }

  pagina.forEach((plano) => {
    const card = document.createElement('article');
    const comeco = new Date(plano.inicio);
    const final = new Date(plano.fim);
    card.className = 'card';
    card.dataset.id = plano.id;

    card.innerHTML = `
        <h3>${plano.plano}</h3>
        <div class="info-item">
            <i class="ti ti-map-pin" style="color: #008000"></i>
            <p><strong>Destino:</strong><br>${plano.destino} - ${plano.uf}</p>
        </div>
        <div class="info-item">
            <i class="ti ti-clock-hour-11" style="color: #008000"></i>
            <p><strong>Duração:</strong><br>${plano.duracao} dias</p>
        </div>
        <div class="info-item no-border">
            <i class="ti ti-calendar-month" style="color: #008000"></i>
            <p><strong>Período:</strong><br>${abreviarMes(comeco)} - ${abreviarMes(final)}</p>
        </div>
        <div class="roteiro">
            <button class="btn-ampliar">
                <i class="ti ti-map-2" style="color: #008000"></i>
                Ampliar Roteiro
            </button>
        </div>
        <div class="botoes-validacao">
            <button class="btn-validar">Validar</button>
            <button class="btn-excluir">Excluir</button>
        </div>
    `;

    card.querySelector('.btn-ampliar').addEventListener('click', () => {
      modelAbrirAmpliar(plano.idPlano);
    });
    card.querySelector('.btn-validar').addEventListener('click', () => {
      validarPlano(plano.idPlano);
    });
    card.querySelector('.btn-excluir').addEventListener('click', () => {
      excluirPlano(plano.idPlano);
    });
    wrapper.appendChild(card);
  });
  renderizarPaginacaoPendentes();
}

function listarPlanos(idEmpresa, status) {
  const tipo = status;
  fetch(`/planos/listarPlanos/${idEmpresa}/${status}`, { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => {
      if (tipo == 1) {
        planosPendentes = data;
        planosPendentesFiltrados = [...data];
        renderizarCardsPendentes();
        renderizarPaginacaoPendentes();
        carregarDestinos();
      }
      if (tipo == 2) {
        planosAprovados = data;
        planosAprovadosFiltrados = [...data];
        renderizarCardsAprovados();
        renderizarPaginacaoAprovados();
        carregarDestinos();
      }
    });
}

function validarPlano(idPlano) {
  fetch(`/planos/validar/${idPlano}`, {
    method: 'PUT',
  }).then((response) => {
    if (response.ok) {
      listarPlanos(id_empresa, 1);
      listarPlanos(id_empresa, 2);
    }
  });
}

function excluirPlano(idPlano) {
  fetch(`/planos/excluir/${idPlano}`, {
    method: 'DELETE',
  }).then((response) => {
    if (response.ok) {
      listarPlanos(id_empresa, 1);
    }
  });
}

function renderizarPaginacaoAprovados() {
  const container = document.getElementById('paginacao2');
  const totalPaginas = Math.ceil(planosAprovadosFiltrados.length / ITENS_POR_PAGINA);
  container.innerHTML = '';

  if (totalPaginas <= 1) return;

  // ‹ anterior
  const btnAnt = document.createElement('button');
  btnAnt.className = 'paginacao-btn';
  btnAnt.innerHTML = `<i class="ti ti-chevron-left"></i>`;
  btnAnt.disabled = paginaAtualAprovados === 1;
  btnAnt.onclick = () => mudarPaginaAprovados(-1);
  container.appendChild(btnAnt);

  // números
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.className = 'paginacao-btn' + (i === paginaAtualAprovados ? ' destaque' : '');
    btn.textContent = i;
    btn.onclick = () => {
      paginaAtualAprovados = i;

      renderizarCardsAprovados();
    };
    container.appendChild(btn);
  }

  // info "X de Y"
  const info = document.createElement('span');
  info.className = 'paginacao-info';
  info.textContent = `${paginaAtualAprovados} de ${totalPaginas}`;
  container.appendChild(info);

  // › próximo
  const btnPrx = document.createElement('button');
  btnPrx.className = 'paginacao-btn';
  btnPrx.innerHTML = `<i class="ti ti-chevron-right"></i>`;
  btnPrx.disabled = paginaAtualAprovados === totalPaginas;
  btnPrx.onclick = () => mudarPaginaAprovados(1);
  container.appendChild(btnPrx);
}

function renderizarPaginacaoPendentes() {
  const container = document.getElementById('paginacao1');
  const totalPaginas = Math.ceil(planosPendentesFiltrados.length / ITENS_POR_PAGINA);
  container.innerHTML = '';

  if (totalPaginas <= 1) return;

  // ‹ anterior
  const btnAnt = document.createElement('button');
  btnAnt.className = 'paginacao-btn';
  btnAnt.innerHTML = `<i class="ti ti-chevron-left"></i>`;
  btnAnt.disabled = paginaAtualPendentes === 1;
  btnAnt.onclick = () => mudarPaginaPendentes(-1);
  container.appendChild(btnAnt);

  // números
  for (let i = 1; i <= totalPaginas; i++) {
    const btn = document.createElement('button');
    btn.className = 'paginacao-btn' + (i === paginaAtualPendentes ? ' destaque' : '');
    btn.textContent = i;
    btn.onclick = () => {
      paginaAtualPendentes = i;
      renderizarCardsPendentes();
    };
    container.appendChild(btn);
  }

  // info "X de Y"
  const info = document.createElement('span');
  info.className = 'paginacao-info';
  info.textContent = `${paginaAtualPendentes} de ${totalPaginas}`;
  container.appendChild(info);

  // › próximo
  const btnPrx = document.createElement('button');
  btnPrx.className = 'paginacao-btn';
  btnPrx.innerHTML = `<i class="ti ti-chevron-right"></i>`;
  btnPrx.disabled = paginaAtualPendentes === totalPaginas;
  btnPrx.onclick = () => mudarPaginaPendentes(1);
  container.appendChild(btnPrx);
}

function mudarPaginaAprovados(direcao) {
  const totalPaginas = Math.ceil(planosAprovadosFiltrados.length / ITENS_POR_PAGINA);
  const nova = paginaAtualAprovados + direcao;
  if (nova < 1 || nova > totalPaginas) return;
  paginaAtualAprovados = nova;
  renderizarCardsAprovados();
}

function mudarPaginaPendentes(direcao) {
  const totalPaginas = Math.ceil(planosPendentesFiltrados.length / ITENS_POR_PAGINA);
  const nova = paginaAtualPendentes + direcao;
  if (nova < 1 || nova > totalPaginas) return;
  paginaAtualPendentes = nova;
  renderizarCardsPendentes();
}

function aplicarFiltros() {
  const destino = document.getElementById('slDestinos').value;
  const duracao = document.getElementById('slDuracao').value;
  planosPendentesFiltrados = filtrarLista(planosPendentes, destino, duracao);
  planosAprovadosFiltrados = filtrarLista(planosAprovados, destino, duracao);
  paginaAtualPendentes = 1;
  paginaAtualAprovados = 1;
  renderizarCardsPendentes();
  renderizarPaginacaoPendentes();
  renderizarCardsAprovados();
  renderizarPaginacaoAprovados();
}

function carregarDestinos() {
  const select = document.getElementById('slDestinos');
  select.innerHTML = `
        <option value="">
            Selecione um destino
        </option>
    `;
  const destinos = [
    ...new Set([
      ...planosPendentes.map((plano) => plano.destino),
      ...planosAprovados.map((plano) => plano.destino),
    ]),
  ];
  console.log('Destinos corrigidos:', destinos);
  destinos.sort();
  destinos.forEach((destino) => {
    const option = document.createElement('option');
    option.value = destino;
    option.textContent = destino;
    select.appendChild(option);
  });
  console.log('Pendentes:', planosPendentes);
  console.log('Aprovados:', planosAprovados);
  console.log('Destinos:', destinos);
}

function filtrarLista(lista, destino, duracao) {
  return lista.filter((plano) => {
    const filtroDestino = !destino || plano.destino === destino;
    let filtroDuracao = true;
    if (duracao == '3') {
      filtroDuracao = plano.duracao <= 3;
    } else if (duracao == '7') {
      filtroDuracao = plano.duracao > 3 && plano.duracao <= 7;
    } else if (duracao == '15') {
      filtroDuracao = plano.duracao > 7 && plano.duracao <= 15;
    } else if (duracao == '999') {
      filtroDuracao = plano.duracao > 15;
    }
    return filtroDestino && filtroDuracao;
  });
}

listarPlanos(id_empresa, 1);
listarPlanos(id_empresa, 2);
