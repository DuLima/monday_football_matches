import { useRef, useState } from 'react';
import type { Season, TeamId } from '../data/types';
import { useAuth } from '../firebase/auth';
import { formatTimeGone, getInjury, isInjured } from '../lib/injuries';
import { playerStats } from '../lib/stats';
import { InjuryDialog } from './InjuryDialog';
import { MedicalIcon } from './MedicalIcon';

export function PlayersTable({ season }: { season: Season }) {
  const { isOwner } = useAuth();
  const players = playerStats(season);
  const orderedTeams: TeamId[] = ['chiti', 'grilo'];
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [dialogFor, setDialogFor] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="-mx-px overflow-x-auto">
        <table className="w-full min-w-[1080px] text-xs sm:text-sm">
          <thead className="bg-brand-dark text-white">
            <tr>
              <Th align="left" className="pl-5">Jogador</Th>
              <Th align="left">Jogos</Th>
              <Th align="left">Equipa(s)</Th>
              <Th align="left">Golos</Th>
              <Th align="left">A. Golos</Th>
              <Th align="left">MOTM</Th>
              <Th align="left">Lesão</Th>
              <Th align="left">Tempo</Th>
              <Th align="left">Vitórias</Th>
              <Th align="left">Empates</Th>
              <Th align="left">Derrotas</Th>
              <Th align="left">% Vit.</Th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const teams = orderedTeams
                .filter(t => (p.perTeam[t] ?? 0) > 0)
                .sort((a, b) => (p.perTeam[b] ?? 0) - (p.perTeam[a] ?? 0));
              const injured = isInjured(season, p.name);
              const injury = getInjury(season, p.name);
              return (
                <tr key={p.name} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                  <Td align="left" className="pl-5 font-semibold text-slate-800">
                    <NameWithMenu
                      name={p.name}
                      injured={injured}
                      canEdit={isOwner}
                      menuOpen={menuFor === p.name}
                      onToggleMenu={() => setMenuFor(menuFor === p.name ? null : p.name)}
                      onCloseMenu={() => setMenuFor(null)}
                      onIntroduce={() => { setMenuFor(null); setDialogFor(p.name); }}
                    />
                  </Td>
                  <Td align="left">{p.games}</Td>
                  <Td align="left">
                    <div className="flex flex-wrap gap-1.5">
                      {teams.map(t => {
                        const team = season.teams[t];
                        return (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name} ({p.perTeam[t]})
                          </span>
                        );
                      })}
                    </div>
                  </Td>
                  <Td align="left">
                    {p.goals > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {p.goals} ⚽
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">
                    {p.ownGoals > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700" title="Auto-golos">
                        {p.ownGoals} AG
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">
                    {p.motm > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        ⭐ {p.motm}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">
                    {injured && injury ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                        {injury.type}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">
                    {injured && injury ? (
                      <span className="text-xs font-semibold text-rose-700">{formatTimeGone(injury)}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">{p.wins}</Td>
                  <Td align="left">{p.draws}</Td>
                  <Td align="left">{p.losses}</Td>
                  <Td align="left">{p.winPct}%</Td>
                </tr>
              );
            })}
            {players.length === 0 && (
              <tr>
                <td colSpan={12} className="p-6 text-center text-slate-500">Sem jogadores registados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {dialogFor && (
        <InjuryDialog
          name={dialogFor}
          current={getInjury(season, dialogFor)}
          onClose={() => setDialogFor(null)}
        />
      )}
    </div>
  );
}

function NameWithMenu({
  name, injured, canEdit, menuOpen, onToggleMenu, onCloseMenu, onIntroduce,
}: {
  name: string;
  injured: boolean;
  canEdit: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onIntroduce: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => canEdit && onToggleMenu()}
        className={
          'inline-flex items-center gap-1.5 text-left ' +
          (canEdit ? 'hover:text-brand-red' : 'cursor-default')
        }
      >
        {injured && <MedicalIcon size={14} />}
        <span>{name}</span>
      </button>
      {menuOpen && canEdit && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={onCloseMenu}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-full z-40 mt-1 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={onIntroduce}
              className="block w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-brand-red-soft hover:text-brand-red"
            >
              {injured ? 'Editar lesão' : 'Introduzir lesão'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children, align = 'center', className = '' }: { children: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <th className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider ${align === 'left' ? 'text-left' : 'text-center'} ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, align = 'center', className = '' }: { children: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <td className={`px-3 py-2.5 ${align === 'left' ? 'text-left' : 'text-center'} ${className}`}>{children}</td>
  );
}
