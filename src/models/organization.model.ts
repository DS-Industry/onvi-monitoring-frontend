export interface Organization {
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

export interface OrganizationPost {
    name: string;
    organizationType: string;
    city: string;
    location: string;
}

export interface OrgData {
    name: string;
    organizationType: string;
    address: {
        city: string;
        location: string;
    }
}

export interface Rating {
    posName: string;
    sum: number;
}

export interface Statistic {
    sum: number;
    cars: number;
}

