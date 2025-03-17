import NoDataUI from "@/components/ui/NoDataUI";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SalyImage from "@/assets/NoEquipment.png"
import DrawerCreate from "@/components/ui/Drawer/DrawerCreate";
import DropdownInput from "@/components/ui/Input/DropdownInput";
import Input from "@/components/ui/Input/Input";
import MultilineInput from "@/components/ui/Input/MultilineInput";
import Button from "@/components/ui/Button/Button";
import { useButtonCreate } from "@/components/context/useContext";
import OverflowTable from "@/components/ui/Table/OverflowTable";
import { columnsEquipmentFailure } from "@/utils/OverFlowTableData";
import useSWR, { mutate } from "swr";
import { createIncident, getDevices, getEquipmentKnots, getIncident, getIncidentEquipmentKnots, getPoses, getPrograms, getWorkers, updateIncident } from "@/services/api/equipment";
import TableSkeleton from "@/components/ui/Table/TableSkeleton";
import useFormHook from "@/hooks/useFormHook";
import useSWRMutation from "swr/mutation";
import FilterMonitoring from "@/components/ui/Filter/FilterMonitoring";
import { usePosType, useSetPosType, useStartDate, useEndDate, useSetStartDate, useSetEndDate, useCity, useSetCity } from '@/hooks/useAuthStore';


interface Incident {
    id: number;
    posId: number;
    workerId: number;
    appearanceDate: Date;
    startDate: Date;
    finishDate: Date;
    objectName: string;
    equipmentKnot: string;
    incidentName: string;
    incidentReason: string;
    incidentSolution: string;
    repair: string;
    downtime: string;
    comment: string;
    programId: number;
}

interface FilterIncidentPos {
    dateStart: string;
    dateEnd: string;
    posId: number | string;
    placementId: number | string;
}

type IncidentBody = {
    posId: number;
    workerId: number;
    appearanceDate: string;
    startDate: string;
    finishDate: string;
    objectName: string;
    equipmentKnotId?: number;
    incidentNameId?: number;
    incidentReasonId?: number;
    incidentSolutionId?: number;
    downtime: number;
    comment: string;
    carWashDeviceProgramsTypeId?: number;
}


const EquipmentFailure: React.FC = () => {
    const { t } = useTranslation();
    const { buttonOn, setButtonOn } = useButtonCreate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editIncidentId, setEditIncidentId] = useState<number>(0);
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [deviceCheck, setDeviceCheck] = useState(false);
    const posType = usePosType();
    const startDate = useStartDate();
    const endDate = useEndDate();
    const setPosType = useSetPosType();
    const setStartDate = useSetStartDate();
    const setEndDate = useSetEndDate();
    const city = useCity();
    const setCity = useSetCity();

    const initialFilter = {
        dateStart: startDate.toString().slice(0, 10) || "2024-01-01",
        dateEnd: endDate.toString().slice(0, 10) || `${formattedDate}`,
        posId: posType || 1,
        placementId: city
    };

    const [dataFilter, setIsDataFilter] = useState<FilterIncidentPos>(initialFilter);

    const handleDataFilter = (newFilterData: Partial<FilterIncidentPos>) => {
        setIsDataFilter((prevFilter) => ({ ...prevFilter, ...newFilterData }));
        setIsTableLoading(true);
        if (newFilterData.posId) setPosType(newFilterData.posId);
        if (newFilterData.dateStart) setStartDate(new Date(newFilterData.dateStart));
        if (newFilterData.dateEnd) setEndDate(new Date(newFilterData.dateEnd));
        if(newFilterData.placementId) setCity(newFilterData.placementId);
    };
    const { data, isLoading: incidentLoading, mutate: incidentMutate } = useSWR([`get-incident`], () => getIncident({
        dateStart: dataFilter.dateStart,
        dateEnd: dataFilter.dateEnd,
        posId: dataFilter.posId,
        placementId: city
    }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true })


    const defaultValues: IncidentBody = {
        posId: 0,
        workerId: 0,
        appearanceDate: '',
        startDate: '',
        finishDate: '',
        objectName: '',
        equipmentKnotId: undefined,
        incidentNameId: undefined,
        incidentReasonId: undefined,
        incidentSolutionId: undefined,
        downtime: 2,
        comment: '',
        carWashDeviceProgramsTypeId: undefined,
    };

    const [formData, setFormData] = useState(defaultValues);

    const { data: posData } = useSWR([`get-pos`], () => getPoses({ placementId: city }), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: workerData } = useSWR([`get-worker`], () => getWorkers(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: deviceData } = useSWR(formData.posId !== 0 ? [`get-device`] : null, () => getDevices(formData.posId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: equipmentKnotData } = useSWR(formData.posId !== 0 ? [`get-equipment-knot`] : null, () => getEquipmentKnots(formData.posId), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: incidentEquipmentKnotData } = useSWR(equipmentKnotData ? [`get-incident-equipment-knot`] : null, () => getIncidentEquipmentKnots(equipmentKnotData ? equipmentKnotData[0].props.id : 0), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const { data: allProgramsData } = useSWR([`get-all-programs`], () => getPrograms(), { revalidateOnFocus: false, revalidateOnReconnect: false, keepPreviousData: true });

    const poses: { name: string; value: number; }[] = posData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const workers: { name: string; value: number; }[] = workerData?.map((item) => ({ name: item.name, value: item.id })) || [];

    const programs: { name: string; value: number; }[] = allProgramsData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const incidents: Incident[] = data
        ?.map((item: Incident) => ({
            ...item,
            posName: poses.find((pos) => pos.value === item.posId)?.name,
            workerName: workers.find((work) => work.value === item.workerId)?.name,
            programName: programs.find((prog) => prog.value === item.programId)?.name
        }))
        .sort((a, b) => a.id - b.id) || [];

    useEffect(() => {
        incidentMutate().then(() => setIsTableLoading(false));
    }, [dataFilter, incidentMutate]);

    const devices: { name: string; value: string; }[] = deviceData?.map((item) => ({ name: item.props.name, value: item.props.name })) || [];

    const equipmentKnots: { name: string; value: number; }[] = equipmentKnotData?.map((item) => ({ name: item.props.name, value: item.props.id })) || [];

    const problemNames: { name: string; value: number; }[] = incidentEquipmentKnotData?.map((item) => ({ name: item.problemName, value: item.id })) || [];

    const reasons: { name: string; value: number; }[] = incidentEquipmentKnotData?.flatMap((item) => (item.reason.map((reas) => ({ name: reas.infoName, value: reas.id })))).filter((reason, index, self) => index === self.findIndex((r) => r.value === reason.value)) || [];

    const solutions: { name: string; value: number; }[] = incidentEquipmentKnotData?.flatMap((item) => (item.solution.map((sol) => ({ name: sol.infoName, value: sol.id })))).filter((reason, index, self) => index === self.findIndex((r) => r.value === reason.value)) || [];

    const { register, handleSubmit, errors, setValue, reset } = useFormHook(formData);

    const { trigger: createInc, isMutating } = useSWRMutation(['create-incident'], async () => createIncident({
        posId: formData.posId,
        workerId: formData.workerId,
        appearanceDate: formData.appearanceDate,
        startDate: formData.startDate,
        finishDate: formData.finishDate,
        objectName: formData.objectName,
        equipmentKnotId: formData.equipmentKnotId,
        incidentNameId: formData.incidentNameId,
        incidentReasonId: formData.incidentReasonId,
        incidentSolutionId: formData.incidentSolutionId,
        downtime: formData.downtime,
        comment: formData.comment,
        carWashDeviceProgramsTypeId: formData.carWashDeviceProgramsTypeId,
    }));

    const { trigger: updateInc } = useSWRMutation(['update-incident'], async () => updateIncident({
        incidentId: editIncidentId,
        workerId: formData.workerId,
        appearanceDate: formData.appearanceDate,
        startDate: formData.startDate,
        finishDate: formData.finishDate,
        objectName: formData.objectName,
        equipmentKnotId: formData.equipmentKnotId,
        incidentNameId: formData.incidentNameId,
        incidentReasonId: formData.incidentReasonId,
        incidentSolutionId: formData.incidentSolutionId,
        downtime: formData.downtime,
        comment: formData.comment,
        carWashDeviceProgramsTypeId: formData.carWashDeviceProgramsTypeId

    }))

    type FieldType = "posId" | "workerId" | "appearanceDate" | "startDate" | "finishDate" | "objectName" | "equipmentKnotId" | "incidentNameId" | "incidentReasonId" | "incidentSolutionId" | "downtime" | "comment" | "carWashDeviceProgramsTypeId";

    const handleInputChange = (field: FieldType, value: string) => {
        const numericFields = ['downtime', 'posId', 'workerId', 'equipmentKnotId', 'incidentNameId', 'incidentReasonId', 'incidentSolutionId', 'carWashDeviceProgramsTypeId'];
        const updatedValue = numericFields.includes(field) ? Number(value) : value;
        setFormData((prev) => ({ ...prev, [field]: updatedValue }));
        setValue(field, value);
    };

    const handleUpdate = (id: number) => {
        setEditIncidentId(id);
        setIsEditMode(true);
        setButtonOn(true);
        const incidentToEdit = incidents.find((org) => org.id === id);

        if (incidentToEdit) {
            const formatDateTime = (dateString: Date) => {
                const date = new Date(dateString); // Convert string to Date object
                return date.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
            };

            setFormData({
                posId: incidentToEdit.posId,
                workerId: incidentToEdit.workerId,
                appearanceDate: formatDateTime(incidentToEdit.appearanceDate),
                startDate: formatDateTime(incidentToEdit.startDate),
                finishDate: formatDateTime(incidentToEdit.finishDate),
                objectName: incidentToEdit.objectName,
                equipmentKnotId: Number(equipmentKnots.find((equipmentKnot) => equipmentKnot.name === incidentToEdit.equipmentKnot)?.value),
                incidentNameId: Number(problemNames.find((incidentName) => incidentName.name === incidentToEdit.incidentName)?.value),
                incidentReasonId: Number(reasons.find((reason) => reason.name === incidentToEdit.incidentReason)?.value),
                incidentSolutionId: Number(solutions.find((solution) => solution.name === incidentToEdit.incidentSolution)?.value),
                downtime: incidentToEdit.downtime === "Нет" ? 0 : 1,
                comment: incidentToEdit.comment,
                carWashDeviceProgramsTypeId: incidentToEdit.programId,
            });
        }
    };

    const resetForm = () => {
        setFormData(defaultValues);
        setIsEditMode(false);
        reset();
        setEditIncidentId(0);
        setButtonOn(false);
    };

    const onSubmit = async (data: unknown) => {
        console.log("Errors: ", errors);
        console.log('Form data:', data);
        try {
            if (editIncidentId) {
                const result = await updateInc();
                console.log(result);
                if (result) {
                    console.log(result);
                    mutate([`get-incident`]);
                    resetForm();
                } else {
                    throw new Error('Invalid update data.');
                }
            } else {
                const result = await createInc();
                if (result) {
                    console.log('API Response:', result);
                    mutate([`get-incident`]);
                    resetForm();
                } else {
                    throw new Error('Invalid response from API');
                }
            }
        } catch (error) {
            console.error("Error during form submission: ", error);
        }
    };

    return (
        <>
            <DrawerCreate onClose={resetForm}>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <span className="font-semibold text-xl md:text-3xl mb-5 text-text01">{t("equipment.break")}</span>
                    <DropdownInput
                        title={t("equipment.carWash")}
                        label={poses.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={poses}
                        classname="w-72"
                        {...register('posId', {
                            required: !isEditMode && 'Pos ID is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Pos ID is required"
                        })}
                        value={formData.posId}
                        onChange={(value) => { handleInputChange('posId', value); setPosType(value); }}
                        error={!!errors.posId}
                        helperText={errors.posId?.message}
                        isDisabled={isEditMode}
                    />
                    <DropdownInput
                        title={t("equipment.employee")}
                        label={workers.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={workers}
                        classname="w-72"
                        {...register('workerId', {
                            required: !isEditMode && 'Worker ID is required',
                            validate: (value) =>
                                (value !== 0 || isEditMode) || "Worker ID is required"
                        })}
                        value={formData.workerId}
                        onChange={(value) => handleInputChange('workerId', value)}
                        error={!!errors.workerId}
                        helperText={errors.workerId?.message}
                    />
                    <Input
                        type={"datetime-local"}
                        title={t("equipment.call")}
                        classname="w-44"
                        value={formData.appearanceDate}
                        changeValue={(e) => handleInputChange('appearanceDate', e.target.value)}
                        error={!!errors.appearanceDate}
                        {...register('appearanceDate', { required: !isEditMode && 'Appearance Date is required' })}
                        helperText={errors.appearanceDate?.message || ''}
                    />
                    <Input
                        type={"datetime-local"}
                        title={t("equipment.start")}
                        classname="w-44"
                        value={formData.startDate}
                        changeValue={(e) => handleInputChange('startDate', e.target.value)}
                        error={!!errors.startDate}
                        {...register('startDate', { required: !isEditMode && 'Start Date is required' })}
                        helperText={errors.startDate?.message || ''}
                    />
                    <Input
                        type={"datetime-local"}
                        title={t("equipment.end")}
                        classname="w-44"
                        value={formData.finishDate}
                        changeValue={(e) => handleInputChange('finishDate', e.target.value)}
                        error={!!errors.finishDate}
                        {...register('finishDate', { required: !isEditMode && 'Finish Date is required' })}
                        helperText={errors.finishDate?.message || ''}
                    />
                    <div className="flex">
                        <input
                            type="checkbox"
                            checked={deviceCheck}
                            // {...register('objectName', { required: !isEditMode && 'Device is required' })}
                            onChange={(e) => {
                                setDeviceCheck(e.target.checked);
                                handleInputChange('objectName', 'Вся мойка');
                            }}
                        />
                        <div className="text-text02 ml-2">{t("equipment.whole")}</div>
                    </div>
                    <DropdownInput
                        title={t("equipment.device")}
                        label={devices.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={devices}
                        classname="w-72"
                        {...register('objectName', { required: !isEditMode && 'Device is required' })}
                        value={formData.objectName}
                        onChange={(value) => handleInputChange('objectName', value)}
                        error={!!errors.objectName}
                        helperText={errors.objectName?.message}
                        isDisabled={deviceCheck}
                    />
                    <DropdownInput
                        title={t("equipment.knot")}
                        label={equipmentKnots.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={equipmentKnots}
                        classname="w-72"
                        {...register('equipmentKnotId')}
                        value={formData.equipmentKnotId}
                        onChange={(value) => handleInputChange('equipmentKnotId', value)}
                    />
                    <DropdownInput
                        title={t("equipment.name")}
                        label={problemNames.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={problemNames}
                        classname="w-72"
                        {...register('incidentNameId')}
                        value={formData.incidentNameId}
                        onChange={(value) => handleInputChange('incidentNameId', value)}
                    />
                    <DropdownInput
                        title={t("equipment.cause")}
                        label={reasons.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={reasons}
                        classname="w-72"
                        {...register('incidentReasonId')}
                        value={formData.incidentReasonId}
                        onChange={(value) => handleInputChange('incidentReasonId', value)}
                    />
                    <DropdownInput
                        title={t("equipment.measures")}
                        label={solutions.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={solutions}
                        classname="w-72"
                        {...register('incidentSolutionId')}
                        value={formData.incidentSolutionId}
                        onChange={(value) => handleInputChange('incidentSolutionId', value)}
                    />
                    <div className="space-y-2">
                        <div className="text-text02 text-sm font-semibold">{t("equipment.simple")}</div>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value={1}
                                    checked={formData.downtime === 1}
                                    className="mr-2"
                                    {...register('downtime', { required: !isEditMode && 'Downtime is required' })}
                                    onChange={(e) => handleInputChange('downtime', e.target.value)}
                                />
                                {t("equipment.yes")}
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value={0}
                                    checked={formData.downtime === 0}
                                    {...register('downtime', { required: !isEditMode && 'Downtime is required' })}
                                    onChange={(e) => handleInputChange('downtime', e.target.value)}
                                    className="mr-2"
                                />
                                {t("equipment.no")}
                            </label>
                        </div>
                        {errors.downtime && (
                            <div className={`text-[11px] font-normal text-errorFill`}>
                                Downtime is required.
                            </div>
                        )}
                    </div>
                    <DropdownInput
                        title={t("equipment.program")}
                        label={programs.length === 0 ? t("warehouse.noVal") : t("warehouse.notSel")}
                        options={programs}
                        classname="w-72"
                        {...register('carWashDeviceProgramsTypeId')}
                        value={formData.carWashDeviceProgramsTypeId}
                        onChange={(value) => handleInputChange('carWashDeviceProgramsTypeId', value)}
                    />
                    <MultilineInput
                        title={t("equipment.comment")}
                        classname="w-96"
                        value={formData.comment}
                        changeValue={(e) => handleInputChange('comment', e.target.value)}
                        error={!!errors.comment}
                        {...register('comment', { required: !isEditMode && 'Comment is required' })}
                        helperText={errors.comment?.message || ''}
                    />
                    <div className="flex justify-end space-x-4">
                        <Button
                            title={t("organizations.cancel")}
                            type='outline'
                            handleClick={() => {
                                setButtonOn(!buttonOn)
                                resetForm();
                            }}
                        />
                        <Button
                            title={t("organizations.save")}
                            form={true}
                            isLoading={isMutating}
                            handleClick={() => { }}
                        />
                    </div>
                </form>
            </DrawerCreate>
            <FilterMonitoring
                count={incidents.length}
                posesSelect={poses}
                handleDataFilter={handleDataFilter}
                hideSearch={true}
            />
            {isTableLoading || incidentLoading ? (
                <TableSkeleton columnCount={columnsEquipmentFailure.length} />
            ) :
                incidents.length > 0 ?
                    <div className="mt-8">
                        <OverflowTable
                            tableData={incidents}
                            columns={columnsEquipmentFailure}
                            isDisplayEdit={true}
                            isUpdate={true}
                            onUpdate={handleUpdate}
                        />
                    </div> :
                    <NoDataUI
                        title={t("equipment.nodata")}
                        description={t("equipment.noBreakdown")}
                    >
                        <img src={SalyImage} className="mx-auto" />
                    </NoDataUI>
            }
        </>
    )
}

export default EquipmentFailure;