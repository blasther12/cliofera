import { readFile } from 'node:fs/promises';

const root = new URL('../docs/', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const tryJson = async path => { try { return await readJson(path); } catch { return {}; } };

const [data, extra, review, guides, ...contentParts] = await Promise.all([
  readJson('data.json'),
  readJson('extra-courses.json'),
  readJson('extra-courses-review.json'),
  readJson('course-guides.json'),
  tryJson('content.json'),
  tryJson('content/year-1.json'),
  tryJson('content/year-2.json'),
  tryJson('content/year-3.json'),
  tryJson('content/year-4.json'),
  tryJson('content/extension-a.json'),
  tryJson('content/extension-b.json'),
  tryJson('content/extension-c1.json'),
  tryJson('content/extension-c2.json'),
  tryJson('content/greece-expansion.json'),
  tryJson('content/final-review.json')
]);

const courses = [...(data.courses || []), ...(extra.courses || []), ...(review.courses || [])];
const content = Object.assign({}, ...contentParts);
const errors = [];
const warnings = [];
let lessons = 0;
let paragraphs = 0;
let longSentences = 0;
let denseParagraphs = 0;
let shortLessons = 0;

const sentences = text => String(text || '').replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
const words = text => String(text || '').trim().split(/\s+/).filter(Boolean).length;

const ids = new Set();
for (const course of courses) {
  if (!course.id || ids.has(course.id)) errors.push(`disciplina ausente/duplicada: ${course.id}`);
  ids.add(course.id);
  const guide = guides[course.id];
  if (!guide) {
    errors.push(`${course.id}: sem guia didático em course-guides.json`);
  } else {
    if (String(guide.plain || '').length < 120) errors.push(`${course.id}: abertura didática curta demais`);
    if (!Array.isArray(guide.questions) || guide.questions.length < 3) errors.push(`${course.id}: menos de 3 perguntas-guia`);
    if (!Array.isArray(guide.watch) || guide.watch.length < 3) errors.push(`${course.id}: menos de 3 alertas de leitura`);
    if (String(guide.connection || '').length < 70) errors.push(`${course.id}: conexão curricular superficial`);
  }

  const detail = content[course.id];
  if (!detail?.modules?.length) continue;
  for (const lesson of detail.modules) {
    lessons += 1;
    const explanation = Array.isArray(lesson.explanation) ? lesson.explanation : [];
    const chars = explanation.join(' ').length;
    if (chars < 180) {
      shortLessons += 1;
      warnings.push(`${course.id} / ${lesson.title}: explicação com menos de 180 caracteres`);
    }
    for (const paragraph of explanation) {
      paragraphs += 1;
      if (String(paragraph).length > 650) {
        denseParagraphs += 1;
        warnings.push(`${course.id} / ${lesson.title}: parágrafo muito denso (${String(paragraph).length} caracteres)`);
      }
      for (const sentence of sentences(paragraph)) {
        if (words(sentence) > 48) {
          longSentences += 1;
          warnings.push(`${course.id} / ${lesson.title}: frase com ${words(sentence)} palavras`);
        }
      }
    }
  }
}

const coverage = courses.length ? Math.round(Object.keys(guides).filter(id => ids.has(id)).length / courses.length * 100) : 0;
console.log(`Disciplinas auditadas: ${courses.length}`);
console.log(`Cobertura de guias didáticos: ${coverage}%`);
console.log(`Aulas auditadas: ${lessons}`);
console.log(`Parágrafos auditados: ${paragraphs}`);
console.log(`Aulas curtas sinalizadas: ${shortLessons}`);
console.log(`Parágrafos densos sinalizados: ${denseParagraphs}`);
console.log(`Frases longas sinalizadas: ${longSentences}`);

if (warnings.length) {
  console.log('\nAvisos editoriais (não bloqueiam publicação):');
  warnings.slice(0, 30).forEach(item => console.log(`- ${item}`));
  if (warnings.length > 30) console.log(`- ... e mais ${warnings.length - 30} aviso(s)`);
}

if (errors.length) {
  console.error('\nFalhas editoriais:');
  errors.forEach(item => console.error(`- ${item}`));
  process.exit(1);
}

console.log('\nAuditoria editorial concluída.');
