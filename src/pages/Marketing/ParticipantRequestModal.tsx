import React, { useState } from 'react';
import { Modal, Button, /*Select,*/ Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { createParticipantRequest, LoyaltyProgramParticipantRequestDto } from '@/services/api/marketing';
import { useUser } from '@/hooks/useUserStore';

interface ParticipantRequestModalProps {
  open: boolean;
  onClose: () => void;
}

const ParticipantRequestModal: React.FC<ParticipantRequestModalProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>();
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!selectedProgramId || !user?.organizationId) {
      message.error(t('validation.loyaltyProgramRequired'));
      return;
    }

    setLoading(true);
    try {
      const request: LoyaltyProgramParticipantRequestDto = {
        ltyProgramId: selectedProgramId,
        organizationId: user.organizationId,
        requestComment: comment || undefined,
      };

      await createParticipantRequest(request);
      message.success(t('loyaltyProgramsTable.requestSubmitted'));
      handleClose();
    } catch (error) {
      console.error('Error submitting participant request:', error);
      message.error(t('errors.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedProgramId(undefined);
    setComment('');
    onClose();
  };

  // Filter out programs where the user is already the owner
//   const availablePrograms = loyaltyPrograms.filter(
//     program => program.props.ownerOrganizationId !== user?.organizationId
//   );

//   const programOptions = availablePrograms.map(program => ({
//     label: program.props.name,
//     value: program.props.id,
//   }));

  return (
    <Modal
      title={t('loyaltyProgramsTable.join')}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {t('actions.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={!selectedProgramId}
        >
          {t('actions.submit')}
        </Button>,
      ]}
      width={600}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-text01">
            {t('loyaltyProgramsTable.programName')} *
          </label>
          {/* <Select
            placeholder={t('loyaltyProgramsTable.selectProgram')}
            value={selectedProgramId}
            onChange={setSelectedProgramId}
            options={programOptions}
            className="w-full"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
            }
          /> */}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-text01">
            {t('marketing.comment')}
          </label>
          <Input.TextArea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={t('loyaltyProgramsTable.commentPlaceholder')}
            rows={4}
            maxLength={500}
            showCount
          />
        </div>

        {/* {availablePrograms.length === 0 && (
          <div className="text-center py-4 text-text02">
            {t('loyaltyProgramsTable.noAvailablePrograms')}
          </div>
        )} */}
      </div>
    </Modal>
  );
};

export default ParticipantRequestModal;
