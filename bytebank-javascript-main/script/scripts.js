import selecionaCotacao from "./imprimeCotacao.js";

let workerPersonalizado = ""
let graficoParaPersonalizado
const divPersonalizado = document.getElementById('divPersonalizado')
const getGraficoPersonalizado = document.getElementById('graficoPersonalizado')

inserirSelect()

let pMoeda = document.getElementById("pMoeda")
let sMoeda = document.getElementById("sMoeda")

pMoeda.addEventListener('change', ()=>{
  if(pMoeda.value != "" && sMoeda.value != ""){
    graficoPersonalizado(pMoeda.value, pMoeda.options[pMoeda.selectedIndex].textContent, sMoeda.value, sMoeda.options[sMoeda.selectedIndex].textContent)
  }
})
sMoeda.addEventListener('change', ()=>{
  if(pMoeda.value != "" && sMoeda.value != ""){
    graficoPersonalizado(pMoeda.value, pMoeda.options[pMoeda.selectedIndex].textContent, sMoeda.value, sMoeda.options[sMoeda.selectedIndex].textContent)
  }
})

// iniciar grafico de Dolar
const graficoDolar = document.getElementById('graficoDolar')

const graficoParaDolar = new Chart(graficoDolar, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Dolar',
      data: [],
      borderWidth: 1
    }]
  },
});

// iniciar worker de Dolar
let workerDolar = new Worker('./script/workers/workerDolar.js')
workerDolar.postMessage('usd')

// receber dados do worker Dolar e inserir no grafico de Dolar
workerDolar.addEventListener("message", event => {
  let tempo = geraHorario()
  let valor = event.data.ask
  selecionaCotacao("dolar", valor)
  adicionarDados(graficoParaDolar, tempo, valor)
})

// iniciar grafico de Iene
const graficoIene = document.getElementById('graficoIene')
const graficoParaIene = new Chart(graficoIene, {
  type: 'line',
  data: {
    label: [],
    datasets: [{
      label: 'Iene',
      data: [],
      borderWidth: 1
    }]
  }
})

// iniciar worker de Iene
let workerIene = new Worker('./script/workers/workerIene.js')
workerIene.postMessage("iene")

// receber dados do worker Iene e inserir no grafico de Iene
workerIene.addEventListener("message", event => {
  let tempo = geraHorario()
  let valor = event.data.ask
  adicionarDados(graficoParaIene, tempo, valor)
  selecionaCotacao('iene', valor)
})

async function graficoPersonalizado(pSigla, pNome, sSigla, sNome){
  // cria o worker
  if(workerPersonalizado == ""){
    workerPersonalizado = new Worker('./script/workers/workerPersonalizado.js')
  }else{
    // caso ja tenha tenha começado anteriromente, deve ser finalizado
    workerPersonalizado.postMessage({action: "finalizar"})
    await waitForWorkerMessage(workerPersonalizado, "finalizado")
    workerPersonalizado.terminate()
    workerPersonalizado = new Worker('./script/workers/workerPersonalizado.js')
    graficoParaPersonalizado.destroy()
  }
  
  // iniciar grafico de Personalizado


  graficoParaPersonalizado = new Chart(getGraficoPersonalizado, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: `${pNome} em relação ao ${sNome}`,
        data: [],
        borderWidth: 1
      }]
    },
  });

  // iniciar worker de Personalizado
  workerPersonalizado.postMessage({pSigla,sSigla, action: "iniciar"})
  mostrarDiv(divPersonalizado)
  // receber dados do worker Personalizado e inserir no grafico de Personalizado
  workerPersonalizado.addEventListener("message", event => {
    if(event.data != 404){
      let tempo = geraHorario()
      let valor = event.data.ask
      adicionarDados(graficoParaPersonalizado, tempo, valor)
      selecionaCotacao('personalizado', valor)
    }else{
      esconderDiv(divPersonalizado)
      workerPersonalizado = ""
      graficoParaPersonalizado.destroy()
      alert('Ops!! Parece que essa moeda esta indisponivel no momento :(\n Tente novamente mais tarde')
      return false
    }
  })

  
}

function waitForWorkerMessage(worker, action) {
  return new Promise((resolve, reject) => {
    const handleMessage = (event) => {
      if (event.data.action === action) {
        worker.removeEventListener('message', handleMessage);
        resolve(event.data);
      }
    };

    const handleError = (error) => {
      worker.removeEventListener('error', handleError);
      reject(error);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);
  });
}

function geraHorario(){
  let data = new Date()
  let horario = data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds()
  return horario
}

function adicionarDados(grafico, legenda, dados){
  grafico.data.labels.push(legenda)
  grafico.data.datasets.forEach((dataset) =>{
    dataset.data.push(dados)
  })
  grafico.update()
}

function mostrarDiv(div){
  div.style.display = 'block'
}
function esconderDiv(div){
  div.style.display = 'none'
}

function inserirSelect(){
  let moedasDisponiveis = {
    "AED": "Dirham dos Emirados",
    "AFN": "Afghani do Afeganistão",
    "ALL": "Lek Albanês",
    "AMD": "Dram Armênio",
    "ANG": "Guilder das Antilhas",
    "AOA": "Kwanza Angolano",
    "ARS": "Peso Argentino",
    "AUD": "Dólar Australiano",
    "AZN": "Manat Azeri",
    "BAM": "Marco Conversível",
    "BBD": "Dólar de Barbados",
    "BDT": "Taka de Bangladesh",
    "BGN": "Lev Búlgaro",
    "BHD": "Dinar do Bahrein",
    "BIF": "Franco Burundinense",
    "BND": "Dólar de Brunei",
    "BOB": "Boliviano",
    "BRL": "Real Brasileiro",
    "BRLT": "Real Brasileiro Turismo",
    "BSD": "Dólar das Bahamas",
    "BTC": "Bitcoin",
    "BWP": "Pula de Botswana",
    "BYN": "Rublo Bielorrusso",
    "BZD": "Dólar de Belize",
    "CAD": "Dólar Canadense",
    "CHF": "Franco Suíço",
    "CHFRTS": "Franco Suíço",
    "CLP": "Peso Chileno",
    "CNH": "Yuan chinês offshore",
    "CNY": "Yuan Chinês",
    "COP": "Peso Colombiano",
    "CRC": "Colón Costarriquenho",
    "CUP": "Peso Cubano",
    "CVE": "Escudo cabo-verdiano",
    "CZK": "Coroa Checa",
    "DJF": "Franco do Djubouti",
    "DKK": "Coroa Dinamarquesa",
    "DOGE": "Dogecoin",
    "DOP": "Peso Dominicano",
    "DZD": "Dinar Argelino",
    "EGP": "Libra Egípcia",
    "ETB": "Birr Etíope",
    "ETH": "Ethereum",
    "EUR": "Euro",
    "FJD": "Dólar de Fiji",
    "GBP": "Libra Esterlina",
    "GEL": "Lari Georgiano",
    "GHS": "Cedi Ganês",
    "GMD": "Dalasi da Gâmbia",
    "GNF": "Franco de Guiné",
    "GTQ": "Quetzal Guatemalteco",
    "HKD": "Dólar de Hong Kong",
    "HNL": "Lempira Hondurenha",
    "HRK": "Kuna Croata",
    "HTG": "Gourde Haitiano",
    "HUF": "Florim Húngaro",
    "IDR": "Rupia Indonésia",
    "ILS": "Novo Shekel Israelense",
    "INR": "Rúpia Indiana",
    "IQD": "Dinar Iraquiano",
    "IRR": "Rial Iraniano",
    "ISK": "Coroa Islandesa",
    "JMD": "Dólar Jamaicano",
    "JOD": "Dinar Jordaniano",
    "JPY": "Iene Japonês",
    "JPYRTS": "Iene Japonês",
    "KES": "Shilling Queniano",
    "KGS": "Som Quirguistanês",
    "KHR": "Riel Cambojano",
    "KMF": "Franco Comorense",
    "KRW": "Won Sul-Coreano",
    "KWD": "Dinar Kuwaitiano",
    "KYD": "Dólar das Ilhas Cayman",
    "KZT": "Tengue Cazaquistanês",
    "LAK": "Kip Laosiano",
    "LBP": "Libra Libanesa",
    "LKR": "Rúpia de Sri Lanka",
    "LSL": "Loti do Lesoto",
    "LTC": "Litecoin",
    "LYD": "Dinar Líbio",
    "MAD": "Dirham Marroquino",
    "MDL": "Leu Moldavo",
    "MGA": "Ariary Madagascarense",
    "MKD": "Denar Macedônio",
    "MMK": "Kyat de Mianmar",
    "MNT": "Mongolian Tugrik",
    "MOP": "Pataca de Macau",
    "MRO": "Ouguiya Mauritana",
    "MUR": "Rúpia Mauriciana",
    "MVR": "Rufiyaa Maldiva",
    "MWK": "Kwacha Malauiana",
    "MXN": "Peso Mexicano",
    "MYR": "Ringgit Malaio",
    "MZN": "Metical de Moçambique",
    "NAD": "Dólar Namíbio",
    "NGN": "Naira Nigeriana",
    "NGNI": "Naira Nigeriana",
    "NGNPARALLEL": "Naira Nigeriana",
    "NIO": "Córdoba Nicaraguense",
    "NOK": "Coroa Norueguesa",
    "NPR": "Rúpia Nepalesa",
    "NZD": "Dólar Neozelandês",
    "OMR": "Rial Omanense",
    "PAB": "Balboa Panamenho",
    "PEN": "Sol do Peru",
    "PGK": "Kina Papua-Nova Guiné",
    "PHP": "Peso Filipino",
    "PKR": "Rúpia Paquistanesa",
    "PLN": "Zlóti Polonês",
    "PYG": "Guarani Paraguaio",
    "QAR": "Rial Catarense",
    "RON": "Leu Romeno",
    "RSD": "Dinar Sérvio",
    "RUB": "Rublo Russo",
    "RUBTOD": "Rublo Russo",
    "RUBTOM": "Rublo Russo",
    "RWF": "Franco Ruandês",
    "SAR": "Riyal Saudita",
    "SCR": "Rúpias de Seicheles",
    "SDG": "Libra Sudanesa",
    "SDR": "DSE",
    "SEK": "Coroa Sueca",
    "SGD": "Dólar de Cingapura",
    "SOS": "Shilling Somaliano",
    "STD": "Dobra São Tomé/Príncipe",
    "SVC": "Colon de El Salvador",
    "SYP": "Libra Síria",
    "SZL": "Lilangeni Suazilandês",
    "THB": "Baht Tailandês",
    "TJS": "Somoni do Tajiquistão",
    "TMT": "TMT",
    "TND": "Dinar Tunisiano",
    "TRY": "Nova Lira Turca",
    "TTD": "Dólar de Trinidad",
    "TWD": "Dólar Taiuanês",
    "TZS": "Shilling Tanzaniano",
    "UAH": "Hryvinia Ucraniana",
    "UGX": "Shilling Ugandês",
    "USD": "Dólar Americano",
    "USDT": "Dólar Americano",
    "UYU": "Peso Uruguaio",
    "UZS": "Som Uzbequistanês",
    "VEF": "Bolívar Venezuelano",
    "VND": "Dong Vietnamita",
    "VUV": "Vatu de Vanuatu",
    "XAF": "Franco CFA Central",
    "XAGG": "Prata",
    "XBR": "Brent Spot",
    "XCD": "Dólar do Caribe Oriental",
    "XOF": "Franco CFA Ocidental",
    "XPF": "Franco CFP",
    "XRP": "XRP",
    "YER": "Riyal Iemenita",
    "ZAR": "Rand Sul-Africano",
    "ZMK": "Kwacha Zambiana",
    "ZWL": "Dólar Zimbabuense",
    "XAU": "Ouro"
  }

  moedasDisponiveis = Object.entries(moedasDisponiveis)

  let selects = document.querySelectorAll(".moeda")
  selects.forEach((select) =>{
    moedasDisponiveis.forEach((moedas) => {
      let sigla = moedas[0]
      let nome = moedas[1]
  
      let option = document.createElement("option")
      option.value = sigla
      option.textContent = nome
  
      select.appendChild(option)
    })
  })
}