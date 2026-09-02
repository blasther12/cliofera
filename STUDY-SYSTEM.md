# Sistema de estudo da Cliofera

A Cliofera combina currículo, cronologia, historiografia, fontes, literatura e produção escrita. A interface adiciona agora caminhos opcionais, relações entre disciplinas, fichamento, domínio historiográfico, avaliações semestrais e bibliografia estruturada.

## Caminhos de estudo

`docs/study-map.json` define caminhos que atravessam a grade por problema histórico:

- Antiguidade, arqueologia e mundos clássicos;
- Mediterrâneo, Islã e mundos medievais;
- Ásia e conexões globais;
- Américas, povos indígenas e Brasil;
- Capitalismo, trabalho e socialismos;
- Século XX, guerras e ordem global;
- Método, historiografia e pesquisa.

Eles não substituem os oito semestres. Servem como outra lente de navegação.

## Mapa de relações

O mesmo arquivo registra:

- `prerequisites`: contexto recomendado;
- `related`: disciplinas conectadas.

A página **Mapa** evita tratar cada disciplina como ilha e torna explícitas simultaneidades e dependências intelectuais.

## Busca transversal

A página **Busca** atravessa:

- disciplinas;
- aulas detalhadas;
- bibliografia;
- literatura;
- debates;
- cronologia.

Assim uma busca por `escravidão`, `Homero`, `gênero` ou `Gramsci` encontra o assunto nos diferentes lugares em que aparece.

## Caderno do historiador

Cada aula possui três critérios de domínio:

1. **Situo o contexto** — tempo, espaço, agentes e processos sem anacronismo;
2. **Analiso fontes** — autoria, finalidade, evidências, silêncios e limites;
3. **Comparo interpretações** — divergências historiográficas e conclusão provisória sustentada.

As notas ficam em `localStorage` e podem ser exportadas/importadas pela página **Caderno**.

## Metadados por aula

`lesson-meta.js` acrescenta:

- tempo estimado;
- nível da aula;
- conteúdo recomendado antes de estudar aquele tópico.

A aula anterior é priorizada. Na primeira aula da disciplina, a interface usa os pré-requisitos do mapa de estudo quando existirem.

## Avaliações semestrais

`docs/assessments.json` define oito produções, uma por semestre, com uma rubrica comum de 100 pontos:

- problema e recorte: 20%;
- uso de fontes: 25%;
- diálogo historiográfico: 20%;
- argumentação: 25%;
- forma e referências: 10%.

A intenção é avaliar produção histórica e não memorização de datas.

## Fontes

`docs/study-map.json` possui coleções confiáveis para começar uma pesquisa, como:

- Biblioteca Nacional Digital;
- Hemeroteca Digital Brasileira;
- Arquivo Nacional;
- Perseus Digital Library;
- Internet History Sourcebooks;
- Gallica;
- Europeana;
- The Programming Historian.

Algumas disciplinas recebem atalhos diretos para as coleções mais úteis.

## Bibliografia estruturada

`docs/bibliography.json` registra algumas obras centrais com:

- autor;
- título;
- tipo da obra;
- função no curso;
- orientação de edição/leitura;
- URL quando verificada;
- ISBN apenas quando efetivamente conferido.

A página **Bibliografia** permite navegar por esse catálogo e as disciplinas exibem as entradas associadas.

## Status editorial

`docs/study-map.json` registra status e data de revisão. O padrão atual é:

```json
{
  "status": "reviewed",
  "lastReviewed": "2026-09-02",
  "reviewEveryDays": 365
}
```

Conteúdos próximos ao tempo presente ou ferramentas digitais podem usar cadência menor.

## CI

O deploy valida:

- 54 disciplinas e conteúdo detalhado;
- aulas, objetivos, leituras e projetos finais;
- lacunas curriculares já identificadas;
- cronologia e eixos transversais;
- caminhos e relações;
- fontes;
- avaliações e rubrica;
- bibliografia estruturada;
- metadados por aula;
- scripts e JSONs usados na interface.

## Como adicionar conteúdo

Consulte o manual global:

<https://github.com/blasther12/blasther12.github.io/blob/main/CONTENT-GUIDE.md>
