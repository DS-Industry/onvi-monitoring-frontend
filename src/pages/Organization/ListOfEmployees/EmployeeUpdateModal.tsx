import Button from "@/components/ui/Button/Button";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Modal from "@/components/ui/Modal/Modal";
import React from "react";
import { useTranslation } from "react-i18next";
import Close from "@icons/close.svg?react";
import useSWR, { mutate } from "swr";
import useSWRMutation from "swr/mutation";
import { getRoles, updateRole } from "@/services/api/organization";

type EmployeeUpdateModalProps = {
  openModal: boolean;
  setOpenModal: (openModal: boolean) => void;
  workerId: number;
  roleId: number;
  setRoleId: (roleId: number) => void;
  selectedWorker: string;
};

const EmployeeUpdateModal: React.FC<EmployeeUpdateModalProps> = ({
  openModal,
  setOpenModal,
  workerId,
  roleId,
  setRoleId,
  selectedWorker,
}) => {
  const { t } = useTranslation();

  const { trigger: update, isMutating } = useSWRMutation(
    ["update-role"],
    async () =>
      updateRole({
        userId: workerId,
        roleId: roleId,
      })
  );

  const handleUpdateRole = async () => {
    const result = await update();

    if (result) {
      mutate([`get-worker`]);
      setOpenModal(false);
    }
  };

  const { data: rolesData } = useSWR([`get-role`], () => getRoles(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    keepPreviousData: true,
  });

  const roles: { name: string; value: number }[] =
    rolesData?.map((item) => ({
      name: item.name,
      value: item.id,
      render: (
        <div>
          <div>{item.name}</div>
          <div className="text-text02">
            Lorem ipsum dolor, sit amet consectetur
          </div>
        </div>
      ),
    })) || [];

  return (
    <div>
      {openModal && selectedWorker && (
        <Modal isOpen={openModal} classname="sm:w-[552px] sm:h-[300px]">
          <div className="flex items-center justify-between">
            <div></div>
            <Close
              onClick={() => setOpenModal(false)}
              className="cursor-pointer text-text01"
            />
          </div>
          <h2 className="text-2xl font-semibold text-text01 mb-4">
            {t("roles.role")}
          </h2>
          <p className="text-primary02 text-sm">{selectedWorker}</p>
          <DropdownInput
            value={roleId}
            options={roles}
            onChange={(value) => setRoleId(value)}
            classname="w-[300px] sm:w-[456px]"
            renderOption={(option) =>
              option.render || <span>{option.name}</span>
            }
          />
          <div className="flex justify-end space-x-4 mt-10">
            <Button
              title={t("organizations.cancel")}
              type="outline"
              handleClick={() => setOpenModal(false)}
            />
            <Button
              title={t("organizations.save")}
              isLoading={isMutating}
              handleClick={handleUpdateRole}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeUpdateModal;
