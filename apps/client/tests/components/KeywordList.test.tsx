import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeywordList } from '../../src/components/KeywordList';

describe('KeywordList', () => {
  it('renders a pill per keyword', () => {
    render(
      <KeywordList
        keywords={[
          { keyword_id: 1, name: 'prison' },
          { keyword_id: 2, name: 'wrongful imprisonment' },
        ]}
      />
    );
    expect(screen.getByText('prison')).toBeInTheDocument();
    expect(screen.getByText('wrongful imprisonment')).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no keywords', () => {
    render(<KeywordList keywords={[]} />);
    expect(screen.getByText('No keywords available.')).toBeInTheDocument();
  });
});
