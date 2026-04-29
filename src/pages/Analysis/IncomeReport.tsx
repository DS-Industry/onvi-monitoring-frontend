import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Skeleton, Input, Select, DatePicker, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { debounce } from 'lodash';

import { getReportById, applyReport, ReportParam } from '@/services/api/reports';
import { getDevices, getPoses } from '@/services/api/equipment';
import { getPlacement } from '@/services/api/device';
import { getWarehouses } from '@/services/api/warehouse';
import { getOrganization } from '@/services/api/organization';
import { getWorkerManager } from '@/services/api/finance';
import { useToast } from '@/components/context/useContext';
import { useUser } from '@/hooks/useUserStore';
import { getNumericPrefix } from '@/utils/getNumericPrefix';

type FormValue = string | number | null;

const isRequired = (param: ReportParam): boolean => {
  if (param.type === 'selectListManager' || param.name === 'managerId') {
    return false;
  }
  if (param.required === undefined) return true;
  if (typeof param.required === 'boolean') return param.required;
  return param.required.toLowerCase() === 'true';
};

const IncomeReport: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = Number(searchParams.get('id'));
  const { showToast } = useToast();
  const user = useUser();
  const cityParam = Number(searchParams.get('city')) || undefined;
  const posIdParam = Number(searchParams.get('posId')) || undefined;

  const { data: posData } = useSWR(
    [`get-pos`, cityParam, user.organizationId],
    () => getPoses({ placementId: cityParam, organizationId: user.organizationId }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  const { data: deviceData } = useSWR(
    posIdParam ? [`get-device`, posIdParam] : null,
    () => getDevices(posIdParam),
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  const { data: warehouseData } = useSWR(
    [`get-warehouse`],
    () => getWarehouses({ posId: posIdParam, placementId: cityParam }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  const { data: organizationData } = useSWR(
    [`get-organization`],
    () => getOrganization({ placementId: cityParam }),
    { revalidateOnFocus: false, keepPreviousData: true }
  );
  const { data: cityData } = useSWR('get-city', getPlacement, { revalidateOnFocus: false });

  const { data: reportData, isLoading: loadingReport } = useSWR(
    reportId ? [`get-report-${reportId}`] : null,
    () => getReportById(reportId)
  );

  const sortedPosOptions = useMemo(() => {
    if (!posData) return [];
    return [...posData]
      .sort((a, b) => {
        const numA = getNumericPrefix(a.name);
        const numB = getNumericPrefix(b.name);
        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name);
      })
      .map(p => ({ label: p.name, value: p.id }));
  }, [posData]);

  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [debouncedManagerSearch, setDebouncedManagerSearch] = useState('');
  const selectedOrganizationId = useMemo(() => {
    const raw = formValues.organizationId;
    if (raw === null || raw === undefined || raw === '') return undefined;
    return Number(raw);
  }, [formValues.organizationId]);

  useEffect(() => {
    if (reportData?.params?.params) {
      const initial: Record<string, FormValue> = {};
      reportData.params.params.forEach((param: ReportParam) => {
        initial[param.name] = null;
      });
      setFormValues(initial);
    }
  }, [reportData]);

  const debouncedManagerSearchUpdate = useMemo(
    () => debounce((value: string) => {
      setDebouncedManagerSearch(value.trim().toLowerCase());
    }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedManagerSearchUpdate.cancel();
    };
  }, [debouncedManagerSearchUpdate]);

  useEffect(() => {
    setDebouncedManagerSearch('');
    debouncedManagerSearchUpdate.cancel();
  }, [selectedOrganizationId, debouncedManagerSearchUpdate]);

  const handleInputChange = (name: string, value: FormValue) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const isFormValid = useMemo(() => {
    if (!reportData?.params?.params) return false;
    return reportData.params.params.every((param: ReportParam) => {
      if (!isRequired(param)) return true;
      const value = formValues[param.name];
      return value !== null && value !== '' && value !== undefined;
    });
  }, [reportData, formValues]);

  const { trigger: generateReport, isMutating } = useSWRMutation(
    ['apply-report', reportId],
    async () => {
      const payload: Record<string, FormValue> = {};
      reportData?.params?.params.forEach((param: ReportParam) => {
        const val = formValues[param.name];
        payload[param.name] = (val === undefined || val === '') ? null : val;
      });
      return applyReport(payload, reportId);
    }
  );

  const onSubmit = async () => {
    try {
      await generateReport();
      navigate('/analysis/transactions');
    } catch (error) {
      console.error(error);
      showToast(t('errors.other.errorCreatingReport'), 'error');
    }
  };

  const getStatus = (hasError: boolean): "" | "error" | "warning" | undefined => {
    return hasError ? "error" : undefined;
  };

  const { data: managerData } = useSWR(
    selectedOrganizationId
      ? ['get-worker-manager', selectedOrganizationId, debouncedManagerSearch]
      : null,
    () => getWorkerManager(selectedOrganizationId!, debouncedManagerSearch),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const managerOptions = useMemo(() => {
    return (managerData || []).map(m => ({ label: `${m.name} ${m.surname}`, value: m.id }));
  }, [managerData]);

  const renderField = (param: ReportParam) => {
    const value = formValues[param.name];
    const required = isRequired(param);
    const hasError = touched[param.name] && required && !value;
    const status = getStatus(hasError);

    if (param.type === 'selectListPlacement') {
      return (
        <Select
          placeholder={param.description}
          options={cityData?.map(city => ({ label: city.region, value: city.id })) || []}
          allowClear
          showSearch
          value={value ?? undefined}
          onChange={(val) => handleInputChange(param.name, val)}
          status={status}
          className="w-64"
        />
      );
    }
    if (param.type === 'dateYearMonth') {
      return (
        <DatePicker
          picker="month"
          placeholder={param.description}
          format="YYYY-MM"
          value={value ? dayjs(value as string) : null}
          onChange={(date: Dayjs | null) => handleInputChange(param.name, date ? date.format('YYYY-MM') : null)}
          status={status}
          className="w-64"
        />
      );
    }
    if (param.type === 'date') {
      return (
        <DatePicker
          showTime
          placeholder={param.description}
          format="YYYY-MM-DD HH:mm:ss"
          value={value ? dayjs(value as string) : null}
          onChange={(date: Dayjs | null) => handleInputChange(param.name, date ? date.format('YYYY-MM-DD HH:mm:ss') : null)}
          status={status}
          className="w-64"
        />
      );
    }

    const nameLower = param.name.toLowerCase();
    if (nameLower.includes('pos')) {
      return (
        <Select
          placeholder={param.description}
          options={sortedPosOptions}
          allowClear
          showSearch
          value={value ?? undefined}
          onChange={(val) => handleInputChange(param.name, val)}
          status={status}
          className="w-64"
        />
      );
    }
    if (nameLower.includes('device')) {
      return (
        <Select
          placeholder={param.description}
          options={deviceData?.map(d => ({ label: d.props.name, value: d.props.id })) || []}
          allowClear
          showSearch
          value={value ?? undefined}
          onChange={(val) => handleInputChange(param.name, val)}
          status={status}
          className="w-64"
        />
      );
    }
    if (nameLower.includes('warehouse')) {
      return (
        <Select
          placeholder={param.description}
          options={warehouseData?.map(w => ({ label: w.props.name, value: w.props.id })) || []}
          allowClear
          showSearch
          value={value ?? undefined}
          onChange={(val) => handleInputChange(param.name, val)}
          status={status}
          className="w-64"
        />
      );
    }
    if (param.type === 'selectListOrg' || nameLower.includes('org')) {
      return (
        <Select
          placeholder={param.description}
          options={organizationData?.map(o => ({ label: o.name, value: o.id })) || []}
          allowClear
          showSearch
          value={value ?? undefined}
          onChange={(val) => handleInputChange(param.name, val)}
          status={status}
          className="w-64"
        />
      );
    }
    if (param.type === 'selectListManager' || nameLower.includes('manager')) {
      return (
        <Select
          placeholder={param.description}
          options={managerOptions}
          allowClear
          showSearch
          filterOption={false}
          value={value ?? undefined}
          onChange={(val) => handleInputChange(param.name, val)}
          onSearch={debouncedManagerSearchUpdate}
          onClear={() => {
            debouncedManagerSearchUpdate.cancel();
            setDebouncedManagerSearch('');
          }}
          status={status}
          className="w-64"
        />
      );
    }
    if (param.type === 'number') {
      return (
        <Input
          type="number"
          placeholder={param.description}
          value={value ?? undefined}
          onChange={(e) => handleInputChange(param.name, e.target.value === '' ? null : Number(e.target.value))}
          status={status}
          className="w-64"
        />
      );
    }
    return (
      <Input
        placeholder={param.description}
        value={value ?? undefined}
        onChange={(e) => handleInputChange(param.name, e.target.value === '' ? null : e.target.value)}
        status={status}
        className="w-64"
      />
    );
  };

  if (loadingReport) return <Skeleton active />;
  if (!reportData) return <div>{t('errors.other.reportNotFound')}</div>;

  return (
    <div>
      <div className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0" onClick={() => navigate(-1)}>
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="ml-12 md:ml-0 mb-5 flex items-center justify-between">
        <span className="text-xl sm:text-3xl font-normal text-text01">{reportData.name}</span>
      </div>

      <div className="p-4 rounded-lg bg-[#fafafa]">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <div className="flex flex-wrap gap-4">
            {reportData.params.params.map((param: ReportParam) => (
              <div key={param.name}>
                <div className="text-sm text-text02 mb-1">
                  {param.description}
                  {isRequired(param) && <span className="text-red-500 ml-1">*</span>}
                </div>
                {renderField(param)}
                {touched[param.name] && isRequired(param) && !formValues[param.name] && (
                  <div className="text-xs text-errorFill mt-1">{t('validation.required')}</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button type="primary" htmlType="submit" loading={isMutating} disabled={!isFormValid}>
              {t('analysis.add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeReport;