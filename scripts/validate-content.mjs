import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

const base = await readJson('data.json');
const extras = await readJson('extra-courses.json');
const literature = await readJson('literature.json');
const catalogs = await Promise.all([
  readJson('content.json'),
  readJson('content/year-1.json'),
  readJson('content/year-2.json'),
  readJson('content/year-3.json'),
  readJson('content/year-4.json'),
  readJson('content/extension-a.json'),
  readJson('content/extension-b.json'),
]);

const courses = [...(base.courses || []), ...(extras.courses || [])];
const content = Object.assign({}, ...catalogs);
const errors = [];
const warnings = [];
const ids = new Set();

for (const course of courses) {
  if (ids.has(course.id)) errors.push(`${course.id}: id de disciplina duplicado`);
  ids.add(course.id);

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

  const literary = literature[course.id];
  if (!literary) {
    errors.push(`${course.id}: biblioteca literária ausente`);
  } else {
    const works = [...(literary.essential || []), ...(literary.extended || [])];
    if (!literary.intro || literary.intro.length < 50) errors.push(`${course.id}: orientação da biblioteca literária ausente`);
    if (!Array.isArray(literary.essential) || literary.essential.length < 3) errors.push(`${course.id}: menos de 3 obras literárias essenciais`);
    if (new Set(works).size !== works.length) warnings.push(`${course.id}: há obra repetida dentro da própria biblioteca literária`);
  }

  if (detail.modules?.length !== course.modules?.length) {
    warnings.push(`${course.id}: checklist base possui ${course.modules.length} módulos e conteúdo detalhado possui ${detail.modules.length}; o app sincroniza pelos títulos das aulas detalhadas.`);
  }
}

const unknownContent = Object.keys(content).filter(id => !ids.has(id));
if (unknownContent.length) warnings.push(`Conteúdos sem disciplina correspondente: ${unknownContent.join(', ')}`);
const unknownLiterature = Object.keys(literature).filter(id => !ids.has(id));
if (unknownLiterature.length) warnings.push(`Bibliotecas literárias sem disciplina correspondente: ${unknownLiterature.join(', ')}`);

const lessonCount = courses.reduce((n, c) => n + (content[c.id]?.modules?.length || 0), 0);
const literaryCount = courses.reduce((n, c) => n + (literature[c.id]?.essential?.length || 0) + (literature[c.id]?.extended?.length || 0), 0);

console.log(`Disciplinas no currículo expandido: ${courses.length}`);
console.log(`Disciplinas com conteúdo: ${courses.filter(c => content[c.id]).length}`);
console.log(`Disciplinas com biblioteca literária: ${courses.filter(c => literature[c.id]).length}`);
console.log(`Aulas detalhadas: ${lessonCount}`);
console.log(`Obras na biblioteca literária: ${literaryCount}`);

if (warnings.length) {
  console.warn('\nAvisos:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('\nFalhas de integridade acadêmica:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nCurrículo, conteúdo e biblioteca literária válidos.');
