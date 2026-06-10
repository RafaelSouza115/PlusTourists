(function () {
  /* ============================================================
       ESTADO GLOBAL
    ============================================================ */
  const EVENTOS_POR_PAGINA = 6;
  let paginaAtual = 1;
  let eventosFiltrados = [];
  let todosEventos = [];

  async function carregarEventos() {
    try {
      const res = await fetch('/eventos/listar');

      if (!res.ok) {
        throw new Error('Erro ao carregar eventos');
      }

      todosEventos = await res.json();
      eventosFiltrados = [...todosEventos];
      renderizarCards();
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarDestinos() {
    try {
      const res = await fetch('/eventos/filtroDestino');
      if (!res.ok) {
        throw new Error('Erro ao carregar destinos');
      }
      const destinos = await res.json();
      const select = document.getElementById('filtro-destino');
      select.innerHTML = '';

      destinos.forEach((destino) => {
        const option = document.createElement('option');
        option.value = destino.municipio.toLowerCase().replace(/ /g, '-');
        option.textContent = destino.municipio;
        select.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarFaixasEtarias() {
    try {
      const res = await fetch('/eventos/filtroFaixaEtaria');

      if (!res.ok) {
        throw new Error('Erro ao carregar faixas etárias');
      }

      const faixas = await res.json();
      const select = document.getElementById('filtro-classificacao');
      select.innerHTML = '<option value="">Selecione: Faixa Etária</option>';

      faixas.forEach((faixa) => {
        const option = document.createElement('option');
        option.value = faixa.classificacao.toLowerCase();
        option.textContent = faixa.classificacao === 'livre' ? 'Livre' : '+' + faixa.classificacao;
        select.appendChild(option);
      });
    } catch (error) {
      console.error(error);
    }
  }
  //
  // Cada objeto deve ter: id, titulo, municipio, classificacao, descricao,
  //                       dataInicio, dataFinal, horaInicio, horaFinal

  /* ============================================================
       CARDS — renderização
    ============================================================ */
  function renderizarCards() {
    const wrapper = document.getElementById('eventos-cards-wrapper');
    const inicio = (paginaAtual - 1) * EVENTOS_POR_PAGINA;
    const fim = inicio + EVENTOS_POR_PAGINA;
    const pagina = eventosFiltrados.slice(inicio, fim);

    wrapper.innerHTML = '';

    if (pagina.length === 0) {
      wrapper.innerHTML = `
                <div style="grid-column:1/-1; display:flex; flex-direction:column;
                            align-items:center; justify-content:center;
                            color:#9ca3af; gap:0.5rem; height:100%;">
                    <i class="ti ti-calendar-off" style="font-size:2.5rem;"></i>
                    <p style="font-size:0.9rem; font-weight:600;">Nenhum evento encontrado.</p>
                </div>`;
      renderizarPaginacao();
      return;
    }

    pagina.forEach((evento) => {
      const card = document.createElement('article');
      card.className = 'evento-card';
      card.dataset.id = evento.id;

      card.innerHTML = `
                <div class="evento-card-header">
                    <h2 class="evento-card-titulo">${evento.titulo}</h2>
                </div>

                <div class="card-info-row">
                    <span class="evento-card-municipio">
                        <i class="ti ti-map-pin"></i>${evento.municipio}
                    </span>
                </div>
                <div class="card-info-row">
                    <span class="card-info-icon"><i class="ti ti-users-group"></i></span>
                    <div class="card-info-text">
                        <span class="card-info-label">Classificação etária</span>
                        <span class="card-info-value">${evento.classificacao === 'livre' ? 'Livre' : '+' + evento.classificacao}</span>
                    </div>
                </div>

                <div class="card-info-row">
                    <span class="card-info-icon"><i class="ti ti-align-left"></i></span>
                    <div class="card-info-text">
                        <span class="card-info-label">Descrição</span>
                        <span class="card-info-value">${evento.descricao}</span>
                    </div>
                </div>

                <button class="btn-visualizar" data-id="${evento.id}">
                    <i class="ti ti-eye"></i>
                    Visualizar evento
                </button>
            `;

      // vincula o botão diretamente ao evento correto
      card.querySelector('.btn-visualizar').addEventListener('click', () => {
        abrirModal(evento.id);
      });

      wrapper.appendChild(card);
    });

    renderizarPaginacao();
  }

  /* ============================================================
       PAGINAÇÃO
    ============================================================ */
  function renderizarPaginacao() {
    const container = document.getElementById('paginacao');
    const totalPaginas = Math.ceil(eventosFiltrados.length / EVENTOS_POR_PAGINA);
    container.innerHTML = '';

    if (totalPaginas <= 1) return;

    // ‹ anterior
    const btnAnt = document.createElement('button');
    btnAnt.className = 'paginacao-btn';
    btnAnt.innerHTML = `<i class="ti ti-chevron-left"></i>`;
    btnAnt.disabled = paginaAtual === 1;
    btnAnt.onclick = () => mudarPagina(-1);
    container.appendChild(btnAnt);

    // números
    for (let i = 1; i <= totalPaginas; i++) {
      const btn = document.createElement('button');
      btn.className = 'paginacao-btn' + (i === paginaAtual ? ' ativo' : '');
      btn.textContent = i;
      btn.onclick = () => {
        paginaAtual = i;
        renderizarCards();
      };
      container.appendChild(btn);
    }

    // info "X de Y"
    const info = document.createElement('span');
    info.className = 'paginacao-info';
    info.textContent = `${paginaAtual} de ${totalPaginas}`;
    container.appendChild(info);

    // › próximo
    const btnPrx = document.createElement('button');
    btnPrx.className = 'paginacao-btn';
    btnPrx.innerHTML = `<i class="ti ti-chevron-right"></i>`;
    btnPrx.disabled = paginaAtual === totalPaginas;
    btnPrx.onclick = () => mudarPagina(1);
    container.appendChild(btnPrx);
  }

  function mudarPagina(direcao) {
    const totalPaginas = Math.ceil(eventosFiltrados.length / EVENTOS_POR_PAGINA);
    const nova = paginaAtual + direcao;
    if (nova < 1 || nova > totalPaginas) return;
    paginaAtual = nova;
    renderizarCards();
  }

  /* ============================================================
       FILTROS
    ============================================================ */
  function aplicarFiltros() {
    const destino = document.getElementById('filtro-destino').value.toLowerCase();
    const classificacao = document.getElementById('filtro-classificacao').value.toLowerCase();

    eventosFiltrados = todosEventos.filter((ev) => {
      const okDestino = !destino || ev.municipio.toLowerCase().replace(/ /g, '-').includes(destino);
      const okClassificacao = !classificacao || ev.classificacao.toLowerCase() === classificacao;
      return okDestino && okClassificacao;
    });

    paginaAtual = 1;
    renderizarCards();
  }

  // expõe aplicarFiltros para os onchange do HTML
  window.aplicarFiltros = aplicarFiltros;

  /* ============================================================
       MODAL DE DETALHES
    ============================================================ */
  function criarModalHTML() {
    const modal = document.createElement('div');
    modal.id = 'modal-evento';
    modal.className = 'modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-evento-titulo');

    modal.innerHTML = `
            <div class="modal-container" id="modal-container">

                <div class="modal-header">
                    <h2 class="modal-titulo" id="modal-evento-titulo">Detalhes do Evento</h2>
                    <button class="modal-btn-fechar" id="modal-btn-fechar" aria-label="Fechar modal">&#x2715;</button>
                </div>

                <div class="modal-info-grid">
                    <div class="modal-info-item">
                        <div class="modal-info-icon"><i class="ti ti-file-description" style="color:#008000"></i></div>
                        <div class="modal-info-text">
                            <span class="modal-info-label">Nome do evento:</span>
                            <span class="modal-info-value" id="modal-nome">—</span>
                        </div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-icon"><i class="ti ti-map-pin" style="color:#008000"></i></div>
                        <div class="modal-info-text">
                            <span class="modal-info-label">Município:</span>
                            <span class="modal-info-value" id="modal-municipio">—</span>
                        </div>
                    </div>
                    <div class="modal-info-item">
                        <div class="modal-info-icon"><i class="ti ti-user-square-rounded" style="color:#008000"></i></div>
                        <div class="modal-info-text">
                            <span class="modal-info-label">Classificação etária:</span>
                            <span class="modal-info-value" id="modal-classificacao">—</span>
                        </div>
                    </div>
                </div>

                <div class="modal-dados-agregados">
                    <div class="modal-dados-header">
                        <div class="modal-dados-header-icon">
                            <i class="ti ti-calendar-month" style="color:#008000"></i>
                        </div>
                        <span class="modal-dados-titulo">Dados detalhados do evento</span>
                    </div>

                    <table class="modal-dados-table">
                        <tbody>
                            <tr>
                                <td>
                                    <span class="td-label">Data Início:</span>
                                    <span class="td-value" id="modal-data-inicio">—</span>
                                </td>
                                <td>
                                    <span class="td-label">Data Final:</span>
                                    <span class="td-value" id="modal-data-final">—</span>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <span class="td-label">Hora Início:</span>
                                    <span class="td-value" id="modal-hora-inicio">—</span>
                                </td>
                                <td>
                                    <span class="td-label">Hora Final:</span>
                                    <span class="td-value" id="modal-hora-final">—</span>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" class="td-descricao-row">
                                    <div class="td-descricao-inner">
                                        <div class="modal-dados-header-icon">
                                            <i class="ti ti-align-left" style="color:#008000"></i>
                                        </div>
                                        <div class="td-descricao-texto">
                                            <span class="td-label">Descrição:</span>
                                            <span class="td-value" id="modal-descricao">—</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        `;

    document.body.appendChild(modal);
    return modal;
  }

  function preencherModal(evento) {
    document.getElementById('modal-evento-titulo').textContent =
      'Detalhes do Evento ' + String(evento.id).padStart(2, '0');
    document.getElementById('modal-nome').textContent = evento.titulo;
    document.getElementById('modal-municipio').textContent = evento.municipio;
    document.getElementById('modal-classificacao').textContent =
      evento.classificacao === 'livre' ? 'Livre' : '+' + evento.classificacao;
    document.getElementById('modal-descricao').textContent = evento.descricao;
    document.getElementById('modal-data-inicio').textContent = evento.dataInicio;
    document.getElementById('modal-data-final').textContent = evento.dataFinal;
    document.getElementById('modal-hora-inicio').textContent = evento.horaInicio;
    document.getElementById('modal-hora-final').textContent = evento.horaFinal;
  }

  function abrirModal(idEvento) {
    // busca primeiro em todosEventos (funciona mesmo com filtros ativos)
    const evento = todosEventos.find((e) => e.id === idEvento);
    if (!evento) return;

    preencherModal(evento);

    const overlay = document.getElementById('modal-evento');
    overlay.classList.add('ativo');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      document.getElementById('modal-btn-fechar')?.focus();
    }, 50);
  }

  function fecharModal() {
    document.getElementById('modal-evento').classList.remove('ativo');
    document.body.style.overflow = '';
  }

  /* ============================================================
       INIT
    ============================================================ */
  async function init() {
    await carregarEventos();
    await carregarDestinos();
    await carregarFaixasEtarias();

    const selectDestino = document.getElementById('filtro-destino');

    if (selectDestino && selectDestino.options.length > 0) {
      selectDestino.selectedIndex = 0;
      aplicarFiltros();
    }

    criarModalHTML();

    document.getElementById('modal-btn-fechar').addEventListener('click', fecharModal);
    document.getElementById('modal-evento').addEventListener('click', function (e) {
      if (e.target === this) fecharModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fecharModal();
    });

    document.getElementById('filtro-destino')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-classificacao')?.addEventListener('change', aplicarFiltros);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
