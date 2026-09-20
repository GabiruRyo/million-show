import { useState } from 'react';
import { Cabecalho } from '../componentes/Cabecalho';
import { CATEGORIAS, CATEGORIA_POR_ID } from '../dados/categorias';
import { useLoja } from '../estado/loja';
import { LETRAS } from '../jogo/ajudas';
import type { CategoriaId, IndiceAlternativa, Nivel, PerguntaCustomizada } from '../tipos';

const VAZIO = {
  categoria: 'curiosidades' as CategoriaId,
  nivel: 1 as Nivel,
  enunciado: '',
  alternativas: ['', '', '', ''] as [string, string, string, string],
  correta: 0 as IndiceAlternativa,
  explicacao: '',
};

export function Editor() {
  const customizadas = useLoja((e) => e.customizadas);
  const salvar = useLoja((e) => e.salvarCustomizada);
  const remover = useLoja((e) => e.removerCustomizada);

  const [rascunho, setRascunho] = useState({ ...VAZIO });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');

  const valido =
    rascunho.enunciado.trim().length > 8 &&
    rascunho.alternativas.every((a) => a.trim().length > 0) &&
    new Set(rascunho.alternativas.map((a) => a.trim().toLowerCase())).size === 4;

  function gravar() {
    if (!valido) return;
    const pergunta: PerguntaCustomizada = {
      id: editandoId ?? `custom-${Date.now()}`,
      categoria: rascunho.categoria,
      nivel: rascunho.nivel,
      enunciado: rascunho.enunciado.trim(),
      alternativas: rascunho.alternativas.map((a) => a.trim()) as [string, string, string, string],
      correta: rascunho.correta,
      explicacao: rascunho.explicacao.trim() || 'Pergunta criada por você no editor.',
      customizada: true,
      criadaEm: Date.now(),
    };
    salvar(pergunta);
    setRascunho({ ...VAZIO });
    setEditandoId(null);
    setAviso('Pergunta salva! Ela já entra no sorteio das próximas partidas.');
    window.setTimeout(() => setAviso(''), 4000);
  }

  function editar(pergunta: PerguntaCustomizada) {
    setRascunho({
      categoria: pergunta.categoria,
      nivel: pergunta.nivel,
      enunciado: pergunta.enunciado,
      alternativas: [...pergunta.alternativas] as [string, string, string, string],
      correta: pergunta.correta,
      explicacao: pergunta.explicacao,
    });
    setEditandoId(pergunta.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function exportar() {
    const blob = new Blob([JSON.stringify(customizadas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'minhas-perguntas.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function importar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const lista = JSON.parse(String(leitor.result)) as PerguntaCustomizada[];
        let importadas = 0;
        for (const item of lista) {
          if (!item.enunciado || !Array.isArray(item.alternativas) || item.alternativas.length !== 4) continue;
          salvar({ ...item, id: item.id ?? `custom-${Date.now()}-${importadas}`, customizada: true, criadaEm: Date.now() });
          importadas++;
        }
        setAviso(`${importadas} pergunta(s) importada(s).`);
      } catch {
        setAviso('Não consegui ler esse arquivo JSON.');
      }
      window.setTimeout(() => setAviso(''), 4000);
    };
    leitor.readAsText(arquivo);
    evento.target.value = '';
  }

  return (
    <>
      <Cabecalho titulo="✏️ Editor de perguntas" />
      <div className="conteudo">
        <div className="painel painel-ouro" style={{ marginBottom: 18 }}>
          <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>
            {editandoId ? 'Editando pergunta' : 'Nova pergunta'}
          </h3>
          <div className="linha">
            <div className="campo" style={{ flex: '1 1 220px' }}>
              <label htmlFor="cat">Categoria</label>
              <select
                id="cat"
                value={rascunho.categoria}
                onChange={(e) => setRascunho({ ...rascunho, categoria: e.target.value as CategoriaId })}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
                ))}
              </select>
            </div>
            <div className="campo" style={{ flex: '0 1 160px' }}>
              <label htmlFor="niv">Dificuldade</label>
              <select
                id="niv"
                value={rascunho.nivel}
                onChange={(e) => setRascunho({ ...rascunho, nivel: Number(e.target.value) as Nivel })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>Nível {n} {'⭐'.repeat(n)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="campo">
            <label htmlFor="enun">Enunciado</label>
            <textarea
              id="enun"
              value={rascunho.enunciado}
              maxLength={220}
              placeholder="Qual é a capital do estado de Roraima?"
              onChange={(e) => setRascunho({ ...rascunho, enunciado: e.target.value })}
            />
          </div>

          {rascunho.alternativas.map((texto, i) => (
            <div className="campo" key={i}>
              <label htmlFor={`alt-${i}`}>
                Alternativa {LETRAS[i]}
                <button
                  type="button"
                  className={`botao botao-pequeno ${rascunho.correta === i ? 'botao-ouro' : 'botao-fantasma'}`}
                  style={{ marginLeft: 10, padding: '2px 10px', fontSize: '0.75rem' }}
                  onClick={() => setRascunho({ ...rascunho, correta: i as IndiceAlternativa })}
                >
                  {rascunho.correta === i ? '✅ é a correta' : 'marcar como correta'}
                </button>
              </label>
              <input
                id={`alt-${i}`}
                value={texto}
                maxLength={120}
                onChange={(e) => {
                  const alternativas = [...rascunho.alternativas] as [string, string, string, string];
                  alternativas[i] = e.target.value;
                  setRascunho({ ...rascunho, alternativas });
                }}
              />
            </div>
          ))}

          <div className="campo">
            <label htmlFor="expl">Explicação / curiosidade (opcional)</label>
            <textarea
              id="expl"
              value={rascunho.explicacao}
              maxLength={320}
              placeholder="Boa Vista é a única capital brasileira totalmente ao norte da linha do Equador."
              onChange={(e) => setRascunho({ ...rascunho, explicacao: e.target.value })}
            />
          </div>

          <div className="linha">
            <button className="botao botao-ouro" disabled={!valido} onClick={gravar}>
              {editandoId ? 'Salvar alterações' : 'Adicionar ao banco'}
            </button>
            {editandoId && (
              <button
                className="botao botao-fantasma"
                onClick={() => {
                  setRascunho({ ...VAZIO });
                  setEditandoId(null);
                }}
              >
                Cancelar
              </button>
            )}
            {!valido && (
              <span className="cinza pequeno">
                Preencha o enunciado e as quatro alternativas (sem repetir texto).
              </span>
            )}
          </div>
          {aviso && <p className="texto-ouro pequeno" role="status">{aviso}</p>}
        </div>

        <div className="painel">
          <div className="linha" style={{ justifyContent: 'space-between' }}>
            <h3 className="texto-ouro" style={{ fontSize: '1rem', margin: 0 }}>
              Minhas perguntas ({customizadas.length})
            </h3>
            <div className="linha">
              <button className="botao botao-fantasma botao-pequeno" onClick={exportar} disabled={customizadas.length === 0}>
                ⬇ Exportar JSON
              </button>
              <label className="botao botao-fantasma botao-pequeno" style={{ display: 'inline-flex' }}>
                ⬆ Importar JSON
                <input type="file" accept="application/json" onChange={importar} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {customizadas.length === 0 ? (
            <p className="cinza" style={{ marginTop: 12 }}>
              Você ainda não criou perguntas. As que criar entram no sorteio junto com as do banco oficial.
            </p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 10 }}>
              <table className="tabela">
                <thead>
                  <tr><th>Pergunta</th><th>Categoria</th><th>Nível</th><th>Gabarito</th><th></th></tr>
                </thead>
                <tbody>
                  {customizadas.map((pergunta) => (
                    <tr key={pergunta.id}>
                      <td style={{ maxWidth: 360 }}>{pergunta.enunciado}</td>
                      <td className="pequeno">{CATEGORIA_POR_ID[pergunta.categoria]?.nomeCurto}</td>
                      <td className="mono">{pergunta.nivel}</td>
                      <td className="mono">{LETRAS[pergunta.correta]}</td>
                      <td>
                        <div className="linha" style={{ gap: 6 }}>
                          <button className="botao botao-fantasma botao-pequeno" onClick={() => editar(pergunta)}>
                            Editar
                          </button>
                          <button className="botao botao-perigo botao-pequeno" onClick={() => remover(pergunta.id)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
