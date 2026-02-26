import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { APIManager } from '@/components/integracoes/APIManager';

describe('APIManager sync flow', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('keeps frontend sync flow working', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === '/api/integracoes/sync') {
        return {
          ok: true,
          json: async () => ({ success: true, message: 'ok' }),
        } as Response;
      }

      if (url === '/api/integracoes') {
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: 'api-1',
                tenant_id: 'tenant-1',
                nome: 'API Projetos Espaider',
                identificador: 'BI_SOLICITACOES_SUPORTEESPAIDER',
                tipo: 'projetos',
                is_active: true,
              },
            ],
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch call: ${url} ${init?.method || 'GET'}`);
    });

    global.fetch = fetchMock as typeof fetch;

    render(<APIManager />);

    await screen.findByText('API Projetos Espaider');
    const syncButton = screen.getByRole('button', { name: /sincronizar/i });
    await userEvent.click(syncButton);

    await screen.findByText(/sucesso/i);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/integracoes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});

