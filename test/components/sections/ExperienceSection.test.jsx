import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExperienceSection } from '../../../src/components/sections/ExperienceSection';

describe('ExperienceSection Component', () => {
  const fallbackSkills = [
    { id: 'html5', name: 'HTML5', category: 'language', level: 'Experienced', iconClass: 'fa-brands fa-html5' },
    { id: 'flutter', name: 'Flutter', category: 'language', level: 'Experienced', iconClass: 'fa-brands fa-flutter', iconType: 'svg' },
    { id: 'laravel', name: 'Laravel', category: 'framework_tool', level: 'Experienced', iconClass: 'fa-brands fa-laravel' }
  ];

  const firestoreSkills = [
    { id: 'firestore-doc-123', name: 'HTML5', category: 'language', level: 'Experienced', iconClass: 'fa-brands fa-html5' },
    { id: 'firestore-doc-456', name: 'Flutter', category: 'language', level: 'Experienced', iconClass: 'fa-brands fa-flutter', iconType: 'svg' },
    { id: 'firestore-doc-789', name: 'Laravel', category: 'framework_tool', level: 'Experienced', iconClass: 'fa-brands fa-laravel' }
  ];

  it('renders programming languages and frameworks & tools categories', () => {
    render(<ExperienceSection skills={fallbackSkills} />);

    expect(screen.getByText(/Programming Languages/i)).toBeInTheDocument();
    expect(screen.getByText(/Frameworks & Tools/i)).toBeInTheDocument();
    expect(screen.getByText('HTML5')).toBeInTheDocument();
    expect(screen.getByText('Flutter')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
  });

  it('preserves DOM nodes across fallback and firestore updates without state flicker', () => {
    const { rerender } = render(<ExperienceSection skills={fallbackSkills} />);

    const html5ElementBefore = screen.getByText('HTML5').closest('.skill-item');
    const flutterElementBefore = screen.getByText('Flutter').closest('.skill-item');

    // Rerender with Firestore skills (different document IDs, same skill names)
    rerender(<ExperienceSection skills={firestoreSkills} />);

    const html5ElementAfter = screen.getByText('HTML5').closest('.skill-item');
    const flutterElementAfter = screen.getByText('Flutter').closest('.skill-item');

    // React should reuse the exact DOM nodes because keys are stable
    expect(html5ElementBefore).toBe(html5ElementAfter);
    expect(flutterElementBefore).toBe(flutterElementAfter);
  });

  it('updates level in-place without destroying DOM elements when level changes from Intermediate to Experienced', () => {
    const initialSkills = [
      { id: 'nodejs', name: 'Node JS', category: 'framework_tool', level: 'Intermediate', iconClass: 'fa-brands fa-node-js' }
    ];
    const updatedSkills = [
      { id: 'nodejs', name: 'Node JS', category: 'framework_tool', level: 'Experienced', iconClass: 'fa-brands fa-node-js' }
    ];

    const { rerender } = render(<ExperienceSection skills={initialSkills} />);
    const cardBefore = screen.getByText('Node JS').closest('.skill-item');
    const badgeBefore = screen.getByText('Intermediate');
    expect(badgeBefore).toHaveClass('intermediate');

    rerender(<ExperienceSection skills={updatedSkills} />);
    const cardAfter = screen.getByText('Node JS').closest('.skill-item');
    const badgeAfter = screen.getByText('Experienced');
    expect(badgeAfter).toHaveClass('experienced');
    expect(cardBefore).toBe(cardAfter);
  });
});
