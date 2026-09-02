import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const readText = async path => readFile(new URL(path, root), 'utf8');

const [bibliography, lessonMetaJs, lessonMetaCss, bibliographyJs, indexHtml] = await Promise.all([
  readJson('bibliography.json'),
  readText('assets/lesson-meta.js'),
  readText('assets/lesson-meta.css'),
  readText('assets/bibliography-tools.js'),
  readText('index.html')
]);

const errors=[];
const entries=bibliography.entries||[];
if(entries.length<10)errors.push('bibliografia estruturada possui menos de 10 entradas');
const ids=new Set();
for(const entry of entries){
  if(!entry.id||ids.has(entry.id))errors.push(`entrada bibliográfica com id ausente/duplicado: ${entry.id}`);
  ids.add(entry.id);
  for(const field of ['author','title','type','editionNote','why'])if(!entry[field]||String(entry[field]).length<8)errors.push(`${entry.id}: campo ${field} ausente ou superficial`);
  if(entry.url&&!entry.url.startsWith('https://'))errors.push(`${entry.id}: URL inválida`);
  if(entry.isbn&&!/^97[89][-0-9 Xx]+$/.test(entry.isbn))errors.push(`${entry.id}: ISBN em formato inesperado`);
  if(!Array.isArray(entry.courses)||!entry.courses.length)errors.push(`${entry.id}: sem disciplinas associadas`);
}

for(const marker of ['lesson-meta-item','lesson-meta-prereq','study-map.json','course-reading','lesson-opening','opening.after(meta)','matchMedia']){
  if(!lessonMetaJs.includes(marker))errors.push(`lesson-meta.js incompleto: ${marker}`);
}
for(const marker of ['.lesson-meta','.lesson-meta-prereq','.lesson-opening','.course-reading .mobile-tabbar','.course-reading .lesson-card']){
  if(!lessonMetaCss.includes(marker))errors.push(`lesson-meta.css incompleto: ${marker}`);
}
for(const marker of ['Bibliografia estruturada','Edição/leitura','Por que usar','bibliography.json'])if(!bibliographyJs.includes(marker))errors.push(`bibliography-tools.js incompleto: ${marker}`);
for(const asset of ['./assets/lesson-meta.js','./assets/lesson-meta.css','./assets/bibliography-tools.js'])if(!indexHtml.includes(asset))errors.push(`index.html não carrega ${asset}`);

console.log(`Referências estruturadas: ${entries.length}`);
if(errors.length){console.error('Falhas nos extras de estudo:');for(const error of errors)console.error(`- ${error}`);process.exit(1)}
console.log('Bibliografia estruturada e fluxo de leitura por aula válidos.');
