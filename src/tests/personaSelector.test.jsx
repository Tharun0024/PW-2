/**
 * @file src/tests/personaSelector.test.js
 * @description Vitest tests for the PersonaSelector component. This file tests that all personas
 * are rendered, that clicking a persona triggers the selection callback, and that the component
 * is keyboard accessible.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import PersonaSelector from '../components/Persona/PersonaSelector';
import { PERSONAS } from '../data/personaConfig';

describe('PersonaSelector', () => {
  const mockOnSelect = vi.fn();

  it('renders all available personas', () => {
    render(<PersonaSelector onSelect={mockOnSelect} selectedPersona={null} />);
    PERSONAS.forEach(persona => {
      expect(screen.getByText(persona.name)).toBeInTheDocument();
      expect(screen.getByText(persona.description)).toBeInTheDocument();
    });
  });

  it('calls onSelect with the correct persona ID when a persona is clicked', () => {
    render(<PersonaSelector onSelect={mockOnSelect} selectedPersona={null} />);
    const firstPersonaButton = screen.getByText(PERSONAS[0].name).closest('button');
    fireEvent.click(firstPersonaButton);
    expect(mockOnSelect).toHaveBeenCalledWith(PERSONAS[0].id);
  });

  it('highlights the currently selected persona', () => {
    const selectedId = PERSONAS[1].id;
    render(<PersonaSelector onSelect={mockOnSelect} selectedPersona={selectedId} />);
    const selectedButton = screen.getByText(PERSONAS[1].name).closest('button');
    expect(selectedButton).toHaveClass('border-accent');
  });

  it('allows keyboard navigation and selection', () => {
    render(<PersonaSelector onSelect={mockOnSelect} selectedPersona={null} />);
    const personaButtons = screen.getAllByRole('button');

    // Focus the first button
    personaButtons[0].focus();
    expect(personaButtons[0]).toHaveFocus();

    // Navigate with arrow keys
    fireEvent.keyDown(personaButtons[0], { key: 'ArrowRight' });
    expect(personaButtons[1]).toHaveFocus();

    fireEvent.keyDown(personaButtons[1], { key: 'ArrowLeft' });
    expect(personaButtons[0]).toHaveFocus();

    // Select with Enter key
    fireEvent.keyDown(personaButtons[1], { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith(PERSONAS[1].id);
  });
});
