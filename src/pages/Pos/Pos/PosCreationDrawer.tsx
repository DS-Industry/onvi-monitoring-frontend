import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { createCarWash } from '@/services/api/pos';
import { mutate } from 'swr';
import { useToast } from '@/components/context/useContext';
import { Organization } from '@/services/api/organization';
import { useSearchParams } from 'react-router-dom';
import { Drawer, Form, Input, Select, Button } from 'antd';
import { useUser } from '@/hooks/useUserStore';
import ProfilePhoto from '@/assets/ProfilePhoto.svg';

type PosCreationDrawerProps = {
  organizations: Organization[];
  isOpen: boolean;
  onClose: () => void;
};

const PosCreationDrawer: React.FC<PosCreationDrawerProps> = ({
  organizations,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || '*';
  const user = useUser();

  const defaultValues = {
    name: '',
    monthlyPlan: null,
    timeWork: '',
    posMetaData: '',
    city: '',
    location: '',
    lat: null,
    lon: null,
    organizationId: Number(user.organizationId),
    carWashPosType: null,
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
      createCarWash(
        {
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
          carWashPosType: formData.carWashPosType || '',
          minSumOrder: formData.minSumOrder,
          maxSumOrder: formData.maxSumOrder,
          stepSumOrder: formData.stepSumOrder,
        },
        selectedFile
      )
  );

  const handleInputChange = (
    field: keyof typeof defaultValues,
    value: string | number | null
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

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
        <div className="mb-5 flex">
          <span className="font-semibold text-sm text-text01">
            {t('routine.fields')}
          </span>
          <span className="text-errorFill">*</span>
          <span className="font-semibold text-sm text-text01">
            {t('routine.are')}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.name')}</div>
              <span className="text-errorFill">*</span>
            </div>
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
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.city')}</div>
              <span className="text-errorFill">*</span>
            </div>
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
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.country')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.location?.message}
              validateStatus={errors.location ? 'error' : undefined}
            >
              <Input
                placeholder={t('pos.country')}
                className="w-80 sm:w-96"
                {...register('location', {
                  required: t('validation.locationRequired'),
                })}
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                status={errors.location ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div className="mb-5">
            <div className="text-text02 text-sm">{t('pos.lat')}</div>
            <Input
              placeholder="00"
              type="number"
              className="w-48"
              {...register('lat')}
              value={formData.lat !== null ? formData.lat : ''}
              onChange={e => handleInputChange('lat', e.target.value)}
            />
          </div>
          <div className="mb-5">
            <div className="text-text02 text-sm">{t('pos.lon')}</div>
            <Input
              placeholder="00"
              type="number"
              className="w-48"
              {...register('lon')}
              value={formData.lon !== null ? formData.lon : ''}
              onChange={e => handleInputChange('lon', e.target.value)}
            />
          </div>
          <div>
            <div className="flex">
              <label className="text-sm text-text02">{t('pos.opening')}</label>
              <span className="text-errorFill">*</span>
            </div>
            <div className="flex space-x-2">
              <Form.Item
                help={errors.timeWork?.message}
                validateStatus={errors.timeWork ? 'error' : undefined}
              >
                <Input
                  placeholder="00"
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
                />
              </Form.Item>
              <div className="text-text02 flex justify-center mt-2"> : </div>
              <Form.Item
                help={errors.timeWork?.message}
                validateStatus={errors.timeWork ? 'error' : undefined}
              >
                <Input
                  placeholder="00"
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
                />
              </Form.Item>
            </div>
            <div className="flex mt-2">
              <input type="checkbox" />
              <div className="text-text02 ml-2">{t('pos.clock')}</div>
            </div>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.monthly')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.monthlyPlan?.message}
              validateStatus={errors.monthlyPlan ? 'error' : undefined}
            >
              <Input
                placeholder="0"
                type="number"
                className="w-48"
                {...register('monthlyPlan', {
                  required: t('validation.monthlyPlanRequired'),
                })}
                value={
                  formData.monthlyPlan !== null ? formData.monthlyPlan : ''
                }
                onChange={e => handleInputChange('monthlyPlan', e.target.value)}
                status={errors.monthlyPlan ? 'error' : ''}
                suffix="₽"
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.company')}</div>
              <span className="text-errorFill">*</span>
            </div>
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
                className="w-80 sm:max-w-96"
                {...register('organizationId', {
                  required: t('validation.organizationRequired'),
                })}
                value={formData.organizationId}
                onChange={value => handleInputChange('organizationId', value)}
                status={errors.organizationId ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.type')}</div>
              <span className="text-errorFill">*</span>
            </div>
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
                className="w-80 sm:max-w-96"
                {...register('carWashPosType', {
                  required: t('validation.carWashPosTypeRequired'),
                })}
                value={formData.carWashPosType}
                onChange={value => handleInputChange('carWashPosType', value)}
                status={errors.carWashPosType ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.min')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.stepSumOrder?.message}
              validateStatus={errors.stepSumOrder ? 'error' : undefined}
            >
              <Input
                placeholder="00"
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
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.minAmount')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.minSumOrder?.message}
              validateStatus={errors.minSumOrder ? 'error' : undefined}
            >
              <Input
                placeholder="00"
                type="number"
                className="w-48"
                {...register('minSumOrder', {
                  required: t('validation.minSumOrderRequired'),
                })}
                value={
                  formData.minSumOrder !== null ? formData.minSumOrder : ''
                }
                onChange={e => handleInputChange('minSumOrder', e.target.value)}
                status={errors.minSumOrder ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="flex">
              <div className="text-text02 text-sm">{t('pos.maxAmount')}</div>
              <span className="text-errorFill">*</span>
            </div>
            <Form.Item
              help={errors.maxSumOrder?.message}
              validateStatus={errors.maxSumOrder ? 'error' : undefined}
            >
              <Input
                placeholder="00"
                type="number"
                className="w-48"
                {...register('maxSumOrder', {
                  required: t('validation.maxSumOrderRequired'),
                })}
                value={
                  formData.maxSumOrder !== null ? formData.maxSumOrder : ''
                }
                onChange={e => handleInputChange('maxSumOrder', e.target.value)}
                status={errors.maxSumOrder ? 'error' : ''}
              />
            </Form.Item>
          </div>
          <div>
            <div className="text-sm text-text02">{t('profile.photo')}</div>

            <div
              className="flex space-x-2 items-center cursor-pointer"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <img
                src={imagePreview || ProfilePhoto}
                alt="Profile"
                className="w-16 h-16 object-cover rounded-full border border-gray-300"
                loading="lazy"
              />
              <div className="text-primary02 font-semibold">
                {t('hr.upload')}
              </div>
            </div>

            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
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
  );
};

export default PosCreationDrawer;
