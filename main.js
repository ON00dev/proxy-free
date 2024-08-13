const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const baseUrl = 'https://pt.proxyservers.pro/proxy/';
const maxPages = 29;

async function scrapePage(pageNumber, browser) {
    const url = `${baseUrl}list/order/updated/order_dir/desc/page/${pageNumber}`;
    const page = await browser.newPage();
    const proxies = [];

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Espera todos os elementos <a> e <span.port> serem carregados
        const elements = await page.$$eval('a[title]', links => {
            return links.map(link => {
                const ip = link.getAttribute('title');
                const portElement = link.parentElement.nextElementSibling.querySelector('span.port');
                const port = portElement ? portElement.textContent.trim() : null;
                return port ? `${ip}:${port}` : null;
            }).filter(proxy => proxy !== null);
        });

        proxies.push(...elements);
        console.log(`Página ${pageNumber} proxies:`, proxies);

    } catch (error) {
        console.error(`Erro ao fazer scraping da página ${pageNumber}:`, error);
    } finally {
        await page.close();
    }

    return proxies;
}

async function scrapeAllPages() {
    const browser = await puppeteer.launch();
    let allProxies = [];

    for (let page = 1; page <= maxPages; page++) {
        const proxies = await scrapePage(page, browser);
        allProxies = allProxies.concat(proxies);
        console.log(`Progresso: ${page}/${maxPages} páginas raspadas.`);
    }

    allProxies = [...new Set(allProxies)];
    console.log('Todas as proxies coletadas:', allProxies);

    await browser.close();

    if (allProxies.length > 0) {
        await saveProxiesToFile(allProxies);
    } else {
        console.log('Nenhuma proxy coletada.');
    }
}

async function saveProxiesToFile(proxies) {
    try {
        await fs.writeFile('proxy_list.txt', proxies.join('\n'));
        console.log('Proxies salvas no arquivo proxy_list.txt.');
    } catch (error) {
        console.error('Erro ao salvar proxies no arquivo:', error);
    }
}

// Iniciar o scraping
scrapeAllPages();
