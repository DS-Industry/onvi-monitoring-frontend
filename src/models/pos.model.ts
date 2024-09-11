interface Pos {
    id: number;
    name: string;
    slug: string;
    address: string;
    monthlyPlan: number;
    organizationName: string;
    timeZone: number;
    posStatus: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updateBy: string;
}

interface PosPost {
    name: string;
    monthlyPlan?: number;
    posMetaData?: string;
    timezone: number;
    city: string;
    location: string;
    image?: string;
    status: string;
    organizationId: number;
}

interface PosData {
    name: string;
    monthlyPlan: number | undefined;
    timezone: string;
    status: string;
    organizationId: number;
    address: {
        city: string;
        location: string;
    }
}

interface PosMonitoring {
    id: number;
    name: string;
    city: string;
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

interface PosPrograms {
    id: number;
    name: string;
    programsInfo: PosProgramInfo[];
}

interface PosProgramInfo {
    programName: string;
    counter: number;
    totalTime: number;
    averageTime: string;
    lastOper: Date;
}
