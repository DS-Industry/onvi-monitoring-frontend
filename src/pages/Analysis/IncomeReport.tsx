import { getDevices, getPoses } from '@/services/api/equipment';
import React, { useState } from 'react';
import useSWR from 'swr';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { applyReport, getReportById } from '@/services/api/reports';
import useSWRMutation from 'swr/mutation';
import Button from '@/components/ui/Button/Button';
import { getWarehouses } from '@/services/api/warehouse';
import { getOrganization } from '@/services/api/organization';
import { useTranslation } from 'react-i18next';
import DateInput from '@/components/ui/Input/DateInput';
import dayjs from 'dayjs';
import { message, Skeleton, Input, Select } from 'antd';
import { useToast } from '@/components/context/useContext';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';

const IncomeReport: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const city = Number(searchParams.get('city')) || undefined;
  const posId = Number(searchParams.get('posId')) || undefined;
  const { showToast } = useToast();

  const { data: posData } = useSWR(
    [`get-pos`, city],
    () => getPoses({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: deviceData } = useSWR(
    posId ? [`get-device`] : null,
    () => getDevices(posId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: warehouseData } = useSWR(
    [`get-warehouse`],
    () =>
      getWarehouses({
        posId: Number(posId) || '*',
        placementId: Number(city) || '*',
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const { data: organizationData } = useSWR(
    [`get-organization`],
    () => getOrganization({ placementId: city }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const {
    data: reportData,
    isLoading: loadingReport,
    isValidating: validatingReport,
  } = useSWR([`get-report`], () => getReportById(location.state.ownerId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const { trigger: createReport, isMutating } = useSWRMutation(
    reportData?.id ? ['create-report'] : null,
    async () =>
      applyReport(
        {
          ...formData,
        },
        reportData?.id ? reportData.id : 0
      )
  );

  const [formData, setFormData] = useState<{ [key: string]: string | number }>(
    {}
  );

  const handleInputChange = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); 

    if (!reportData?.id) {
      console.error('Report ID is missing');
      return;
    }

    const missingFields = reportData.params.params
      .filter(
        param =>
          !formData[param.name] || formData[param.name].toString().trim() === ''
      )
      .map(param => param.description || param.name);

    if (missingFields.length > 0) {
      message.error(
        `Please fill in the following fields: ${missingFields.join(', ')}`
      );
      return;
    }

    try {
      await createReport(); 
      navigate('/analysis/transactions');
    } catch (error) {
      console.error('Error creating report:', error);
      showToast(t('errors.other.errorCreatingReport'), 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.income')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">{t('analysis.repo')}</h3>
          <div className="flex flex-wrap gap-4">
            {loadingReport || validatingReport ? (
              <div className="flex flex-wrap gap-4">
                <Skeleton.Input active style={{ width: 150, height: 32 }} />
                <Skeleton.Input active style={{ width: 150, height: 32 }} />
                <Skeleton.Input active style={{ width: 150, height: 32 }} />
              </div>
            ) : (
              reportData &&
              reportData.params.params.map(value => (
                <div key={value.name}>
                  {value.type === 'date' ? (
                    <DateInput
                      title={value.description}
                      value={
                        formData[value.name]
                          ? dayjs(formData[value.name])
                          : null
                      }
                      changeValue={date =>
                        handleInputChange(
                          value.name,
                          date ? date.format('YYYY-MM-DD') : ''
                        )
                      }
                      classname="w-64"
                    />
                  ) : value.name.toLowerCase().includes('pos') ? (
                    <div>
                      <div className="text-sm text-text02">
                        {value.description}
                      </div>
                    <Select
                      title={value.description}
                      value={formData[value.name] || ''}
                      options={posData?.map((item) => ({ label: item.name, value: item.id }))}
                      onChange={val => handleInputChange(value.name, val)}
                      className="w-64"
                      size="large"
                    />
                    </div>
                  ) : value.name.toLowerCase().includes('device') ? (
                    <div>
                      <div className="text-sm text-text02">
                        {value.description}
                      </div>
                    <Select
                      title={value.description}
                      value={formData[value.name] || ''}
                      options={deviceData?.map((item) => ({ label: item.props.name, value: item.props.id }))}
                      onChange={val => handleInputChange(value.name, val)}
                      className="w-64"
                      size="large"
                    />
                    </div>
                  ) : value.name.toLowerCase().includes('warehouse') ? (
                    <div>
                      <div className="text-sm text-text02">
                        {value.description}
                      </div>
                    <Select
                      title={value.description}
                      value={formData[value.name] || ''}
                      options={warehouseData?.map((item) => ({ label: item.props.name, value: item.props.id }))}
                      onChange={val => handleInputChange(value.name, val)}
                      className="w-64"
                      size="large"
                    />
                    </div>
                  ) : value.name.toLowerCase().includes('org') ? (
                    <div>
                      <div className="text-sm text-text02">
                        {value.description}
                      </div>
                    <Select
                      title={value.description}
                      value={formData[value.name] || ''}
                      options={organizationData?.map((item) => ({ label: item.name, value: item.id }))}
                      onChange={val => handleInputChange(value.name, val)}
                      className="w-64"
                      size="large"
                    />
                    </div>
                  ) : value.type === 'number' ? (
                    <div>
                      <div className="text-sm text-text02">
                        {t(`analysis.${value.name}`)}
                      </div>
                      <Input
                        type="number"
                        value={formData[value.name] || ''}
                        onChange={e =>
                          handleInputChange(value.name, Number(e.target.value))
                        }
                        className="w-64"
                        size='large'
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-text02">
                        {t(`analysis.${value.name}`)}
                      </div>
                      <Input
                        title={t(`analysis.${value.name}`)}
                        type="text"
                        value={formData[value.name] || ''}
                        onChange={e =>
                          handleInputChange(value.name, e.target.value)
                        }
                        className="w-64"
                        size='large'
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <Button
            title={t('analysis.add')}
            form={true}
            isLoading={isMutating}
          />
        </form>
      </div>
    </div>
  );
};

export default IncomeReport;
