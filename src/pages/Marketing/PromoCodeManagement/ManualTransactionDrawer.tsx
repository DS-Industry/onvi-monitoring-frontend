import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
} from 'antd';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/components/context/useContext';
import {
  ManualTransactionRequest,
  createManualTransaction,
} from '@/services/api/marketing';

const { Option } = Select;

interface ManualTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: number;
  onSuccess: () => void;
}

const ManualTransactionDrawer: React.FC<ManualTransactionDrawerProps> = ({
  isOpen,
  onClose,
  organizationId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [form] = Form.useForm();

  const { trigger: createTransactionMutation, isMutating: isCreatingTransaction } =
    useSWRMutation(
      ['create-manual-transaction'],
      async (_, { arg }: { arg: ManualTransactionRequest }) => {
        return createManualTransaction(arg);
      }
    );

  React.useEffect(() => {
    if (isOpen) {
      form.resetFields();
    }
  }, [isOpen, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const transactionData: ManualTransactionRequest = {
        clientId: values.clientId,
        cardId: values.cardId,
        amount: values.amount,
        type: values.type,
        description: values.description,
        organizationId: organizationId,
        posId: values.posId,
        promocodeId: values.promocodeId,
      };

      await createTransactionMutation(transactionData);
      showToast(t('success.transactionCreated'), 'success');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(t('common.somethingWentWrong') || 'Something went wrong');
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={t('marketing.createManualTransaction')}
      placement="right"
      width={600}
      onClose={handleClose}
      open={isOpen}
      footer={
        <Space>
          <Button onClick={handleClose}>
            {t('constants.cancel')}
          </Button>
          <Button
            type="primary"
            loading={isCreatingTransaction}
            onClick={handleSubmit}
          >
            {t('common.create')}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="type"
          label={t('marketing.transactionType')}
          rules={[
            { required: true, message: t('validation.required') },
          ]}
        >
          <Select placeholder={t('constants.selectType')}>
            <Option value="DEPOSIT">
              {t('marketing.deposit')}
            </Option>
            <Option value="WITHDRAWAL">
              {t('marketing.withdrawal')}
            </Option>
            <Option value="BONUS_ACCRUAL">
              {t('marketing.bonusAccrual')}
            </Option>
            <Option value="BONUS_WRITEOFF">
              {t('marketing.bonusWriteoff')}
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="clientId"
          label={t('marketing.clientId')}
        >
          <Input
            type="number"
            placeholder={t('marketing.enterClientId')}
          />
        </Form.Item>

        <Form.Item
          name="cardId"
          label={t('marketing.cardId')}
        >
          <Input
            type="number"
            placeholder={t('marketing.enterCardId')}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label={t('marketing.amount')}
          rules={[
            { required: true, message: t('validation.required') },
            { type: 'number', min: 0.01, message: t('validation.positiveNumber') },
          ]}
        >
          <Input
            type="number"
            step="0.01"
            placeholder={t('marketing.enterAmount')}
          />
        </Form.Item>

        <Form.Item
          name="posId"
          label={t('marketing.posId')}
        >
          <Input
            type="number"
            placeholder={t('marketing.enterPosId')}
          />
        </Form.Item>

        <Form.Item
          name="promocodeId"
          label={t('marketing.promocodeId')}
        >
          <Input
            type="number"
            placeholder={t('marketing.enterPromocodeId')}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('marketing.description')}
        >
          <Input.TextArea
            rows={3}
            placeholder={t('marketing.enterDescription')}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ManualTransactionDrawer;
