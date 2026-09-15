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

  it('should omit group query when group is not passed', async () => {
    await getAllManagerPaperTypes();

    expect(mockedGet).toHaveBeenCalledWith('user/manager-paper/type', undefined);
  });

  it('should send group query when group is passed', async () => {
    await getAllManagerPaperTypes(ManagerPaperGroup.WAGES);

    expect(mockedGet).toHaveBeenCalledWith('user/manager-paper/type', {
      params: { group: ManagerPaperGroup.WAGES },
    });
  });
});
