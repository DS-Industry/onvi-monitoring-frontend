import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/config/i18n';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import type { OrganizationSubscriptionResponseDto } from '@/services/api/subscription';
import { getPosFinTabloList } from '@/services/api/finance/fintablo';
import { getFiscalIntegration, setFiscalIntegration } from '@/services/api/pos/fiscal';
import FinTabloTab from './FinTabloTab';

const showToast = vi.fn();

vi.mock('@/components/context/useContext', () => ({
  useToast: () => ({ showToast }),
}));

vi.mock('@/services/api/finance/fintablo', () => ({
  getPosFinTabloList: vi.fn(),
  patchPosFinTablo: vi.fn(),
}));

vi.mock('@/services/api/pos/fiscal', () => ({
  getFiscalIntegration: vi.fn(),
  setFiscalIntegration: vi.fn(),
}));

describe('FinTabloTab fiscal integration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
    showToast.mockReset();
    vi.mocked(getPosFinTabloList).mockReset();
    vi.mocked(getFiscalIntegration).mockReset();
    vi.mocked(setFiscalIntegration).mockReset();
    vi.mocked(getPosFinTabloList).mockResolvedValue([
      {
        posId: 5,
        name: 'Мойка',
        enabled: true,
        moneybagId: null,
        moneybagName: 'Счёт',
      },
    ]);
    vi.mocked(getFiscalIntegration).mockResolvedValue({
      posId: 5,
      enabled: false,
    });
    useSubscriptionStore.setState({
      status: 'ready',
      activeSubscription: {
        status: 'ACTIVE',
        planFeatures: ['ManagerPaper'],
      } as OrganizationSubscriptionResponseDto,
    });
  });

  it('should turn integration on when the switch is used and the object is absent from the list', async () => {
    const user = userEvent.setup();
    vi.mocked(setFiscalIntegration).mockResolvedValue({
      posId: 5,
      enabled: true,
    });

    render(<FinTabloTab organizationId={9} posId={5} />);

    expect(
      await screen.findByText('Интеграция миниПК')
    ).toBeInTheDocument();
    const switches = screen.getAllByRole('switch');
    const fiscalSwitch = switches[1];
    expect(fiscalSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(fiscalSwitch);

    expect(setFiscalIntegration).toHaveBeenCalledWith(5, true);
    expect(showToast).toHaveBeenCalledWith(
      'Интеграция миниПК включена',
      'success'
    );
  });
});
