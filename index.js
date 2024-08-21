const express = require('express')

const { AllClients,
    getChamadosByStatus_AGEN,
    getChamadosByStatus_INIC,
    getChamadosByStatus_ACTE,
    getChamadosByStatus_DESP,
    getChamadosByStatus_FIOK,
    OpenOrdemServico
} = require('./functions')

require('dotenv').config()

const APP = express()
APP.use(express.json())
const PORT = process.env.PORT

APP.listen(PORT, () => {
    console.log('http://localhost:' + PORT)
})

APP.get('/consultar-cnpj', async (req, res) => {
    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar cnpj do chamado da query string
        const CNPJ = req.query.cnpj;

        // Verificar se o CNPJ foi enviado
        if (!CNPJ) {
            return res.status(404).json({
                message: 'É necessário enviar o CNPJ para pesquisar',
                response: {}
            });
        }

        const CLIENT = await AllClients(CNPJ)
        console.log(CLIENT)

        // Verificar se o cliente foi encontrado
        if (!CLIENT) {
            return res.status(404).json({
                message: 'CNPJ não encontrado',
                response: {}
            });
        } else {
            return res.status(200).json({
                message: 'Cliente encontrado com sucesso',
                response: CLIENT
            });
        }

    } catch (error) {
        console.error('Erro ao acessar serviço de consulta de clientes:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            return res.status(error.response.status).json({
                error: 'Server: Erro ao acessar serviço de consulta de clientes: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            return res.status(500).json({
                error: 'TimeOut: Erro ao acessar serviço de consulta de clientes: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar serviço de consulta de clientes: ' + error.message
        });
    }
})

APP.get('/chamados-agen', async (req, res) => {

    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar id do chamado da query string
        const ID = req.query.id;
        console.log('ID recebido:', ID);

        // Verificar se o ID foi enviado
        if (!ID) {
            console.log('ID não fornecido');
            return res.status(404).json({
                message: 'É necessário enviar o ID para pesquisar',
                resposne: {}
            });
        }

        // Obter lista de chamados pelo status
        const LIST_CHAMADOS_STATUS = await getChamadosByStatus_AGEN(ID);
        console.log('Lista de chamados obtida:', LIST_CHAMADOS_STATUS);

        if (!LIST_CHAMADOS_STATUS || LIST_CHAMADOS_STATUS.length === 0) {
            console.log('Nenhum chamado encontrado para o ID fornecido');
            return res.status(404).json({
                message: 'Nenhum chamado encontrado para o ID fornecido',
                response: LIST_CHAMADOS_STATUS
            });
        } else {
            console.log('Chamados encontrados:', LIST_CHAMADOS_STATUS);
            return res.status(200).json({
                message: 'Chamados encontrados',
                response: LIST_CHAMADOS_STATUS
            });
        }

    } catch (error) {
        console.error('Erro ao acessar serviço de consulta de chamados:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Erro ao acessar serviço de consulta de chamados: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            console.error('Sem resposta do servidor');
            return res.status(500).json({
                error: 'TimeOut: Erro ao acessar serviço de consulta de chamados: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar serviço de consulta de chamados: ' + error.message
        });
    }
})

APP.get('/chamados-inic', async (req, res) => {

    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar id do chamado da query string
        const ID = req.query.id;
        console.log('ID recebido:', ID);

        // Verificar se o ID foi enviado
        if (!ID) {
            console.log('ID não fornecido');
            return res.status(404).json({
                message: 'É necessário enviar o ID para pesquisar',
                resposne: {}
            });
        }

        // Obter lista de chamados pelo status
        const LIST_CHAMADOS_STATUS = await getChamadosByStatus_INIC(ID);
        console.log('Lista de chamados obtida:', LIST_CHAMADOS_STATUS);

        if (!LIST_CHAMADOS_STATUS || LIST_CHAMADOS_STATUS.length === 0) {
            console.log('Nenhum chamado encontrado para o ID fornecido');
            return res.status(404).json({
                message: 'Nenhum chamado encontrado para o ID fornecido',
                response: LIST_CHAMADOS_STATUS
            });
        } else {
            console.log('Chamados encontrados:', LIST_CHAMADOS_STATUS);
            return res.status(200).json({
                message: 'Chamados encontrados',
                response: LIST_CHAMADOS_STATUS
            });
        }

    } catch (error) {
        console.error('Erro ao acessar serviço de consulta de chamados:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Erro ao acessar serviço de consulta de chamados: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            console.error('Sem resposta do servidor');
            return res.status(500).json({
                error: 'TimeOut: Erro ao acessar serviço de consulta de chamados: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar serviço de consulta de chamados: ' + error.message
        });
    }
})

APP.get('/chamados-acte', async (req, res) => {

    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar id do chamado da query string
        const ID = req.query.id;
        console.log('ID recebido:', ID);

        // Verificar se o ID foi enviado
        if (!ID) {
            console.log('ID não fornecido');
            return res.status(404).json({
                message: 'É necessário enviar o ID para pesquisar',
                resposne: {}
            });
        }

        // Obter lista de chamados pelo status
        const LIST_CHAMADOS_STATUS = await getChamadosByStatus_ACTE(ID);
        console.log('Lista de chamados obtida:', LIST_CHAMADOS_STATUS);

        if (!LIST_CHAMADOS_STATUS || LIST_CHAMADOS_STATUS.length === 0) {
            console.log('Nenhum chamado encontrado para o ID fornecido');
            return res.status(404).json({
                message: 'Nenhum chamado encontrado para o ID fornecido',
                response: LIST_CHAMADOS_STATUS
            });
        } else {
            console.log('Chamados encontrados:', LIST_CHAMADOS_STATUS);
            return res.status(200).json({
                message: 'Chamados encontrados',
                response: LIST_CHAMADOS_STATUS
            });
        }

    } catch (error) {
        console.error('Erro ao acessar serviço de consulta de chamados:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Erro ao acessar serviço de consulta de chamados: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            console.error('Sem resposta do servidor');
            return res.status(500).json({
                error: 'TimeOut: Erro ao acessar serviço de consulta de chamados: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar serviço de consulta de chamados: ' + error.message
        });
    }
})

APP.get('/chamados-desp', async (req, res) => {

    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar id do chamado da query string
        const ID = req.query.id;
        console.log('ID recebido:', ID);

        // Verificar se o ID foi enviado
        if (!ID) {
            console.log('ID não fornecido');
            return res.status(404).json({
                message: 'É necessário enviar o ID para pesquisar',
                resposne: {}
            });
        }

        // Obter lista de chamados pelo status
        const LIST_CHAMADOS_STATUS = await getChamadosByStatus_DESP(ID);
        console.log('Lista de chamados obtida:', LIST_CHAMADOS_STATUS);

        if (!LIST_CHAMADOS_STATUS || LIST_CHAMADOS_STATUS.length === 0) {
            console.log('Nenhum chamado encontrado para o ID fornecido');
            return res.status(404).json({
                message: 'Nenhum chamado encontrado para o ID fornecido',
                response: LIST_CHAMADOS_STATUS
            });
        } else {
            console.log('Chamados encontrados:', LIST_CHAMADOS_STATUS);
            return res.status(200).json({
                message: 'Chamados encontrados',
                response: LIST_CHAMADOS_STATUS
            });
        }

    } catch (error) {
        console.error('Erro ao acessar serviço de consulta de chamados:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Erro ao acessar serviço de consulta de chamados: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            console.error('Sem resposta do servidor');
            return res.status(500).json({
                error: 'TimeOut: Erro ao acessar serviço de consulta de chamados: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar serviço de consulta de chamados: ' + error.message
        });
    }
})

APP.get('/chamados-fiok', async (req, res) => {

    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar id do chamado da query string
        const ID = req.query.id;
        console.log('ID recebido:', ID);

        // Verificar se o ID foi enviado
        if (!ID) {
            console.log('ID não fornecido');
            return res.status(404).json({
                message: 'É necessário enviar o ID para pesquisar',
                resposne: {}
            });
        }

        // Obter lista de chamados pelo status
        const LIST_CHAMADOS_STATUS = await getChamadosByStatus_FIOK(ID);
        console.log('Lista de chamados obtida:', LIST_CHAMADOS_STATUS);

        if (!LIST_CHAMADOS_STATUS || LIST_CHAMADOS_STATUS.length === 0) {
            console.log('Nenhum chamado encontrado para o ID fornecido');
            return res.status(404).json({
                message: 'Nenhum chamado encontrado para o ID fornecido',
                response: LIST_CHAMADOS_STATUS
            });
        } else {
            console.log('Chamados encontrados:', LIST_CHAMADOS_STATUS);
            return res.status(200).json({
                message: 'Chamados encontrados',
                response: LIST_CHAMADOS_STATUS
            });
        }

    } catch (error) {
        console.error('Erro ao acessar serviço de consulta de chamados:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Erro ao acessar serviço de consulta de chamados: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            console.error('Sem resposta do servidor');
            return res.status(500).json({
                error: 'TimeOut: Erro ao acessar serviço de consulta de chamados: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao acessar serviço de consulta de chamados: ' + error.message
        });
    }
})

APP.post('/abrir-chamado', async (req, res) => {

    try {
        console.log('request received')

        if (req.get('Authorization') !== process.env.TOKEN) {
            return res.status(401).json({
                message: 'É necessário estar autenticado para acessar a API',
                response: {}
            })
        }

        // Pegar cnpj do chamado da requisição
        const CLIENT = req.body;

        // Verificar se o body foi enviado
        if (!CLIENT || Object.keys(CLIENT).length === 0) {
            return res.status(404).json({
                message: 'É necessário enviar o body para abrir o chamado',
                response: {}
            });
        }

        const OPEN_CHAMADO = await OpenOrdemServico(CLIENT);

        // Retornando o número do OS
        return res.status(200).json({
            message: 'Chamado aberto com sucesso',
            response: OPEN_CHAMADO
        });

    } catch (error) {

        console.error('Erro ao abrir chamado:', error);

        // Verificar se o erro tem uma resposta do servidor
        if (error.response) {
            console.error('Erro de resposta do servidor:', error.response.data);
            return res.status(error.response.status).json({
                error: 'Server: Erro ao abrir chamado: ' + error.response.data
            });
        }

        // Verificar se o erro foi causado por falta de resposta do servidor
        if (error.request) {
            console.error('Sem resposta do servidor');
            return res.status(500).json({
                error: 'TimeOut: Erro ao abrir chamado: Sem resposta do servidor'
            });
        }

        // Caso seja um erro de configuração ou outro tipo de erro
        console.error('Erro inesperado:', error.message);
        return res.status(500).json({
            error: 'Erro ao abrir chamado: ' + error.message
        });

    }

})