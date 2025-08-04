import Button from "@/components/ui/Button/Button";
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "@ui/Notification.tsx";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import { postPosData } from "@/services/api/pos";
import { mutate } from "swr";
import { useButtonCreate, useToast } from "@/components/context/useContext";
import { Organization } from "@/services/api/organization";
import { useSearchParams } from "react-router-dom";

type PosFormProps = {
  organizations: Organization[];
};

const PosForm: React.FC<PosFormProps> = ({ organizations }) => {
  const { t } = useTranslation();
  const [notificationVisible, setNotificationVisible] = useState(true);
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city") || "*";

  const defaultValues = {
    name: "",
    monthlyPlan: null,
    timeWork: "",
    posMetaData: "",
    city: "",
    location: "",
    lat: null,
    lon: null,
    organizationId: null,
    carWashPosType: "",
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
      postPosData({
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
        carWashPosType: formData.carWashPosType,
        minSumOrder: formData.minSumOrder,
        maxSumOrder: formData.maxSumOrder,
        stepSumOrder: formData.stepSumOrder,
      })
  );

  type FieldType =
    | "name"
    | "monthlyPlan"
    | "timeWork"
    | "posMetaData"
    | "city"
    | "location"
    | "lat"
    | "lon"
    | "organizationId"
    | "carWashPosType"
    | "minSumOrder"
    | "maxSumOrder"
    | "stepSumOrder";

  const handleInputChange = (field: FieldType, value: string | null) => {
    const numericFields = [
      "monthlyPlan",
      "stepSumOrder",
      "minSumOrder",
      "maxSumOrder",
      "lat",
      "lon",
    ];
    const updatedValue = numericFields.includes(field) ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [field]: updatedValue }));
    setValue(field, value);
  };

  const handleTimeWorkChange = (field: string, value: number) => {
    if (field === "startHour") {
      setStartHour(value);
      setFormData((prev) => ({
        ...prev,
        timeWork: `${value}${endHour ?? ""}`,
      }));
      setValue("timeWork", `${value}${endHour ?? ""}`);
    } else {
      setEndHour(value);
      setFormData((prev) => ({
        ...prev,
        timeWork: `${startHour ?? ""}${value}`,
      }));
      setValue("timeWork", `${startHour ?? ""}${value}`);
    }
  };

  const { showToast } = useToast();
  const { setButtonOn } = useButtonCreate();

  const resetForm = () => {
    setFormData(defaultValues);
    reset();
    setButtonOn(false);
  };

  const onSubmit = async () => {
    try {
      const result = await createPos();
      if (result) {
        mutate([`get-pos`, city]);
        resetForm();
      } else {
        showToast(t("errors.other.errorDuringFormSubmission"), "error");
      }
    } catch (error) {
      console.error("Error during form submission: ", error);
      showToast(t("errors.other.errorDuringFormSubmission"), "error");
    }
  };

  return (
    <div>
      <DrawerCreate onClose={resetForm}>
        {notificationVisible && organizations.length === 0 && (
          <Notification
            title={t("organizations.legalEntity")}
            message={t("pos.createObject")}
            link={t("pos.goto")}
            linkUrl="/administration/legalRights"
            onClose={() => setNotificationVisible(false)}
          />
        )}

        <form
          className="space-y-6 w-full max-w-2xl mx-auto p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <span className="font-semibold text-xl md:text-3xl mb-5">
            {t("pos.creating")}
          </span>
          <div className="grid grid-cols-1 gap-4">
            <Input
              title={t("pos.name")}
              type={"text"}
              label={t("pos.example")}
              classname="w-80 sm:w-96"
              {...register("name", { required: "Name is required" })}
              value={formData.name}
              changeValue={(e) => handleInputChange("name", e.target.value)}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <Input
              title={t("pos.city")}
              type={"text"}
              label={t("pos.address")}
              classname="w-80 sm:w-96"
              {...register("city", { required: "City is required" })}
              value={formData.city}
              changeValue={(e) => handleInputChange("city", e.target.value)}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
            <Input
              title={t("pos.location")}
              type={"text"}
              label={t("pos.location")}
              classname="w-80 sm:w-96"
              {...register("location", { required: "Location is required" })}
              value={formData.location}
              changeValue={(e) => handleInputChange("location", e.target.value)}
              error={!!errors.location}
              helperText={errors.location?.message}
            />
            <Input
              title={t("pos.lat")}
              type="number"
              classname="w-48"
              {...register("lat")}
              value={formData.lat}
              changeValue={(e) => handleInputChange("lat", e.target.value)}
            />
            <Input
              title={t("pos.lon")}
              type="number"
              classname="w-48"
              {...register("lon")}
              value={formData.lon}
              changeValue={(e) => handleInputChange("lon", e.target.value)}
            />
            <div>
              <label className="text-sm text-text02">{t("pos.opening")}</label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  classname="w-40"
                  value={startHour !== null ? startHour : ""}
                  changeValue={(e) =>
                    handleTimeWorkChange("startHour", Number(e.target.value))
                  }
                  {...register("timeWork", {
                    required: "Time Work is required",
                  })}
                  error={!!errors.timeWork}
                  helperText={errors.timeWork?.message}
                />
                <div className="flex justify-center items-center text-text02">
                  {" "}
                  :{" "}
                </div>
                <Input
                  type="number"
                  classname="w-40"
                  value={endHour !== null ? endHour : ""}
                  changeValue={(e) =>
                    handleTimeWorkChange("endHour", Number(e.target.value))
                  }
                  {...register("timeWork", {
                    required: "Time Work is required",
                  })}
                  error={!!errors.timeWork}
                  helperText={errors.timeWork?.message}
                />
              </div>
              <div className="flex mt-2">
                <input type="checkbox" />
                <div className="text-text02 ml-2">{t("pos.clock")}</div>
              </div>
            </div>
            <Input
              title={t("pos.monthly")}
              type={"number"}
              defaultValue={"0"}
              classname="w-48"
              {...register("monthlyPlan", {
                required: "Monthly Plan is required",
              })}
              value={formData.monthlyPlan}
              changeValue={(e) =>
                handleInputChange("monthlyPlan", e.target.value)
              }
              error={!!errors.monthlyPlan}
              helperText={errors.monthlyPlan?.message}
            />
            <DropdownInput
              title={t("pos.company")}
              label={t("pos.companyName")}
              options={organizations.map((item) => ({
                value: item.id,
                name: item.name,
              }))}
              classname="w-80 sm:w-96"
              {...register("organizationId", {
                required: "Organization ID is required",
              })}
              value={formData.organizationId}
              onChange={(value) => handleInputChange("organizationId", value)}
              error={!!errors.organizationId}
              helperText={errors.organizationId?.message}
            />
            <DropdownInput
              title={t("pos.type")}
              label={t("pos.self")}
              options={[
                { name: "МСО", value: "SelfService" },
                { name: t("pos.robot"), value: "Portal" },
                {
                  name: `МСО + ${t("pos.robot")}`,
                  value: "SelfServiceAndPortal",
                },
              ]}
              classname="w-80 sm:w-96"
              {...register("carWashPosType", {
                required: "Pos Type is required",
              })}
              value={formData.carWashPosType}
              onChange={(value) => handleInputChange("carWashPosType", value)}
              error={!!errors.carWashPosType}
              helperText={errors.carWashPosType?.message}
            />
            <div>
              <label className="text-sm text-text02">{t("pos.min")}</label>
              <Input
                type="number"
                classname="w-48"
                {...register("stepSumOrder", {
                  required: "Step Sum Order is required",
                })}
                value={formData.stepSumOrder}
                changeValue={(e) =>
                  handleInputChange("stepSumOrder", e.target.value)
                }
                error={!!errors.stepSumOrder}
                helperText={errors.stepSumOrder?.message}
              />
            </div>
            <div>
              <label className="text-sm text-text02">
                {t("pos.minAmount")}
              </label>
              <Input
                type="number"
                classname="w-48"
                {...register("minSumOrder", {
                  required: "Min Sum Order is required",
                })}
                value={formData.minSumOrder}
                changeValue={(e) =>
                  handleInputChange("minSumOrder", e.target.value)
                }
                error={!!errors.minSumOrder}
                helperText={errors.minSumOrder?.message}
              />
            </div>
            <div>
              <label className="text-sm text-text02">
                {t("pos.maxAmount")}
              </label>
              <Input
                type="number"
                classname="w-48"
                {...register("maxSumOrder", {
                  required: "Max Sum Order is required",
                })}
                value={formData.maxSumOrder}
                changeValue={(e) =>
                  handleInputChange("maxSumOrder", e.target.value)
                }
                error={!!errors.maxSumOrder}
                helperText={errors.maxSumOrder?.message}
              />
            </div>
            <div>
              <div>{t("pos.photos")}</div>
              <div>{t("pos.maxNumber")}</div>
              <Button
                form={false}
                iconPlus={true}
                type="outline"
                title={t("pos.download")}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
            <Button
              title={t("organizations.cancel")}
              type="outline"
              handleClick={() => resetForm()}
            />
            <Button
              title={t("organizations.save")}
              form={true}
              isLoading={isMutating}
            />
          </div>
        </form>
      </DrawerCreate>
    </div>
  );
};

export default PosForm;
