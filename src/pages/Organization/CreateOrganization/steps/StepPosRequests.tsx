import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Form, Input, InputNumber, Modal, Button as AntButton } from 'antd';
import Button from '@/components/ui/Button/Button';
import { useCreateOrganizationContext } from '../context';
import {
  getOrganizationPosRequests,
  createPosRequest,
  updatePosRequest,
  type PosRequestResponseDto,
} from '@/services/api/posRequest';
import useSWR from 'swr';
import type { PlanId } from '../types';

function getPosLimit(plan: PlanId | null, customPoses: number): number | null {
  if (plan === 'base') return 1;
  if (plan === 'space') return 3;
  if (plan === 'business') return 5;
  if (plan === 'custom') return customPoses || null;
  return null;
}

const StepPosRequests: React.FC = () => {
  const { t } = useTranslation();
  const {
    organizationId,
    selectedPlan,
    customPoses,
    showToast,
  } = useCreateOrganizationContext();

  const [form] = Form.useForm();
  const [editing, setEditing] = useState<PosRequestResponseDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: requests = [],
    isLoading,
    mutate,
  } = useSWR(
    organizationId ? ['pos-requests', organizationId] : null,
    () => getOrganizationPosRequests(organizationId as number)
  );

  const posLimit = useMemo(
    () => getPosLimit(selectedPlan, customPoses),
    [selectedPlan, customPoses]
  );

  const usedCount = requests.length;
  const canCreateMore =
    posLimit == null ? true : usedCount < posLimit;

  const handleCreate = async (values: {
    name: string;
    address: string;
    numberOfBoxes?: number;
    numberOfVacuums?: number;
    posMigrationId?: number | null;
  }) => {
    if (!organizationId) return;
    setIsCreating(true);
    try {
      await createPosRequest({
        name: values.name,
        address: values.address,
        numberOfBoxes: values.numberOfBoxes,
        numberOfVacuums: values.numberOfVacuums,
        posMigrationId: values.posMigrationId ?? undefined,
        organizationId,
      });
      form.resetFields();
      await mutate();
      showToast(
        t('createOrganization.posRequestsCreated'),
        'success'
      );
    } catch {
      showToast(
        t('createOrganization.posRequestsCreateError'),
        'error'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (values: {
    name: string;
    address: string;
    numberOfBoxes?: number;
    numberOfVacuums?: number;
    posMigrationId?: number | null;
  }) => {
    if (!editing) return;
    try {
      await updatePosRequest(editing.id, {
        name: values.name,
        address: values.address,
        numberOfBoxes: values.numberOfBoxes,
        numberOfVacuums: values.numberOfVacuums,
        posMigrationId: values.posMigrationId ?? undefined,
      });
      setEditing(null);
      await mutate();
      showToast(
        t('createOrganization.posRequestsUpdated'),
        'success'
      );
    } catch {
      showToast(
        t('createOrganization.posRequestsUpdateError'),
        'error'
      );
    }
  };

  const columns = [
    {
      title: t('general.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('general.address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: t('createOrganization.posRequestsNumberOfBoxes'),
      dataIndex: 'numberOfBoxes',
      key: 'numberOfBoxes',
    },
    {
      title: t('createOrganization.posRequestsNumberOfVacuums'),
      dataIndex: 'numberOfVacuums',
      key: 'numberOfVacuums',
    },
    {
      title: t('createOrganization.posRequestsPosMigrationId'),
      dataIndex: 'posMigrationId',
      key: 'posMigrationId',
      render: (v: number | null) => (v != null ? v : '—'),
    },
    {
      title: t('constants.status'),
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => t(`tables.${value}`),
    },
    {
      title: t('constants.actions'),
      key: 'actions',
      render: (record: PosRequestResponseDto) => (
        <AntButton
          size="small"
          type="link"
          disabled={record.status !== 'PENDING'}
          onClick={() => {
            setEditing(record);
          }}
        >
          {t('actions.edit')}
        </AntButton>
      ),
    },
  ];

  if (!organizationId) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#BFFA00] mb-2">
          {t('createOrganization.stepLabel4')}
        </span>
        <h1 className="text-lg sm:text-xl font-bold text-white">
          {t('createOrganization.posRequestsTitle')}
        </h1>
        <p className="mt-2 text-sm text-[#a3a3a3]">
          {t('createOrganization.posRequestsDescription')}
        </p>
        <p className="mt-2 text-xs text-[#a3a3a3]">
          {posLimit != null
            ? t('createOrganization.posRequestsLimit', {
              used: usedCount,
              limit: posLimit,
            })
            : t('createOrganization.posRequestsNoLimit', { used: usedCount })}
        </p>
      </div>

      <div className="mb-8 rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] p-4 sm:p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          disabled={isCreating}
          className="[&_.ant-form-item-label]:min-h-[1.5rem] [&_.ant-form-item-label]:overflow-visible [&_.ant-form-item-label>label]:leading-normal"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="text-white">{t('general.name')}</span>}
              name="name"
              rules={[{ required: true }]}
            >
              <Input placeholder={t('general.name')} />
            </Form.Item>
            <Form.Item
              label={<span className="text-white">{t('general.address')}</span>}
              name="address"
              rules={[{ required: true }]}
            >
              <Input placeholder={t('general.address')} />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-white">
                  {t('createOrganization.posRequestsNumberOfBoxes')}
                </span>
              }
              name="numberOfBoxes"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber
                min={0}
                className="w-full"
                parser={(value) => Number(value || 0)}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-white">
                  {t('createOrganization.posRequestsNumberOfVacuums')}
                </span>
              }
              name="numberOfVacuums"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber
                min={0}
                className="w-full"
                parser={(value) => Number(value || 0)}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-white">
                  {t('createOrganization.posRequestsPosMigrationId')}
                </span>
              }
              name="posMigrationId"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber
                min={0}
                className="w-full"
                placeholder={t('createOrganization.posRequestsPosMigrationIdPlaceholder')}
              />
            </Form.Item>
          </div>
          <Button
            type="basic"
            title={t('createOrganization.posRequestsCreateButton')}
            classname="mt-2 !rounded-xl !py-3 font-semibold"
            disabled={!canCreateMore || isCreating}
            isLoading={isCreating}
            form
          />
          {!canCreateMore && (
            <p className="mt-2 text-xs text-[#f97316]">
              {t('createOrganization.posRequestsLimitReached')}
            </p>
          )}
        </Form>
      </div>

      <div className="rounded-2xl bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden">
        <Table<PosRequestResponseDto>
          rowKey="id"
          columns={columns}
          dataSource={requests}
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: t('table.noData') }}
        />
      </div>

      <Modal
        open={editing != null}
        title={t('createOrganization.posRequestsEditTitle')}
        onCancel={() => setEditing(null)}
        footer={null}
        destroyOnClose
      >
        {editing && (
          <Form
            layout="vertical"
            initialValues={{
              name: editing.name,
              address: editing.address,
              numberOfBoxes: editing.numberOfBoxes,
              numberOfVacuums: editing.numberOfVacuums,
              posMigrationId: editing.posMigrationId,
            }}
            onFinish={handleUpdate}
            className="[&_.ant-form-item-label]:min-h-[1.5rem] [&_.ant-form-item-label]:overflow-visible [&_.ant-form-item-label>label]:leading-normal"
          >
            <Form.Item
              label={t('general.name')}
              name="name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={t('general.address')}
              name="address"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  {t('createOrganization.posRequestsNumberOfBoxes')}
                </span>
              }
              name="numberOfBoxes"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  {t('createOrganization.posRequestsNumberOfVacuums')}
                </span>
              }
              name="numberOfVacuums"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item
              label={t('createOrganization.posRequestsPosMigrationId')}
              name="posMigrationId"
              rules={[{ type: 'number', min: 0 }]}
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <div className="flex justify-end gap-2 mt-2">
              <AntButton onClick={() => setEditing(null)}>
                {t('actions.cancel')}
              </AntButton>
              <AntButton type="primary" htmlType="submit">
                {t('actions.save')}
              </AntButton>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default StepPosRequests;

