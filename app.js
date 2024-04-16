const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')


const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

// importar para leer excel
const XLSX = require('xlsx');
//para validar achivos
const fs = require('fs');
const diacritics = require('diacritics');

const rutaArchivo = __dirname +"\\DatosBot.xlsx"

const excel = ()=>{
    try {
        if (fs.existsSync(rutaArchivo)) {
            const workbook = XLSX.readFile(rutaArchivo);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(sheet);
            return data
          } 
        
      } catch (error) {
        return false;
      }
}

//console.log(flows)
const buscarRespuesta = (excel, palabraBuscada)=>{
    // console.log("exce :" +excel)
    //console.log("Palabra sucia"+palabraBuscada)
    palabraBuscada = diacritics.remove(palabraBuscada)
    //console.log("Palabra limpia"+palabraBuscada)
    for (const obj of excel) {
      if (obj.Palabras == palabraBuscada) {
        //console.log(obj.Respuestas)
        return obj.Descripcion + '\n' + obj.Respuestas1 + '\n' + obj.Respuestas2 + '\n' + obj.Respuestas3 + '\n' + obj.Respuestas4;
      }
    }
  }

const Palabras=()=> {
    //return [...excel()].map(item => addKeyword(item.Palabras).addAnswer(['📄 Aquí tenemos el flujoecundario']));
      
    return excel().map(item => addKeyword(item.Palabras,{ sensitive: true})
        .addAnswer(item.Descripcion) 
        .addAnswer(item.Respuestas1)
        .addAnswer(item.Respuestas2)
        .addAnswer(item.Respuestas3)
        .addAnswer(item.Respuestas4)
        
    );
  }

const expresionRegular = '/[\s\S]*/';

const flowPrincipal = addKeyword(expresionRegular,{regex: true })
    .addAction(async (textoRes, { flowDynamic }) => {
                    return flowDynamic(buscarRespuesta(excel(),textoRes.body))
                })
const main = async () => {
    const adapterDB = new MockAdapter()
    //const adapterFlow = createFlow(Palabras())
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
// console.log(Palabras()[0])
//console.log(buscarRespuesta(excel(),"Clases Presencial"))
