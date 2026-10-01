/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/config/axiosConfig';
import { getFiscalCard, listFiscal, setFiscalIntegration } from './fiscal';

vi.mock('@/config/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('listFiscal', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('should request the fiscal list when the period and organization are set', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { page: 1, size: 20, total: 0, items: [] },
    });
    const dateStart = new Date('2026-10-01T00:00:00');
    const dateEnd = new Date('2026-10-01T23:59:00');

    await listFiscal({
      organizationId: 3,
      dateStart,
      dateEnd,
      page: 1,
      size: 20,
      warning: 'warning',
    });

    expect(api.get).toHaveBeenCalledWith('/user/pos/fiscal', {
      params: {
        organizationId: 3,
        page: 1,
        size: 20,
        warning: 'warning',
        dateStart,
        dateEnd,
      },
    });
  });
});

describe('getFiscalCard', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('should request the object card when pos id and period are set', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { posId: 7 } });
    const dateStart = new Date('2026-10-01T00:00:00');
    const dateEnd = new Date('2026-10-01T23:59:00');

    await getFiscalCard(7, { dateStart, dateEnd });

    expect(api.get).toHaveBeenCalledWith('/user/pos/fiscal/7', {
      params: { dateStart, dateEnd },
    });
  });
});

describe('setFiscalIntegration', () => {
  beforeEach(() => {
    vi.mocked(api.patch).mockReset();
  });

  it('should send the enabled flag when the switch changes', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { posId: 7, enabled: true },
    });

    const result = await setFiscalIntegration(7, true);

    expect(api.patch).toHaveBeenCalledWith('/user/pos/fiscal/7', {
      enabled: true,
    });
    expect(result).toEqual({ posId: 7, enabled: true });
  });
});
