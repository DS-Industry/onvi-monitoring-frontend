const UserRole =  {
    id: 1,
    name: "Manager",
    permissions: [
        {
            id: 1,
            object: 'Pos',
            action: 'create'
        },
        {
            id: 2,
            object: 'Pos',
            action: 'update'
        },
        {
            id: 3,
            object: 'Pos',
            action: 'delete'
        },
        {
            id: 4,
            object: 'Finance',
            action: 'view'
        }
    ]
}
