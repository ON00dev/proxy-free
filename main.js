const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// URL do site que você deseja fazer scraping
const url = 'https://pt.proxyservers.pro/proxy/'; // Substitua pela URL do site real

async function scrapeAndSave() {
    try {
        // Faz uma requisição para o site
        const { data } = await axios.get(url);

        // Carrega o HTML no cheerio
        const $ = cheerio.load(data);

        // Array para armazenar os proxies
        const proxies = [];

        // Itera sobre cada tag <a> com a estrutura desejada
        $('a[href^="/proxy/"]').each((index, element) => {
            const ip = $(element).attr('title');
            const port = $(element).next('span.port').data('port');

            if (ip && port) {
                // Formata e adiciona o proxy à lista
                proxies.push(`${ip}:${port}`);
            }
        });

        // Salva os proxies no arquivo
        fs.writeFile('proxy_list.txt', proxies.join('\n'), (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo:', err);
            } else {
                console.log('Arquivo salvo com sucesso!');
            }
        });

    } catch (error) {
        console.error('Erro ao fazer scraping:', error);
    }
}

// Executa a função
scrapeAndSave();
