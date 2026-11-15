import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkillIcon } from '../../../src/components/common/SkillIcon';

describe('SkillIcon component', () => {
  it('renders official Flutter SVG when skill name is Flutter or iconClass contains flutter (Review Focus #3)', () => {
    const { container: c1 } = render(
      <SkillIcon skill={{ name: 'Flutter', iconClass: 'fa-solid fa-code' }} />
    );
    expect(c1.querySelector('svg.skill-icon-svg')).toBeInTheDocument();

    const { container: c2 } = render(
      <SkillIcon skill={{ name: 'Mobile Framework', iconClass: 'fa-brands fa-flutter' }} />
    );
    expect(c2.querySelector('svg.skill-icon-svg')).toBeInTheDocument();

    const { container: c3 } = render(
      <SkillIcon skill={{ name: 'Other', iconType: 'svg' }} />
    );
    expect(c3.querySelector('svg.skill-icon-svg')).toBeInTheDocument();
  });

  it('renders Font Awesome <i> tag for standard icons', () => {
    const { container } = render(
      <SkillIcon skill={{ name: 'React', iconClass: 'fa-brands fa-react' }} />
    );
    expect(container.querySelector('i.fa-brands.fa-react')).toBeInTheDocument();
  });
});
