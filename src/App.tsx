import { useEffect } from 'react';
import { useLoja } from './estado/loja';
import { Menu } from './telas/Menu';
import { Modos } from './telas/Modos';
import { Partida } from './telas/Partida';
import { FimDeJogo } from './telas/FimDeJogo';
import { Ranking } from './telas/Ranking';
import { Estatisticas } from './telas/Estatisticas';
import { Acervo } from './telas/Acervo';
import { Editor } from './telas/Editor';
import { Configuracoes } from './telas/Configuracoes';
import { Regulamento } from './telas/Regulamento';
import { Duelo } from './telas/Duelo';
import { configurarAudio } from './audio/sintetizador';

export function App() {
  const tela = useLoja((e) => e.tela);
  const config = useLoja((e) => e.config);

  useEffect(() => {
    configurarAudio(config.som, config.volume);
  }, [config.som, config.volume]);

  return (
    <div className={`app ${config.animacoes ? '' : 'sem-animacoes'}`}>
      {tela === 'menu' && <Menu />}
      {tela === 'modos' && <Modos />}
      {tela === 'partida' && <Partida />}
      {tela === 'fim' && <FimDeJogo />}
      {tela === 'ranking' && <Ranking />}
      {tela === 'estatisticas' && <Estatisticas />}
      {tela === 'acervo' && <Acervo />}
      {tela === 'editor' && <Editor />}
      {tela === 'config' && <Configuracoes />}
      {tela === 'regulamento' && <Regulamento />}
      {tela === 'duelo' && <Duelo />}
    </div>
  );
}
