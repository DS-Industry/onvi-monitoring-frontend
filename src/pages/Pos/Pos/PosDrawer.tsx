import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { postPosData } from '@/services/api/pos';
import { mutate } from 'swr';
import { useToast } from '@/components/context/useContext';
import { Organization } from '@/services/api/organization';
import { useSearchParams } from 'react-router-dom';
import { Drawer, Form, Input, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

type PosDrawerProps = {
  organizations: Organization[];
  isOpen: boolean;
  onClose: () => void;
};

const PosDrawer: React.FC<PosDrawerProps> = ({
  organizations,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || '*';

  const defaultValues = {
    name: '',
    monthlyPlan: null,
    timeWork: '',
    posMetaData: '',
    city: '',
    location: '',
    lat: null,
    lon: null,
    organizationId: null,
    carWashPosType: '',
    minSumOrder: null,
    maxSumOrder: null,
    stepSumOrder: null,
  };

  const [formData, setFormData] = useState(defaultValues);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [endHour, setEndHour] = useState<number | null>(null);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const { trigger: createPos, isMutating } = useSWRMutation(
    [`create-pos`],
    async () =>
      postPosData({
        name: formData.name,
        monthlyPlan: formData.monthlyPlan,
        timeWork: formData.timeWork,
        address: {
          city: formData.city,
          location: formData.location,
          lat: formData.lat,
          lon: formData.lon,
        },
        organizationId: formData.organizationId,
        carWashPosType: formData.carWashPosType,
        minSumOrder: formData.minSumOrder,
        maxSumOrder: formData.maxSumOrder,
        stepSumOrder: formData.stepSumOrder,
      })
  );

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: string | null
  ) => {
    const numericFields = [
      'monthlyPlan',
      'stepSumOrder',
      'minSumOrder',
      'maxSumOrder',
      'lat',
      'lon',
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleTimeWorkChange = (field: string, value: number) => {
    if (field === 'startHour') {
      setStartHour(value);
      setFormData(prev => ({
        ...prev,
        timeWork: `${value}${endHour ?? ''}`,
      }));
      setValue('timeWork', `${value}:${endHour ?? ''}`);
    } else {
      setEndHour(value);
      setFormData(prev => ({
        ...prev,
        timeWork: `${startHour ?? ''}${value}`,
      }));
      setValue('timeWork', `${startHour ?? ''}:${value}`);
    }
  };

  const { showToast } = useToast();

  const resetForm = () => {
    setFormData(defaultValues);
    setStartHour(null);
    setEndHour(null);
    reset();
    onClose();
  };

  const onSubmit = async () => {
    try {
      const result = await createPos();
      if (result) {
        mutate([`get-pos`, city]);
        resetForm();
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  return (
    <div>
      <Drawer open={isOpen} width={620} closable={false} onClose={resetForm}>
        {notificationVisible && organizations.length === 0 && (
          <Notification
            title={t('organizations.legalEntity')}
            message={t('pos.createObject')}
            link={t('pos.goto')}
            linkUrl="/administration/legalRights"
            onClose={() => setNotificationVisible(false)}
          />
        )}

        <form
          className="space-y-6 w-full max-w-2xl mx-auto p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <span className="font-semibold text-xl md:text-3xl mb-5">
            {t('pos.creating')}
          </span>
          <div className="grid grid-cols-1 gap-2">
            <div>
              <div className="text-text02 text-sm">{t('pos.name')}</div>
              <Form.Item
                help={errors.name?.message}
                validateStatus={errors.name ? 'error' : undefined}
              >
                <Input
                  placeholder={t('pos.example')}
                  className="w-80 sm:w-96"
                  {...register('name', {
                    required: t('validation.nameRequired'),
                  })}
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  status={errors.name ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.city')}</div>
              <Form.Item
                help={errors.city?.message}
                validateStatus={errors.city ? 'error' : undefined}
              >
                <Input
                  placeholder={t('pos.address')}
                  className="w-80 sm:w-96"
                  {...register('city', {
                    required: t('validation.cityRequired'),
                  })}
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  status={errors.city ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.location')}</div>
              <Form.Item
                help={errors.location?.message}
                validateStatus={errors.location ? 'error' : undefined}
              >
                <Input
                  placeholder={t('pos.location')}
                  className="w-80 sm:w-96"
                  {...register('location', {
                    required: t('validation.locationRequired'),
                  })}
                  value={formData.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  status={errors.location ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.lat')}</div>
              <Input
                type="number"
                className="w-48"
                {...register('lat')}
                value={formData.lat !== null ? formData.lat : ''}
                onChange={e => handleInputChange('lat', e.target.value)}
                size="large"
              />
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.lon')}</div>
              <Input
                type="number"
                className="w-48"
                {...register('lon')}
                value={formData.lon !== null ? formData.lon : ''}
                onChange={e => handleInputChange('lon', e.target.value)}
                size="large"
              />
            </div>
            <div>
              <label className="text-sm text-text02">{t('pos.opening')}</label>
              <div className="flex space-x-2">
                <Form.Item
                  help={errors.timeWork?.message}
                  validateStatus={errors.timeWork ? 'error' : undefined}
                >
                  <Input
                    type="number"
                    className="w-40"
                    {...register('timeWork', {
                      required: t('validation.timeWorkRequired'),
                    })}
                    value={startHour !== null ? startHour : ''}
                    onChange={e =>
                      handleTimeWorkChange('startHour', Number(e.target.value))
                    }
                    status={errors.timeWork ? 'error' : ''}
                    size="large"
                  />
                </Form.Item>
                <div className="text-text02 flex justify-center mt-2"> : </div>
                <Form.Item
                  help={errors.timeWork?.message}
                  validateStatus={errors.timeWork ? 'error' : undefined}
                >
                  <Input
                    type="number"
                    className="w-40"
                    {...register('timeWork', {
                      required: t('validation.timeWorkRequired'),
                    })}
                    value={endHour !== null ? endHour : ''}
                    onChange={e =>
                      handleTimeWorkChange('endHour', Number(e.target.value))
                    }
                    status={errors.timeWork ? 'error' : ''}
                    size="large"
                  />
                </Form.Item>
              </div>
              <div className="flex mt-2">
                <input type="checkbox" />
                <div className="text-text02 ml-2">{t('pos.clock')}</div>
              </div>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.monthly')}</div>
              <Form.Item
                help={errors.monthlyPlan?.message}
                validateStatus={errors.monthlyPlan ? 'error' : undefined}
              >
                <Input
                  className="w-48"
                  {...register('monthlyPlan', {
                    required: t('validation.monthlyPlanRequired'),
                  })}
                  value={
                    formData.monthlyPlan !== null ? formData.monthlyPlan : ''
                  }
                  onChange={e =>
                    handleInputChange('monthlyPlan', e.target.value)
                  }
                  status={errors.monthlyPlan ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.company')}</div>
              <Form.Item
                help={errors.organizationId?.message}
                validateStatus={errors.organizationId ? 'error' : undefined}
              >
                <Select
                  placeholder={t('pos.companyName')}
                  options={organizations.map(item => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  className="w-80 sm:w-96"
                  {...register('organizationId', {
                    required: t('validation.organizationRequired'),
                  })}
                  value={formData.organizationId}
                  onChange={value => handleInputChange('organizationId', value)}
                  status={errors.organizationId ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.type')}</div>
              <Form.Item
                help={errors.carWashPosType?.message}
                validateStatus={errors.carWashPosType ? 'error' : undefined}
              >
                <Select
                  placeholder={t('pos.self')}
                  options={[
                    { label: 'МСО', value: 'SelfService' },
                    { label: t('pos.robot'), value: 'Portal' },
                    {
                      label: `МСО + ${t('pos.robot')}`,
                      value: 'SelfServiceAndPortal',
                    },
                  ]}
                  className="w-80 sm:w-96"
                  {...register('carWashPosType', {
                    required: t('validation.carWashPosTypeRequired'),
                  })}
                  value={formData.carWashPosType}
                  onChange={value => handleInputChange('carWashPosType', value)}
                  status={errors.carWashPosType ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.min')}</div>
              <Form.Item
                help={errors.stepSumOrder?.message}
                validateStatus={errors.stepSumOrder ? 'error' : undefined}
              >
                <Input
                  type="number"
                  className="w-48"
                  {...register('stepSumOrder', {
                    required: t('validation.stepSumOrderRequired'),
                  })}
                  value={
                    formData.stepSumOrder !== null ? formData.stepSumOrder : ''
                  }
                  onChange={e =>
                    handleInputChange('stepSumOrder', e.target.value)
                  }
                  status={errors.stepSumOrder ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.minAmount')}</div>
              <Form.Item
                help={errors.minSumOrder?.message}
                validateStatus={errors.minSumOrder ? 'error' : undefined}
              >
                <Input
                  type="number"
                  className="w-48"
                  {...register('minSumOrder', {
                    required: t('validation.minSumOrderRequired'),
                  })}
                  value={
                    formData.minSumOrder !== null ? formData.minSumOrder : ''
                  }
                  onChange={e =>
                    handleInputChange('minSumOrder', e.target.value)
                  }
                  status={errors.minSumOrder ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div className="text-text02 text-sm">{t('pos.maxAmount')}</div>
              <Form.Item
                help={errors.maxSumOrder?.message}
                validateStatus={errors.maxSumOrder ? 'error' : undefined}
              >
                <Input
                  type="number"
                  className="w-48"
                  {...register('maxSumOrder', {
                    required: t('validation.maxSumOrderRequired'),
                  })}
                  value={
                    formData.maxSumOrder !== null ? formData.maxSumOrder : ''
                  }
                  onChange={e =>
                    handleInputChange('maxSumOrder', e.target.value)
                  }
                  status={errors.maxSumOrder ? 'error' : ''}
                  size="large"
                />
              </Form.Item>
            </div>
            <div>
              <div>{t('pos.photos')}</div>
              <div>{t('pos.maxNumber')}</div>
              <Button icon={<PlusOutlined />} className="btn-outline-primary">
                {t('pos.download')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button onClick={() => resetForm()} className="btn-outline-primary">
              {t('organizations.cancel')}
            </Button>
            <Button
              htmlType="submit"
              loading={isMutating}
              className="btn-primary"
            >
              {t('organizations.save')}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default PosDrawer;
