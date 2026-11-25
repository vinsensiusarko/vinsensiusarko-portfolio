import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DeviceFrame, getDeviceVariant } from '../../../src/components/common/DeviceFrame';
import { AvailabilityBadge } from '../../../src/components/common/AvailabilityBadge';

describe('DeviceFrame', () => {
  it('maps project categories to the right device variant', () => {
    expect(getDeviceVariant('Mobile Application')).toBe('mobile');
    expect(getDeviceVariant('Web Application')).toBe('web');
    expect(getDeviceVariant('Web Portal')).toBe('web');
    expect(getDeviceVariant('Enterprise System')).toBe('web');
    expect(getDeviceVariant('Desktop Application')).toBe('desktop');
    expect(getDeviceVariant('Backend API')).toBe('desktop');
    expect(getDeviceVariant('')).toBe('web');
  });

  it('renders mobile frame chrome around children', () => {
    const { container } = render(
      <DeviceFrame variant="mobile" title="Mozaic POS">
        <img src="/test.png" alt="Mobile screen" />
      </DeviceFrame>
    );

    expect(container.querySelector('[data-device-frame="mobile"]')).toBeInTheDocument();
    expect(screen.getByAltText('Mobile screen')).toBeInTheDocument();
  });

  it('renders web browser chrome with extracted hostname from demo url', () => {
    const { container } = render(
      <DeviceFrame variant="web" title="Arkommerce" url="https://www.arkommerce-admin.web.app/dashboard">
        <img src="/web.png" alt="Web screen" />
      </DeviceFrame>
    );

    expect(container.querySelector('[data-device-frame="web"]')).toBeInTheDocument();
    expect(screen.getByText('arkommerce-admin.web.app')).toBeInTheDocument();
    expect(screen.getByAltText('Web screen')).toBeInTheDocument();
  });

  it('falls back to project title in web chrome when url is empty or invalid', () => {
    render(
      <DeviceFrame variant="web" title="SMArT System" url="not-a-valid-url">
        <span>Preview</span>
      </DeviceFrame>
    );

    expect(screen.getByText('SMArT System')).toBeInTheDocument();
  });

  it('renders desktop window chrome with window title', () => {
    const { container } = render(
      <DeviceFrame variant="desktop" title="Chatting App">
        <img src="/desktop.png" alt="Desktop screen" />
      </DeviceFrame>
    );

    expect(container.querySelector('[data-device-frame="desktop"]')).toBeInTheDocument();
    expect(screen.getByText('Chatting App')).toBeInTheDocument();
    expect(screen.getByAltText('Desktop screen')).toBeInTheDocument();
  });
});

describe('AvailabilityBadge', () => {
  it('renders nothing when status is hidden or missing', () => {
    const { container: c1 } = render(<AvailabilityBadge status="hidden" />);
    const { container: c2 } = render(<AvailabilityBadge />);
    expect(c1).toBeEmptyDOMElement();
    expect(c2).toBeEmptyDOMElement();
  });

  it('renders preset label for available, freelance, and busy statuses', () => {
    const { rerender } = render(<AvailabilityBadge status="available" />);
    expect(screen.getByRole('status')).toHaveTextContent('Available for Work & Freelance');

    rerender(<AvailabilityBadge status="freelance" />);
    expect(screen.getByRole('status')).toHaveTextContent('Open to Select Projects');

    rerender(<AvailabilityBadge status="busy" />);
    expect(screen.getByRole('status')).toHaveTextContent('Currently Booked');
  });

  it('renders custom text override when provided and omits role="status" in non-live preview mode', () => {
    const { rerender } = render(
      <AvailabilityBadge status="available" text="Open for Q4 Flutter contracts" />
    );
    expect(screen.getByRole('status', { name: 'Open for Q4 Flutter contracts' })).toBeInTheDocument();

    rerender(<AvailabilityBadge status="available" text="Preview text" live={false} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('Preview text')).toBeInTheDocument();
  });
});
