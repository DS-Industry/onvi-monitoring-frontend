import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getPoses,
  getTechTaskItem,
  getTechTaskManage,
  TechTaskBody,
  TechTaskManagerInfo,
} from '@/services/api/equipment';
import useSWR from 'swr';
import { Table, Tooltip } from 'antd';
import { useSearchParams } from 'react-router-dom';
import {
  ALL_PAGE_SIZES,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from '@/utils/constants';
import GeneralFilters from '@/components/ui/Filter/GeneralFilters';
import { updateSearchParams } from '@/utils/searchParamsUtils';
import {
  getDateRender,
  getStatusTagRender,
  getTagRender,
} from '@/utils/tableUnits';
import { ColumnsType } from 'antd/es/table';
import { useColumnSelector } from '@/hooks/useTableColumnSelector';
import ColumnSelector from '@/components/ui/Table/ColumnSelector';
import TechTaskForm from './TechTaskForm';
import AntDButton from 'antd/es/button';
import { EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useButtonCreate } from '@/components/context/useContext';

interface Item {
  id: number;
  title: string;
  description?: string;
}

const TechTaskCreate: React.FC = () => {
  const { t } = useTranslation();

  const defaultValues: TechTaskBody = {
    name: '',
    posId: 0,
    type: '',
    period: 0,
    startDate: dayjs().toDate(),
    endSpecifiedDate: undefined,
    markdownDescription: undefined,
    techTaskItem: [],
    tagIds: [],
  };

  const { data: techTaskItems } = useSWR(
    [`get-tech-task-item`],
    () => getTechTaskItem(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const techTask: { title: string; id: number; description: string }[] =
    useMemo(
      () =>
        techTaskItems?.map(item => ({
          title: item.props.title,
          id: item.props.id,
          description: 'This is the description text.',
        })) || [],
      [techTaskItems]
    );

  const [formData, setFormData] = useState(defaultValues);
  const [editTechTaskId, setEditTechTaskId] = useState<number>(0);
  const [availableItems, setAvailableItems] = useState<Item[]>(techTask);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const { setButtonOn } = useButtonCreate();

  const techTasksTypes = [
    { name: t('tables.REGULAR'), value: 'REGULAR' },
    { name: t('tables.ONETIME'), value: 'ONETIME' },
  ];

  const handleUpdate = (id: number) => {
    setEditTechTaskId(id);
    setButtonOn(true);
    const techTaskToEdit = techTasks.find(tech => tech.id === id);
    if (techTaskToEdit) {
      const techTaskItemNumber: number[] =
        techTaskToEdit.items?.map(item => item.id) || [];
      const techSelectedTasks: {
        id: number;
        title: string;
        description: string;
      }[] = techTaskToEdit.items.map(item => ({
        id: item.id,
        title: item.title,
        description: 'This is the description text.',
      }));
      setSelectedItems(techSelectedTasks);
      setAvailableItems(
        availableItems.filter(item => !techTaskItemNumber.includes(item.id))
      );
      setFormData({
        name: techTaskToEdit.name,
        posId: techTaskToEdit.posId,
        type:
          techTasksTypes.find(item => item.name === techTaskToEdit.type)
            ?.value || '-',
        period: techTaskToEdit.period,
        startDate: techTaskToEdit.startDate,
        endSpecifiedDate:
          techTaskToEdit.endSpecifiedDate && techTaskToEdit.endSpecifiedDate,
        techTaskItem: techTaskItemNumber,
        markdownDescription: techTaskToEdit.markdownDescription,
        tagIds: techTaskToEdit.tags.map(tag => tag.id),
      });
    }
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || DEFAULT_PAGE);
  const pageSize = Number(searchParams.get('size') || DEFAULT_PAGE_SIZE);
  const posId = Number(searchParams.get('posId')) || undefined;

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { data, isLoading: techTasksLoading } = useSWR(
    [`get-tech-tasks`, currentPage, pageSize, posId],
    () =>
      getTechTaskManage({
        posId: posId,
        page: currentPage,
        size: pageSize,
      }).finally(() => {
        setIsInitialLoading(false);
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: poses } = useSWR(
    [`get-pos`],
    () => getPoses({ placementId: '*' }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const techTasks =
    data?.techTaskManageInfo.map(item => ({
      ...item,
      type: t(`tables.${item.type}`),
      posName: poses?.find(pos => pos.id === item.posId)?.name,
      status:
        item.status === 'ACTIVE'
          ? t(`tables.In Progress`)
          : item.status === 'FINISHED'
            ? t(`tables.Done`)
            : t(`tables.${item.status}`),
    })) || [];

  const renderStatus = getStatusTagRender(t);
  const dateRender = getDateRender();

  const columnsTechTasks: ColumnsType<TechTaskManagerInfo> = [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Автомойка/ Филиал',
      dataIndex: 'posName',
      key: 'posName',
    },
    {
      title: 'Наименование работ',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Периодичность',
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
    },
    {
      title: 'Тип работы',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Теги',
      dataIndex: 'tags',
      key: 'tags',
      render: value => getTagRender(value),
    },
    {
      title: 'Дата начала работ',
      dataIndex: 'startDate',
      key: 'startDate',
      render: dateRender,
    },
    {
      title: '',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: unknown, record: { id: number }) => (
        <Tooltip title="Редактировать">
          <AntDButton
            type="text"
            icon={
              <EditOutlined className="text-blue-500 hover:text-blue-700" />
            }
            onClick={() => handleUpdate(record.id)}
            style={{ height: '24px' }}
          />
        </Tooltip>
      ),
    },
  ];

  const resetFilters = () => {
    updateSearchParams(searchParams, setSearchParams, {
      posId: undefined,
    });
  };

  const {
    checkedList,
    setCheckedList,
    options: optionsColumns,
    visibleColumns,
  } = useColumnSelector(columnsTechTasks, 'tech-tasks-columns');

  return (
    <>
      <GeneralFilters
        count={data?.totalCount || 0}
        display={['pos', 'reset']}
        onReset={resetFilters}
      />
      <div className="mt-8">
        <ColumnSelector
          checkedList={checkedList}
          options={optionsColumns}
          onChange={setCheckedList}
        />
        <Table
          dataSource={techTasks.sort((a, b) => a.id - b.id)}
          columns={visibleColumns}
          loading={techTasksLoading || isInitialLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: data?.totalCount || 0,
            pageSizeOptions: ALL_PAGE_SIZES,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, size) => {
              updateSearchParams(searchParams, setSearchParams, {
                page: String(page),
                size: String(size),
              });
            },
          }}
          scroll={{ x: 'max-content' }}
        />
      </div>
      <TechTaskForm
        formData={formData}
        setFormData={setFormData}
        editTechTaskId={editTechTaskId}
        setEditTechTaskId={setEditTechTaskId}
        availableItems={availableItems}
        setAvailableItems={setAvailableItems}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
      />
    </>
  );
};

export default TechTaskCreate;
