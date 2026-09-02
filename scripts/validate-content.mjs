import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const data = await readJson('data.json');
const catalogs = await Promise.all([
  readJson('content.json'),
  readJson('content/year-1.json'),
  readJson('content/year-2.json'),
  readJson('content/year-3.json'),
  readJson('content/year-4.json'),
]);

const content = Object.assign({}, ...catalogs);
const errors = [];
const warnings = [];

for (const course of data.courses) {
  const detail = content[course.id];
  if (!detail) {
    errors.push(`${course.id}: sem conteúdo detalhado`);
    continue;
  }

  if (!detail.intro || detail.intro.length < 120) errors.push(`${course.id}: introdução muito curta ou ausente`);
  if (!Array.isArray(detail.objectives) || detail.objectives.length < 4) errors.push(`${course.id}: menos de 4 objetivos de aprendizagem`);
  if (!Array.isArray(detail.modules) || detail.modules.length < 5) errors.push(`${course.id}: menos de 5 aulas detalhadas`);
  if (!Array.isArray(detail.readingGuide) || detail.readingGuide.length < 3) errors.push(`${course.id}: guia de leitura insuficiente`);
  if (!detail.finalProject) errors.push(`${course.id}: projeto final ausente`);

  for (const [index, module] of (detail.modules || []).entries()) {
    const prefix = `${course.id}/aula-${index + 1}`;
    if (!module.title) errors.push(`${prefix}: título ausente`);
    if (!Array.isArray(module.explanation) || module.explanation.join(' ').length < 120) errors.push(`${prefix}: explicação insuficiente`);
    if (!Array.isArray(module.concepts) || module.concepts.length < 3) errors.push(`${prefix}: conceitos-chave insuficientes`);
    if (!module.reading?.work || !module.reading?.focus || !module.reading?.why) errors.push(`${prefix}: leitura orientada incompleta`);
    if (!Array.isArray(module.questions) || module.questions.length < 2) errors.push(`${prefix}: menos de 2 perguntas de reflexão`);
    if (!module.exercise) errors.push(`${prefix}: exercício ausente`);
  }

  if (detail.modules?.length !== course.modules?.length) {
    warnings.push(`${course.id}: checklist possui ${course.modules.length} módulos e conteúdo detalhado possui ${detail.modules.length}.`);
  }
}

const unknown = Object.keys(content).filter(id => !data.courses.some(course => course.id === id));
if (unknown.length) warnings.push(`Conteúdos sem disciplina correspondente: ${unknown.join(', ')}`);

console.log(`Disciplinas no currículo: ${data.courses.length}`);
console.log(`Disciplinas com conteúdo: ${data.courses.filter(c => content[c.id]).length}`);
console.log(`Aulas detalhadas: ${Object.values(content).reduce((n, c) => n + (c.modules?.length || 0), 0)}`);

if (warnings.length) {
  console.warn('\nAvisos:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\nFalhas de integridade acadêmica:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nConteúdo acadêmico válido.');
