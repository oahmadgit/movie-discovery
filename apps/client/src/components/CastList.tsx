import type { CastMember } from '../api/client';
import { PersonPlaceholder } from './placeholders/PersonPlaceholder';

export function CastList({ cast }: { cast: CastMember[] }) {
  if (!cast?.length) return <p className="empty-note">No cast information available.</p>;

  return (
    <div className="cast-strip">
      {cast.map((member) => (
        <div key={member.person_id} className="cast-card">
          <div className="cast-avatar">
            <PersonPlaceholder />
          </div>
          <p className="cast-name">{member.name}</p>
          <p className="cast-character">{member.character}</p>
        </div>
      ))}
    </div>
  );
}
