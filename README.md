# Cliofera

> Uma faculdade autodidata de História, sem diploma, mas com currículo, aulas, historiografia, fontes, literatura, debates e produção de pesquisa.

## O que é

A **Cliofera** é um projeto open source para estudar História de forma sistemática, com uma estrutura inspirada em graduações universitárias e ampliada para estudo independente.

O nome combina **Clio**, musa grega da História, com **esfera**: a ideia de um universo conectado de tempos, lugares, fontes e interpretações.

A proposta não é apenas aprender datas e acontecimentos, mas desenvolver pensamento histórico:

- analisar fontes primárias e secundárias;
- compreender debates historiográficos;
- comparar interpretações;
- reconhecer anacronismos;
- construir argumentos com evidências;
- ler literatura e cultura como representações historicamente situadas;
- escrever resenhas, ensaios e pesquisas;
- trabalhar com arquivos, acervos, museus e patrimônio;
- desenvolver autonomia para pesquisar História.

## Currículo

A trilha principal continua organizada em **quatro anos e oito semestres**, mas agora reúne **46 disciplinas**.

Além do núcleo cronológico e historiográfico original, o currículo foi confrontado com matrizes universitárias brasileiras, incluindo a matriz do Bacharelado em História da PUCPR, e recebeu novos eixos que estavam pouco cobertos ou ausentes:

- Fundamentos da Sociologia para Historiadores;
- Fundamentos da Antropologia para Historiadores;
- História da Ásia;
- História da América Latina;
- História dos Estados Unidos e América Anglo-Saxônica;
- História da Arte e Cultura Visual;
- História e Cultura Africana, Afro-Brasileira e Indígena;
- História do Paraná e de Curitiba;
- História da Alimentação;
- História das Mulheres, Gênero e Sexualidades;
- Arquivos, Centros Documentais e Acervos;
- Patrimônio, Museus e História Pública;
- Direitos Humanos em Perspectiva Histórica;
- História Ambiental.

A intenção não é copiar uma graduação específica, mas usar currículos acadêmicos como **benchmark de cobertura** e manter a Cliofera mais ampla em historiografia, comparação, literatura e projetos autorais.

## Como cada disciplina funciona

Cada disciplina deve oferecer:

1. **Visão geral** e objetivos de aprendizagem.
2. **Aulas detalhadas** com conceitos-chave.
3. **Leitura orientada** explicando o que observar e por que ler.
4. **Fontes primárias** e materiais de época quando aplicáveis.
5. **Perguntas historiográficas** e exercícios.
6. **Guia de leitura acadêmica**.
7. **Biblioteca literária**, separando cânone essencial e trilha expandida.
8. **Projeto final da disciplina**.
9. **Grandes Debates** relacionados ao tema quando existirem.

### Literatura não é historiografia

Romance, poesia, teatro, diário, autobiografia e ficção não entram como prova automática de como uma sociedade "era". Eles são lidos como produções históricas e culturais.

Ao ler literatura, pergunte:

- quando e onde a obra foi produzida;
- quem escreve e para qual público;
- qual é a voz narrativa;
- quais experiências aparecem e quais são silenciadas;
- como a obra representa classe, raça, gênero, religião, guerra, trabalho ou poder;
- como ela dialoga ou entra em tensão com fontes e historiografia.

A disciplina **História do Socialismo e suas Vertentes**, por exemplo, combina Marx, Engels, Luxemburg, Lenin, Gramsci e historiografia especializada com uma trilha literária que passa por Dickens, Zola, Górki, Chernyshevsky, John Reed, Orwell, Koestler, Platonov, Bulgákov, Pasternak, Grossman, Soljenítsin, Victor Serge, Saramago, Jorge Amado, Graciliano Ramos, Neruda, Padura, Aleksiévitch e Le Guin.

## Estrutura do projeto

Os principais eixos são:

1. **Currículo** — quatro anos, oito semestres e 46 disciplinas.
2. **Conteúdo didático** — centenas de aulas com leitura orientada e exercícios.
3. **Biblioteca literária** — cânone essencial e trilhas expandidas por disciplina.
4. **Grandes Debates da História** — perguntas historiográficas sem resposta única.
5. **Grandes Problemas Históricos** — temas que atravessam diferentes épocas.
6. **Produção acadêmica** — fichamentos, resenhas, ensaios e trabalho final.
7. **História pública e profissão** — arquivos, acervos, patrimônio e museus.

## Acesso pelo navegador e celular

A Cliofera possui uma aplicação em `docs/`, publicada via GitHub Pages e preparada como **PWA (Progressive Web App)**.

Enquanto o repositório mantiver o nome atual, o endereço é:

**https://blasther12.github.io/lyceum-historia/**

### iPhone / iPad

1. Abra o endereço no Safari.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. A Cliofera passa a aparecer junto aos seus aplicativos.

### Android

1. Abra o endereço no Chrome.
2. Use **Instalar app** ou **Adicionar à tela inicial**.
3. Confirme a instalação.

O aplicativo inclui layout responsivo, navegação móvel, progresso salvo no aparelho, exportação/importação de progresso e cache para uso offline.

## Comece aqui

No site, abra **Currículo** e comece por **Introdução aos Estudos Históricos**.

A trilha inclui Grandes Debates como:

- Por que Roma caiu?
- O feudalismo realmente existiu?
- Quando começa o capitalismo?
- A Revolução Industrial melhorou inicialmente a vida das pessoas?
- Reforma ou revolução?
- Outubro de 1917: revolução ou golpe?
- Stalin foi continuidade ou ruptura de Lenin?
- Por que a União Soviética colapsou?

## Qualidade acadêmica do conteúdo

O workflow de publicação executa `scripts/validate-content.mjs` antes do deploy. O validador impede a publicação se uma disciplina não possuir o mínimo esperado de:

- introdução;
- objetivos;
- aulas detalhadas;
- conceitos;
- leitura orientada;
- perguntas;
- exercícios;
- guia de leitura;
- projeto final;
- biblioteca literária.

Isso não substitui revisão acadêmica humana, mas evita que páginas vazias ou estruturas incompletas sejam publicadas silenciosamente.

## Desenvolvimento local

```bash
python3 -m http.server 8000 --directory docs
```

Abra `http://localhost:8000`.

## GitHub Pages

O workflow `.github/workflows/pages.yml` publica automaticamente a pasta `docs/` a cada push na branch `main`.

Caso seja necessário habilitar manualmente, abra **Settings → Pages → Source → GitHub Actions**.

## Filosofia

O objetivo final não é “terminar História”.

É aprender a **pensar historicamente**.
