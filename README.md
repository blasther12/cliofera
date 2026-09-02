# Lyceum

> Uma faculdade autodidata de História, sem diploma, mas com currículo, bibliografia, fontes, debates e produção escrita.

## Objetivo

O Lyceum é um projeto open source para estudar História de forma sistemática, com uma estrutura inspirada em uma graduação universitária.

A proposta não é apenas aprender datas e acontecimentos, mas desenvolver pensamento histórico:

- analisar fontes primárias e secundárias;
- compreender debates historiográficos;
- comparar interpretações;
- reconhecer anacronismos;
- construir argumentos com evidências;
- escrever resenhas, ensaios e pesquisas;
- desenvolver autonomia para estudar História.

## Estrutura

O projeto possui quatro eixos:

1. **Currículo** — uma trilha de quatro anos e oito semestres.
2. **Grandes Debates da História** — perguntas historiográficas sem resposta única.
3. **Grandes Problemas Históricos** — temas que atravessam diferentes épocas.
4. **Produção acadêmica** — fichamentos, resenhas, ensaios e trabalho final.

## Acesso pelo navegador e celular

O Lyceum possui uma aplicação em `docs/`, publicada via GitHub Pages e preparada como **PWA (Progressive Web App)**.

Quando o Pages estiver habilitado, o endereço será:

**https://blasther12.github.io/lyceum-historia/**

### iPhone / iPad

1. Abra o endereço no Safari.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. O Lyceum passa a aparecer junto aos seus aplicativos.

### Android

1. Abra o endereço no Chrome.
2. Use **Instalar app** ou **Adicionar à tela inicial**.
3. Confirme a instalação.

O aplicativo inclui layout responsivo, navegação móvel, progresso salvo no aparelho, exportação/importação de progresso e cache básico para uso offline.

## Comece aqui

No site, abra **Currículo** e comece por **Introdução aos Estudos Históricos**.

A trilha inclui 32 disciplinas, História do Socialismo e suas Vertentes e Grandes Debates como:

- Por que Roma caiu?
- O feudalismo realmente existiu?
- Quando começa o capitalismo?
- Reforma ou revolução?
- Outubro de 1917: revolução ou golpe?
- Stalin foi continuidade ou ruptura de Lenin?
- Por que a União Soviética colapsou?

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
