const { XMLParser } = require("fast-xml-parser");
const axios = require('axios')
require('dotenv').config()

function formatDate() {

    let date = new Date()
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function getDiaMesAtual() {

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Janeiro é 0, então adicionamos 1
    const day = '01'; // Primeiro dia do mês

    return `${year}-${month}-${day}T00:00:00`;
}

function go_onParams(body, funcao) {

    return {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.URL,
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': `http://www.equiperemota.com.br/${funcao}`
        },
        data: body
    }
}

async function dealWithChamados(response, id) {

    try {

        let arrayChamados = []

        const PARSER2JSON = new XMLParser();

        // xml to json
        let jsonObj = PARSER2JSON.parse(response)

        // Se precisar acessar a resposta SOAP
        let soapBody = jsonObj['soap:Envelope']['soap:Body'].GetServiceOrdersResponse.GetServiceOrdersResult

        // parse em texto retornado acima
        let newJsonObj = JSON.parse(soapBody)

        // acessa as propriedades do novo objeto
        let listChamados = newJsonObj.answersXML.FormAnswers

        // acessa todos os chamados e procura o com ID igual
        for (let i = 0; i < listChamados.length; i++) {
            console.log(listChamados[i].ClienteID)
            if (listChamados[i].ClienteID === id) {
                console.log('achou chamado')
                arrayChamados.push(listChamados[i])
            }
        }

        return arrayChamados

    } catch (error) {

        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }

    }

}

async function AllClients(cnpj) {

    let data = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <GetAllClients xmlns="http://www.equiperemota.com.br">
        <authCode>${process.env.ALL_CLIENTS}</authCode>
        <clientCode>${process.env.CLIENT_CODE}</clientCode>
      </GetAllClients>
    </soap:Body>
  </soap:Envelope>`

    // setando os parametros da requisição
    const config = go_onParams(data, 'GetAllClients')

    try {
        const resp = await axios.request(config)

        // Instancia o parser
        const PARSER2JSON = new XMLParser();

        // xml to json
        let jsonObj = PARSER2JSON.parse(resp.data)

        // Se precisar acessar a resposta SOAP
        let soapBody = jsonObj['soap:Envelope']['soap:Body'].GetAllClientsResponse.GetAllClientsResult

        let newJsonObj = JSON.parse(soapBody)

        let clientListText = newJsonObj.clientListJson

        const clientListJson = JSON.parse(clientListText)

        // agora e colocar as pontuações no cnpj e percorrer toda a lista de clientes e verificar paricidade com o cnpjs
        cnpj = String(cnpj)
        cnpj = cnpj.replace(/\D/g, '');

        // Aplica o formato XX.XXX.XXX/XXXX-XX
        cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")

        // const teste = clientListJson.filter((array) => array.Name.indexOf("Teste") != -1)
        const clientFound = clientListJson.filter((array) => array.FederalInscriptionId === cnpj)
        // console.log(clientFound)
        return JSON.stringify(clientFound[0])

    } catch (error) {

        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }

    }
}

async function getChamadosByStatus_AGEN(id) {

    const diaUmMesAtual = getDiaMesAtual()

    const diaAtual = formatDate()

    const DATA_AGEN = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <GetServiceOrders xmlns="http://www.equiperemota.com.br">
            <authCode>${process.env.AUTH_AGEN}</authCode>
            <clientCode>${process.env.CLIENT_CODE}</clientCode>
            <dataInicio>${diaUmMesAtual}</dataInicio>
            <dataFim>${diaAtual}</dataFim>
            <flowStateTag>AGEN</flowStateTag>
        </GetServiceOrders>
    </soap:Body>
</soap:Envelope>`

    const CONFIG_AGEN = go_onParams(DATA_AGEN, 'GetServiceOrders')

    try {

        const RESPONSE = await axios.request(CONFIG_AGEN)

        const CHAMADOS_RETURN = dealWithChamados(RESPONSE.data, id)

        return CHAMADOS_RETURN

    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }
    }

}

async function getChamadosByStatus_INIC(id) {

    const diaUmMesAtual = getDiaMesAtual()

    const diaAtual = formatDate()

    const DATA_INIC = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <GetServiceOrders xmlns="http://www.equiperemota.com.br">
            <authCode>${process.env.AUTH_INIC}</authCode>
            <clientCode>${process.env.CLIENT_CODE}</clientCode>
            <dataInicio>${diaUmMesAtual}</dataInicio>
            <dataFim>${diaAtual}</dataFim>
            <flowStateTag>INIC</flowStateTag>
        </GetServiceOrders>
    </soap:Body>
</soap:Envelope>`

    const CONFIG_INIC = go_onParams(DATA_INIC, 'GetServiceOrders')

    try {

        const RESPONSE = await axios.request(CONFIG_INIC)

        const CHAMADOS_RETURN = dealWithChamados(RESPONSE.data, id)

        return CHAMADOS_RETURN

    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }
    }

}

async function getChamadosByStatus_ACTE(id) {

    const diaUmMesAtual = getDiaMesAtual()

    const diaAtual = formatDate()

    const DATA_ACTE = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <GetServiceOrders xmlns="http://www.equiperemota.com.br">
            <authCode>${process.env.AUTH_ACTE}</authCode>
            <clientCode>${process.env.CLIENT_CODE}</clientCode>
            <dataInicio>${diaUmMesAtual}</dataInicio>
            <dataFim>${diaAtual}</dataFim>
            <flowStateTag>ACTE</flowStateTag>
        </GetServiceOrders>
    </soap:Body>
</soap:Envelope>`


    const CONFIG_ACTE = go_onParams(DATA_ACTE, 'GetServiceOrders')

    try {

        const RESPONSE = await axios.request(CONFIG_ACTE)

        const CHAMADOS_RETURN = dealWithChamados(RESPONSE.data, id)

        return CHAMADOS_RETURN

    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }
    }

}

async function getChamadosByStatus_DESP(id) {

    const diaUmMesAtual = getDiaMesAtual()

    const diaAtual = formatDate()

    const DATA_DESP = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <GetServiceOrders xmlns="http://www.equiperemota.com.br">
            <authCode>${process.env.AUTH_DESP}</authCode>
            <clientCode>${process.env.CLIENT_CODE}</clientCode>
            <dataInicio>${diaUmMesAtual}</dataInicio>
            <dataFim>${diaAtual}</dataFim>
            <flowStateTag>DESP</flowStateTag>
        </GetServiceOrders>
    </soap:Body>
</soap:Envelope>`


    const CONFIG_DESP = go_onParams(DATA_DESP, 'GetServiceOrders')

    try {

        const RESPONSE = await axios.request(CONFIG_DESP)

        const CHAMADOS_RETURN = dealWithChamados(RESPONSE.data, id)

        return CHAMADOS_RETURN

    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }
    }

}

async function getChamadosByStatus_FIOK(id) {

    const diaUmMesAtual = getDiaMesAtual()

    const diaAtual = formatDate()

    const DATA_FIOK = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <GetServiceOrders xmlns="http://www.equiperemota.com.br">
            <authCode>${process.env.AUTH_FIOK}</authCode>
            <clientCode>${process.env.CLIENT_CODE}</clientCode>
            <dataInicio>${diaUmMesAtual}</dataInicio>
            <dataFim>${diaAtual}</dataFim>
            <flowStateTag>FIOK</flowStateTag>
        </GetServiceOrders>
    </soap:Body>
</soap:Envelope>`

    const CONFIG_FIOK = go_onParams(DATA_FIOK, 'GetServiceOrders')

    try {

        const RESPONSE = await axios.request(CONFIG_FIOK)

        const CHAMADOS_RETURN = dealWithChamados(RESPONSE.data, id)

        return CHAMADOS_RETURN

    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }
    }
}

async function OpenOrdemServico(clientData) {

    const TIMESTAMP = generateGuid()
    console.log(TIMESTAMP)
    console.log(clientData.Id)
    let formattedDate = formatDate().toString();

    let data = `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
        <OpenOrdemServico xmlns="http://www.equiperemota.com.br">
            <authCode>${process.env.AUTH_CHAMADO}</authCode>
            <clientCode>${process.env.CLIENT_CODE}</clientCode>
            <externalID>${clientData.Id}</externalID>
            <externalClienteID>${clientData.Id}</externalClienteID>
            <externalTipoServicoID>7</externalTipoServicoID>
            <dataSolicitacao>${formattedDate}</dataSolicitacao>
            <prioridade>N</prioridade>
            <contatoNome>${clientData.ContactName}</contatoNome>
            <contatoTelefone>${clientData.ContactPhone}</contatoTelefone>
            <endereco>${clientData.Address.Address}</endereco>
            <enderecoNumero>${clientData.Address.AddressNumber}</enderecoNumero>
            <enderecoComplemento>${clientData.Address.AddressComplement}</enderecoComplemento>
            <enderecoBairro>${clientData.Address.AddressNeighborhood}</enderecoBairro>
            <cidade>${clientData.Address.AddressCity}</cidade>
            <uF>${clientData.Address.AddressState}</uF>
            <cEP>${clientData.Address.AddressZipcode}</cEP>
            <descricao>player status offline</descricao>
            <latitude>${clientData.Lat}</latitude>
            <longitude>${clientData.Lng}</longitude>
            <dataCriacao>${formattedDate}</dataCriacao>
            <enderecoReferencia>${clientData.Address.AddressZipcode}</enderecoReferencia>
            <dynFormCreateFormXML></dynFormCreateFormXML>
            <dataHoraAgendamento>${formattedDate}</dataHoraAgendamento>
            <mobileAgentCodeSource>Internal</mobileAgentCodeSource>
        </OpenOrdemServico>
    </soap:Body>
</soap:Envelope>`;

    const CONFIG = go_onParams(data, 'OpenOrdemServico')

    try {

        const response = await axios.request(CONFIG);

        const PARSER2JSON = new XMLParser();

        let jsonObj = PARSER2JSON.parse(response.data)

        let soapBody = jsonObj['soap:Envelope']['soap:Body'].OpenOrdemServicoResponse.OpenOrdemServicoResult

        let newObj = JSON.parse(soapBody)

        let osNumber = newObj.numeroOS

        return osNumber

    } catch (error) {
        if (error.response) {
            // O servidor respondeu com um status diferente de 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            return { error: 'Server responded with an error', details: error.response.data };
        } else if (error.request) {
            // A requisição foi feita, mas nenhuma resposta foi recebida
            console.error('Error request:', error.request);
            return { error: 'No response received from server', details: error.request };
        } else {
            // Algo aconteceu ao configurar a requisição que acionou um erro
            console.error('Error message:', error.message);
            return { error: 'Request setup error', details: error.message };
        }
    }
}

module.exports = {
    AllClients,
    getChamadosByStatus_AGEN,
    getChamadosByStatus_INIC,
    getChamadosByStatus_ACTE,
    getChamadosByStatus_DESP,
    getChamadosByStatus_FIOK,
    OpenOrdemServico
};