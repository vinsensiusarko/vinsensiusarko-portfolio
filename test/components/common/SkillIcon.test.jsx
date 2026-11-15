import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SkillIcon } from '../../../src/components/common/SkillIcon';

describe('SkillIcon component', () => {
  it('renders official Flutter SVG when skill name is Flutter or iconClass contains flutter (Review Focus #3)', () => {
    const { container: c1 } = render(
      <SkillIcon skill={{ name: 'Flutter', iconClass: 'fa-solid fa-code' }} />
    );
    const svgEl = c1.querySelector('svg.skill-icon-svg');
    expect(svgEl).toBeInTheDocument();
    expect(svgEl).toHaveAttribute('fill', 'currentColor');
    expect(svgEl.style.color).not.toBe('#02569B');

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

  it('auto-renders official Dart SVG when name is Dart or iconClass includes dart-lang / dart', () => {
    const { container: c1 } = render(
      <SkillIcon skill={{ name: 'Dart', iconClass: 'fa-solid fa-code' }} />
    );
    const dartSvg1 = c1.querySelector('svg.skill-icon-dart');
    expect(dartSvg1).toBeInTheDocument();
    expect(dartSvg1).toHaveAttribute('fill', 'currentColor');

    const { container: c2 } = render(
      <SkillIcon skill={{ name: 'Language', iconClass: 'fa-brands fa-dart-lang' }} />
    );
    expect(c2.querySelector('svg.skill-icon-dart')).toBeInTheDocument();
  });

  it('renders Arko monogram for Arko CMS skills', () => {
    const { container } = render(
      <SkillIcon skill={{ name: 'Arko CMS', iconClass: 'fa-solid fa-bolt' }} />
    );
    expect(container.querySelector('svg.brand-logo-svg')).toBeInTheDocument();
  });

  it('renders custom uploaded image (PNG/SVG) when iconUrl is present', () => {
    const { container } = render(
      <SkillIcon
        skill={{
          name: 'Custom Tech',
          iconType: 'upload',
          iconUrl: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='
        }}
      />
    );
    const img = container.querySelector('img.skill-icon-img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=');
  });
});
