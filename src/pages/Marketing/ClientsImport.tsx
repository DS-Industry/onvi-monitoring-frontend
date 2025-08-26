import Notification from '@/components/ui/Notification';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import useSWRMutation from 'swr/mutation';
import { importCards } from '@/services/api/marketing';
import { useNavigate } from 'react-router-dom';
import {
  DownloadOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import QuestionMarkIcon from '@icons/qustion-mark.svg?react';
import { Drawer, message } from 'antd';
import { useUser } from '@/hooks/useUserStore';

const ClientsImport: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const navigate = useNavigate();
  const user = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      console.log('File selected:', file);
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
    }
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/client-cards-template.csv';
    link.download = 'client-cards-template.csv';
    link.click();
  };

  const { trigger: importCardsMutation, isMutating } = useSWRMutation(
    ['import-cards'],
    async (_, { arg }: { arg: { file: File; organizationId: number } }) => {
      return importCards(arg);
    }
  );

  const handleSubmit = async () => {
    if (!selectedFile) {
      message.error(t('validation.fileRequired'));
      return;
    }

    if (selectedFile.size === 0) {
      message.error('File is empty. Please select a valid file.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; 
    if (selectedFile.size > maxSize) {
      message.error(t('validation.fileTooLarge'));
      return;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-excel',
      'text/csv', 
      'application/csv',
      'text/plain', 
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    console.log('File MIME type:', selectedFile.type);
    console.log('File extension:', fileExtension);
    console.log('Allowed types:', allowedTypes);
    console.log('Allowed extensions:', allowedExtensions);
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      message.error(t('validation.invalidFileType'));
      return;
    }

    if (!user.organizationId) {
      message.error(t('validation.organizationRequired'));
      return;
    }

    try {
      console.log('File being sent:', selectedFile);
      console.log('File size:', selectedFile.size);
      console.log('File type:', selectedFile.type);
      console.log('Organization ID:', user.organizationId);
      
      const result = await importCardsMutation({
        file: selectedFile,
        organizationId: user.organizationId,
      });

      if (result?.success) {
        message.success(
          t('marketing.importSuccess', { count: result.importedCount })
        );
        navigate('/marketing/clients');
      } else {
        message.error(result?.message || t('marketing.importError'));
      }
    } catch (error) {
      console.error('Import failed:', error);
      message.error(t('marketing.importError'));
    }
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('marketing.importCards')}
          </span>
          <QuestionMarkIcon />
        </div>
      </div>
      <div>
        {notificationVisible && (
          <Notification
            title={t('marketing.importCards')}
            message={t('marketing.importCardsDescription')}
            onClose={() => setNotificationVisible(false)}
          />
        )}
        <div className="font-semibold text-2xl mt-5 text-primary02">
          {t('marketing.selectFile')}
        </div>
        <div className="flex mt-5">
          <div
            onClick={() => {
              setDrawerOpen(!drawerOpen);
            }}
            className={`w-80 h-40 flex flex-col justify-center text-center cursor-pointer ${drawerOpen ? 'bg-white border-2 border-primary02' : 'bg-background05'} rounded-2xl`}
          >
            <div
              className={`flex justify-center text-center ${drawerOpen ? 'text-primary02' : 'text-text01'}`}
            >
              <FileOutlined />
              <div className="ml-2 font-semibold text-lg">
                {t('marketing.downloadTemplate')}
              </div>
            </div>
            <div
              className={`mt-2 ml-5 text-base ${drawerOpen ? 'text-text01' : 'text-text02'} font-normal`}
            >
              {t('marketing.clickToDownload')}
            </div>
          </div>
        </div>
        <div className="mt-14 w-[720px]">
          <div className="flex items-center justify-between">
            <div className=" text-text02 text-base font-normal">
              {t('marketing.uploadFile')}
            </div>
            <div className="justify-end text-text02 text-base font-normal">
              {t('marketing.excelFormat')}
            </div>
          </div>
          <div className="border rounded-lg h-24 flex justify-center text-center flex-col">
            {!selectedFile && (
              <div className={`flex m-auto`}>
                <label
                  htmlFor="file-upload"
                  className="flex text-primary02 cursor-pointer space-x-2"
                >
                  <DownloadOutlined />
                                  <div>{t('marketing.selectFile')}</div>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="ml-2 text-text01">{t('marketing.or')}</div>
              </div>
            )}
            {selectedFile && (
              <div>
                <div className="flex items-center justify-between space-x-3 p-2">
                  <div className="flex">
                    <div className="text-primary02">{selectedFile.name}</div>
                    <div className="text-text01">
                      ({(selectedFile.size / 1024).toFixed(2)} kB)
                    </div>
                  </div>
                  <button
                    className="text-text02 justify-end"
                    onClick={handleFileRemove}
                  >
                    <CloseOutlined />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-4 mt-10">
          <Button
            title={t('actions.cancel')}
            type="outline"
            handleClick={() => {
              navigate(-1);
            }}
          />
          <Button
            title={t('marketing.importCards')}
            form={true}
            handleClick={handleSubmit}
            isLoading={isMutating}
          />
        </div>
        <Drawer
          placement="right"
          size="large"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          className="custom-drawer"
        >
          <div className="space-y-6">
            <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">
              {t('marketing.templateRequirements')}
            </div>
            <div className="font-normal text-base text-text01">
              {t('marketing.templateDescription')}
            </div>
            <div className="space-y-4">
              <div className="font-semibold text-lg text-text01">
                {t('marketing.requiredFields')}:
              </div>
              <div className="space-y-2 text-sm text-text02">
                <div>• <strong>devNumber</strong> - {t('marketing.devNumberDescription')}</div>
                <div>• <strong>uniqueNumber</strong> - {t('marketing.uniqueNumberDescription')}</div>
                <div>• <strong>tierId</strong> - {t('marketing.tierIdDescription')}</div>
              </div>
            </div>
            <div className="font-normal text-base text-text01">
              {t('marketing.useCorrectFormat')}
            </div>
            <div className="font-normal text-base text-text01">
              {t('marketing.supportFormats')}
            </div>
            <Button
              title={t('marketing.downloadTemplate')}
              type="outline"
              iconDownload={true}
              handleClick={handleDownload}
            />
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default ClientsImport;
