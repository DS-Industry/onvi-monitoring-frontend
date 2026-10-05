import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '@/config/i18n';
import useSubscriptionStore from '@/config/store/subscriptionSlice';
import type { OrganizationSubscriptionResponseDto } from '@/services/api/subscription';
import { getPosFinTabloList, patchPosFinTablo } from '@/services/api/finance/fintablo';
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
    vi.mocked(patchPosFinTablo).mockReset();
    vi.mocked(getFiscalIntegration).mockReset();
    vi.mocked(setFiscalIntegration).mockReset();
    vi.mocked(getPosFinTabloList).mockResolvedValue([
      {
        posId: 5,
        name: 'Мойка',
        enabled: true,
        moneybagId: null,
        moneybagName: 'Счёт',
        syncFromDate: '2026-03-01',
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

  it('should keep the sync date disabled while the object is enabled', async () => {
    render(<FinTabloTab organizationId={9} posId={5} />);

    const dateInput = await screen.findByLabelText('Отправлять проводки с даты');
    expect(dateInput).toBeDisabled();
    expect(dateInput).toHaveValue('01.03.2026');
  });

  it('should not enable the object when the sync date is empty', async () => {
    const user = userEvent.setup();
    vi.mocked(getPosFinTabloList).mockResolvedValue([
      {
        posId: 5,
        name: 'Мойка',
        enabled: false,
        moneybagId: null,
        moneybagName: null,
        syncFromDate: null,
      },
    ]);

    render(<FinTabloTab organizationId={11} posId={5} />);

    const switches = await screen.findAllByRole('switch');
    expect(switches[0]).toHaveAttribute('aria-checked', 'false');
    await user.click(switches[0]);

    expect(patchPosFinTablo).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Укажите дату, с которой отправлять проводки')
    ).toBeInTheDocument();
  });
});
