/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/config/axiosConfig';
import { ManagerPaperGroup } from '@/utils/constants';
import { getAllManagerPaperTypes } from './index';

vi.mock('@/config/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);

describe('getAllManagerPaperTypes', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue({ data: [] });
  });

  it('should send organizationId when only organization is passed', async () => {
    await getAllManagerPaperTypes({ organizationId: 4 });

    expect(mockedGet).toHaveBeenCalledWith('user/manager-paper/type', {
      params: { organizationId: 4 },
    });
  });

  it('should send group and visibility when they are passed', async () => {
    await getAllManagerPaperTypes({
      organizationId: 4,
      group: ManagerPaperGroup.WAGES,
      visibleOnly: true,
    });

    expect(mockedGet).toHaveBeenCalledWith('user/manager-paper/type', {
      params: {
        organizationId: 4,
        group: ManagerPaperGroup.WAGES,
        visibleOnly: true,
      },
    });
  });
});
