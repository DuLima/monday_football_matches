import type { Team } from '../data/types';

// Emblems live in public/emblems/<team id>.webp; BASE_URL keeps the path valid on GitHub Pages.
export function TeamBadge({ team, size = 72 }: { team: Team; size?: number }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}emblems/${team.id}.webp`}
      alt={team.name}
      title={team.name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 object-contain drop-shadow-[0_4px_10px_rgb(0_0_0/0.5)]"
    />
  );
}
