import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { getRoles, updateRole } from '@/services/api/organization';
import { Modal, Select } from 'antd';
import { getWorkers } from '@/services/api/equipment';
import { useUser } from '@/hooks/useUserStore';

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
  const [roleId, setRoleId] = useState(0);
  const [selectedWorker, setSelectedWorker] = useState<string>('');

  const user = useUser();

  const { data: workerData } = useSWR(
    [`get-worker`],
    () => getWorkers(user.organizationId!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
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
        roleId: roleId,
      })
  );

  const handleUpdateRole = async () => {
    const result = await update();

    if (result) {
      mutate([`get-worker`]);
      onClose();
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
          onOk={handleUpdateRole}
          okButtonProps={{
            loading: isMutating,
          }}
          okText={t('organizations.save')}
          cancelText={t('organizations.cancel')}
          className="sm:w-[552px] max-h-[90vh] overflow-auto"
        >
          <h2 className="text-2xl font-semibold text-text01 mb-4">
            {t('roles.role')}
          </h2>
          <p className="text-primary02 text-sm">{selectedWorker}</p>
          <Select
            value={roleId}
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
