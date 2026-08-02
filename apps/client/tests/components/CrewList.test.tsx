import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CrewList } from '../../src/components/CrewList';

describe('CrewList', () => {
  it('renders each crew member with their job', () => {
    render(
      <CrewList
        crew={[
          { person_id: 1, name: 'Frank Darabont', job: 'Director', department: 'Directing' },
          { person_id: 2, name: 'Roger Deakins', job: 'Director of Photography', department: 'Camera' },
        ]}
      />
    );
    expect(screen.getByText(/Frank Darabont/)).toBeInTheDocument();
    expect(screen.getByText('Director')).toBeInTheDocument();
    expect(screen.getByText(/Roger Deakins/)).toBeInTheDocument();
    expect(screen.getByText('Director of Photography')).toBeInTheDocument();
  });

  it('shows an empty-state message when crew is empty', () => {
    render(<CrewList crew={[]} />);
    expect(screen.getByText('No crew information available.')).toBeInTheDocument();
  });
});
