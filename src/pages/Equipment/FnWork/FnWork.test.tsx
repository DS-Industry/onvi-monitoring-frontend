import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import i18n from '@/config/i18n';
import FnWork from './index';
import FnWorkCard from './FnWorkCard';
import { getFiscalCard, listFiscal } from '@/services/api/pos/fiscal';

vi.mock('@/pages/Pos/Overview/components/PeriodToggle', () => ({
  default: () => <div>period</div>,
}));

vi.mock('@/hooks/useUserStore', () => ({
  useUser: () => ({ organizationId: 9 }),
}));

vi.mock('@/services/api/pos/fiscal', () => ({
  listFiscal: vi.fn(),
  getFiscalCard: vi.fn(),
}));

const listItem = {
  posId: 4,
  posName: 'Мойка Север',
  objectLast: {
    deviceName: 'Пост 1',
    amount: 150,
    operationTime: '2026-10-02T11:22:00.000Z',
    paymentType: 'PAPER',
  },
  miniPcLast: null,
  objectCount: 1,
  objectSum: 150,
  miniPcCount: 0,
  miniPcSum: 0,
  state: {
    statusLine: 'Смена открыта',
    receivedAt: '2026-09-25T14:12:00',
    treasurerLinkOpen: true,
    shiftStatus: 'OPEN' as const,
    receiptAttemptSucceeded: true,
    driverErrorStep: null,
    driverErrorCode: null,
    driverErrorText: null,
    fnMemoryOverflow: true,
    fnResourceExhausted: false,
    fnReplacementRequired: false,
    ofdUnsentDocumentsCount: 0,
  },
  warnings: ['Расходятся суммы' as const],
};

describe('FnWork', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
    vi.mocked(listFiscal).mockReset();
    vi.mocked(listFiscal).mockResolvedValue({
      page: 1,
      size: 20,
      total: 1,
      items: [listItem],
    });
  });

  it('should show the object, warning and fiscal memory note when the list loads', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/equipment/fn?dateStart=2026-09-25T00:00&dateEnd=2026-09-25T23:59&page=1&size=20',
        ]}
      >
        <FnWork />
      </MemoryRouter>
    );

    expect(await screen.findByText('Мойка Север')).toBeInTheDocument();
    expect(screen.getByText('Расходятся суммы')).toBeInTheDocument();
    expect(screen.getByText('Расходятся суммы')).toHaveClass('text-errorFill');
    expect(screen.getByText('Память ФН переполнена')).toBeInTheDocument();
    expect(screen.getByText('Получено: 25.09.2026 14:12')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('—')).not.toHaveClass('text-errorFill');
  });

  it('should show wall-clock operation time from a Z-suffixed string', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/equipment/fn?dateStart=2026-10-02T00:00&dateEnd=2026-10-02T23:59&page=1&size=20',
        ]}
      >
        <FnWork />
      </MemoryRouter>
    );

    expect(await screen.findByText('02.10.2026 11:22')).toBeInTheDocument();
  });

  it('should open the object card when the row is activated', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          '/equipment/fn?dateStart=2026-09-25T00:00&dateEnd=2026-09-25T23:59',
        ]}
      >
        <Routes>
          <Route path="/equipment/fn" element={<FnWork />} />
          <Route path="/equipment/fn/:posId" element={<div>card-open</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(await screen.findByText('Мойка Север'));

    expect(await screen.findByText('card-open')).toBeInTheDocument();
  });
});

describe('FnWorkCard', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ru');
    vi.mocked(getFiscalCard).mockReset();
    vi.mocked(getFiscalCard).mockResolvedValue({
      posId: 4,
      posName: 'Мойка Север',
      objectCount: 1,
      objectSum: 150,
      miniPcCount: 1,
      miniPcSum: 150,
      state: {
        statusLine: 'Смена открыта',
        receivedAt: '2026-09-25T14:12:00',
        treasurerLinkOpen: true,
        shiftStatus: 'OPEN',
        receiptAttemptSucceeded: true,
        driverErrorStep: null,
        driverErrorCode: null,
        driverErrorText: null,
        fnMemoryOverflow: false,
        fnResourceExhausted: false,
        fnReplacementRequired: false,
        ofdUnsentDocumentsCount: 3,
      },
      objectHistory: [
        {
          operationTime: '2026-10-02T11:22:00.000Z',
          deviceName: 'Пост 1',
          amount: 150,
          paymentType: 'PAPER',
        },
      ],
      miniPcHistory: [
        {
          operationTime: '2026-09-25T14:12:00',
          deviceName: 'Пост 1',
          amount: 150,
          paymentType: 'Безналичные',
          qr: '',
        },
      ],
    });
  });

  it('should show cash and cashless labels and leave a blank qr cell when qr is empty', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/equipment/fn/4?dateStart=2026-09-25T00:00&dateEnd=2026-09-25T23:59',
        ]}
      >
        <Routes>
          <Route path="/equipment/fn/:posId" element={<FnWorkCard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Мойка Север — связка с Казначеем')
    ).toBeInTheDocument();
    expect(screen.getByText('Наличные')).toBeInTheDocument();
    expect(screen.getByText('Безналичные')).toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });

  it('should show treasurer state with ofd unsent count and wall-clock time', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          '/equipment/fn/4?dateStart=2026-09-25T00:00&dateEnd=2026-09-25T23:59',
        ]}
      >
        <Routes>
          <Route path="/equipment/fn/:posId" element={<FnWorkCard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Смена открыта')).toBeInTheDocument();
    expect(screen.getByText('Неотправленных в ОФД: 3')).toBeInTheDocument();
    expect(screen.getByText('11:22')).toBeInTheDocument();
  });
});
