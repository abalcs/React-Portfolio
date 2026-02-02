import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock all child components to isolate App testing
jest.mock('../Layout/Layout', () => ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>);
jest.mock('../Header/Header', () => () => <header data-testid="header">Header</header>);
jest.mock('../Hero/Hero', () => () => <section data-testid="hero">Hero</section>);
jest.mock('../About/About', () => () => <section data-testid="about">About</section>);
jest.mock('../Skills/Skills', () => () => <section data-testid="skills">Skills</section>);
jest.mock('../Experience/Experience', () => () => <section data-testid="experience">Experience</section>);
jest.mock('../Projects/Projects', () => () => <section data-testid="projects">Projects</section>);
jest.mock('../GitHubStats/GitHubStats', () => () => <section data-testid="github-stats">GitHubStats</section>);
jest.mock('../Contact/Contact', () => () => <section data-testid="contact">Contact</section>);
jest.mock('../Footer/Footer', () => () => <footer data-testid="footer">Footer</footer>);
jest.mock('../UI/LoadingScreen', () => () => <div data-testid="loading-screen">Loading</div>);
jest.mock('../UI/BackToTop', () => () => <button data-testid="back-to-top">Back to Top</button>);
jest.mock('../UI/ScrollProgress', () => () => <div data-testid="scroll-progress">Progress</div>);

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders all major sections', () => {
    render(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.getByTestId('skills')).toBeInTheDocument();
    expect(screen.getByTestId('experience')).toBeInTheDocument();
    expect(screen.getByTestId('projects')).toBeInTheDocument();
    expect(screen.getByTestId('github-stats')).toBeInTheDocument();
    expect(screen.getByTestId('contact')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders UI components', () => {
    render(<App />);

    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-progress')).toBeInTheDocument();
  });

  it('renders main element containing sections', () => {
    render(<App />);
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });
});
