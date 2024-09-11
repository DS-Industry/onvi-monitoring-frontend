interface Organization {
    id: number;
    name: string;
    slug: string;
    address: string;
    organizationDocumentId?: number;
    organizationStatus: string;
    organizationType: string;
    createdAt: Date;
    updatedAt: Date;
    owner: string;
}

interface OrganizationPost {
    name: string;
    organizationType: string;
    city: string;
    location: string;
}

interface OrgData {
    name: string;
    organizationType: string;
    address: {
        city: string;
        location: string;
    }
}

interface Rating {
    posName: string;
    sum: number;
}

interface Statistic {
    sum: number;
    cars: number;
}

