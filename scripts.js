const SEGURADORAS_PADRAO = [
    'Yelum seguros',
    'Mapfre seguros',
    'HDI seguros',
    'Bradesco seguros',
    'Porto seguros',
    'Azul seguros',
    'Allianz seguros'
];

const COBERTURAS_PADRAO = [
    'BASICA - 01-COMPREENSIVA',
    'RESP CIVIL FACULTATIVA VEÍCULOS - DANOS MATERIAIS',
    'RESP CIVIL FACULTATIVA VEÍCULOS - DANOS CORPORAIS',
    'RESP CIVIL FACULTATIVA VEÍCULOS - DANOS MORAIS E ESTÉTICOS',
    'ACIDENTES PESSOAIS PASSAGEIROS - LMI POR PASSAGEIRO - MORTE',
    'ACIDENTES PESSOAIS PASSAGEIROS - LMI POR PASSAGEIRO - INVALIDEZ PERMANENTE',
    'CARTA VERDE - DANOS MATERIAIS',
    'CARTA VERDE - MORTE E/OU DANOS PESSOAIS',
    'CARRO RESERVA - 15 DIAS BÁSICO',
    'ASSISTENCIA - SUPERIOR',
    'PROTECAO PEQUENOS REPAROS',
    'VIDROS - SUPERIOR'
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

function aplicarMascaraLmi(input) {
    if (/[a-zA-Z]/.test(input.value)) return;

    const digits = input.value.replace(/\D/g, '');
    input.value = digits ? formatNumeroBR(parseInt(digits, 10) / 100) : '';
}

function valorFormatado(texto) {
    const valor = parseValor(texto);
    if (valor === null) return 'R$ ';
    return formatMoeda(valor);
}

function lmiFormatado(texto) {
    if (!texto?.trim()) return '';

    const valor = parseValor(texto);
    if (valor === null) return texto.trim();

    return formatNumeroBR(valor);
}

function addCobertura(nome = '', lmi = '') {
    const div = document.createElement('div');

    div.className = 'cobertura';
    div.innerHTML = `
        <input class="cob-nome" placeholder="Cobertura" value="${nome}">
        <input class="cob-lmi" placeholder="LMI (R$)" value="${lmi}">
    `;

    document.getElementById('coberturas').appendChild(div);

    addEvents();
    update();
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
    document.querySelectorAll('input:not(.valor):not(.cob-nome):not(.cob-lmi), textarea').forEach(el => {
        el.oninput = update;
    });

    document.querySelectorAll('.cob-nome').forEach(el => {
        el.oninput = update;
    });

    document.querySelectorAll('.cob-lmi').forEach(el => {
        el.oninput = (e) => {
            aplicarMascaraLmi(e.target);
            update();
        };
    });

    document.querySelectorAll('.valor').forEach(el => {
        el.oninput = (e) => {
            aplicarMascaraValor(e.target);
            update();
        };
    });
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

    return { todosPreenchidos: true, melhorNome };
}

function updateMetaSeguro() {
    const classeBonus = document.getElementById('classeBonus').value.trim();
    const renovApolice = document.getElementById('renovaApolice').value.trim();
    const vigencia = document.getElementById('vigencia').value.trim();
    const metaEl = document.getElementById('metaSeguroPreview');
    const classeEl = document.getElementById('classeBonusPreview');
    const renovaEl = document.getElementById('renovaApolicePreview');
    const vigenciaEl = document.getElementById('vigenciaPreview');

    classeEl.textContent = classeBonus ? `Classe de Bônus: ${classeBonus}` : '';
    renovaEl.textContent = renovApolice ? `Renova Apólice nº/Cia: ${renovApolice}` : '';
    vigenciaEl.textContent = vigencia ? `Vigência: ${vigencia}` : '';

    classeEl.hidden = !classeBonus;
    renovaEl.hidden = !renovApolice;
    vigenciaEl.hidden = !vigencia;
    metaEl.hidden = !classeBonus && !renovApolice && !vigencia;
}

function updateCoberturas() {
    const tbody = document.getElementById('coberturasPreview');
    const nomes = document.querySelectorAll('.cob-nome');
    const lmis = document.querySelectorAll('.cob-lmi');

    tbody.innerHTML = '';

    for (let i = 0; i < nomes.length; i++) {
        const nome = nomes[i].value.trim();
        const lmi = lmis[i].value.trim();

        if (!nome && !lmi) continue;

        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${nome}</td>
            <td>${lmiFormatado(lmis[i].value)}</td>
        `;

        tbody.appendChild(tr);
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

    updateCoberturas();
    updateMetaSeguro();

    const tbody = document.getElementById('tbody');
    const melhorInput = document.getElementById('melhorValor');

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

    const { todosPreenchidos, melhorNome } = getMelhorSeguradora();

    if (document.activeElement !== melhorInput) {
        if (todosPreenchidos && melhorNome) {
            melhorInput.value = `Menor valor encontrado: ${melhorNome}`;
        } else {
            melhorInput.value = '';
        }
    }

    document.querySelectorAll('.melhor-preview').forEach(el => {
        el.textContent = melhorInput.value;
        el.hidden = !melhorInput.value.trim();
    });
}

document
    .getElementById('logoInput')
    .addEventListener(
        'change',
        function (e) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload =
                function (event) {
                    document.querySelectorAll('.logo-preview').forEach(img => {
                        img.src = event.target.result;
                    });
                };

            reader.readAsDataURL(file);
        }
    );

async function baixar() {
    const paginas = document.querySelectorAll('.quote');

    try {
        for (let i = 0; i < paginas.length; i++) {
            const canvas = await html2canvas(paginas[i], {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff"
            });

            const link = document.createElement('a');

            link.href = canvas.toDataURL("image/png");
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
COBERTURAS_PADRAO.forEach(nome => addCobertura(nome));
