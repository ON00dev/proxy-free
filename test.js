const fs = require('fs').promises;
const assert = require('assert');
const { createFileIfNotExists, clearFileContent } = require('./proxy_collector'); // Importar do proxy_collector.js

const testFilePath = 'test_proxy_list.txt';

// Teste para a função createFileIfNotExists
async function testCreateFileIfNotExists() {
    if (await fs.access(testFilePath).then(() => true).catch(() => false)) {
        await fs.unlink(testFilePath); // Remover o arquivo se já existir
    }

    await createFileIfNotExists(testFilePath);
    const exists = await fs.access(testFilePath).then(() => true).catch(() => false);
    assert(exists, 'Arquivo não foi criado');
    console.log('Teste createFileIfNotExists passou.');
}

// Teste para a função clearFileContent
async function testClearFileContent() {
    await fs.writeFile(testFilePath, 'Conteúdo temporário');

    await clearFileContent(testFilePath);
    const content = await fs.readFile(testFilePath, 'utf8');
    assert.strictEqual(content, '', 'Arquivo não foi limpo');
    console.log('Teste clearFileContent passou.');
}

// Executar testes
(async () => {
    await testCreateFileIfNotExists();
    await testClearFileContent();

    // Limpeza após testes
    if (await fs.access(testFilePath).then(() => true).catch(() => false)) {
        await fs.unlink(testFilePath);
    }
})();
