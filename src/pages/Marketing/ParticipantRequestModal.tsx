import React, { useState } from 'react';
import { Modal, Button, Select, Input, message, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { 
  createParticipantRequest, 
  LoyaltyProgramParticipantRequestDto,
  getPublicLoyaltyPrograms,
  LoyaltyProgramStatus
} from '@/services/api/marketing';
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
  const [searchValue, setSearchValue] = useState('');

  const { data: programsResponse, error, isLoading: programsLoading } = useSWR(
    open ? 'public-loyalty-programs' : null, 
    () => getPublicLoyaltyPrograms({
      status: LoyaltyProgramStatus.ACTIVE,
    }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, 
    }
  );

  const publicPrograms = programsResponse?.programs ?? [];

  if (error) {
    console.error('Error fetching public programs:', error);
    message.error(t('errors.fetchFailed'));
  }


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
    setSearchValue('');
    onClose();
  };

  const availablePrograms = publicPrograms?.filter(
    program => {
      const isNotOwner = program.ownerOrganizationId !== user?.organizationId;
      const matchesSearch = !searchValue || 
        program.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        program.ownerOrganizationName?.toLowerCase().includes(searchValue.toLowerCase());
      
      return isNotOwner && matchesSearch;
    }
  ) ?? []

  const programOptions = availablePrograms.map(program => ({
    label: program.name,
    value: program.id,
    description: program.description,
    ownerName: program.ownerOrganizationName,
  }));

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
      <div className="space-y-4 mb-10">
        <div>
          <label className="block text-sm font-medium mb-2 text-text01">
            {t('loyaltyProgramsTable.programName')} *
          </label>
          <Select
            placeholder={t('loyaltyProgramsTable.selectProgram')}
            value={selectedProgramId}
            onChange={setSelectedProgramId}
            options={programOptions}
            className="w-full"
            showSearch
            loading={programsLoading}
            onSearch={setSearchValue}
            filterOption={false}
            optionRender={(option) => (
              <div className="py-2">
                <div className="font-medium text-text01">{option.label}</div>
                {option.data.description && (
                  <div className="text-sm text-text02 mt-1">{option.data.description}</div>
                )}
                {option.data.ownerName && (
                  <div className="text-xs text-text03 mt-1">
                    {t('loyaltyProgramsTable.owner')}: {option.data.ownerName}
                  </div>
                )}
              </div>
            )}
            notFoundContent={programsLoading ? <Spin size="small" /> : t('loyaltyProgramsTable.noProgramsFound')}
          />
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

        {availablePrograms.length === 0 && !programsLoading && (
          <div className="text-center py-4 text-text02">
            {t('loyaltyProgramsTable.noAvailablePrograms')}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ParticipantRequestModal;
