import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const resolveCourseId = id => id === 'segunda-guerra' ? 'fascismo-segunda-guerra' : id;

const [base, extras, review, literature, literatureReview, timeline, media, ...catalogs] = await Promise.all([
  readJson('data.json'),
  readJson('extra-courses.json'),
  readJson('extra-courses-review.json'),
  readJson('literature.json'),
  readJson('literature-review.json'),
  readJson('timeline.json'),
  readJson('media.json'),
  readJson('content.json'),
  readJson('content/year-1.json'),
  readJson('content/year-2.json'),
  readJson('content/year-3.json'),
  readJson('content/year-4.json'),
  readJson('content/extension-a.json'),
  readJson('content/extension-b.json'),
  readJson('content/extension-c1.json'),
  readJson('content/extension-c2.json'),
  readJson('content/greece-expansion.json')
]);

const courses = [...(base.courses || []), ...(extras.courses || []), ...(review.courses || [])];
const content = Object.assign({}, ...catalogs);
const allLiterature = { ...literature, ...literatureReview };
const errors = [];
const ids = new Set(courses.map(course => course.id));

const requiredGaps = [
  'arqueologia-cultura-material',
  'bizancio-mediterraneo-oriental',
  'china-leste-asiatico',
  'india-sul-asia',
  'historia-indigena-americas',
  'escravidao-atlantica',
  'descolonizacao-sul-global',
  'humanidades-digitais'
];

for (const id of requiredGaps) if (!ids.has(id)) errors.push(`lacuna curricular reapareceu: ${id}`);

for (const course of courses) {
  const detail = content[course.id];
  if (!detail) errors.push(`${course.id}: sem conteúdo detalhado`);
  if (!allLiterature[course.id]) errors.push(`${course.id}: sem biblioteca literária`);
  if (detail) {
    if (!Array.isArray(detail.modules) || detail.modules.length < 5) errors.push(`${course.id}: menos de 5 aulas`);
    if (!Array.isArray(detail.objectives) || detail.objectives.length < 4) errors.push(`${course.id}: objetivos insuficientes`);
    if (!Array.isArray(detail.readingGuide) || detail.readingGuide.length < 3) errors.push(`${course.id}: guia de leitura insuficiente`);
    if (!detail.finalProject) errors.push(`${course.id}: projeto final ausente`);
  }
}

const greece = content['antiguidade-ii'];
const greekText = JSON.stringify(greece || {}).toLowerCase();
for (const term of ['minoic', 'micên', 'povos do mar', 'ilíada', 'odisseia']) {
  if (!greekText.includes(term)) errors.push(`Grécia Antiga: tópico obrigatório ausente: ${term}`);
}

if (!Array.isArray(timeline.events) || timeline.events.length < 50) errors.push('cronologia mestra possui menos de 50 marcos');
if (!Array.isArray(timeline.axes) || timeline.axes.length < 5) errors.push('eixos transversais insuficientes');
for (const event of timeline.events || []) {
  for (const rawId of event.courses || []) {
    const id = resolveCourseId(rawId);
    if (!ids.has(id)) errors.push(`cronologia referencia disciplina inexistente: ${rawId} (${event.title})`);
  }
}

for (const [courseId, entry] of Object.entries(media)) {
  if (!ids.has(courseId)) errors.push(`mídia associada a disciplina inexistente: ${courseId}`);
  for (const image of entry.images || []) {
    if (!image.src || !image.sourceUrl) errors.push(`${courseId}: imagem sem src/sourceUrl`);
  }
  for (const video of entry.videos || []) {
    if (!video.url || !video.title) errors.push(`${courseId}: vídeo sem título/url`);
  }
}

console.log(`Currículo após revisão: ${courses.length} disciplinas`);
console.log(`Cronologia mestra: ${timeline.events?.length || 0} marcos`);
console.log(`Eixos transversais: ${timeline.axes?.length || 0}`);
console.log(`Disciplinas com mídia curada: ${Object.keys(media).length}`);
console.log(`Novas lacunas cobertas: ${requiredGaps.length}`);

if (errors.length) {
  console.error('\nFalhas da revisão curricular:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nRevisão curricular, cronologia e mídia válidas.');
