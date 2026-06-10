const URL_GERENCIAR_FUNCIONARIO = '/gerenciar-funcionario';

/* ====================================================
   Helpers de sessão
==================================================== */
function obterIdEmpresa() {
  return sessionStorage.ID_EMPRESA;
}

/* ====================================================
   Tabela
==================================================== */
function mostrarMensagemTabela(mensagem) {
  const corpoTabela = document.getElementById('tabela_corpo');
  corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#9ca3af; padding:2rem;">${mensagem}</td></tr>`;
}

function formatarNivelAcesso(nivelAcesso) {
  const niveis = {
    1: 'Gerente',
    2: 'Analista Sênior',
    3: 'Analista',
    4: 'Empresa Plustourists',
  };
  return niveis[nivelAcesso] ?? nivelAcesso ?? '-';
}

function plotarTabela(listaFuncionarios) {
  const corpoTabela = document.getElementById('tabela_corpo');
  corpoTabela.innerHTML = '';

  if (!listaFuncionarios || listaFuncionarios.length === 0) {
    mostrarMensagemTabela('Nenhum funcionário encontrado.');
    return;
  }

  listaFuncionarios.forEach((funcionario) => {
    const novaLinha = document.createElement('tr');
    novaLinha.classList.add('table-content');

    novaLinha.innerHTML = `
            <td>${funcionario.id_funcionario}</td>
            <td>${funcionario.nome}</td>
            <td>${funcionario.cpf}</td>
            <td>${funcionario.email}</td>
            <td>${formatarNivelAcesso(funcionario.nivel_acesso)}</td>
            <td>
                <button class="table-action edit" type="button"
                    onclick="abrirModalEdicao(${funcionario.id_funcionario})">
                    <i class="ti ti-user-edit" style="color: white"></i>
                    Editar
                </button>
            </td>
            <td>
                <button class="table-action delete" type="button"
                    onclick="abrirModalExclusao(${funcionario.id_funcionario}, '${funcionario.nome.replace(/'/g, "\\'")}')">
                    <i class="ti ti-trash-x" style="color: white"></i>
                    Excluir
                </button>
            </td>
        `;

    corpoTabela.appendChild(novaLinha);
  });
}

async function listarUsuarios() {
  const idEmpresa = obterIdEmpresa();

  if (!idEmpresa) {
    mostrarMensagemTabela('Sem ID da empresa na sessão. Faça login novamente.');
    console.error('Sem ID_EMPRESA no sessionStorage.');
    return;
  }

  try {
    const resposta = await fetch(`${URL_GERENCIAR_FUNCIONARIO}/listar?idEmpresa=${idEmpresa}`);

    if (resposta.status === 204) {
      mostrarMensagemTabela('Nenhum funcionário encontrado.');
      return;
    }

    if (!resposta.ok) throw new Error('Erro ao buscar funcionários.');

    const funcionarios = await resposta.json();
    plotarTabela(funcionarios);
  } catch (erro) {
    mostrarMensagemTabela('Erro ao carregar funcionários.');
    console.error('Erro na requisição:', erro);
  }
}

async function pesquisar() {
  const idEmpresa = obterIdEmpresa();
  const pesquisa = document.getElementById('pesquisarVAR').value.trim();

  if (!pesquisa) {
    listarUsuarios();
    return;
  }

  if (!idEmpresa) {
    mostrarMensagemTabela('Sem ID da empresa na sessão. Faça login novamente.');
    return;
  }

  try {
    const parametros = new URLSearchParams({ idEmpresa, pesquisa });
    const resposta = await fetch(`${URL_GERENCIAR_FUNCIONARIO}/pesquisar?${parametros}`);

    if (!resposta.ok) throw new Error('Erro ao pesquisar funcionários.');

    const funcionarios = await resposta.json();
    plotarTabela(funcionarios);
  } catch (erro) {
    mostrarMensagemTabela('Erro ao pesquisar funcionários.');
    console.error('Erro na pesquisa:', erro);
  }
}

/* ====================================================
   Helpers de modal
==================================================== */
function abrirModal(id) {
  document.getElementById(id).classList.add('active');
}

function fecharModal(id) {
  document.getElementById(id).classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) fecharModal(overlay.id);
    });
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach((el) => {
      el.classList.remove('active');
    });
  }
});

/* ====================================================
   Modal de Cadastro
   Backend espera: nome, CPF, email, senha, idEmpresa, idNivelAcesso
==================================================== */
function abrirModalCadastro() {
  ['cad_nome', 'cad_cpf', 'cad_email', 'cad_senha', 'cad_nivel'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  abrirModal('modalCadastro');
}

async function salvarCadastro() {
  const nome = document.getElementById('cad_nome').value.trim();
  const CPF = document.getElementById('cad_cpf').value.replace(/\D/g, '');
  const email = document.getElementById('cad_email').value.trim();
  const senha = document.getElementById('cad_senha').value;
  const idNivelAcesso = document.getElementById('cad_nivel').value;
  const idEmpresa = obterIdEmpresa();

  if (!nome || !CPF || !email || !senha || !idNivelAcesso) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  // Exatamente os nomes que o controller desestrutura no req.body
  const dados = { nome, CPF, email, senha, idEmpresa, idNivelAcesso };

  try {
    const resposta = await fetch(`${URL_GERENCIAR_FUNCIONARIO}/cadastrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.mensagem || 'Erro ao cadastrar funcionário.');
    }

    fecharModal('modalCadastro');
    listarUsuarios();
  } catch (erro) {
    alert('Não foi possível cadastrar o funcionário: ' + erro.message);
    console.error('Erro ao cadastrar:', erro);
  }
}

/* ====================================================
   Modal de Edição
   Busca via: GET /listar?idFuncionario=X  (retorna array, pega [0])
   Salva via: POST /atualizar
   Backend espera: idFuncionario, nome, CPF, email, senha, idNivelAcesso
==================================================== */
async function abrirModalEdicao(idFuncionario) {
  try {
    // O backend reutiliza /listar com idFuncionario na query
    const resposta = await fetch(
      `${URL_GERENCIAR_FUNCIONARIO}/listar?idFuncionario=${idFuncionario}`
    );

    if (!resposta.ok) throw new Error('Erro ao buscar dados do funcionário.');

    // buscarPorId retorna array — pega o primeiro item
    const lista = await resposta.json();
    const funcionario = Array.isArray(lista) ? lista[0] : lista;

    if (!funcionario) {
      alert('Funcionário não encontrado.');
      return;
    }

    document.getElementById('edit_id').value = funcionario.id_funcionario;
    document.getElementById('edit_nome').value = funcionario.nome ?? '';
    document.getElementById('edit_cpf').value = funcionario.cpf ?? '';
    document.getElementById('edit_email').value = funcionario.email ?? '';
    document.getElementById('edit_nivel').value = funcionario.nivel_acesso ?? '';
    document.getElementById('edit_senha').value = '';

    abrirModal('modalEdicao');
  } catch (erro) {
    alert('Não foi possível carregar os dados do funcionário.');
    console.error('Erro ao buscar funcionário:', erro);
  }
}

async function salvarEdicao() {
  const idFuncionario = document.getElementById('edit_id').value;
  const nome = document.getElementById('edit_nome').value.trim();
  const CPF = document.getElementById('edit_cpf').value.replace(/\D/g, '');
  const email = document.getElementById('edit_email').value.trim();
  const senha = document.getElementById('edit_senha').value || '';
  const idNivelAcesso = document.getElementById('edit_nivel').value;

  if (!nome || !CPF || !email || !idNivelAcesso) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  // Exatamente os nomes que o controller desestrutura no req.body
  const dados = { idFuncionario, nome, CPF, email, senha, idNivelAcesso };

  try {
    // Rota é POST no backend, não PUT
    const resposta = await fetch(`${URL_GERENCIAR_FUNCIONARIO}/atualizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.mensagem || 'Erro ao atualizar funcionário.');
    }

    fecharModal('modalEdicao');
    listarUsuarios();
  } catch (erro) {
    alert('Não foi possível atualizar o funcionário: ' + erro.message);
    console.error('Erro ao editar:', erro);
  }
}

/* ====================================================
   Modal de Exclusão
   Rota é GET no backend: /deletar?idFuncionario=X
==================================================== */
function abrirModalExclusao(idFuncionario, nomeFuncionario) {
  document.getElementById('excluir_id').value = idFuncionario;
  document.getElementById('excluir_nome').textContent = nomeFuncionario;
  abrirModal('modalExclusao');
}

async function confirmarExclusao() {
  const idFuncionario = document.getElementById('excluir_id').value;

  try {
    // Rota é GET no backend, não DELETE
    const resposta = await fetch(
      `${URL_GERENCIAR_FUNCIONARIO}/deletar?idFuncionario=${idFuncionario}`
    );

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}));
      throw new Error(erro.mensagem || 'Erro ao excluir funcionário.');
    }

    fecharModal('modalExclusao');
    listarUsuarios();
  } catch (erro) {
    alert('Não foi possível excluir o funcionário: ' + erro.message);
    console.error('Erro ao deletar:', erro);
  }
}

function limparSessaoGerenciamento() {
  sessionStorage.clear();
  window.location = '../../login.html';
}

/* ====================================================
   Init
==================================================== */
window.addEventListener('load', listarUsuarios);
