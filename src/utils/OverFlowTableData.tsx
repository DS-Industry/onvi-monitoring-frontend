export const tableUserData = [
  {
    id: 1,
    firstName: "Emily",
    lastName: "Johnson",
    middleName: "Smith",
    age: 28,
    gender: "female",
    email: "emily.johnson@x.dummyjson.com",
    phone: "+81 965-431-3024",
    username: "emilys",
    password: "emilyspass",
    birthDate: "1996-5-30",
    image: "...",
    bloodGroup: "O-",
    height: 193.24,
    weight: 63.16,
    eyeColor: "Green",
  },
  {
    id: 2,
    firstName: "Emily",
    lastName: "Johnson",
    middleName: "Smith",
    age: 28,
    gender: "female",
    email: "emily.johnson@x.dummyjson.com",
    phone: "+81 965-431-3024",
    username: "emilys",
    password: "emilyspass",
    birthDate: "1996-5-30",
    image: "...",
    bloodGroup: "O-",
    height: 193.24,
    weight: 63.16,
    eyeColor: "Green",
  },
];

export const columnsUser = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "firstName",
    key: "firstName",
  },
  {
    label: "lastName",
    key: "lastName",
  },
  {
    label: "middleName",
    key: "middleName",
  },
  {
    label: "age",
    key: "age",
  },
  {
    label: "gender",
    key: "gender",
  },
  {
    label: "email",
    key: "email",
  },
  {
    label: "phone",
    key: "phone",
  },
  {
    label: "username",
    key: "username",
  },
  {
    label: "password",
    key: "password",
  },
  {
    label: "birthDate",
    key: "birthDate",
  },
  {
    label: "image",
    key: "image",
  },
  {
    label: "bloodGroup",
    key: "bloodGroup",
  },
  {
    label: "height",
    key: "height",
  },
  {
    label: "weight",
    key: "weight",
  },
  {
    label: "eyeColor",
    key: "eyeColor",
  },
];

export const columnsPos = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Название",
    key: "name",
  },
  {
    label: "Обозначение",
    key: "slug",
  },
  {
    label: "Адресс",
    key: "address",
  },
  {
    label: "Месячный план",
    key: "monthlyPlan",
  },
  {
    label: "Название организации",
    key: "posType",
  },
  {
    label: "Временная зона",
    key: "timezone",
  },
  {
    label: "Статус",
    key: "status",
  },
  {
    label: "Дата создания",
    key: "createdAt",
    type: "date",
  },
  {
    label: "Дата обновления",
    key: "updatedAt",
    type: "date",
  },
  {
    label: "Создал",
    key: "createdById",
  },
  {
    label: "Обновил",
    key: "updatedById",
  },
]
export const columnsOrg = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Название",
    key: "name",
  },
  {
    label: "Обозначение",
    key: "slug",
  },
  {
    label: "Адресс",
    key: "address",
  },
  {
    label: "Статус",
    key: "organizationStatus",
  },
  {
    label: "Тип",
    key: "organizationType",
  },
  {
    label: "Дата создания",
    key: "createdAt",
    type: "date",
  },
  {
    label: "Дата обновления",
    key: "updatedAt",
    type: "date",
  },
  {
    label: "Хозяин",
    key: "ownerId",
  },
]
export const columnsDevice = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Название",
    key: "name",
  },
  {
    label: "Статус",
    key: "status",
  },
  {
    label: "ip Адресс",
    key: "ipAddress",
  },
  {
    label: "Тип",
    key: "carWashDeviceType",
  },
  {
    label: "Принадлежит",
    key: "carWashPosName",
  },
]
export const columnsMonitoringPos = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Название",
    key: "name",
  },
  {
    label: "Город",
    key: "city",
  },
  {
    label: "Кол-во опреаций",
    key: "counter",
  },
  {
    label: "Наличные",
    key: "cashSum",
  },
  {
    label: "Безналичные",
    key: "virtualSum",
  },
  {
    label: "Яндекс Заправки",
    key: "yandexSum",
  },
  {
    label: "Последняя операция",
    key: "lastOper",
    type: "date",
  },
]

export const columnsMonitoringFullDevices = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Название",
    key: "name",
  },
  {
    label: "Кол-во опреаций",
    key: "counter",
  },
  {
    label: "Наличные",
    key: "cashSum",
  },
  {
    label: "Безналичные",
    key: "virtualSum",
  },
  {
    label: "Яндекс Заправки",
    key: "yandexSum",
  },
  {
    label: "Последняя операция",
    key: "lastOper",
    type: "date",
  },
]

export const columnsMonitoringDevice = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Сумма операции",
    key: "sumOper",
  },
  {
    label: "Дата операции",
    key: "dateOper",
    type: "date",
  },
  {
    label: "Дата загрузки",
    key: "dateLoad",
    type: "date",
  },
  {
    label: "Счетчик",
    key: "counter",
  },
  {
    label: "Локальный id",
    key: "localId",
  },
  {
    label: "Валюта",
    key: "currencyType",
  }
]

export const columnsProgramsPos = [
  {
    label: "Программа",
    key: "programName",
  },
  {
    label: "Кол-во программ",
    key: "counter",
  },
  {
    label: "Общее время мин.",
    key: "totalTime",
  },
  {
    label: "Среднее время мин.",
    key: "averageTime",
  },
  {
    label: "Последняя программа",
    key: "lastOper",
    type: "date",
  },
]

export const columnsProgramDevice = [
  {
    label: "id",
    key: "id",
  },
  {
    label: "Название",
    key: "name",
  },
  {
    label: "Начало программы",
    key: "dateBegin",
    type: "date",
  },
  {
    label: "Конец программы",
    key: "dateEnd",
    type: "date",
  },
  {
    label: "Время выполнения",
    key: "time",
  },
  {
    label: "Локальный id",
    key: "localId",
  },
  {
    label: "Оплата",
    key: "payType",
  },
  {
    label: "Машина",
    key: "isCar"
  }
]

