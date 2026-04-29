// Iniciamos sem ID fixo para não gerar lixo no LocalStorage ao abrir a página
let notaAtualId = localStorage.getItem('nota_ativa_id');

const espc_nota = document.querySelector('.escrev');

window.onload = function() {
    renderizarTodasNotas();
    
    // Só carrega se houver um rascunho ativo real
    if (notaAtualId) {
        const rascunho = buscarNota(notaAtualId);
        if (rascunho) {
            document.getElementById('tt_nota').value = rascunho.titulo;
            document.getElementById('nota').value = rascunho.texto;
        }
    }
};

// ESSA FUNÇÃO É O QUE O BOTÃO DE ÍCONE CHAMA
function prepararNovaNota() {
    // Geramos o ID APENAS quando o usuário decide criar uma nota
    notaAtualId = Date.now(); 
    localStorage.setItem('nota_ativa_id', notaAtualId);
    
    // Limpa os campos para a nova nota
    document.getElementById('tt_nota').value = "";
    document.getElementById('nota').value = "";
    
    // Abre o painel
    if (espc_nota.style.display === 'none' || espc_nota.style.display === '') {
        espc_nota.style.display = 'flex';
    }
}

function atualizar() {
    // Se por algum motivo não houver ID (ex: usuário começou a digitar sem clicar no botão +)
    if (!notaAtualId) {
        notaAtualId = Date.now();
        localStorage.setItem('nota_ativa_id', notaAtualId);
    }

    const titulo = document.getElementById('tt_nota').value;
    const texto = document.getElementById('nota').value;

    // Se apagar tudo, podemos manter o ID mas não salva no array se preferir, 
    // mas aqui vamos salvar para manter o "vincular" automático
    salvarNoArray(notaAtualId, titulo, texto);
    renderizarTodasNotas();
}

function salvarNoArray(id, titulo, texto) {
    let notas = JSON.parse(localStorage.getItem('minhas_notas')) || [];
    const index = notas.findIndex(n => n.id == id);
    const agora = new Date().toISOString();
    if (index > -1) {
        notas[index].titulo=titulo;
        notas[index].texto=texto;
        notas[index].dataEdicao = agora;
    }
    else {
        const dadosNota = { 
                id: id, 
                titulo: titulo, 
                texto: texto, 
                dataCriacao : agora,
                dataEdicao: agora
            };
            notas.push(dadosNota);


    }
    

   /* if (index > -1) {
        notas[index] = dadosNota;
    } else {
        notas.push(dadosNota);
    }*/

    localStorage.setItem('minhas_notas', JSON.stringify(notas));
}

function renderizarTodasNotas() {
    const notas = JSON.parse(localStorage.getItem('minhas_notas')) || [];
    const destino = document.getElementById('salva_nota');
    if(!destino) return;
    destino.innerHTML = "";
    const formatar = (iso) =>{
        if(!iso) return "?";
        const d= new Date (iso);
        const min= d.getMinutes().toString().padStart(2,'0');
        const hora= d.getHours().toString().padStart(2,'0');
        return `${d.getDate()}/${d.getMonth() + 1} às ${hora}: ${min}`;
    }

    // Inverte para a nota mais nova aparecer primeiro
    [...notas].reverse().forEach(n => {
        // Destaque para a nota que está aberta agora
        const classeAtiva = n.id == notaAtualId ? "card-ativo" : "";
        
       
       // Substitua o trecho de destino.innerHTML dentro do seu forEach por este:
    // Dentro do seu forEach na função renderizarTodasNotas:
    destino.innerHTML += `
        <div class="card-nota ${classeAtiva}" onclick="carregarParaEditar(${n.id})">
            
            <div class="card-header">
                <h3 class="card-title">${n.titulo || "Sem título"}</h3>
                
                <div class="menu-container">
                    <button class="btn-opcoes" onclick="toggleMenu(event, ${n.id})">···</button>
                    
                    <div id="menu-${n.id}" class="menu-dropdown" style="display: none;">
                        <button onclick="carregarParaEditar(${n.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                            Abrir anotação
                        </button>
                        <button class="btn-excluir" onclick="confirmarExclusao(event, ${n.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Excluir anotação
                        </button>
                    </div>
                </div>
            </div>

            <div class="card-content">
                <p class="card-body">${n.texto || ""}</p>
            </div>
            
            <div class="card-footer">
                <span>Criada: ${formatar(n.dataCriacao)}</span> <br>
                <span>Editada: ${formatar(n.dataEdicao)}</span>
            </div>
        </div>
    `;
    });
}

function carregarParaEditar(id) {//pega a nota em que o usuario clicar
    notaAtualId = id;
    localStorage.setItem('nota_ativa_id', id);
    const nota = buscarNota(id);
    
    if (nota) {
        document.getElementById('tt_nota').value = nota.titulo;
        document.getElementById('nota').value = nota.texto;
        espc_nota.style.display = 'flex';
    }
}

function alternarMenuNota() {
    espc_nota.style.display = (espc_nota.style.display === 'none' || espc_nota.style.display === '') ? 'flex' : 'none';
}

function buscarNota(id) {
    const notas = JSON.parse(localStorage.getItem('minhas_notas')) || [];
    return notas.find(n => n.id == id);
}
/*funcão de deleta */
function toggleMenu(event, id) {
    event.stopPropagation(); // Evita que a nota abra ao clicar nos pontinhos
    
    // Fecha outros menus abertos
    document.querySelectorAll('.menu-dropdown').forEach(m => {
        if(m.id !== `menu-${id}`) m.style.display = 'none';
    });

    const menu = document.getElementById(`menu-${id}`);
    menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
}

function confirmarExclusao(event, id) {
    event.stopPropagation();
    if (confirm("Tem certeza que deseja apagar esta nota?")) {
        let notas = JSON.parse(localStorage.getItem('minhas_notas')) || [];
        notas = notas.filter(n => n.id != id);
        localStorage.setItem('minhas_notas', JSON.stringify(notas));
        
        if (notaAtualId == id) {
            notaAtualId = null;
            localStorage.removeItem('nota_ativa_id');
            document.getElementById('tt_nota').value = "";
            document.getElementById('nota').value = "";
        }
        renderizarTodasNotas();
    }
}