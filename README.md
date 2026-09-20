# Show do Milhão

Réplica jogável, em português do Brasil, do clássico programa de perguntas e respostas —
com **1.600 perguntas autorais**, ajudas, escada de prêmios e vários modos de jogo.

> Projeto de fã, sem qualquer vínculo com o programa original ou com a emissora.
> Nenhuma marca, logotipo, trilha ou áudio original é reproduzido: a identidade visual é
> própria, os efeitos sonoros são sintetizados em tempo real e todas as perguntas são autorais.

## Começando

```bash
npm install
npm run dev      # http://localhost:5173
```

Outros comandos:

| Comando             | O que faz                                                        |
| ------------------- | ---------------------------------------------------------------- |
| `npm run build`     | Checagem de tipos + build de produção em `dist/`                  |
| `npm run preview`   | Serve o build de produção                                         |
| `npm test`          | Testes do motor do jogo e do banco de perguntas (Vitest)          |
| `npm run validar`   | Valida as 1.600 perguntas e imprime o relatório do banco          |
| `npm run checar`    | Mesma validação em forma de CLI rápida, útil ao editar perguntas  |
| `npm run typecheck` | Só a checagem de tipos                                            |

## O jogo

São **16 perguntas** em ordem crescente de dificuldade, de R$ 1.000 a **R$ 1.000.000**.

**Ajudas:** 🃏 Cartas (elimina duas alternativas erradas) · 🎓 Universitários (três estudantes
opinam, e erram mais nas perguntas difíceis) · 🪧 Placas (votação da plateia) · ⏭️ Pular (3×) ·
🛑 Parar (encerra levando o acumulado).

Cada pergunta tem tempo para ser respondida. No preset clássico o relógio começa em **45
segundos** e cresce conforme o prêmio: 68 segundos da 6ª à 10ª pergunta e 90 segundos da 11ª em
diante. Se o tempo acabar, a partida termina como se a resposta estivesse errada.

Na 16ª pergunta vale a regra clássica: acertar paga o milhão, parar garante R$ 500 mil e
errar significa ir para casa sem nada. Nos demais degraus, o efeito do erro depende do preset
escolhido em Configurações:

- **Clássico** — leva metade do valor acumulado; 45s por pergunta, com tempo extra nas mais valiosas (padrão);
- **Radical** — sai sem nada, com 30 segundos fixos por pergunta;
- **Patamares** — garante R$ 5 mil e R$ 50 mil, com um minuto por pergunta.

O tempo-base, o crescimento e o próprio cronômetro (que pode ser desligado) ficam ajustáveis em
Configurações.

### Outros modos

**Treino** por categoria · **Contra-relógio** (20s por pergunta, com bônus por velocidade) ·
**Sobrevivência** (três vidas, dificuldade crescente) · **Duelo** para dois jogadores no mesmo
aparelho.

### Outras telas

Hall da Fama, estatísticas de aproveitamento por categoria, **Acervo** (busca e consulta das
1.600 perguntas com gabarito e explicação), **Editor** de perguntas próprias com importação e
exportação em JSON, configurações e regulamento.

## O banco de perguntas

16 categorias × 5 níveis × 20 perguntas = **1.600 perguntas**, cada uma com quatro alternativas
e uma explicação exibida após a resposta.

História do Brasil · História Geral · Geografia do Brasil · Geografia Mundial · Biologia e Corpo
Humano · Física e Química · Matemática e Lógica · Língua Portuguesa · Literatura · Música ·
Cinema e TV · Futebol · Esportes · Tecnologia e Internet · Arte, Mitologia e Religião ·
Curiosidades Gerais.

As perguntas ficam em `src/dados/perguntas/<categoria>.ts`, escritas em um formato compacto:

```ts
['Em que ano foi proclamada a Independência do Brasil?',
 ['1808', '1822', '1889', '1500'], 1,
 'A Independência foi proclamada em 7 de setembro de 1822.'],
```

O terceiro campo é o índice da alternativa correta (0 = A). Os ids (`categoria-nivel-NN`) são
gerados automaticamente por `montar()`.

`npm run validar` cobre: formato e unicidade dos ids, quatro alternativas distintas e não
vazias, gabarito válido, tamanho de enunciados e explicações, enunciados duplicados em todo o
banco, contagem exata de 20 perguntas por categoria e nível, e equilíbrio do gabarito (hoje
exatamente 400 respostas em cada letra).

## Estrutura

```
src/
  tipos.ts              # tipos centrais
  dados/                # categorias, escada de prêmios, banco de perguntas, validação
  jogo/                 # motor puro, sem React: sorteio, ajudas, regras, máquina de estados
  telas/                # Menu, Partida, Fim de jogo, Ranking, Acervo, Editor, Duelo…
  componentes/          # escada, alternativas, ajudas, cronômetro, cheque premiado
  audio/                # efeitos sintetizados via Web Audio API
  armazenamento/        # localStorage versionado
  estado/loja.ts        # store (zustand) que amarra tudo
```

O motor do jogo é composto de funções puras, testadas isoladamente em
`src/jogo/*.test.ts` — inclusive o cálculo de prêmio em cada preset de regra, o comportamento
das ajudas e o sorteio determinístico por semente.

## Acessibilidade e compatibilidade

Teclas **A/B/C/D** ou **1–4** selecionam a alternativa e **Enter** confirma; foco visível em
todos os controles, regiões `aria-live` na revelação da resposta e respeito a
`prefers-reduced-motion`. O layout funciona a partir de 400px de largura, com a escada de
prêmios rolando na horizontal no celular.

Todos os dados (perfil, histórico, estatísticas e perguntas criadas por você) ficam apenas no
`localStorage` do navegador — nada é enviado para nenhum servidor.
