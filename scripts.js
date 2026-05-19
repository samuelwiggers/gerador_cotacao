let count = 0;

function addSeg(){
    count++;
    const div = document.createElement('div');

    div.className = 'seg';
    div.innerHTML = `
        <input class="nome" placeholder="Seguradora">
        <input class="valor" placeholder="Valor">
    `;

    document.getElementById('segs').appendChild(div);

    addEvents();
    update();
}

function addEvents(){
    document.querySelectorAll('input, textarea').forEach(el => {
        el.oninput = update;
    });
}

function update(){
    document.getElementById('clientePreview').innerText = document.getElementById('cliente').value || 'Cliente';
    document.getElementById('mensagemPreview').innerText = document.getElementById('mensagem').value;

    const tbody = document.getElementById('tbody');

    tbody.innerHTML = '';
    tbody.style = 'text-align: center'

    const nomes = document.querySelectorAll('.nome');
    const valores = document.querySelectorAll('.valor');

    for(let i = 0; i < nomes.length; i++){
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${nomes[i].value}</td>
            <td>${valores[i].value}</td>
        `;

        tbody.appendChild(tr);
    }
}

document
    .getElementById('logoInput')
    .addEventListener(
        'change',
        function(e){
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload =
                function(event){
                    document.getElementById('logoPreview').src = event.target.result;
                };

            reader.readAsDataURL(file);
        }
    );

async function baixar(){
    const quote = document.getElementById('quote');

    try{
        const canvas =await html2canvas(quote, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff"
        });

        const image =  canvas.toDataURL("image/png");
        const link = document.createElement('a');

        link.href = image;
        link.download = 'cotacao.png';
        link.click();

    }catch(err){
        console.error(err);
        alert('Erro ao gerar imagem');
    }
}

addSeg();
addSeg();