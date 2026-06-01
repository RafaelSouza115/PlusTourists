// ===== MODAL DETALHES DO EVENTO =====

(function () {
    // ── Dados de exemplo por evento ──────────────────────────────────
    const eventosData = [
        {
            id: 1,
            nome: "Rock in Rio",
            municipio: "São Paulo",
            classificacao: "Livre",
            descricao: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            dataInicio: "DD/MM/AAAA",
            dataFinal: "DD/MM/AAAA",
            horaInicio: "HH:MM",
            horaFinal: "HH:MM",
            anosAnteriores: ["2023", "2022", "2021", "2019", "2018"],
        },
        {
            id: 2,
            nome: "Rock in Rio",
            municipio: "São Paulo",
            classificacao: "+18",
            descricao: "Rock in Rio é um dos maiores festivais de música.",
            dataInicio: "DD/MM/AAAA",
            dataFinal: "DD/MM/AAAA",
            horaInicio: "HH:MM",
            horaFinal: "HH:MM",
            anosAnteriores: ["2023", "2022", "2021"],
        },
        {
            id: 3,
            nome: "Rock in Rio",
            municipio: "São Paulo",
            classificacao: "+18",
            descricao: "Rock in Rio é um dos maiores festivais de música.",
            dataInicio: "DD/MM/AAAA",
            dataFinal: "DD/MM/AAAA",
            horaInicio: "HH:MM",
            horaFinal: "HH:MM",
            anosAnteriores: ["2022", "2021"],
        },
        {
            id: 4,
            nome: "Festival Cultural",
            municipio: "São Paulo",
            classificacao: "+14",
            descricao: "Festival de música e cultura.",
            dataInicio: "DD/MM/AAAA",
            dataFinal: "DD/MM/AAAA",
            horaInicio: "HH:MM",
            horaFinal: "HH:MM",
            anosAnteriores: ["2023"],
        },
        {
            id: 5,
            nome: "Festival Cultural",
            municipio: "São Paulo",
            classificacao: "+12",
            descricao: "Festival de música e cultura.",
            dataInicio: "DD/MM/AAAA",
            dataFinal: "DD/MM/AAAA",
            horaInicio: "HH:MM",
            horaFinal: "HH:MM",
            anosAnteriores: [],
        },
        {
            id: 6,
            nome: "Festival Cultural",
            municipio: "São Paulo",
            classificacao: "+18",
            descricao: "Festival de música e cultura.",
            dataInicio: "DD/MM/AAAA",
            dataFinal: "DD/MM/AAAA",
            horaInicio: "HH:MM",
            horaFinal: "HH:MM",
            anosAnteriores: ["2023", "2022"],
        },
    ];

    // ── Cria o HTML do modal e injeta no body ─────────────────────────
    function criarModalHTML() {
        const modal = document.createElement("div");
        modal.id = "modal-evento";
        modal.className = "modal-overlay";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-labelledby", "modal-evento-titulo");

        modal.innerHTML = `
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />  <script src="../js/dashboard/sidebar.js" defer></script>

      <div class="modal-container" id="modal-container">

        <!-- Cabeçalho -->
        <div class="modal-header">
          <h2 class="modal-titulo" id="modal-evento-titulo">Detalhes do Evento</h2>
          <button class="modal-btn-fechar" id="modal-btn-fechar" aria-label="Fechar modal">&#x2715;</button>
        </div>

        <!-- Grid de info principal -->
        <div class="modal-info-grid">
          <div class="modal-info-item">
            <div class="modal-info-icon">
            <i class="ti ti-file-description" style="color: #008000"></i>
            </div>
            <div class="modal-info-text">
              <span class="modal-info-label">Nome do evento:</span>
              <span class="modal-info-value" id="modal-nome">—</span>
            </div>
          </div>

          <div class="modal-info-item">
            <div class="modal-info-icon">
            <i class="ti ti-map-pin" style="color: #008000"></i>
            </div>
            <div class="modal-info-text">
              <span class="modal-info-label">Município:</span>
              <span class="modal-info-value" id="modal-municipio">—</span>
            </div>
          </div>

          <div class="modal-info-item">
            <div class="modal-info-icon">
          <i class="ti ti-user-square-rounded" style="color: #008000"></i>            
          </div>
            <div class="modal-info-text">
              <span class="modal-info-label">Classificação etária:</span>
              <span class="modal-info-value" id="modal-classificacao">—</span>
            </div>
          </div>

        </div>

        <!-- Dados Agregados -->
        <div class="modal-dados-agregados">
          <div class="modal-dados-header">
            <div class="modal-dados-header-icon">
              <i class="ti ti-calendar-month" style="color: #008000"></i>
            </div>
            <span class="modal-dados-titulo">Dados detalhados do evento</span>
          </div>

          <table class="modal-dados-table">
            <tbody>
              <tr>
                <td>
                  <span class="td-label">Data Início (Evento):</span>
                  <span class="td-value" id="modal-data-inicio">DD/MM/AAAA</span>
                </td>
                <td>
                  <span class="td-label">Data Final (Evento):</span>
                  <span class="td-value" id="modal-data-final">DD/MM/AAAA</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="td-label">Hora Início (Evento):</span>
                  <span class="td-value" id="modal-hora-inicio">HH:MM</span>
                </td>
                <td>
                  <span class="td-label">Hora Final (Evento):</span>
                  <span class="td-value" id="modal-hora-final">HH:MM</span>
                </td>
              </tr>
              <tr>
                <td colspan="2" class="td-descricao-row">
                  <div class="td-descricao-inner">
                    <div class="modal-dados-header-icon">
                    <i class="ti ti-baseline-density-small" style="color: #008000"></i>
                    </div>
                    <div class="td-descricao-texto">
                      <span class="td-label">Descrição do evento:</span>
                      <span class="td-value" id="modal-descricao"></span>
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

    // ── Preenche o modal com dados do evento ─────────────────────────
    function preencherModal(evento) {
        document.getElementById("modal-evento-titulo").textContent =
            "Detalhes do Evento " + String(evento.id).padStart(2, "0");
        document.getElementById("modal-nome").textContent = evento.nome;
        document.getElementById("modal-municipio").textContent = evento.municipio;
        document.getElementById("modal-classificacao").textContent = evento.classificacao;
        document.getElementById("modal-descricao").textContent = evento.descricao;
        document.getElementById("modal-data-inicio").textContent = evento.dataInicio;
        document.getElementById("modal-data-final").textContent = evento.dataFinal;
        document.getElementById("modal-hora-inicio").textContent = evento.horaInicio;
        document.getElementById("modal-hora-final").textContent = evento.horaFinal;
    }

    // ── Abre / fecha o modal ─────────────────────────────────────────
    function abrirModal(idEvento) {
        const evento = eventosData.find((e) => e.id === idEvento);
        if (!evento) return;

        preencherModal(evento);

        const overlay = document.getElementById("modal-evento");
        overlay.classList.add("ativo");
        document.body.style.overflow = "hidden";

        // foco acessível
        setTimeout(() => {
            const btnFechar = document.getElementById("modal-btn-fechar");
            if (btnFechar) btnFechar.focus();
        }, 50);
    }

    function fecharModal() {
        const overlay = document.getElementById("modal-evento");
        overlay.classList.remove("ativo");
        document.body.style.overflow = "";
    }

    // ── Inicialização ─────────────────────────────────────────────────
    function init() {
        criarModalHTML();

        // Fechar pelo botão X
        document.getElementById("modal-btn-fechar").addEventListener("click", fecharModal);

        // Fechar clicando fora do container
        document.getElementById("modal-evento").addEventListener("click", function (e) {
            if (e.target === this) fecharModal();
        });

        // Fechar com Escape
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") fecharModal();
        });

        // Vincular botões "Visualizar evento" dos cards
        vincularBotoesVisualizacao();
    }

    function vincularBotoesVisualizacao() {
        const cards = document.querySelectorAll(".evento-card");
        cards.forEach((card, index) => {
            const btn = card.querySelector(".btn-visualizar");
            if (!btn) return;

            const idEvento = index + 1; // Evento 01 = id 1, etc.
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                abrirModal(idEvento);
            });
        });
    }

    // Aguarda o DOM estar pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();