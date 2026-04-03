import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../store/AuthContext';
import LoginPage from '../pages/LoginPage';

describe('LoginPage', () => {
  it('renders premium sign in copy and form fields', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/build smarter kits with zero friction/i)).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
