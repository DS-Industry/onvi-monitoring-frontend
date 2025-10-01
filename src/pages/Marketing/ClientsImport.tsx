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
  ArrowLeftOutlined,
} from '@ant-design/icons';
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
    const fileExtension = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf('.'));

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      message.error(t('validation.invalidFileType'));
      return;
    }

    if (!user.organizationId) {
      message.error(t('validation.organizationRequired'));
      return;
    }

    try {
      const result = await importCardsMutation({
        file: selectedFile,
        organizationId: user.organizationId,
      });

      message.success(
        t('marketing.importSuccess', { count: result.importedCount })
      );
      navigate('/marketing/clients');
    } catch (error) {
      console.error('Import failed:', error);
      message.error(t('marketing.importError'));
    }
  };

  return (
    <>
      <div
        className="flex text-primary02 mb-5 cursor-pointer ml-12 md:ml-0 "
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowLeftOutlined />
        <p className="ms-2">{t('login.back')}</p>
      </div>
      <div className="px-4 md:px-0 mb-5 ml-10 md:ml-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl md:text-3xl font-normal text-text01">
            {t('marketing.importCards')}
          </span>
        </div>
      </div>

      <div className="px-4 md:px-0">
        {notificationVisible && (
          <Notification
            title={t('marketing.importCards')}
            message={t('marketing.importCardsDescription')}
            onClose={() => setNotificationVisible(false)}
          />
        )}

        <div className="font-semibold text-xl md:text-2xl mt-5 text-primary02">
          {t('marketing.selectFile')}
        </div>

        <div className="flex mt-5">
          <div
            onClick={() => {
              setDrawerOpen(!drawerOpen);
            }}
            className={`w-full sm:w-80 h-32 sm:h-40 flex flex-col justify-center text-center cursor-pointer ${
              drawerOpen
                ? 'bg-white border-2 border-primary02'
                : 'bg-background05'
            } rounded-2xl transition-all duration-200 hover:shadow-md`}
          >
            <div
              className={`flex justify-center text-center items-center ${
                drawerOpen ? 'text-primary02' : 'text-text01'
              }`}
            >
              <FileOutlined className="text-xl md:text-2xl" />
              <div className="ml-2 font-semibold text-base md:text-lg">
                {t('marketing.downloadTemplate')}
              </div>
            </div>
            <div
              className={`mt-2 px-4 text-sm md:text-base ${
                drawerOpen ? 'text-text01' : 'text-text02'
              } font-normal`}
            >
              {t('marketing.clickToDownload')}
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-14 w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="text-text02 text-sm md:text-base font-normal">
              {t('marketing.uploadFile')}
            </div>
            <div className="text-text02 text-sm md:text-base font-normal">
              {t('marketing.excelFormat')}
            </div>
          </div>

          <div className="border rounded-lg h-20 md:h-24 flex justify-center text-center flex-col p-4">
            {!selectedFile && (
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <label
                  htmlFor="file-upload"
                  className="flex text-primary02 cursor-pointer items-center space-x-2 hover:text-primary02_Hover transition-colors"
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
                <div className="text-text01">{t('warehouse.or')}</div>
              </div>
            )}
            {selectedFile && (
              <div className="w-full">
                <div className="flex items-center justify-between space-x-3 p-2">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 min-w-0">
                    <div className="text-primary02 text-sm md:text-base truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-text01 text-xs md:text-sm">
                      ({(selectedFile.size / 1024).toFixed(2)} kB)
                    </div>
                  </div>
                  <button
                    className="text-text02 hover:text-text01 transition-colors flex-shrink-0"
                    onClick={handleFileRemove}
                  >
                    <CloseOutlined />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-8 md:mt-10">
          <Button
            title={t('actions.cancel')}
            type="outline"
            handleClick={() => {
              navigate(-1);
            }}
            classname="w-full sm:w-auto"
          />
          <Button
            title={t('marketing.importCards')}
            form={true}
            handleClick={handleSubmit}
            isLoading={isMutating}
            classname="w-full sm:w-auto"
          />
        </div>

        <Drawer
          placement="right"
          size="large"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          className="custom-drawer"
          zIndex={9999}
        >
          <div className="space-y-6 p-4">
            <div className="font-semibold text-xl md:text-3xl mb-5 text-text01">
              {t('marketing.templateRequirements')}
            </div>
            <div className="font-normal text-sm md:text-base text-text01">
              {t('marketing.templateDescription')}
            </div>
            <div className="space-y-4">
              <div className="font-semibold text-lg text-text01">
                {t('marketing.requiredFields')}:
              </div>
              <div className="space-y-2 text-sm text-text02">
                <div>
                  • <strong>devNumber</strong> -{' '}
                  {t('marketing.devNumberDescription')}
                </div>
                <div>
                  • <strong>uniqueNumber</strong> -{' '}
                  {t('marketing.uniqueNumberDescription')}
                </div>
                <div>
                  • <strong>tierId</strong> - {t('marketing.tierIdDescription')}
                </div>
              </div>
            </div>
            <div className="font-normal text-sm md:text-base text-text01">
              {t('marketing.useCorrectFormat')}
            </div>
            <div className="font-normal text-sm md:text-base text-text01">
              {t('marketing.supportFormats')}
            </div>
            <Button
              title={t('marketing.downloadTemplate')}
              type="outline"
              iconDownload={true}
              handleClick={handleDownload}
              classname="w-full sm:w-auto"
            />
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default ClientsImport;
