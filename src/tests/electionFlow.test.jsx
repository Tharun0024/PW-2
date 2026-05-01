/**
 * @file src/tests/electionFlow.test.js
 * @description Vitest tests for the ElectionFlow component. This file tests that the component
 * renders all steps of the election process, that expanding a step reveals its content,
 * and that necessary accessibility roles are present.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ElectionFlow from '../components/Flow/ElectionFlow';
import { useTranslate } from '../hooks/useTranslate.jsx';
import { ELECTION_STEPS } from '../data/electionSteps';

// Mock the useTranslate hook
vi.mock('../hooks/useTranslate.jsx');

describe('ElectionFlow', () => {
  beforeEach(() => {
    useTranslate.mockReturnValue({
      translateContent: vi.fn(async (content) => content),
      currentLanguage: 'en',
      loading: false,
    });
  });

  it('renders all election steps correctly', async () => {
    render(<ElectionFlow />);
    await waitFor(() => {
        ELECTION_STEPS.forEach(step => {
            expect(screen.getByText(`${step.id}. ${step.title}`)).toBeInTheDocument();
            expect(screen.getByText(step.description)).toBeInTheDocument();
        });
    });
  });

  it('expands a step to show content on click', async () => {
    render(<ElectionFlow />);
    
    let firstStepTitle;
    await waitFor(() => {
        firstStepTitle = screen.getByText(`1. ${ELECTION_STEPS[0].title}`);
    });
    const firstStepButton = firstStepTitle.closest('button');

    // The content is rendered with dangerouslySetInnerHTML, so we find it by its container
    const contentContainer = firstStepButton.nextElementSibling;
    expect(contentContainer).toHaveClass('max-h-0');

    // Click to expand
    fireEvent.click(firstStepButton);

    // Now content should be visible by checking the class change
    await waitFor(() => {
        expect(contentContainer).not.toHaveClass('max-h-0');
    });
    expect(firstStepButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('has correct accessibility roles for the list and items', async () => {
    render(<ElectionFlow />);
    await waitFor(() => {
        // The main container should be a list
        expect(screen.getByRole('list')).toBeInTheDocument();
        // Each step should be a listitem
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBe(ELECTION_STEPS.length);
    });
  });
});
