const SEGURADORAS_PADRAO = [
    'Yelum seguros',
    'Mapfre seguros',
    'HDI seguros',
    'Bradesco seguros',
    'Porto seguros',
    'Azul seguros',
    'Allianz seguros'
];

let count = 0;

function formatMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatNumeroBR(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function aplicarMascaraValor(input) {
    const digits = input.value.replace(/\D/g, '');
    input.value = digits ? formatMoeda(parseInt(digits, 10) / 100) : 'R$ ';
}

function aplicarMascaraNumero(input) {
    const digits = input.value.replace(/\D/g, '');
    input.value = digits ? formatNumeroBR(parseInt(digits, 10) / 100) : '';
}

function aplicarMascaraDias(input) {
    input.value = input.value.replace(/\D/g, '');
}

function valorFormatado(texto) {
    const valor = parseValor(texto);
    if (valor === null) return 'R$ ';
    return formatMoeda(valor);
}

function numeroFormatado(texto) {
    if (!texto?.trim()) return '';
    const valor = parseValor(texto);
    if (valor === null) return texto.trim();
    return formatNumeroBR(valor);
}

function parseValor(texto) {
    if (!texto?.trim()) return null;

    const limpo = texto.replace(/[^\d,.-]/g, '').trim();
    if (!limpo) return null;

    const valor = limpo.includes(',')
        ? parseFloat(limpo.replace(/\./g, '').replace(',', '.'))
        : parseFloat(limpo);

    return Number.isFinite(valor) ? valor : null;
}

function setPreviewValor(id, texto) {
    const el = document.getElementById(id);
    const formatado = numeroFormatado(texto);

    el.textContent = formatado ? `${formatado} ` : '';
}

function updatePaginaCoberturas() {
    const seguradoraDestaque = document.getElementById('seguradoraDestaque').value.trim();

    document.getElementById('seguradoraDestaquePreview').textContent =
        seguradoraDestaque || 'Bradesco seguros';

    setPreviewValor('danosCorporaisPreview', document.getElementById('danosCorporais').value);
    setPreviewValor('danosMateriaisPreview', document.getElementById('danosMateriais').value);
    setPreviewValor('passageirosPreview', document.getElementById('passageiros').value);

    const dias = document.getElementById('carroReservaDias').value.trim();
    document.getElementById('carroReservaPreview').textContent = dias ? `${dias} ` : '';

    setPreviewValor('franquiaPreview', document.getElementById('franquia').value);

    const seguradoraCotacao = document.getElementById('seguradoraCotacao').value.trim();
    document.getElementById('seguradoraCotacaoPreview').textContent =
        seguradoraCotacao ? `${seguradoraCotacao} ` : '';

    const valorCotacao = valorFormatado(document.getElementById('valorCotacao').value);
    const valorEl = document.getElementById('valorCotacaoPreview');
    valorEl.textContent = parseValor(document.getElementById('valorCotacao').value) !== null
        ? valorCotacao.replace('R$', '').trim()
        : '';
}

function addSeg(nome = '') {
    count++;
    const div = document.createElement('div');

    div.className = 'seg';
    div.innerHTML = `
        <input class="nome" placeholder="Seguradora" value="${nome}">
        <input class="valor" placeholder="R$ 0,00" value="R$ ">
    `;

    document.getElementById('segs').appendChild(div);

    addEvents();
    update();
}

function addEvents() {
    document.querySelectorAll('input:not(.valor):not(.num-cobertura):not(.valor-cotacao):not(.num-dias), textarea').forEach(el => {
        el.oninput = update;
    });

    document.querySelectorAll('.num-cobertura').forEach(el => {
        el.oninput = (e) => {
            aplicarMascaraNumero(e.target);
            update();
        };
    });

    document.querySelectorAll('.num-dias').forEach(el => {
        el.oninput = (e) => {
            aplicarMascaraDias(e.target);
            update();
        };
    });

    document.querySelectorAll('.valor-cotacao, .valor').forEach(el => {
        el.oninput = (e) => {
            aplicarMascaraValor(e.target);
            update();
        };
    });
}

function getMelhorSeguradora() {
    const nomes = document.querySelectorAll('.nome');
    const valores = document.querySelectorAll('.valor');

    if (!nomes.length) {
        return { todosPreenchidos: false, melhorNome: null };
    }

    let menor = Infinity;
    let melhorNome = null;

    for (let i = 0; i < nomes.length; i++) {
        const nome = nomes[i].value.trim();
        const valor = parseValor(valores[i].value);

        if (!nome || valor === null) {
            return { todosPreenchidos: false, melhorNome: null };
        }

        if (valor < menor) {
            menor = valor;
            melhorNome = nome;
        }
    }

    return { todosPreenchidos: true, melhorNome, melhorValor: menor };
}

function aplicarMelhorCotacao({ todosPreenchidos, melhorNome, melhorValor }) {
    const seguradoraDestaqueInput = document.getElementById('seguradoraDestaque');
    const seguradoraInput = document.getElementById('seguradoraCotacao');
    const valorInput = document.getElementById('valorCotacao');

    if (!todosPreenchidos || !melhorNome || melhorValor === null) return;

    if (document.activeElement !== seguradoraDestaqueInput) {
        seguradoraDestaqueInput.value = melhorNome;
    }

    if (document.activeElement !== seguradoraInput) {
        seguradoraInput.value = melhorNome;
    }

    if (document.activeElement !== valorInput) {
        valorInput.value = formatMoeda(melhorValor);
    }
}

function update() {
    const cliente = document.getElementById('cliente').value || 'Cliente';
    const mensagem = document.getElementById('mensagem').value;

    document.querySelectorAll('.cliente-preview').forEach(el => {
        el.innerText = cliente;
    });

    document.querySelectorAll('.mensagem-preview').forEach(el => {
        el.textContent = mensagem;
        el.hidden = !mensagem.trim();
    });

    const tbody = document.getElementById('tbody');

    tbody.innerHTML = '';
    tbody.style = 'text-align: center';

    const nomes = document.querySelectorAll('.nome');
    const valores = document.querySelectorAll('.valor');

    const linhas = Array.from(nomes, (nome, i) => ({
        nome: nome.value,
        valorTexto: valores[i].value,
        valor: parseValor(valores[i].value)
    }));

    linhas.sort((a, b) => {
        if (a.valor === null && b.valor === null) return 0;
        if (a.valor === null) return 1;
        if (b.valor === null) return -1;
        return a.valor - b.valor;
    });

    for (const linha of linhas) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${linha.nome}</td>
            <td>${valorFormatado(linha.valorTexto)}</td>
        `;

        tbody.appendChild(tr);
    }

    const resultado = getMelhorSeguradora();

    aplicarMelhorCotacao(resultado);
    updatePaginaCoberturas();
}

document.getElementById('logoInput').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        document.querySelectorAll('.logo-preview').forEach(img => {
            img.src = event.target.result;
        });
    };

    reader.readAsDataURL(file);
});

async function baixar() {
    const paginas = document.querySelectorAll('.quote');

    try {
        for (let i = 0; i < paginas.length; i++) {
            const canvas = await html2canvas(paginas[i], {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');

            link.href = canvas.toDataURL('image/png');
            link.download = `cotacao-pagina-${i + 1}.png`;
            link.click();

            if (i < paginas.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 400));
            }
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao gerar imagem');
    }
}

SEGURADORAS_PADRAO.forEach(nome => addSeg(nome));
addEvents();
update();
