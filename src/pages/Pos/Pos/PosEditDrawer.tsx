import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Notification from '@ui/Notification.tsx';
import useFormHook from '@/hooks/useFormHook';
import useSWRMutation from 'swr/mutation';
import { createCarWash, deleteCarWash, getPosById, PosRequestBody, updateCarWash } from '@/services/api/pos';
import useSWR, { mutate } from 'swr';
import { useToast } from '@/components/context/useContext';
import { Organization } from '@/services/api/organization';
import { useSearchParams } from 'react-router-dom';
import { Drawer, Form, Input, Select, Button, Upload, TimePicker } from 'antd';
import { useUser } from '@/hooks/useUserStore';
import { PlusOutlined } from '@ant-design/icons';
import { UploadChangeParam, UploadFile } from 'antd/es/upload';
import dayjs, { Dayjs } from 'dayjs';

type PosEditDrawerProps = {
  organizations: Organization[];
  isOpen: boolean;
  id: number | null;
  onClose: () => void;
};

const PosEditDrawer: React.FC<PosEditDrawerProps> = ({
  organizations,
  isOpen,
  id,
  onClose,
}) => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchParams] = useSearchParams();
  const city = Number(searchParams.get('city')) || undefined;
  const user = useUser();
  const [isDeletingCarWash, setIsDeletingCarWash] = useState(false);

  const defaultValues: PosRequestBody = {
    name: '',
    startTime: '',
    endTime: '',
    posMetaData: '',
    city: '',
    location: '',
    lat: '',
    lon: '',
    organizationId: Number(user.organizationId),
    carWashPosType: null,
    minSumOrder: null,
    maxSumOrder: null,
    stepSumOrder: null,
  };

  const [formData, setFormData] = useState(defaultValues);

  const { register, handleSubmit, errors, setValue, reset } =
    useFormHook(formData);

  const {
    data: posData
  } = useSWR(id ? [`get-pos-by-id`, id] : null, () =>
    getPosById(id!),
    {
      shouldRetryOnError: false
    }
  );

  useEffect(() => {
    if (posData) {
      setFormData({
        name: posData.props.name,
        startTime: posData.props.startTime || '',
        endTime: posData.props.endTime || '',
        posMetaData: posData.props.posMetaData,
        city: posData.props.address.props.city,
        location: posData.props.address.props.location,
        lat: posData.props.address.props.lat,
        lon: posData.props.address.props.lon,
        organizationId: posData.props.organizationId,
        carWashPosType: posData.props.carWashPosType,
        minSumOrder: posData.props.minSumOrder,
        maxSumOrder: posData.props.maxSumOrder,
        stepSumOrder: posData.props.stepSumOrder,
      })
    }
  }, [posData])

  const { trigger: createPos, isMutating } = useSWRMutation(
    [`create-pos`],
    async () =>
      createCarWash(
        {
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          address: {
            city: formData.city,
            location: formData.location,
            lat: String(formData.lat),
            lon: String(formData.lon),
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

  const { trigger: updatePos, isMutating: isUpdatingPos } = useSWRMutation(
    [`update-pos`, id],
    async () =>
      updateCarWash(
        Number(id),
        {
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          address: {
            city: formData.city,
            location: formData.location,
            lat: String(formData.lat),
            lon: String(formData.lon),
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
      'stepSumOrder',
      'minSumOrder',
      'maxSumOrder',
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', time: Dayjs | null) => {
    const timeString = time ? time.format('HH:mm') : '';
    setFormData(prev => ({ ...prev, [field]: timeString }));
    setValue(field, timeString);
  };

  const { showToast } = useToast();

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    const { fileList: newFileList } = info;

    const file = (newFileList[0]?.originFileObj as File) || null;
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
    }
  };

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    onClose();
    setSelectedFile(null);
  };

  const onSubmit = async () => {
    try {
      const result = id ? await updatePos() : await createPos();
      if (result) {
        mutate([`get-pos`, city, user.organizationId]);
        showToast(t('success.recordCreated'), 'success');
        resetForm();
      } else {
        showToast(t('errors.other.errorDuringFormSubmission'), 'error');
      }
    } catch (error) {
      console.error('Error during form submission: ', error);
      showToast(t('errors.other.errorDuringFormSubmission'), 'error');
    }
  };

  const handleDelete = async () => {
    setIsDeletingCarWash(true);
    try {
      const result = await mutate(
        [`delete-car-wash`, id],
        () => deleteCarWash(Number(id)),
        false
      );

      if (result) {
        onClose();
        mutate([`get-pos`, city, user.organizationId]);
      }
    } catch (error) {
      showToast(t('errors.other.errorDeletingNomenclature'), 'error');
    } finally {
      setIsDeletingCarWash(false);
    }
  };

  return (
    <Drawer open={isOpen} width={620} title={t('pos.creating')} onClose={resetForm}>
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
        className="w-full max-w-2xl mx-auto p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
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
                  required: id === null && t('validation.nameRequired'),
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
                  required: id === null && t('validation.cityRequired'),
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
                  required: id === null && t('validation.locationRequired'),
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
            <div className="flex mb-2">
              <label className="text-sm text-text02">{t('pos.opening')}</label>
              <span className="text-errorFill">*</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="flex mb-1">
                  <label className="text-xs text-text02">{t('shift.startTime')}</label>
                  <span className="text-errorFill">*</span>
                </div>
                <Form.Item
                  help={errors.startTime?.message}
                  validateStatus={errors.startTime ? 'error' : undefined}
                >
                  <TimePicker
                    placeholder={t('shift.selectStartTime')}
                    format="HH:mm"
                    className="w-full"
                    {...register('startTime', {
                      required: id === null && t('shift.startTimeRequired'),
                    })}
                    value={formData.startTime ? dayjs(formData.startTime, 'HH:mm') : null}
                    onChange={(time) => handleTimeChange('startTime', time)}
                    status={errors.startTime ? 'error' : ''}
                  />
                </Form.Item>
              </div>

              <div className="flex-1">
                <div className="flex mb-1">
                  <label className="text-xs text-text02">{t('shift.endTime')}</label>
                  <span className="text-errorFill">*</span>
                </div>
                <Form.Item
                  help={errors.endTime?.message}
                  validateStatus={errors.endTime ? 'error' : undefined}
                >
                  <TimePicker
                    placeholder={t('shift.selectEndTime')}
                    format="HH:mm"
                    className="w-full"
                    {...register('endTime', {
                      required: id === null && t('shift.endTimeRequired'),
                    })}
                    value={formData.endTime ? dayjs(formData.endTime, 'HH:mm') : null}
                    onChange={(time) => handleTimeChange('endTime', time)}
                    status={errors.endTime ? 'error' : ''}
                  />
                </Form.Item>
              </div>
            </div>
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
                  required: id === null && t('validation.organizationRequired'),
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
                  required: id === null && t('validation.carWashPosTypeRequired'),
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
                  required: id === null && t('validation.stepSumOrderRequired'),
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
                  required: id === null && t('validation.minSumOrderRequired'),
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
                  required: id === null && t('validation.maxSumOrderRequired'),
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
            <div className="text-text02 text-sm">{t('hr.upload')}</div>
            <Upload
              listType="picture-card"
              showUploadList={true}
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
              className="w-full upload-full-width"
            >
              {selectedFile ? null : (
                <div className="text-text02 w-full">
                  <PlusOutlined />
                  <div className="mt-2">{t('hr.upload')}</div>
                </div>
              )}
            </Upload>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={() => resetForm()}>
            {t('organizations.cancel')}
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-errorFill hover:bg-red-300 text-white"
            loading={isDeletingCarWash}
          >
            {t('marketing.delete')}
          </Button>
          <Button
            htmlType="submit"
            loading={id ? isUpdatingPos : isMutating}
            type='primary'
          >
            {t('organizations.save')}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};

export default PosEditDrawer;
