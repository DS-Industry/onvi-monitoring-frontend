/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/config/axiosConfig';
import {
  applyManagerPaperFintabloProps,
  buildPatchPosFinTabloBody,
  buildUpdateOrganizationFinTabloBody,
  FINTABLO_PENDING_POLL_MS,
  getOrganizationFinTablo,
  hasPendingFintabloSync,
  retryManagerPaperFinTablo,
  sanitizeManagerPaperFintabloFields,
  shouldShowFintabloRetry,
  sanitizeOrganizationFinTabloResponse,
  sanitizePosFinTabloResponse,
  shouldShowFinTabloPosTab,
  updateOrganizationFinTablo,
} from './fintablo';

vi.mock('@/config/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('sanitizeOrganizationFinTabloResponse', () => {
  it('should not expose token when payload contains a secret', () => {
    const result = sanitizeOrganizationFinTabloResponse({
      objectsEnabled: true,
      tokenConfigured: true,
      directionId: '1',
      categoryIds: null,
      token: 'ft-secret-token',
    });

    expect(result).toEqual({
      objectsEnabled: true,
      tokenConfigured: true,
      directionId: '1',
      categoryIds: null,
    });
    expect(result).not.toHaveProperty('token');
  });
});

describe('sanitizePosFinTabloResponse', () => {
  it('should keep moneybagName when backend sends it', () => {
    const result = sanitizePosFinTabloResponse({
      posId: 2,
      name: 'Мойка 1',
      enabled: true,
      moneybagId: 'mb-1',
      moneybagName: 'Касса 36',
    });

    expect(result.moneybagName).toBe('Касса 36');
    expect(result.moneybagId).toBe('mb-1');
  });

  it('should omit moneybagName when it is missing', () => {
    const result = sanitizePosFinTabloResponse({
      posId: 2,
      name: 'Мойка 1',
      enabled: true,
      moneybagId: 'mb-1',
    });

    expect(result).not.toHaveProperty('moneybagName');
  });
});

describe('buildUpdateOrganizationFinTabloBody', () => {
  it('should omit token when input is blank', () => {
    const body = buildUpdateOrganizationFinTabloBody({
      organizationId: 9,
      objectsEnabled: true,
      token: '   ',
    });

    expect(body).toEqual({
      organizationId: 9,
      objectsEnabled: true,
    });
    expect(body).not.toHaveProperty('token');
  });

  it('should include trimmed token when provided', () => {
    const body = buildUpdateOrganizationFinTabloBody({
      organizationId: 9,
      objectsEnabled: true,
      token: ' abc ',
    });

    expect(body.token).toBe('abc');
  });
});

describe('buildPatchPosFinTabloBody', () => {
  it('should send moneybagName only when enabling with a non-empty name', () => {
    expect(
      buildPatchPosFinTabloBody({
        enabled: true,
        moneybagName: ' Касса ',
      })
    ).toEqual({ enabled: true, moneybagName: 'Касса' });

    expect(
      buildPatchPosFinTabloBody({
        enabled: false,
        moneybagName: 'Касса',
      })
    ).toEqual({ enabled: false });
  });
});

describe('shouldShowFinTabloPosTab', () => {
  it('should return false when user has only ManagerPaper update', () => {
    expect(
      shouldShowFinTabloPosTab({
        canUpdateOrganization: false,
        canUpdateManagerPaper: true,
        hasManagerPaperTariff: true,
        objectsEnabled: true,
      })
    ).toBe(false);
  });

  it('should return true without tariff even if org flag is off', () => {
    expect(
      shouldShowFinTabloPosTab({
        canUpdateOrganization: true,
        canUpdateManagerPaper: true,
        hasManagerPaperTariff: false,
        objectsEnabled: false,
      })
    ).toBe(true);
  });

  it('should return false when tariff is present and org flag is off', () => {
    expect(
      shouldShowFinTabloPosTab({
        canUpdateOrganization: true,
        canUpdateManagerPaper: true,
        hasManagerPaperTariff: true,
        objectsEnabled: false,
      })
    ).toBe(false);
  });

  it('should return true when both abilities, tariff and org flag are on', () => {
    expect(
      shouldShowFinTabloPosTab({
        canUpdateOrganization: true,
        canUpdateManagerPaper: true,
        hasManagerPaperTariff: true,
        objectsEnabled: true,
      })
    ).toBe(true);
  });
});

describe('getOrganizationFinTablo', () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
  });

  it('should request organization status without reading a token field', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        objectsEnabled: true,
        tokenConfigured: true,
        directionId: null,
        categoryIds: null,
        token: 'should-not-leak',
      },
    });

    const result = await getOrganizationFinTablo(9);

    expect(api.get).toHaveBeenCalledWith('user/manager-paper/fintablo', {
      params: { organizationId: 9 },
    });
    expect(result).not.toHaveProperty('token');
    expect(result.tokenConfigured).toBe(true);
  });
});

describe('updateOrganizationFinTablo', () => {
  beforeEach(() => {
    vi.mocked(api.put).mockReset();
  });

  it('should put body without blank token', async () => {
    vi.mocked(api.put).mockResolvedValue({
      data: {
        objectsEnabled: false,
        tokenConfigured: false,
        directionId: null,
        categoryIds: null,
      },
    });

    await updateOrganizationFinTablo({
      organizationId: 9,
      objectsEnabled: false,
      token: '',
    });

    expect(api.put).toHaveBeenCalledWith('user/manager-paper/fintablo', {
      organizationId: 9,
      objectsEnabled: false,
    });
  });
});

describe('sanitizeManagerPaperFintabloFields', () => {
  it('should keep pending synced and failed statuses', () => {
    expect(sanitizeManagerPaperFintabloFields({ fintabloSyncStatus: 'pending' }))
      .toEqual({ fintabloSyncStatus: 'pending' });
    expect(sanitizeManagerPaperFintabloFields({ fintabloSyncStatus: 'synced' }))
      .toEqual({ fintabloSyncStatus: 'synced' });
    expect(sanitizeManagerPaperFintabloFields({ fintabloSyncStatus: 'failed' }))
      .toEqual({ fintabloSyncStatus: 'failed' });
  });

  it('should omit status when value is unknown', () => {
    expect(
      sanitizeManagerPaperFintabloFields({ fintabloSyncStatus: 'queued' })
    ).toEqual({});
  });

  it('should return empty fields when sync status is missing', () => {
    expect(sanitizeManagerPaperFintabloFields({ id: 1 })).toEqual({});
  });

  it('should keep last error text as it arrived', () => {
    expect(
      sanitizeManagerPaperFintabloFields({
        fintabloLastError: 'Счёт «Касса» не найден',
      })
    ).toEqual({ fintabloLastError: 'Счёт «Касса» не найден' });
  });
});

describe('applyManagerPaperFintabloProps', () => {
  it('should drop token and authorization when they are present on paper props', () => {
    const result = applyManagerPaperFintabloProps({
      id: 4,
      fintabloSyncStatus: 'failed',
      fintabloTransactionId: 'tx-1',
      token: 'ft-secret-token',
      authorization: 'Bearer secret',
      Authorization: 'Bearer secret',
    });

    expect(result).toEqual({
      id: 4,
      fintabloSyncStatus: 'failed',
      fintabloTransactionId: 'tx-1',
    });
    expect(result).not.toHaveProperty('token');
    expect(result).not.toHaveProperty('authorization');
    expect(result).not.toHaveProperty('Authorization');
  });
});

describe('shouldShowFintabloRetry', () => {
  it('should return true only when status is failed and retry is allowed', () => {
    expect(shouldShowFintabloRetry('failed', true)).toBe(true);
    expect(shouldShowFintabloRetry('failed', false)).toBe(false);
    expect(shouldShowFintabloRetry('pending', true)).toBe(false);
    expect(shouldShowFintabloRetry('synced', true)).toBe(false);
    expect(shouldShowFintabloRetry(undefined, true)).toBe(false);
  });
});

describe('hasPendingFintabloSync', () => {
  it('should return true when a paper on the page is pending', () => {
    expect(
      hasPendingFintabloSync([
        { fintabloSyncStatus: 'synced' },
        { fintabloSyncStatus: 'pending' },
      ])
    ).toBe(true);
  });

  it('should return false when no paper is pending', () => {
    expect(
      hasPendingFintabloSync([
        { fintabloSyncStatus: 'failed' },
        { fintabloSyncStatus: null },
      ])
    ).toBe(false);
    expect(FINTABLO_PENDING_POLL_MS).toBe(5000);
  });
});

describe('retryManagerPaperFinTablo', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  it('should post retry without a token in the url or body', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: {} });

    await retryManagerPaperFinTablo(42);

    expect(api.post).toHaveBeenCalledWith(
      'user/manager-paper/42/fintablo/retry'
    );
    const [url, body] = vi.mocked(api.post).mock.calls[0];
    expect(url).not.toMatch(/token/i);
    expect(url).not.toMatch(/authorization/i);
    expect(body).toBeUndefined();
  });
});

