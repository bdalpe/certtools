import React from 'react';
import { render, screen, fireEvent} from '@testing-library/react';
import App from './App';

test('Ensure navbar is shown', () => {
  render(<App />);
  expect(screen.getByText(/Certificate Tools/i)).toBeInTheDocument();
});