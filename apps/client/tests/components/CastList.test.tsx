import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CastList } from '../../src/components/CastList';

describe('CastList', () => {
  it('renders a card per cast member with name and character', () => {
    render(
      <CastList
        cast={[
          { person_id: 1, name: 'Tim Robbins', character: 'Andy Dufresne', order: 0 },
          { person_id: 2, name: 'Morgan Freeman', character: "Ellis Boyd 'Red' Redding", order: 1 },
        ]}
      />
    );
    expect(screen.getByText('Tim Robbins')).toBeInTheDocument();
    expect(screen.getByText('Andy Dufresne')).toBeInTheDocument();
    expect(screen.getByText('Morgan Freeman')).toBeInTheDocument();
    expect(screen.getByText("Ellis Boyd 'Red' Redding")).toBeInTheDocument();
  });

  it('shows an empty-state message when cast is empty', () => {
    render(<CastList cast={[]} />);
    expect(screen.getByText('No cast information available.')).toBeInTheDocument();
  });

  it('shows an empty-state message when cast is undefined', () => {
    render(<CastList cast={undefined as unknown as []} />);
    expect(screen.getByText('No cast information available.')).toBeInTheDocument();
  });
});
