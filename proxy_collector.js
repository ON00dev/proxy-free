const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

const baseUrl = 'https://pt.proxyservers.pro/proxy/';
const maxPages = 29; // Máximo de páginas a serem acessadas
let uniqueProxies = new Set(); // Inicializar o conjunto de proxies únicas

// Função para registrar erros específicos
async function logError(error, message) {
    const logMessage = `${new Date().toISOString()} - ${message}: ${error}\n`;
    await fs.appendFile('error_log.txt', logMessage);
}

async function scrapePage(pageNumber) {
    const url = `${baseUrl}list/order/updated/order_dir/desc/page/${pageNumber}`;
    console.log(`Iniciando scraping da página ${pageNumber}`);

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const proxiesToAdd = [];
        let duplicatesCount = 0;

        $('a[title]').each((index, element) => {
            const ip = $(element).attr('title');
            const portElement = $(element).next('span.port');
            const port = portElement ? portElement.attr('data-port') : null;

            if (ip && port) {
                const proxy = `${ip}:${port}`;
                if (uniqueProxies.has(proxy)) {
                    duplicatesCount++;
                } else {
                    uniqueProxies.add(proxy);
                    proxiesToAdd.push(proxy);
                }
            }
        });

        if (proxiesToAdd.length > 0) {
            try {
                await fs.appendFile('proxy_list.txt', proxiesToAdd.join('\n') + '\n');
                console.log(`Dados da página ${pageNumber} salvos em proxy_list.txt`);
            } catch (writeError) {
                await logError(writeError, `Erro ao salvar dados da página ${pageNumber}`);
            }
        } else {
            console.log(`Nenhum dado novo para salvar da página ${pageNumber}`);
        }

        if (duplicatesCount > 0) {
            console.log(`Página ${pageNumber}: ${duplicatesCount} proxies duplicadas não foram adicionadas.`);
        }

    } catch (error) {
        await logError(error, `Erro ao fazer scraping da página ${pageNumber}`);
    }
}

// Função para verificar e corrigir permissões do arquivo
async function checkFilePermissions(filePath) {
    try {
        await fs.access(filePath, fs.constants.W_OK);
    } catch (error) {
        console.log(`Permissões insuficientes para escrever no arquivo ${filePath}. Tentando ajustar permissões.`);
        try {
            await fs.chmod(filePath, 0o666);
        } catch (chmodError) {
            await logError(chmodError, `Erro ao ajustar permissões do arquivo ${filePath}`);
        }
    }
}

// Função para criar o arquivo se não existir
async function createFileIfNotExists(filePath) {
    try {
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        if (!exists) {
            await fs.writeFile(filePath, '');
            console.log(`Arquivo ${filePath} criado.`);
        }
    } catch (error) {
        await logError(error, `Erro ao criar o arquivo ${filePath}`);
    }
}

// Função para limpar o conteúdo do arquivo
async function clearFileContent(filePath) {
    try {
        await fs.writeFile(filePath, '');
        console.log(`Conteúdo do arquivo ${filePath} limpo.`);
    } catch (error) {
        await logError(error, `Erro ao limpar o conteúdo do arquivo ${filePath}`);
    }
}

async function scrapeAllPages() {
    const filePath = 'proxy_list.txt';

    uniqueProxies = new Set(); // Reinicializar o conjunto de proxies únicas
    await createFileIfNotExists(filePath);
    await checkFilePermissions(filePath);
    await clearFileContent(filePath);

    for (let page = 1; page <= maxPages; page++) {
        await scrapePage(page);
        console.log(`Progresso: ${(page / maxPages * 100).toFixed(2)}%`);
    }
}

// Exportar funções para testes
module.exports = {
    createFileIfNotExists,
    clearFileContent,
    scrapeAllPages // Para fins de teste, se necessário
};

// Iniciar o scraping apenas se o script for executado diretamente
if (require.main === module) {
    scrapeAllPages();
}
