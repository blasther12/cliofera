import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentFiles = [
  'docs/content.json',
  'docs/content/year-1.json',
  'docs/content/year-2.json',
  'docs/content/year-3.json',
  'docs/content/year-4.json',
  'docs/content/extension-a.json',
  'docs/content/extension-b.json',
  'docs/content/extension-c1.json',
  'docs/content/extension-c2.json',
  'docs/content/greece-expansion.json',
  'docs/content/final-review.json'
];

const stopwords = new Set('a o as os de da do das dos e em no na nos nas um uma uns umas para por com sem que qual quais como porque porquê quando onde quem seu sua seus suas pode podem deve devem é são foi foram ser ter entre mais menos muito muita sobre ao aos à às ou se isso essa esse este esta seus suas'.split(' '));
const clean = value => String(value || '').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, ' ');
const tokens = value => clean(value).split(/\s+/).filter(token => token.length >= 4 && !stopwords.has(token));
const sentences = value => String(value || '').split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.length > 28);

function cautionFor(question) {
  const q = clean(question);
  if (/necessari|sempre|automatic|inevit|todo|nunca/.test(q)) return 'Evite respostas absolutas. Em História, indique condições, exceções e diferenças de contexto.';
  if (/por que|porque|causa/.test(q)) return 'Separe causas de longa duração, conjunturas e gatilhos. Um acontecimento histórico raramente possui uma causa única.';
  if (/como/.test(q)) return 'Explique o processo em etapas e mostre quais agentes, instituições ou condições tornam essa relação possível.';
  if (/fonte|document|evidenc|arqueolog|testemunh/.test(q)) return 'Diferencie o que a fonte mostra diretamente do que estamos inferindo. Considere autoria, contexto, público e silêncios.';
  if (/compare|diferen|distingu/.test(q)) return 'Defina cada elemento antes de comparar. Depois explicite semelhanças, diferenças e o critério usado na comparação.';
  return 'Trate a resposta como uma interpretação argumentada: formule uma ideia central, apoie-a em evidências e indique seus limites.';
}

function answerFromLesson(lesson, question) {
  const source = (lesson.explanation || []).flatMap(sentences);
  const qTokens = new Set(tokens(question));
  const scored = source.map((sentence, index) => {
    const st = tokens(sentence);
    const overlap = st.filter(token => qTokens.has(token)).length;
    const conceptHits = (lesson.concepts || []).filter(concept => {
      const c = tokens(concept);
      return c.some(token => qTokens.has(token) || st.includes(token));
    }).length;
    return { sentence, score: overlap * 5 + conceptHits * 2 - index * 0.05 };
  }).sort((a, b) => b.score - a.score);

  const selected = [];
  for (const item of scored) {
    if (!selected.includes(item.sentence)) selected.push(item.sentence);
    if (selected.length === 3) break;
  }
  if (!selected.length) selected.push(...source.slice(0, 2));

  const shortAnswer = selected[0] || 'A resposta precisa ser construída a partir do conteúdo e das evidências discutidas nesta aula.';
  const commentary = selected.slice(0, 3).join(' ');
  const keyPoints = (lesson.concepts || []).slice(0, 5);
  return {
    question,
    shortAnswer,
    commentary,
    caution: cautionFor(question),
    keyPoints
  };
}

const merged = {};
for (const relative of contentFiles) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) continue;
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(merged, parsed);
}

const answerKey = {};
let lessons = 0;
let questions = 0;
for (const [courseId, course] of Object.entries(merged)) {
  const modules = Array.isArray(course?.modules) ? course.modules : [];
  if (!modules.length) continue;
  answerKey[courseId] = {};
  modules.forEach((lesson, index) => {
    if (!Array.isArray(lesson.questions) || !lesson.questions.length) return;
    lessons += 1;
    questions += lesson.questions.length;
    answerKey[courseId][String(index)] = {
      title: lesson.title,
      answers: lesson.questions.map(question => answerFromLesson(lesson, question))
    };
  });
  if (!Object.keys(answerKey[courseId]).length) delete answerKey[courseId];
}

const output = {
  generatedAt: new Date().toISOString(),
  note: 'Respostas-modelo geradas a partir do conteúdo editorial de cada aula. Em perguntas interpretativas, representam uma resposta possível, não um gabarito absoluto.',
  courses: answerKey
};
fs.writeFileSync(path.join(root, 'docs/answers.json'), JSON.stringify(output, null, 2) + '\n');
console.log(`Commented answers generated for ${questions} questions across ${lessons} lessons.`);
