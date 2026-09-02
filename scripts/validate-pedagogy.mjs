import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const readText = async path => readFile(new URL(path, root), 'utf8');

const [glossary, pedagogyJs, pedagogyCss, indexHtml, worker] = await Promise.all([
  readJson('history-glossary.json'),
  readText('assets/pedagogy.js'),
  readText('assets/pedagogy.css'),
  readText('index.html'),
  readText('service-worker.js')
]);

const errors = [];
const entries = Object.entries(glossary);
if (entries.length < 60) errors.push(`glossário possui apenas ${entries.length} termos; esperado >= 60`);
for (const [term, definition] of entries) {
  if (term.length < 3) errors.push(`termo inválido no glossário: ${term}`);
  if (String(definition).length < 55) errors.push(`definição superficial: ${term}`);
}
for (const marker of ['Em termos simples','Mapa da disciplina','Aprofundar este tema','Palavras que você precisa entender','GUIDE_RULES']) {
  if (!pedagogyJs.includes(marker)) errors.push(`pedagogy.js incompleto: ${marker}`);
}
for (const marker of ['.plain-history','.course-topic-map','.history-depth','.history-vocab','.history-checkpoint']) {
  if (!pedagogyCss.includes(marker)) errors.push(`pedagogy.css incompleto: ${marker}`);
}
for (const asset of ['./assets/pedagogy.js','./assets/pedagogy.css']) {
  if (!indexHtml.includes(asset)) errors.push(`index.html não carrega ${asset}`);
}
for (const asset of ['./history-glossary.json','./assets/pedagogy.js','./assets/pedagogy.css']) {
  if (!worker.includes(asset)) errors.push(`service worker não inclui ${asset}`);
}

console.log(`Termos explicados em linguagem comum: ${entries.length}`);
if (errors.length) {
  console.error('Falhas na camada pedagógica:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Camada pedagógica de leitura e aprofundamento válida.');
