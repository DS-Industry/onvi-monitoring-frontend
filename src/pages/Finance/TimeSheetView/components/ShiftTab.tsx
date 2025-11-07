import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// utils
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// components
import { Controller, useForm } from 'react-hook-form';
import { Select, Button, Form, Input, Card, message, Modal } from 'antd';
import { StarOutlined } from '@ant-design/icons';

// services
import {
  StatusWorkDayShiftReport,
  UpdateDayShiftBody,
  getDayShiftById,
  returnDayShift,
  sendDayShift,
  updateDayShift,
  deleteDayShift,
} from '@/services/api/finance';

import { usePermissions } from '@/hooks/useAuthStore';
import hasPermission from '@/permissions/hasPermission';

// Assign numeric score to each estimation
const GRADES_ESTIMATION_SCORES: Record<number, number> = {
  1: 5, // Без замечаний
  2: 2, // Грубое нарушение
  3: 4, // Незначительные
  4: 3, // Разовое замечание
};

// types
interface GradingFormData {
  grading: Record<string, number>;
  comment?: string;
}

const ShiftTab: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const shiftId = searchParams.get('id')
    ? Number(searchParams.get('id'))
    : undefined;
  const [modal, contextHolder] = Modal.useModal();

  const userPermissions = usePermissions();

  const { data: dayShiftData, mutate: refreshDayShiftData } = useSWR(
    shiftId ? ['get-shift-data', shiftId] : null,
    () => (shiftId ? getDayShiftById(shiftId) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  );

  const { trigger: sendCash, isMutating: loadingSendCash } = useSWRMutation(
    ['send-cash-oper'],
    () =>
      shiftId
        ? sendDayShift(shiftId)
          .catch(() => {
            message.error(t('errors.sendFailed'));
          })
          .finally(() => {
            message.success(t('actions.sendSuccess'));
            refreshDayShiftData();
          })
        : null
  );

  const { trigger: returnCash, isMutating: loadingReturnCash } = useSWRMutation(
    ['return-cash-oper'],
    () =>
      shiftId
        ? returnDayShift(shiftId)
          .catch(() => {
            message.error(t('errors.sendFailed'));
          })
          .finally(() => {
            message.success(t('actions.returnSuccess'));
            refreshDayShiftData();
          })
        : null
  );

  const { trigger: updateShift, isMutating: loadingUpdate } = useSWRMutation(
    ['update-shift'],
    (_, { arg }: { arg: UpdateDayShiftBody }) =>
      shiftId
        ? updateDayShift(arg, shiftId).catch(() => {
          message.error(t('errors.updateFailed'));
        })
        : null
  );

  const { trigger: deleteShift, isMutating: loadingDelete } = useSWRMutation(
    ['delete-shift'],
    () =>
      shiftId
        ? deleteDayShift(shiftId)
          .then(() => {
            message.success(t('finance.deleteSuccess'));
            window.history.back();
          })
          .catch(() => {
            message.error(t('finance.deleteFailed'));
          })
        : null
  );

  const send = async () => {
    const formData = control._formValues as GradingFormData;
    await handleGradingSave(formData, false);

    await sendCash();
  };

  const start = dayjs(dayShiftData?.startWorkingTime);
  const end = dayjs(dayShiftData?.endWorkingTime);
  const workedHours =
    start.isValid() && end.isValid()
      ? dayjs.duration(end.diff(start)).asHours().toFixed(1)
      : '';

  const { control, handleSubmit, reset } = useForm<GradingFormData>({
    defaultValues: { grading: {}, comment: '' },
  });

  useEffect(() => {
    if (dayShiftData?.gradingParameterInfo) {
      const defaults: Record<string, number> = {};
      dayShiftData.gradingParameterInfo.parameters.forEach(param => {
        if (param.estimationId)
          defaults[param.id.toString()] = param.estimationId;
      });
      reset({ grading: defaults, comment: dayShiftData?.comment || '' });
    }
  }, [dayShiftData, reset]);

  const handleGradingSave = async (data: GradingFormData, showToast: boolean = true) => {
    try {
      const gradingData = dayShiftData?.gradingParameterInfo?.parameters.map(
        param => ({
          parameterId: param.id,
          estimationId: data.grading[param.id.toString()] || null,
        })
      );

      if (!gradingData) {
        message.error(t('errors.updateFailed'));
        return;
      }

      const result = await updateShift({
        gradingData,
        comment: data.comment || '',
      });

      if (result) {
        if (showToast) {
          message.success(t('routes.savedSuccessfully'));
        }
        mutate(['get-shift-data', shiftId]);
      }
    } catch {
      message.error(t('errors.somethingWentWrong'));
    }
  };

  const handleFormSubmit = async (data: GradingFormData) => {
    await handleGradingSave(data, true);
  };

  const handleDelete = () => {
    modal.confirm({
      title: t('finance.confirmDeleteShift'),
      content: t('finance.deleteShiftWarning'),
      okText: t('actions.delete'),
      cancelText: t('actions.cancel'),
      okType: 'danger',
      onOk: async () => {
        await deleteShift();
      },
    });
  };

  const gradedParams = dayShiftData?.gradingParameterInfo?.parameters.filter(
    p => p.estimationId !== null
  );

  const totalScore = gradedParams?.reduce((sum, param) => {
    if (param.estimationId !== null) {
      return sum + (GRADES_ESTIMATION_SCORES[param.estimationId] || 0);
    }
    return sum;
  }, 0);

  const averageScore = gradedParams?.length
    ? (totalScore || 0) / gradedParams.length
    : null;

  const calculateDailyShiftPayout = () => {
    if (!dayShiftData?.dailySalary || !dayShiftData?.bonusPayout || !dayShiftData?.gradingParameterInfo) {
      return dayShiftData?.dailySalary || 0;
    }

    const { parameters, allEstimations } = dayShiftData.gradingParameterInfo;

    const totalPercentage = parameters.reduce((sum, param) => {
      if (param.estimationId === null) return sum;

      const estimation = allEstimations.find(est => est.id === param.estimationId);

      if (!estimation) return sum;

      const parameterWeightPercent = param.weightPercent || 0;
      const estimationWeightPercent = estimation.weightPercent || 0;

      const parameterPercent = (parameterWeightPercent * estimationWeightPercent) / 100;

      return sum + parameterPercent;
    }, 0);

    const dailyShiftPayout = dayShiftData.dailySalary + (dayShiftData.bonusPayout * totalPercentage) / 100;

    return Math.round(dailyShiftPayout);
  };

  const dailyShiftPayout = calculateDailyShiftPayout();

  const hasPermissionToSend = hasPermission(
    [
      { subject: 'ShiftReport', action: 'create' },
      { subject: 'ShiftReport', action: 'manage' },
    ],
    userPermissions
  );

  const hasPermissionToReturn = hasPermission(
    [
      { subject: 'ShiftReport', action: 'update' },
      { subject: 'ShiftReport', action: 'manage' },
    ],
    userPermissions
  );

  const hasPermissionToDelete = hasPermission(
    [
      { subject: 'ShiftReport', action: 'manage' },
      { subject: 'ShiftReport', action: 'delete' },
    ],
    userPermissions
  );

  return (
    <div className="mt-3">
      {contextHolder}
      <h1 className="text-[20px] font-bold mb-5">
        {t('finance.employeeShiftView')}
      </h1>
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4">
          <div>
            <p className="text-bold">{t('finance.totalCarsWashed')}</p>
            <p className="font-bold text-[24px]">
              {dayShiftData?.totalCar ?? 0}
            </p>
          </div>
          <div>
            <p className="text-bold]">{t('finance.averageRating')}</p>
            <p className="font-bold text-[24px] flex items-center gap-1">
              {averageScore?.toFixed(1)}
              <StarOutlined className="text-yellow-500" />
            </p>
          </div>
          <div>
            <p className="text-bold=">{t('finance.employeeName')}</p>
            <p className="font-bold text-[24px]">
              {dayShiftData?.workerName || '-'}
            </p>
          </div>
          <div>
            <p className="text-bold">{t('finance.shiftHours')}</p>
            <p className="font-bold text-[24px]">
              {start.format('HH:mm')} - {end.format('HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-bold">{t('finance.totalHoursWorked')}</p>
            <p className="font-bold text-[24px]">
              {workedHours} {t('general.hours')}
            </p>
          </div>
          <div>
            <p className="text-bold">{t('finance.dailyShiftPayout')}</p>
            <p className="font-bold text-[24px]">
              {dailyShiftPayout} ₽
            </p>
          </div>
        </div>
      </Card>
      <div className="mt-8">
        <h2 className="text-[20px] font-bold mb-2">
          {t('finance.shiftGradingWithBonus')}
        </h2>

        <Form
          layout="vertical"
          onFinish={handleSubmit(handleFormSubmit)}
          className="mt-5"
        >
          {dayShiftData?.gradingParameterInfo?.parameters.map(param => (
            <Form.Item
              key={param.id}
              label={
                <span className="text-[14px] font-semibold">
                  {t(`finance.gradingParameters.${param.name}`, param.name)}
                </span>
              }
            >
              <Controller
                name={`grading.${param.id}`}
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="w-80 sm:w-96 h-[43px]"
                    placeholder={t('finance.selectGrade') || ''}
                    allowClear
                  >
                    {dayShiftData.gradingParameterInfo?.allEstimations.map(
                      est => (
                        <Select.Option key={est.id} value={est.id}>
                          {t(
                            `finance.gradingEstimations.${est.name}`,
                            est.name
                          )}
                        </Select.Option>
                      )
                    )}
                  </Select>
                )}
              />
            </Form.Item>
          ))}

          <Form.Item
            label={
              <span className="text-[14px] font-semibold">
                {t('finance.managerComment')}
              </span>
            }
            className="pt-5"
          >
            <Controller
              name="comment"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={3}
                  placeholder={
                    t('finance.leaveCommentsForManagerPlaceholder') || ''
                  }
                />
              )}
            />
          </Form.Item>

          <hr />

          <div className="flex gap-2 pt-6">
            {dayShiftData?.status !== StatusWorkDayShiftReport.SENT ? (
              <Button
                className="h-[43px] bg-[#FFF] border border-solid border-[#1890FF] text-[#1890FF]"
                type="primary"
                htmlType="submit"
                loading={loadingUpdate}
              >
                {t('routes.save')}
              </Button>
            ) : (
              <></>
            )}

            {dayShiftData?.status === StatusWorkDayShiftReport.SENT &&
              hasPermissionToReturn ? (
              <Button
                className="h-[43px]  bg-[#1890FF]"
                type="primary"
                onClick={async () => await returnCash()}
                loading={loadingReturnCash}
              >
                {t('finance.return')}
              </Button>
            ) : hasPermissionToSend ? (
              <Button
                className="h-[43px]  bg-[#1890FF]"
                type="primary"
                onClick={send}
                loading={loadingSendCash}
              >
                {t('finance.send')}
              </Button>
            ) : (
              <></>
            )}

            {dayShiftData?.status !== StatusWorkDayShiftReport.SENT && hasPermissionToDelete && (
              <Button
                className="h-[43px] bg-red-500 hover:bg-red-600 border-red-500"
                type="primary"
                danger
                onClick={handleDelete}
                loading={loadingDelete}
              >
                {t('actions.delete')}
              </Button>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ShiftTab;
