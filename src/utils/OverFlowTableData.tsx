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
    label: "Наименование",
    key: "name",
  },
  {
    label: "Город",
    key: "city",
  },
  {
    label: "Адрес",
    key: "address",
  },
  {
    label: "Кол-во операций",
    key: "quantity",
  },
  {
    label: "Последняя операция",
    key: "lastOper",
    type: "date",
  },
  {
    label: "Последняя Списание по картам",
    key: "lastLabelWriteOff"
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
    label: "Списание по приложению",
    key: "Writeoffapplication"
  },
  {
    label: "Сashback по картам",
    key: "cashbackSumCard"
  },
  {
    label: "Сумма скидки",
    key: "discountSum"
  },
  {
    label: "Кол-во опреаций",
    key: "counter",
  },  
  {
    label: "Яндекс Сумма",
    key: "yandexSum",
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

export const columnsEquipmentFailure = [
  {
    label: "Название объекта",
    key: "posId"
  },
  {
    label: "Тип объекта",
    key: "type"
  },
  {
    label: "Сотрудник",
    key: "workerId"
  },
  {
    label: "Дата вызова",
    key: "appearanceDate",
    type: "date"
  },
  {
    label: "Дата начала работы",
    key: "startDate",
    type: "date"
  },
  {
    label: "Дата окончания работы",
    key: "finishDate",
    type: "date"
  },
  {
    label: "Устройство",
    key: "objectName"
  },
  {
    label: "Узел",
    key: "equipmentKnot"
  },
  {
    label: "Проблема",
    key: "incidentName"
  },
  {
    label: "Причина",
    key: "incidentReason"
  },
  {
    label: "Принятые меры",
    key: "incidentSolution"
  },
  {
    label: "Замена",
    key: "repair"
  },
  {
    label: "Простой",
    key: "downtime"
  },
  {
    label: "Авто/час",
    key: "autoHour"
  },
  {
    label: "Комментарий",
    key: "comment"
  },
  {
    label: "Цена минуты",
    key: "pricePerMinute"
  },
  {
    label: "Проверка простоя",
    key: "idleCheck"
  },
  {
    label: "Стоимость простоя",
    key: "downtimeCost"
  },
  {
    label: "Авто на устройстве",
    key: "autoOnDevice"
  },
  {
    label: "Программа",
    key: "programId"
  }
]

export const columnsTechTasks = [
  {
    label: "Автомойка/ Филиал",
    key: "posId"
  },
  {
    label: "Наименование работ",
    key: "name"
  },
  {
    label: "Периодичность",
    key: "period"
  },
  {
    label: "Тип работы",
    key: "type"
  },
  {
    label: "Дата начала работ",
    key: "startDate",
    type: "date"
  }
]

export const columnsTechTasksRead = [
  {
    label: "№",
    key: "id"
  },
  {
    label: "Автомойка/ Филиал",
    key: "posId"
  },
  {
    label: "Наименование работ",
    key: "name"
  },
  {
    label: "Периодичность",
    key: "type"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Дата начала",
    key: "startWorkDate",
    type: "date"
  },
  {
    label: "Дата окончания",
    key: "sendWorkDate",
    type: "date"
  },
  {
    label: "Исполнитель",
    key: "executorId"
  }
]

export const columnsChemicalConsumption = [
  {
    label: "Период",
    key: "period"
  },
  {
    label: "Вода + шампунь, факт",
    key: "Вода + шампунь, факт"
  },
  {
    label: "Вода + шампунь, время",
    key: "Вода + шампунь, время"
  },
  {
    label: "Вода + шампунь, пересчет",
    key: "Вода + шампунь, пересчет"
  },
  {
    label: "Активная химия, факт",
    key: "Активная химия, факт"
  },
  {
    label: "Активная химия, время",
    key: "Активная химия, время"
  },
  {
    label: "Активная химия, пересчет",
    key: "Активная химия, пересчет"
  },
  {
    label: "Мойка дисков, факт",
    key: "Мойка дисков, факт"
  },
  {
    label: "Мойка дисков, время",
    key: "Мойка дисков, время"
  },
  {
    label: "Мойка дисков, пересчет",
    key: "Мойка дисков, пересчет"
  },
  {
    label: "Щетка + пена, факт",
    key: "Щетка + пена, факт"
  },
  {
    label: "Щетка + пена, время",
    key: "Щетка + пена, время"
  },
  {
    label: "Щетка + пена, пересчет",
    key: "Щетка + пена, пересчет"
  },
  {
    label: "Воск + защита, факт",
    key: "Воск + защита, факт"
  },
  {
    label: "Воск + защита, время",
    key: "Воск + защита, время"
  },
  {
    label: "Воск + защита, пересчет",
    key: "Воск + защита, пересчет"
  },
  {
    label: "T-POWER, факт",
    key: "T-POWER, факт"
  },
  {
    label: "T-POWER, время",
    key: "T-POWER, время"
  },
  {
    label: "T-POWER, пересчет",
    key: "T-POWER, пересчет"
  }
]

export const columnsConsumptionRate = [
  {
    label: "Программа",
    key: "programTypeName",
    render: (row) => <span>{row.programTypeName}</span>,
  },
  {
    label: "Расход литр/минута",
    key: "literRate",
    render: (row: { literRate: string | number | readonly string[] | undefined; id: any; }, handleChange: (arg0: any, arg1: string, arg2: string) => void) => (
      <input
        type="number"
        className="border border-gray-300 p-2 w-full"
        value={row.literRate}
        onChange={(e) => handleChange(row.id, "literRate", e.target.value)}
      />
    ),
  },
  {
    label: "Концентрация 1/х",
    key: "concentration",
    render: (row: { concentration: string | number | readonly string[] | undefined; id: any; }, handleChange: (arg0: any, arg1: string, arg2: string) => void) => (
      <input
        type="number"
        className="border border-gray-300 p-2 w-full"
        value={row.concentration}
        onChange={(e) => handleChange(row.id, "concentration", e.target.value)}
      />
    ),
  },
];


