let intervalo

addEventListener("message", event =>{
    if(event.data.action == "iniciar"){
        const {pSigla, sSigla} = event.data
        conectaAPI(pSigla, sSigla)
        intervalo = setInterval(() => conectaAPI(pSigla, sSigla),5000)
    }else if(event.data.action == "finalizar"){
        clearInterval(intervalo)
        postMessage({action: "finalizado"})
        close()
    }
})
async function conectaAPI(pSigla, sSigla){
    const conecta = await fetch(`https://economia.awesomeapi.com.br/last/${pSigla}-${sSigla}`)
    let conectaTraduzido = await conecta.json()
    conectaTraduzido = conectaTraduzido[Object.keys(conectaTraduzido)[0]]
    postMessage(conectaTraduzido)
    if(conectaTraduzido == 404){
        close()
    }
}