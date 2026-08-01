import type { CastMember } from '../api/client';

export function CastList({ cast }: { cast: CastMember[] }) {
  if (!cast?.length) return <p>No cast information available.</p>;

  return (
    <ul className="cast-list">
      {cast.map((member) => (
        <li key={member.person_id}>
          {member.name} as {member.character}
        </li>
      ))}
    </ul>
  );
}
