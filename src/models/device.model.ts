interface Device {
    id: number;
    name: string;
    status: string;
    ipAddress: string;
    carWashDeviceType: string;
    carWashPosName: string;
    carWashPosId: number;
}

interface DevicesMonitoring {
    id: number;
    name: string;
    counter: number;
    cashSum: number;
    virtualSum: number;
    yandexSum: number;
    mobileSum: number;
    cardSum: number;
    lastOper: Date;
    discountSum: number;
    cashbackSumCard: number;
    cashbackSumMub: number;
}

interface DeviceMonitoring {
    id: number;
    sumOper: number;
    dateOper: Date;
    dateLoad: Date;
    counter: number;
    localId: number;
    currencyType: string;
}

interface DeviceProgram {
    id: number;
    name: string;
    dateBegin: Date;
    dateEnd: Date;
    time: string;
    localId: number;
    payType: string;
    isCar: number;
}