import Filter from '@/components/ui/Filter/Filter';
import DropdownInput from '@/components/ui/Input/DropdownInput';
import { getDevices, getPoses } from '@/services/api/equipment';
import React, { useState } from 'react';
import useSWR from 'swr';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { applyReport, getReportById } from '@/services/api/reports';
import Input from '@/components/ui/Input/Input';
import useSWRMutation from 'swr/mutation';
import Button from '@/components/ui/Button/Button';
import { getWarehouses } from '@/services/api/warehouse';
import { getOrganization } from '@/services/api/organization';
import { useTranslation } from 'react-i18next';
import DateInput from '@/components/ui/Input/DateInput';
import dayjs from 'dayjs';
import { message, Skeleton } from 'antd';
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

  const poses: { name: string; value: number }[] =
    posData?.map(item => ({ name: item.name, value: item.id })) || [];

  const devices: { name: string; value: string }[] =
    deviceData?.map(item => ({
      name: item.props.name,
      value: item.props.name,
    })) || [];

  const warehouses: { name: string; value: number }[] =
    warehouseData?.map(item => ({
      name: item.props.name,
      value: item.props.id,
    })) || [];

  const organizations: { name: string; value: number }[] =
    organizationData?.map(item => ({ name: item.name, value: item.id })) || [];

  // State for dynamic inputs
  const [formData, setFormData] = useState<{ [key: string]: string | number }>(
    {}
  );

  // Handle input changes dynamically
  const handleInputChange = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent page reload

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
      // Show Ant Design error notification or toast
      message.error(
        `Please fill in the following fields: ${missingFields.join(', ')}`
      );
      return;
    }

    try {
      await createReport(); // Pass formData correctly
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

      <div className="mt-5">
        <Filter
          count={0}
          hideSearch={true}
          hideCity={true}
          hideDateTime={true}
          children={undefined}
        ></Filter>

        {/* Dynamic Input Fields Based on API Response */}
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
                      <DropdownInput
                        title={value.description}
                        value={formData[value.name] || ''}
                        options={poses}
                        onChange={val => handleInputChange(value.name, val)}
                        classname="w-64"
                      />
                    ) : value.name.toLowerCase().includes('device') ? (
                      <DropdownInput
                        title={value.description}
                        value={formData[value.name] || ''}
                        options={devices}
                        onChange={val => handleInputChange(value.name, val)}
                        classname="w-64"
                      />
                    ) : value.name.toLowerCase().includes('warehouse') ? (
                      <DropdownInput
                        title={value.description}
                        value={formData[value.name] || ''}
                        options={warehouses}
                        onChange={value => handleInputChange(value.name, value)}
                        classname="w-64"
                      />
                    ) : value.name.toLowerCase().includes('org') ? (
                      <DropdownInput
                        title={value.description}
                        value={formData[value.name] || ''}
                        options={organizations}
                        onChange={val => handleInputChange(value.name, val)}
                        classname="w-64"
                      />
                    ) : value.type === 'number' ? (
                      <Input
                        title={t(`analysis.${value.name}`)}
                        type="number"
                        value={formData[value.name] || ''}
                        changeValue={e =>
                          handleInputChange(value.name, Number(e.target.value))
                        }
                        classname="w-64"
                      />
                    ) : (
                      <Input
                        title={t(`analysis.${value.name}`)}
                        type="text"
                        value={formData[value.name] || ''}
                        changeValue={e =>
                          handleInputChange(value.name, e.target.value)
                        }
                        classname="w-64"
                      />
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
    </div>
  );
};

export default IncomeReport;
