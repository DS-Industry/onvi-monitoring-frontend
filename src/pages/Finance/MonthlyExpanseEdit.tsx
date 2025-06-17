import ExpandableTable from "@/components/ui/Table/ExpandableTable";
import React from "react";

type ExpenseItem = {
    deviceId: number;
    id: number;
    date: string;
    description: string;
    amount: number;
    category: string;
    paymentMethod: string;
    tags: { id: number; color: string; name: string; }[];
    receipt: boolean;
};

type ExpenseCategory = {
    deviceId: number;
    title: string;
    totalAmount: number;
    transactionCount: number;
    budgetLimit: number;
    budgetUsed: number;
    period: string;
};

const MonthlyExpanseEdit: React.FC = () => {
    const expenseData: ExpenseItem[] = [
        // Food & Dining expenses (deviceId: 1)
        {
            deviceId: 1,
            id: 1,
            date: "2024-06-15T08:30:00Z",
            description: "Breakfast at Cafe Central",
            amount: 25.50,
            category: "Food & Dining",
            paymentMethod: "Credit Card",
            tags: [
                { id: 1, color: "green", name: "Business" },
                { id: 2, color: "blue", name: "Meal" }
            ],
            receipt: true
        },
        {
            deviceId: 1,
            id: 2,
            date: "2024-06-15T12:45:00Z",
            description: "Lunch - Pizza Palace",
            amount: 32.00,
            category: "Food & Dining",
            paymentMethod: "Cash",
            tags: [
                { id: 3, color: "orange", name: "Casual" }
            ],
            receipt: false
        },
        {
            deviceId: 1,
            id: 3,
            date: "2024-06-16T19:20:00Z",
            description: "Dinner with colleagues",
            amount: 85.75,
            category: "Food & Dining",
            paymentMethod: "Credit Card",
            tags: [
                { id: 1, color: "green", name: "Business" },
                { id: 4, color: "purple", name: "Team" }
            ],
            receipt: true
        },

        // Transportation expenses (deviceId: 2)
        {
            deviceId: 2,
            id: 4,
            date: "2024-06-15T07:00:00Z",
            description: "Uber to office",
            amount: 12.50,
            category: "Transportation",
            paymentMethod: "Digital Wallet",
            tags: [
                { id: 1, color: "green", name: "Business" },
                { id: 5, color: "cyan", name: "Commute" }
            ],
            receipt: true
        },
        {
            deviceId: 2,
            id: 5,
            date: "2024-06-15T18:30:00Z",
            description: "Gas Station Fill-up",
            amount: 45.00,
            category: "Transportation",
            paymentMethod: "Credit Card",
            tags: [
                { id: 6, color: "red", name: "Fuel" }
            ],
            receipt: true
        },
        {
            deviceId: 2,
            id: 6,
            date: "2024-06-16T08:15:00Z",
            description: "Parking Downtown",
            amount: 8.00,
            category: "Transportation",
            paymentMethod: "Cash",
            tags: [
                { id: 7, color: "gray", name: "Parking" }
            ],
            receipt: false
        },

        // Entertainment expenses (deviceId: 3)
        {
            deviceId: 3,
            id: 7,
            date: "2024-06-16T20:00:00Z",
            description: "Movie tickets",
            amount: 28.00,
            category: "Entertainment",
            paymentMethod: "Credit Card",
            tags: [
                { id: 8, color: "pink", name: "Movies" },
                { id: 9, color: "yellow", name: "Weekend" }
            ],
            receipt: true
        },
        {
            deviceId: 3,
            id: 8,
            date: "2024-06-17T15:30:00Z",
            description: "Netflix Subscription",
            amount: 15.99,
            category: "Entertainment",
            paymentMethod: "Auto-pay",
            tags: [
                { id: 10, color: "red", name: "Subscription" }
            ],
            receipt: true
        },

        // Shopping expenses (deviceId: 4)
        {
            deviceId: 4,
            id: 9,
            date: "2024-06-14T14:20:00Z",
            description: "Grocery shopping",
            amount: 127.85,
            category: "Shopping",
            paymentMethod: "Debit Card",
            tags: [
                { id: 11, color: "green", name: "Groceries" },
                { id: 12, color: "blue", name: "Weekly" }
            ],
            receipt: true
        },
        {
            deviceId: 4,
            id: 10,
            date: "2024-06-16T11:45:00Z",
            description: "Online purchase - Amazon",
            amount: 67.50,
            category: "Shopping",
            paymentMethod: "Credit Card",
            tags: [
                { id: 13, color: "orange", name: "Online" },
                { id: 14, color: "purple", name: "Electronics" }
            ],
            receipt: true
        }
    ];

    const expenseCategoryData: ExpenseCategory[] = [
        {
            deviceId: 1,
            title: "Food & Dining",
            totalAmount: 143.25,
            transactionCount: 3,
            budgetLimit: 500.00,
            budgetUsed: 28.65,
            period: "2024-06-01T00:00:00Z GMT - 2024-06-30T23:59:59Z GMT"
        },
        {
            deviceId: 2,
            title: "Transportation",
            totalAmount: 65.50,
            transactionCount: 3,
            budgetLimit: 300.00,
            budgetUsed: 21.83,
            period: "2024-06-01T00:00:00Z GMT - 2024-06-30T23:59:59Z GMT"
        },
        {
            deviceId: 3,
            title: "Entertainment",
            totalAmount: 43.99,
            transactionCount: 2,
            budgetLimit: 200.00,
            budgetUsed: 21.99,
            period: "2024-06-01T00:00:00Z GMT - 2024-06-30T23:59:59Z GMT"
        },
        {
            deviceId: 4,
            title: "Shopping",
            totalAmount: 195.35,
            transactionCount: 2,
            budgetLimit: 600.00,
            budgetUsed: 32.56,
            period: "2024-06-01T00:00:00Z GMT - 2024-06-30T23:59:59Z GMT"
        }
    ];

    const expenseColumns = [
        {
            label: "Date",
            key: "date",
            type: "date"
        },
        {
            label: "Description",
            key: "description",
            type: "string"
        },
        {
            label: "Amount",
            key: "amount",
            type: "currency"
        },
        {
            label: "Payment Method",
            key: "paymentMethod",
            type: "string"
        },
        {
            label: "Tags",
            key: "tags",
            type: "tags"
        },
        {
            label: "Receipt",
            key: "receipt",
            type: "boolean",
            render: (record: ExpenseItem, handleChange?: (id: number, key: string, value: string | number) => void) => (
                <input
                    type="checkbox"
                    checked={record.receipt}
                    onChange={(e) => handleChange?.(record.id, "receipt", e.target.checked ? 1 : 0)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
            )
        }
    ];

    const categoryColumns= [
        {
            label: "Category",
            key: "title",
            type: "string"
        },
        {
            label: "Total Amount",
            key: "totalAmount",
            type: "currency"
        },
        {
            label: "Transactions",
            key: "transactionCount",
            type: "number"
        },
        {
            label: "Budget Used",
            key: "budgetUsed",
            type: "percent"
        },
        {
            label: "Period",
            key: "period",
            type: "period"
        }
    ];

    return (
        <div>
            <div className="mt-8">
                <ExpandableTable
                    data={expenseData}
                    columns={expenseColumns}
                    titleColumns={categoryColumns}
                    titleData={expenseCategoryData}
                />
            </div>
        </div>
    )
}

export default MonthlyExpanseEdit;