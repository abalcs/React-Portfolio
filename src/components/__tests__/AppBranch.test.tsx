import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// The 3D module must never load in jsdom — stub the lazy target.
jest.mock('../../three/AscentScene', () => () => (
  <div data-testid="ascent-scene" />
));

jest.mock('../../hooks/useCapabilities', () => ({
  useCapabilities: jest.fn(),
}));

const { useCapabilities } = jest.requireMock('../../hooks/useCapabilities');

describe('App capability branching', () => {
  beforeEach(() => {
    // CRA's resetMocks wipes the setupTests matchMedia implementation;
    // this suite renders the real Header/useTheme, so restore it.
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('renders the classic 2D site when WebGL is unavailable', () => {
    useCapabilities.mockReturnValue({ webgl: false, reducedMotion: false });
    render(<App />);
    expect(screen.queryByTestId('ascent-scene')).not.toBeInTheDocument();
    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('renders the classic 2D site when reduced motion is preferred', () => {
    useCapabilities.mockReturnValue({ webgl: true, reducedMotion: true });
    render(<App />);
    expect(screen.queryByTestId('ascent-scene')).not.toBeInTheDocument();
  });

  it('renders the Ascent experience when capable', async () => {
    useCapabilities.mockReturnValue({ webgl: true, reducedMotion: false });
    render(<App />);
    expect(await screen.findByTestId('ascent-scene')).toBeInTheDocument();
    expect(document.querySelector('main')).toHaveClass('relative', 'z-10');
  });
});
