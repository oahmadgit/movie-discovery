import type { CrewMember } from '../api/client';

export function CrewList({ crew }: { crew: CrewMember[] }) {
  if (!crew?.length) return <p>No crew information available.</p>;

  return (
    <ul className="crew-list">
      {crew.map((member) => (
        <li key={`${member.person_id}-${member.job}`}>
          {member.name} &mdash; {member.job}
        </li>
      ))}
    </ul>
  );
}
