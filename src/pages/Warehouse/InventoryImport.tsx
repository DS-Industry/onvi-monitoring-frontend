import Notification from '@/components/ui/Notification';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button/Button';
import useSWRMutation from 'swr/mutation';
import { createNomenclatureFile } from '@/services/api/warehouse';
import { useNavigate } from 'react-router-dom';
import {
  DownloadOutlined,
  FileOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Drawer } from 'antd';

const InventoryImport: React.FC = () => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const navigate = useNavigate();
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
    link.href = `${import.meta.env.VITE_S3_CLOUD}/nomenclature/template.xlsx`;
    link.download = 'template.xlsx';
    link.click();
  };

  const { trigger: createInventory, isMutating } = useSWRMutation(
    ['create-inventory'],
    async (_, { arg }: { arg: { file: File } }) => {
      return createNomenclatureFile(arg);
    }
  );

  const handleSubmit = async () => {
    if (!selectedFile) {
      console.error('No file selected.');
      return;
    }

    const result = await createInventory({
      file: selectedFile,
    });

    if (result) {
      navigate(-1);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <div className="ml-12 md:ml-0 mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-xl sm:text-3xl font-normal text-text01">
            {t('routes.import')}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {notificationVisible && (
          <Notification
            title={t('warehouse.loading')}
            message={t('warehouse.importing')}
            onClose={() => setNotificationVisible(false)}
          />
        )}
        <div className="font-semibold text-xl sm:text-2xl mt-5 text-primary02">
          {t('warehouse.fileSel')}
        </div>
        <div className="flex flex-col sm:flex-row mt-5 gap-4">
          <div
            onClick={() => setDrawerOpen(true)}
            className={`w-full sm:w-80 h-40 flex flex-col justify-center items-center cursor-pointer ${drawerOpen ? 'bg-white border-2 border-primary02' : 'bg-background05'} rounded-2xl`}
          >
            <div
              className={`flex items-center space-x-2 ${drawerOpen ? 'text-primary02' : 'text-text01'}`}
            >
              <FileOutlined />
              <div className="font-semibold text-lg">{t('warehouse.use')}</div>
            </div>
            <div
              className={`mt-2 ml-5 text-base ${drawerOpen ? 'text-text01' : 'text-text02'} font-normal`}
            >
              {t('warehouse.download')}
            </div>
          </div>
        </div>
        <div className="mt-10 w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row justify-between text-text02 text-base font-normal">
            <div>{t('warehouse.fileDown')}</div>
            <div>{t('warehouse.xls')}</div>
          </div>
          <div className="border rounded-lg h-24 flex justify-center items-center text-center mt-4">
            {!selectedFile ? (
              <div className="flex flex-wrap justify-center items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className="flex items-center text-primary02 cursor-pointer space-x-2"
                >
                  <DownloadOutlined />
                  <div>{t('warehouse.select')}</div>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="text-text01">{t('warehouse.or')}</div>
              </div>
            ) : (
              <div className="flex items-center justify-between space-x-3 p-2 w-full">
                <div className="flex items-center truncate">
                  <div className="text-primary02 truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-text01 ml-2">
                    ({(selectedFile.size / 1024).toFixed(2)} kB)
                  </div>
                </div>
                <button className="text-text02" onClick={handleFileRemove}>
                  <CloseOutlined />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            title={t('warehouse.reset')}
            type="outline"
            handleClick={() => {}}
          />
          <Button
            title={t('pos.download')}
            form
            handleClick={handleSubmit}
            isLoading={isMutating}
          />
        </div>
        <Drawer
          title={t('warehouse.fileReq')}
          placement="right"
          size="large"
          onClose={closeDrawer}
          open={drawerOpen}
          className="custom-drawer"
        >
          <div className="space-y-6">
            <div className="font-normal text-base text-text01">
              {t('warehouse.toAvoid')}
            </div>
            <div className="font-normal text-base text-text01">
              {t('warehouse.useCorr')}
            </div>
            <div className="font-normal text-base text-text01">
              {t('warehouse.supp')}
            </div>
            <div className="flex space-x-2">
              <Button
                title={t('organizations.cancel')}
                handleClick={() => setDrawerOpen(false)}
              />
              <Button
                title={t('warehouse.down')}
                type="outline"
                iconDownload={true}
                handleClick={handleDownload}
              />
            </div>
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default InventoryImport;
