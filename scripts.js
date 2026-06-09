const SEGURADORAS_PADRAO = [
    'Yelum seguros',
    'Mapfre seguros',
    'HDI seguros',
    'Bradesco seguros',
    'Porto seguros',
    'Azul seguros',
    'Allianz seguros',
    'Zurich seguros',
    'Tokio Marine seguros',
];

const LOGOS_SEGURADORAS = [
    { keys: ['yelum'], path: 'logos/yelum-seguros.png' },
    { keys: ['mapfre'], path: 'logos/mapfre-seguros.png' },
    { keys: ['hdi'], path: 'logos/hdi-seguros.png' },
    { keys: ['bradesco'], path: 'logos/bradesco.png' },
    { keys: ['porto'], path: 'logos/porto-seguro-novo-logo.png' },
    { keys: ['azul'], path: 'logos/azul-seguros.png' },
    { keys: ['allianz'], path: 'logos/allianz-seguros.png' },
    { keys: ['zurich'], path: 'logos/zurich-seguros.png' },
    { keys: ['tokio'], path: 'logos/tokio-marine-seguros.png' }
];

function logoSeguradora(nome) {
    const normalizado = nome.toLowerCase();
    const entrada = LOGOS_SEGURADORAS.find(({ keys }) =>
        keys.some(chave => normalizado.includes(chave))
    );

    return entrada?.path ?? null;
}

function celulaSeguradora(nome) {
    const logo = logoSeguradora(nome);

    if (!logo) {
        return nome;
    }

    return `
        <span class="seguradora-celula">
            <img class="seg-logo" src="${logo}" alt="">
            <span>${nome}</span>
        </span>
    `;
}

let count = 0;

function preloadLogosSeguradoras() {
    for (const { path } of LOGOS_SEGURADORAS) {
        if (!path) continue;
        const img = new Image();
        img.src = path;
    }
}

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
            <td>${celulaSeguradora(linha.nome)}</td>
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

const QUOTE_WIDTH = 390;
const QUOTE_SCALE = 2.5;

function preloadImagens(container) {
    const imagens = container.querySelectorAll('img');

    return Promise.all([...imagens].map(img => {
        if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

async function salvarArquivo(blob, filename) {
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: filename });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    const url = URL.createObjectURL(blob);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIOS) {
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return;
    }

    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function baixarArquivoDireto(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

let modalUrls = [];

function fecharModalDownload() {
    document.getElementById('modalDownload').hidden = true;
    document.getElementById('modalDownloadLista').innerHTML = '';

    for (const url of modalUrls) {
        URL.revokeObjectURL(url);
    }

    modalUrls = [];
}

function mostrarModalDownload(arquivos) {
    const lista = document.getElementById('modalDownloadLista');
    const modal = document.getElementById('modalDownload');

    lista.innerHTML = '';
    modalUrls = [];

    for (let i = 0; i < arquivos.length; i++) {
        const { blob, filename } = arquivos[i];
        const url = URL.createObjectURL(blob);

        modalUrls.push(url);

        const item = document.createElement('div');
        item.className = 'modal-download__item';

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Página ${i + 1}`;

        const botao = document.createElement('button');
        botao.type = 'button';
        botao.textContent = `Salvar página ${i + 1}`;
        botao.onclick = () => salvarArquivo(blob, filename);

        item.append(img, botao);
        lista.appendChild(item);
    }

    modal.hidden = false;
}

async function entregarArquivos(arquivos) {
    const files = arquivos.map(({ blob, filename }) =>
        new File([blob], filename, { type: 'image/png' })
    );
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare?.({ files })) {
        try {
            await navigator.share({ files, title: 'Cotação' });
            return;
        } catch (err) {
            if (err.name === 'AbortError') return;
        }
    }

    if (isMobile) {
        mostrarModalDownload(arquivos);
        return;
    }

    for (const { blob, filename } of arquivos) {
        baixarArquivoDireto(blob, filename);
        await new Promise(resolve => setTimeout(resolve, 400));
    }
}

async function capturarPagina(pagina) {
    pagina.scrollIntoView({ block: 'center', inline: 'nearest' });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    await preloadImagens(pagina);
    await document.fonts?.ready;

    const largura = pagina.offsetWidth;
    const altura = pagina.offsetHeight;

    return html2canvas(pagina, {
        scale: QUOTE_SCALE,
        width: largura,
        height: altura,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#181a1b',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: largura,
        windowHeight: altura
    });
}

async function baixar() {
    const paginas = document.querySelectorAll('.quote');
    const botao = document.querySelector('.btn-download');

    if (!paginas.length) return;

    botao.disabled = true;
    botao.textContent = 'Gerando imagens...';

    try {
        const arquivos = [];

        for (let i = 0; i < paginas.length; i++) {
            botao.textContent = `Gerando página ${i + 1}/${paginas.length}...`;

            const canvas = await capturarPagina(paginas[i]);
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

            if (!blob) {
                throw new Error('Falha ao gerar imagem');
            }

            arquivos.push({
                blob,
                filename: `cotacao-pagina-${i + 1}.png`
            });
        }

        await entregarArquivos(arquivos);
    } catch (err) {
        console.error(err);
        alert(err.name === 'AbortError' ? 'Download cancelado' : 'Erro ao gerar imagem');
    } finally {
        botao.disabled = false;
        botao.textContent = 'Baixar Imagens (2 páginas)';
    }
}

SEGURADORAS_PADRAO.forEach(nome => addSeg(nome));
preloadLogosSeguradoras();
addEvents();
update();
