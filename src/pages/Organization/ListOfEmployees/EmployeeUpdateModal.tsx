import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { getRoles, updateRole } from '@/services/api/organization';
import { Button, Modal, Select } from 'antd';
import { blockWorker, getWorkers } from '@/services/api/equipment';
import { useUser } from '@/hooks/useUserStore';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/context/useContext';

type EmployeeUpdateModalProps = {
  open: boolean;
  onClose: () => void;
  workerId: number;
};

const EmployeeUpdateModal: React.FC<EmployeeUpdateModalProps> = ({
  open,
  onClose,
  workerId,
}) => {
  const { t } = useTranslation();
  const [rolesId, setRoleId] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [searchParams] = useSearchParams();
  const roleId = Number(searchParams.get('roleId')) || undefined;
  const status = searchParams.get('status') || undefined;
  const name = searchParams.get('search') || undefined;
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const { showToast } = useToast();

  const user = useUser();

  const { data: workerData } = useSWR(
    user.organizationId ? [`get-worker`, user.organizationId] : null,
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { trigger: block, isMutating: blocking } = useSWRMutation(
    ['block-worker', workerId],
    async () => blockWorker(workerId)
  );

  useEffect(() => {
    if (workerId !== 0) {
      const worker = workerData?.find(work => work.id === workerId)?.name || '';
      const workerRole =
        workerData?.find(role => role.id === workerId)?.roleName || '';
      const roleNo = rolesData?.find(role => role.name === workerRole)?.id || 0;
      setSelectedWorker(worker);
      setRoleId(roleNo);
    }
  }, [workerId]);

  const { trigger: update, isMutating } = useSWRMutation(
    ['update-role'],
    async () =>
      updateRole({
        userId: workerId,
        roleId: rolesId,
      })
  );

  const handleUpdateRole = async () => {
    const result = await update();

    if (result) {
      mutate([
        'get-worker',
        user.organizationId,
        currentPage,
        pageSize,
        roleId,
        status,
        name,
      ]);
      onClose();
    }
  };

  const handleBlockWorker = async () => {
    try {
      await block();
      mutate([
        'get-worker',
        user.organizationId,
        currentPage,
        pageSize,
        roleId,
        status,
        name,
      ]);
      onClose();
    } catch (error) {
      showToast(t('errors.other.unexpectedErrorOccurred'), 'error');
    }
  };

  const { data: rolesData } = useSWR([`get-role`], () => getRoles(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  return (
    <div>
      {open && selectedWorker && (
        <Modal
          open={open}
          closable={true}
          onCancel={onClose}
          okButtonProps={{
            loading: isMutating,
          }}
          footer={[
            <Button key="cancel" onClick={onClose}>
              {t('organizations.cancel')}
            </Button>,
            <Button
              key="extra"
              danger
              loading={blocking}
              onClick={handleBlockWorker}
            >
              {t('roles.block')}
            </Button>,
            <Button
              key="ok"
              type="primary"
              loading={isMutating}
              onClick={handleUpdateRole}
            >
              {t('organizations.save')}
            </Button>,
          ]}
          className="sm:w-[552px] max-h-[90vh] overflow-auto"
        >
          <h2 className="text-2xl font-semibold text-text01 mb-4">
            {t('roles.role')}
          </h2>
          <p className="text-primary02 text-sm">{selectedWorker}</p>
          <Select
            value={rolesId}
            options={rolesData?.map(item => ({
              label: item.name,
              value: item.id,
            }))}
            onChange={value => setRoleId(value)}
            className="w-[300px] sm:w-[456px]"
          />
        </Modal>
      )}
    </div>
  );
};

export default EmployeeUpdateModal;
