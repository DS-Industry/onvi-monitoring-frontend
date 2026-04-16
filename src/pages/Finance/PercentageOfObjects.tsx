import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Popconfirm,
  Space,
  Checkbox,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  UserDeleteOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@/hooks/useUserStore';
import { useToast } from '@/hooks/useToast';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, ALL_PAGE_SIZES } from '@/utils/constants';
import { getCurrencyRender } from '@/utils/tableUnits';
import {
  createPosCalculation,
  getPosByCalculation,
  createPosPartnerPercent,
  deletePosPartnerPercent,
  getPosCalculations,
  getWorkerPartners,
  updatePosCalculation,
  type PosCalculationResponse,
  type WorkerPartnerResponse,
} from '@/services/api/finance';
import PercentageFilters from './PercentageOfObjects/components/PercentageFilters';
import CreatePosCalculationModal from './PercentageOfObjects/components/CreatePosCalculationModal';
import AddPartnerModal from './PercentageOfObjects/components/AddPartnerModal';
import type { ObjectData, PartnerDetail, SelectOptionNumber, SelectOptionString } from './PercentageOfObjects/types';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  inputType: 'number' | 'text' | 'date' | 'checkbox';
  record: ObjectData | PartnerDetail;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  inputType,
  children,
  ...restProps
}) => {

  const getInputNode = () => {
    switch (inputType) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
            parser={value => value!.replace(/\s/g, '')}
          />
        );
      case 'date':
        return <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />;
      case 'checkbox':
        return <Checkbox onClick={(e) => e.stopPropagation()} />;
      default:
        return <Input />;
    }
  };

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          valuePropName={inputType === 'checkbox' ? 'checked' : 'value'}
        >
          {getInputNode()}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const PercentageOfObjects: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const city = searchParams.get('city') || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;
  const partnerId = Number(searchParams.get('partnerId')) || undefined;

  const [data, setData] = useState<ObjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosFilterLoading, setIsPosFilterLoading] = useState(false);
  const [posFilterOptions, setPosFilterOptions] = useState<SelectOptionString[]>([]);
  const [isCreatePosOptionsLoading, setIsCreatePosOptionsLoading] = useState(false);
  const [createPosOptions, setCreatePosOptions] = useState<SelectOptionNumber[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [savingParentId, setSavingParentId] = useState<number | null>(null);
  const [workerPartners, setWorkerPartners] = useState<WorkerPartnerResponse[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [addPartnerModalOpen, setAddPartnerModalOpen] = useState(false);
  const [addPartnerForRecord, setAddPartnerForRecord] = useState<ObjectData | null>(null);
  const [isAddPartnerSubmitting, setIsAddPartnerSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [addPartnerForm] = Form.useForm();

  const watchedFormValues = Form.useWatch([], form);
  const watchedCreatePartners = Form.useWatch('newPartners', createForm) as
    | Array<{
      partnerId?: number;
      startDate?: Dayjs;
      endDate?: Dayjs;
      percent?: number;
      comment?: string;
    }>
    | undefined;

  const partnersPercentSumInfo = useMemo(() => {
    if (editingParentId === null) {
      return { sum: 100, valid: true, partnerCount: 0 };
    }
    const record = data.find(r => r.id === editingParentId);
    const partnerCount = record?.partners.length ?? 0;
    if (partnerCount === 0) {
      return { sum: 100, valid: true, partnerCount: 0 };
    }
    let sum = 0;
    for (let i = 0; i < partnerCount; i++) {
      const key = `partners[${i}].percent` as const;
      let raw: unknown = watchedFormValues?.[key];
      if (raw === undefined || raw === null) {
        raw = record?.partners[i]?.percent;
      }
      const n = typeof raw === 'number' ? raw : Number(raw);
      sum += Number.isFinite(n) ? n : 0;
    }
    const valid = Math.abs(sum - 100) < 0.01;
    return { sum, valid, partnerCount };
  }, [data, editingParentId, watchedFormValues]);

  const createPartnersSumInfo = useMemo(() => {
    const rows = watchedCreatePartners ?? [];
    if (rows.length === 0) {
      return { sum: 100, valid: true };
    }
    let sum = 0;
    for (const row of rows) {
      const raw = row?.percent;
      const n = typeof raw === 'number' ? raw : Number(raw);
      sum += Number.isFinite(n) ? n : 0;
    }
    return { sum, valid: Math.abs(sum - 100) < 0.01 };
  }, [watchedCreatePartners]);

  const partnerSelectOptions = useMemo(
    () =>
      workerPartners.map(w => ({
        value: w.id,
        label: [w.surname, w.name, w.middlename].filter(Boolean).join(' '),
      })),
    [workerPartners]
  );

  const addPartnerSelectOptions = useMemo(() => {
    if (!addPartnerForRecord) return partnerSelectOptions;
    const taken = new Set(
      addPartnerForRecord.partners
        .map(p => p.partnerId)
        .filter((id): id is number => id != null)
    );
    return partnerSelectOptions.filter(o => !taken.has(o.value));
  }, [partnerSelectOptions, addPartnerForRecord]);

  const mapCalculationToTableData = (item: PosCalculationResponse): ObjectData => ({
    id: item.posCalculationId,
    posId: item.pos.id,
    city: item.region,
    carWashName: item.pos.name,
    cost: item.cost,
    includeInReport: item.calculationReport,
    partners: item.partners.map((partner, index) => {
      const fullName = [partner.surname, partner.name, partner.middlename]
        .filter(Boolean)
        .join(' ');
      return {
        id: index + 1,
        partnerId: partner.partnerId,
        startDate: dayjs(partner.startDate),
        endDate: partner.endDate ? dayjs(partner.endDate) : undefined,
        percent: partner.percent,
        partnerName: fullName,
        comment: partner.comment,
      };
    }),
  });

  const loadPosOptions = useCallback(async () => {
    if (!user.organizationId) return;
    setIsPosFilterLoading(true);
    try {
      const calculatedPoses = await getPosByCalculation({
        organizationId: user.organizationId,
        isPosCalculation: true,
      });
      setPosFilterOptions(
        calculatedPoses.map(pos => ({
          value: String(pos.id),
          label: pos.name,
        }))
      );
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsPosFilterLoading(false);
    }
  }, [t, user.organizationId]);

  const loadCreatePosOptions = useCallback(async () => {
    if (!user.organizationId) return;
    setIsCreatePosOptionsLoading(true);
    try {
      const availablePoses = await getPosByCalculation({
        organizationId: user.organizationId,
        isPosCalculation: false,
      });
      setCreatePosOptions(
        availablePoses.map(pos => ({
          value: pos.id,
          label: pos.name,
        }))
      );
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsCreatePosOptionsLoading(false);
    }
  }, [t, user.organizationId]);

  useEffect(() => {
    const loadWorkerPartners = async () => {
      if (!user.organizationId) return;
      try {
        const workers = await getWorkerPartners(user.organizationId);
        setWorkerPartners(workers);
      } catch (error) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    };

    loadWorkerPartners();
  }, [user.organizationId]);

  useEffect(() => {
    loadPosOptions();
  }, [loadPosOptions]);

  useEffect(() => {
    const loadCalculations = async () => {
      setIsLoading(true);
      try {
        const response = await getPosCalculations({
          posId,
          partnerId,
        });
        const mappedData: ObjectData[] = response.map(mapCalculationToTableData);
        setData(mappedData);
      } catch (error) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadCalculations();
  }, [posId, partnerId]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const cityMatches = !city || item.city === city;
      const posMatches = !posId || item.posId === posId;
      return cityMatches && posMatches;
    });
  }, [data, city, posId]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const totalCount = filteredData.length;
  const currencyRender = getCurrencyRender();

  const isEditingParent = (record: ObjectData) => editingParentId === record.id;

  const applyRecordToForm = (record: ObjectData) => {
    const formValues: Record<string, unknown> = {
      cost: record.cost,
      includeInReport: record.includeInReport,
    };
    record.partners.forEach((partner, idx) => {
      formValues[`partners[${idx}].endDate`] = partner.endDate;
      formValues[`partners[${idx}].percent`] = partner.percent;
      formValues[`partners[${idx}].comment`] = partner.comment;
    });
    form.setFieldsValue(formValues);
  };

  const editParent = (record: ObjectData) => {
    applyRecordToForm(record);
    setEditingParentId(record.id);
  };

  const cancelParent = () => {
    setEditingParentId(null);
    form.resetFields();
  };

  const saveParent = async (record: ObjectData) => {
    if (!partnersPercentSumInfo.valid) {
      showToast(t('finance.partnersPercentSumMustBe100'), 'error');
      return;
    }
    setSavingParentId(record.id);
    try {
      const values = await form.validateFields();
      const response = await updatePosCalculation({
        posCalculationId: record.id,
        cost: values.cost,
        calculationReport: values.includeInReport,
        partners: record.partners
          .filter(partner => partner.partnerId)
          .map((partner, idx) => ({
            partnerId: partner.partnerId!,
            endDate: values[`partners[${idx}].endDate`]?.toDate(),
            percent: values[`partners[${idx}].percent`],
            comment: values[`partners[${idx}].comment`],
          })),
      });

      const updatedRecord = mapCalculationToTableData(response);
      setData(prev => prev.map(item => (item.id === record.id ? updatedRecord : item)));
      setEditingParentId(null);
      showToast(t('success.recordUpdated'), 'success');
    } catch (err) {
      showToast(t('errors.other.failedToUpdateRecord'), 'error');
    } finally {
      setSavingParentId(null);
    }
  };

  const handleAdd = () => {
    createForm.resetFields();
    createForm.setFieldValue('calculationReport', true);
    createForm.setFieldValue('newPartners', []);
    loadCreatePosOptions();
    setIsCreateModalOpen(true);
  };

  const handleCreatePosCalculation = async () => {
    try {
      const values = await createForm.validateFields();
      const rawPartners = (values.newPartners ?? []) as Array<{
        partnerId?: number;
        startDate?: Dayjs;
        endDate?: Dayjs;
        percent?: number;
        comment?: string;
      }>;
      const partnersPayload = rawPartners
        .filter(p => p.partnerId != null && p.startDate && p.percent != null)
        .map(p => ({
          partnerId: p.partnerId!,
          startDate: p.startDate!.toDate(),
          endDate: p.endDate?.toDate(),
          percent: p.percent!,
          comment: p.comment,
        }));

      if (partnersPayload.length > 0 && !createPartnersSumInfo.valid) {
        showToast(t('finance.partnersPercentSumMustBe100'), 'error');
        return;
      }

      const seen = new Set<number>();
      for (const p of partnersPayload) {
        if (seen.has(p.partnerId)) {
          showToast(t('errors.other.errorDuringFormSubmission'), 'error');
          return;
        }
        seen.add(p.partnerId);
      }

      setIsCreateSubmitting(true);
      const response = await createPosCalculation({
        posId: values.posId,
        cost: values.cost,
        calculationReport: values.calculationReport ?? false,
      });

      let finalResponse = response;
      if (partnersPayload.length > 0) {
        finalResponse = await createPosPartnerPercent({
          posCalculationId: response.posCalculationId,
          partners: partnersPayload,
        });
      }

      const createdItem = mapCalculationToTableData(finalResponse);

      setData(prev => [createdItem, ...prev]);

      await Promise.all([loadPosOptions(), loadCreatePosOptions()]);

      setIsCreateModalOpen(false);
      createForm.resetFields();
      showToast(t('success.recordCreated'), 'success');
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const openAddPartnerModal = (record: ObjectData) => {
    addPartnerForm.resetFields();
    setAddPartnerForRecord(record);
    setAddPartnerModalOpen(true);
  };

  const handleAddPartnerSubmit = async () => {
    if (!addPartnerForRecord) return;
    try {
      const v = await addPartnerForm.validateFields();
      setIsAddPartnerSubmitting(true);
      const response = await createPosPartnerPercent({
        posCalculationId: addPartnerForRecord.id,
        partners: [
          {
            partnerId: v.partnerId,
            startDate: v.startDate.toDate(),
            endDate: v.endDate?.toDate(),
            percent: v.percent,
            comment: v.comment,
          },
        ],
      });
      const updatedRecord = mapCalculationToTableData(response);
      setData(prev =>
        prev.map(item => (item.id === addPartnerForRecord.id ? updatedRecord : item))
      );
      if (editingParentId === addPartnerForRecord.id) {
        applyRecordToForm(updatedRecord);
      }
      setAddPartnerModalOpen(false);
      setAddPartnerForRecord(null);
      addPartnerForm.resetFields();
      showToast(t('success.recordUpdated'), 'success');
    } catch (error) {
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    } finally {
      setIsAddPartnerSubmitting(false);
    }
  };

  const expandedRowRender = (record: ObjectData) => {
    const editing = isEditingParent(record);
    const handleDeletePartner = async (partnerId?: number) => {
      if (!partnerId) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
        return;
      }
      try {
        const response = await deletePosPartnerPercent({
          posCalculationId: record.id,
          partnerId,
        });
        const updatedRecord = mapCalculationToTableData(response);
        setData(prev => prev.map(item => (item.id === record.id ? updatedRecord : item)));
        showToast(t('success.recordDeleted'), 'success');
      } catch (error) {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    };

    const percentInputsInvalid =
      editing && record.partners.length > 0 && !partnersPercentSumInfo.valid;

    const partnerColumns: ColumnsType<PartnerDetail> = [
      {
        title: t('shift.startDate'),
        key: 'startDate',
        render: (_, partner) => {
          return partner.startDate?.isValid() ? partner.startDate.format('DD.MM.YYYY') : '-';
        },
      },
      {
        title: t('marketing.comp'),
        key: 'endDate',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].endDate`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <DatePicker format="DD.MM.YYYY" style={{ width: '100%' }} />
              </Form.Item>
            );
          }
          return partner.endDate?.isValid() ? partner.endDate.format('DD.MM.YYYY') : '-';
        },
      },
      {
        title: t('finance.percent'),
        key: 'percent',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].percent`;
          if (editing) {
            return (
              <Form.Item
                name={fieldName}
                style={{ margin: 0 }}
                validateStatus={percentInputsInvalid ? 'error' : undefined}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.01}
                  style={{ width: '100%' }}
                  status={percentInputsInvalid ? 'error' : undefined}
                />
              </Form.Item>
            );
          }
          return `${partner.percent}%`;
        },
      },
      {
        title: t('finance.partnerName'),
        key: 'partnerName',
        render: (_, partner) => partner.partnerName,
      },
      {
        title: t('equipment.comment'),
        key: 'comment',
        render: (_, partner, idx) => {
          const fieldName = `partners[${idx}].comment`;
          if (editing) {
            return (
              <Form.Item name={fieldName} style={{ margin: 0 }}>
                <Input />
              </Form.Item>
            );
          }
          return partner.comment || '-';
        },
      },
      {
        title: t('marketing.actions'),
        key: 'actions',
        width: 80,
        render: (_, partner) => (
          <Popconfirm
            title={t('common.delete')}
            onConfirm={() => handleDeletePartner(partner.partnerId)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="text"
              danger
              icon={<UserDeleteOutlined />}
              disabled={editing}
            />
          </Popconfirm>
        ),
      },
    ];

    return (
      <>
        <Button
          type="dashed"
          icon={<UserAddOutlined />}
          className="mb-3"
          onClick={e => {
            e.stopPropagation();
            openAddPartnerModal(record);
          }}
          disabled={
            !user.organizationId ||
            partnerSelectOptions.filter(
              o => !record.partners.some(p => p.partnerId === o.value)
            ).length === 0
          }
        >
          {t('finance.addPartner')}
        </Button>
        {editing && record.partners.length > 0 && (
          <div
            className={`mb-2 text-sm ${percentInputsInvalid ? 'text-red-500' : 'text-text02'}`}
          >
            {t('finance.percent')}: {partnersPercentSumInfo.sum.toFixed(2)}%
            {percentInputsInvalid && (
              <span className="ms-2">{t('finance.partnersPercentSumMustBe100')}</span>
            )}
          </div>
        )}
        <Table
          dataSource={record.partners}
          columns={partnerColumns}
          pagination={false}
          size="small"
          rowKey="id"
        />
      </>
    );
  };

  const mainColumns: ColumnsType<ObjectData> = [
    {
      title: t('finance.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: t('finance.city'),
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: t('finance.carWash'),
      dataIndex: 'carWashName',
      key: 'carWashName',
    },
    {
      title: t('finance.cost'),
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number) => currencyRender(value),
      onCell: (record) => ({
        editing: isEditingParent(record),
        dataIndex: 'cost',
        inputType: 'number',
        record,
      } as any),
    },
    {
      title: t('finance.includeInReport'),
      dataIndex: 'includeInReport',
      key: 'includeInReport',
      render: (value: boolean) => (value ? t('common.yes') : t('common.no')),
      onCell: (record) => ({
        editing: isEditingParent(record),
        dataIndex: 'includeInReport',
        inputType: 'checkbox',
        record,
      } as any),
    },
    {
      title: t('marketing.actions'),
      key: 'actions',
      render: (_: unknown, record) => {
        const editing = isEditingParent(record);
        if (editing) {
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => saveParent(record)}
                disabled={!partnersPercentSumInfo.valid}
                loading={savingParentId === record.id}
              >
                {t('organizations.save')}
              </Button>
              <Button
                onClick={cancelParent}
              >
                {t('organizations.cancel')}
              </Button>
            </Space>
          );
        }
        return (
          <Typography.Link
            disabled={editingParentId !== null}
            onClick={() => editParent(record)}
          >
            {t('actions.edit')}
          </Typography.Link>
        );
      },
    },
  ];

  const { checkedList, setCheckedList, options, visibleColumns } =
    useColumnSelector(mainColumns, 'percentage-of-objects-table-columns');

  return (
    <>
      <div className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0" onClick={() => navigate(-1)}>
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>

      <div className="ml-12 md:ml-0 mb-5 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.percentageOfObjects')}
          </span>
        </div>
        <Button icon={<PlusOutlined />} className="btn-primary" onClick={handleAdd}>
          {t('routes.add')}
        </Button>
      </div>

      <PercentageFilters
        totalCount={totalCount}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        isPosFilterLoading={isPosFilterLoading}
        posFilterOptions={posFilterOptions}
        partnerSelectOptions={partnerSelectOptions}
      />

      <div className="mt-8">
        <div className="mb-4 flex justify-between">
          <div className="w-full">
            <ColumnSelector
              checkedList={checkedList}
              options={options}
              onChange={setCheckedList}
            />
          </div>
        </div>

        <Form form={form} component={false}>
          <Table
            rowKey="id"
            dataSource={paginatedData}
            loading={isLoading}
            columns={visibleColumns}
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              rowExpandable: () => true,
              onExpand: (expanded, record) => {
                if (expanded) {
                  setExpandedRowKeys([...expandedRowKeys, record.id]);
                } else {
                  setExpandedRowKeys(expandedRowKeys.filter(k => k !== record.id));
                }
              },
            }}
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              pageSizeOptions: ALL_PAGE_SIZES,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} из ${total} ${t('finance.records')}`,
              onChange: (page, size) =>
                updateSearchParams(searchParams, setSearchParams, {
                  page: String(page),
                  size: String(size),
                }),
            }}
            scroll={{ x: 'max-content' }}
          />
        </Form>
      </div>

      <CreatePosCalculationModal
        open={isCreateModalOpen}
        confirmLoading={isCreateSubmitting}
        createForm={createForm}
        watchedCreatePartners={watchedCreatePartners}
        createPartnersSumInfo={createPartnersSumInfo}
        createPosOptions={createPosOptions}
        isCreatePosOptionsLoading={isCreatePosOptionsLoading}
        partnerSelectOptions={partnerSelectOptions}
        onOk={handleCreatePosCalculation}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <AddPartnerModal
        open={addPartnerModalOpen}
        confirmLoading={isAddPartnerSubmitting}
        addPartnerForm={addPartnerForm}
        addPartnerSelectOptions={addPartnerSelectOptions}
        onOk={handleAddPartnerSubmit}
        onCancel={() => {
          setAddPartnerModalOpen(false);
          setAddPartnerForRecord(null);
          addPartnerForm.resetFields();
        }}
      />
    </>
  );
};

export default PercentageOfObjects;