
const InputDateGap = (
    {
        defaultDateStart,
        defaultDateEnd,
        onStartDateChange,
        onEndDateChange,
    }
        ) => {

    const [dateStart, timeStart] = defaultDateStart.split(' ');
    const [dateEnd, timeEnd] = defaultDateEnd.split(' ');

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateInput = event.target.closest('.flex')!.querySelector('input[type="date"]') as HTMLInputElement;
        const timeInput = event.target.closest('.flex')!.querySelector('input[type="time"]') as HTMLInputElement;

        const dateValue = dateInput.value;
        const timeValue = timeInput.value;

        const combinedDateTime = `${dateValue} ${timeValue}`;
        console.log(combinedDateTime);

        onStartDateChange(combinedDateTime);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const dateInput = event.target.closest('.flex')!.querySelector('input[type="date"]') as HTMLInputElement;
        const timeInput = event.target.closest('.flex')!.querySelector('input[type="time"]') as HTMLInputElement;

        const dateValue = dateInput.value;
        const timeValue = timeInput.value;

        const combinedDateTime = `${dateValue} ${timeValue}`;
        console.log(combinedDateTime);

        onEndDateChange(combinedDateTime);
    };



    return(
        <div className="my-5">
            <p className="text-sm text-text02 mb-1.5">Период</p>
            <div className="w-1/2 flex gap-2.5 text-text02">
                <div className="flex gap-2.5 items-center">
                    <span>с</span>
                    <input
                        type="date"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={dateStart}
                        onChange={handleStartDateChange}
                    />
                    <input
                        type="time"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={timeStart}
                        onChange={handleStartDateChange}
                    />
                </div>
                <div className="flex gap-2.5 items-center">
                    <span>по</span>
                    <input
                        type="date"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={dateEnd}
                        onChange={handleEndDateChange}
                    />
                    <input
                        type="time"
                        className="rounded-md py-2 px-4 border border-opacity01/30 bg-[#F7F9FC] w-40"
                        value={timeEnd}
                        onChange={handleEndDateChange}
                    />
                </div>
            </div>
        </div>
    )
}

export default InputDateGap