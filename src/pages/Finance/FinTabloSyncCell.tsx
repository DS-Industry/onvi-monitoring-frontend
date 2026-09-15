import { useState } from 'react';
import { Button, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  isFintabloSyncStatus,
  retryManagerPaperFinTablo,
  shouldShowFintabloRetry,
  type FintabloSyncStatus,
} from '@/services/api/finance/fintablo';

const STATUS_COLOR: Record<FintabloSyncStatus, string> = {
  pending: 'processing',
  synced: 'success',
  failed: 'error',
};

type FinTabloSyncCellProps = {
  paperId: number;
  fintabloSyncStatus?: FintabloSyncStatus | null;
  fintabloLastError?: string | null;
  canRetry: boolean;
  onRetried: () => void;
};

const STATUS_LABEL: Record<FintabloSyncStatus, string> = {
  pending: 'fintablo.syncPending',
  synced: 'fintablo.syncSynced',
  failed: 'fintablo.syncFailed',
};

const FinTabloSyncCell = ({
  paperId,
  fintabloSyncStatus,
  fintabloLastError,
  canRetry,
  onRetried,
}: FinTabloSyncCellProps) => {
  const { t } = useTranslation();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!isFintabloSyncStatus(fintabloSyncStatus)) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryManagerPaperFinTablo(paperId);
      onRetried();
    } catch {
      void 0;
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Tag color={STATUS_COLOR[fintabloSyncStatus]}>
        {t(STATUS_LABEL[fintabloSyncStatus])}
      </Tag>
      {fintabloSyncStatus === 'failed' && fintabloLastError ? (
        <span className="text-xs text-text01 break-all">{fintabloLastError}</span>
      ) : null}
      {shouldShowFintabloRetry(fintabloSyncStatus, canRetry) ? (
        <Button
          type="link"
          size="small"
          className="h-auto p-0"
          loading={isRetrying}
          aria-label={t('fintablo.retry')}
          onClick={handleRetry}
        >
          {t('fintablo.retry')}
        </Button>
      ) : null}
    </div>
  );
};

export default FinTabloSyncCell;
