import type { CrewMember } from '../api/client';
import { PersonPlaceholder } from './placeholders/PersonPlaceholder';

export function CrewList({ crew }: { crew: CrewMember[] }) {
  if (!crew?.length) return <p className="empty-note">No crew information available.</p>;

  return (
    <ul className="crew-list">
      {crew.map((member) => (
        <li key={`${member.person_id}-${member.job}`} className="crew-item">
          <div className="crew-avatar">
            <PersonPlaceholder />
          </div>
          <span>
            {member.name} — <span className="crew-job">{member.job}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
