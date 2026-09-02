import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const resolveCourseId = id => id === 'segunda-guerra' ? 'fascismo-segunda-guerra' : id;

const [base, extras, review, literature, literatureReview, timeline, media, finalReview, ...catalogs] = await Promise.all([
  readJson('data.json'),
  readJson('extra-courses.json'),
  readJson('extra-courses-review.json'),
  readJson('literature.json'),
  readJson('literature-review.json'),
  readJson('timeline.json'),
  readJson('media.json'),
  readJson('content/final-review.json'),
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

const appendUnique = (target = [], incoming = [], key = value => typeof value === 'string' ? value : JSON.stringify(value)) => {
  const result = [...target];
  const seen = new Set(result.map(key));
  for (const item of incoming || []) {
    const id = key(item);
    if (!seen.has(id)) {
      seen.add(id);
      result.push(item);
    }
  }
  return result;
};

for (const [courseId, patch] of Object.entries(finalReview || {})) {
  if (patch.mode === 'replace' || !content[courseId]) {
    const { mode, ...detail } = patch;
    content[courseId] = detail;
    continue;
  }
  const detail = content[courseId];
  detail.objectives = appendUnique(detail.objectives, patch.objectives);
  detail.modules = appendUnique(detail.modules, patch.modules, module => module.title);
  detail.readingGuide = appendUnique(detail.readingGuide, patch.readingGuide, reading => reading.work);
  if (patch.finalProject) detail.finalProject = patch.finalProject;
}

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
    for (const [index, module] of (detail.modules || []).entries()) {
      const prefix = `${course.id}/aula-${index + 1}`;
      if (!module.title) errors.push(`${prefix}: título ausente`);
      if (!Array.isArray(module.explanation) || module.explanation.join(' ').length < 120) errors.push(`${prefix}: explicação insuficiente`);
      if (!Array.isArray(module.concepts) || module.concepts.length < 3) errors.push(`${prefix}: conceitos insuficientes`);
      if (!module.reading?.work || !module.reading?.focus || !module.reading?.why) errors.push(`${prefix}: leitura orientada incompleta`);
      if (!Array.isArray(module.questions) || module.questions.length < 2) errors.push(`${prefix}: perguntas insuficientes`);
      if (!module.exercise) errors.push(`${prefix}: exercício ausente`);
    }
  }
}

const topicChecks = {
  'antiguidade-ii': ['minoic', 'micên', 'povos do mar', 'ilíada', 'odisseia'],
  'antiguidade-i': ['hitita', 'assíria', 'bília hebraica'.replace('bília', 'bíblia')],
  'pre-historia': ['povoamento das américas', 'lapita', 'pacífico'],
  'africa-i': ['etiópia', 'grande zimbábue', 'kongo'],
  'mundo-islamico': ['sunismo', 'mameluco', 'otomano', 'safávida'],
  'historiografia-ii': ['historiografia feminista', 'atlântico negro', 'historiografias indígenas'],
  'metodologia-pesquisa': ['história oral', 'quantitativa', 'história conectada', 'uso de ia'],
  'brasil-iii': ['nova república', 'tempo presente'],
  'global-contemporanea': ['neoliberalismo', '11 de setembro', 'crise de 2008', 'antropoceno'],
  'primeira-guerra': ['tropas coloniais', 'império otomano'],
  'fascismo-segunda-guerra': ['guerra sino-japonesa', 'imperialismo japonês'],
  'historia-ciencia': ['saúde pública', 'eugenia']
};

for (const [courseId, terms] of Object.entries(topicChecks)) {
  const text = JSON.stringify(content[courseId] || {}).toLocaleLowerCase('pt-BR');
  for (const term of terms) {
    if (!text.includes(term.toLocaleLowerCase('pt-BR'))) errors.push(`${courseId}: tópico da revisão final ausente: ${term}`);
  }
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

const lessonCount = courses.reduce((total, course) => total + (content[course.id]?.modules?.length || 0), 0);
console.log(`Currículo após revisão: ${courses.length} disciplinas`);
console.log(`Aulas após revisão final: ${lessonCount}`);
console.log(`Cronologia mestra: ${timeline.events?.length || 0} marcos`);
console.log(`Eixos transversais: ${timeline.axes?.length || 0}`);
console.log(`Disciplinas com mídia curada: ${Object.keys(media).length}`);
console.log(`Lacunas estruturais cobertas: ${requiredGaps.length}`);
console.log(`Disciplinas aprofundadas na revisão final: ${Object.keys(finalReview || {}).length}`);

if (errors.length) {
  console.error('\nFalhas da revisão curricular:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nRevisão curricular, cronologia, mídia e aprofundamento final válidos.');
