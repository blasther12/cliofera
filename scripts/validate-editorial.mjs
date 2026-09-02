import { readFile } from 'node:fs/promises';

const map = JSON.parse(await readFile(new URL('../docs/study-map.json', import.meta.url), 'utf8'));
const errors = [];
const now = new Date();
now.setHours(0, 0, 0, 0);

const validateMeta = (label, meta) => {
  if (!['draft', 'reviewed', 'verified'].includes(meta?.status)) {
    errors.push(`${label}: status editorial inválido`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta?.lastReviewed || '')) {
    errors.push(`${label}: lastReviewed inválido`);
    return;
  }
  if (!Number.isInteger(meta?.reviewEveryDays) || meta.reviewEveryDays <= 0) {
    errors.push(`${label}: reviewEveryDays inválido`);
    return;
  }
  const reviewed = new Date(`${meta.lastReviewed}T00:00:00`);
  const ageDays = Math.floor((now - reviewed) / 86400000);
  if (ageDays > meta.reviewEveryDays) {
    errors.push(`${label}: revisão vencida há ${ageDays} dias; cadência é ${meta.reviewEveryDays} dias`);
  }
};

validateMeta('defaultEditorial', map.defaultEditorial);
for (const [courseId, override] of Object.entries(map.editorial || {})) {
  validateMeta(courseId, { ...map.defaultEditorial, ...override });
}

if (errors.length) {
  console.error('Falhas de frescor editorial:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Frescor editorial válido em ${1 + Object.keys(map.editorial || {}).length} políticas.`);
