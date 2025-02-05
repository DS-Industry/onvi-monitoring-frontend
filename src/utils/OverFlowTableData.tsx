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
    type: "number"
  },
  {
    label: "Организация",
    key: "organizationName"
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
  }
]
export const columnsOrg = [
  {
    label: "id",
    key: "id",
  },
  // {
  //   label: "Название",
  //   key: "name",
  // },
  // {
  //   label: "Обозначение",
  //   key: "slug",
  // },
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
    key: "ownerName",
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
    type: "number"
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
    type: "number"
  },
  {
    label: "Безналичные",
    key: "virtualSum",
    type: "number"
  },
  {
    label: "Списание по приложению",
    key: "Writeoffapplication"
  },
  {
    label: "Сashback по картам",
    key: "cashbackSumCard",
    type: "number"
  },
  {
    label: "Сумма скидки",
    key: "discountSum",
    type: "number"
  },
  {
    label: "Кол-во опреаций",
    key: "counter",
    type: "number"
  },
  {
    label: "Яндекс Сумма",
    key: "yandexSum",
    type: "number"
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
    type: "number"
  },
  {
    label: "Безналичные",
    key: "virtualSum",
    type: "number"
  },
  {
    label: "Яндекс Заправки",
    key: "yandexSum",
    type: "number"
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
    type: "number"
  },
  {
    label: "Локальный id",
    key: "localId",
    type: "number"
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
    type: "number"
  },
  {
    label: "Общее время мин.",
    key: "totalTime",
    type: "number"
  },
  {
    label: "Среднее время мин.",
    key: "averageTime",
    type: "number"
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
    type: "number"
  },
  {
    label: "Локальный id",
    key: "localId",
    type: "number"
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
    key: "posName"
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
    render: (row: { programTypeName: string; }) => <span>{row.programTypeName}</span>,
  },
  {
    label: "Расход литр/минута",
    key: "literRate",
    render: (row: { literRate: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
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
    render: (row: { concentration: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
      <input
        type="number"
        className="border border-gray-300 p-2 w-full"
        value={row.concentration}
        onChange={(e) => handleChange(row.id, "concentration", e.target.value)}
      />
    ),
  },
];

export const columnsInventory = [
  {
    label: "Код",
    key: "id"
  },
  {
    label: "Номенклатура",
    key: "name"
  },
  // {
  //   label: "Артикул",
  //   key: "sku"
  // },
  // {
  //   label: "Organization",
  //   key: "organizationId"
  // },
  // {
  //   label: "Supplier",
  //   key: "supplierId"
  // },
  {
    label: "Категория",
    key: "categoryId"
  }
  // {
  //   label: "Measurement",
  //   key: "measurement"
  // }
];

export const columnsCategory = [
  {
    label: "Название группы",
    key: "name"
  },
  {
    label: "Описание",
    key: "description"
  },
];

export const columnsAllDocuments = [
  {
    label: "№",
    key: "id"
  },
  {
    label: "Номер",
    key: "name"
  },
  {
    label: "Дата",
    key: "carryingAt",
    type: "date"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Вид документа",
    key: "type"
  },
  {
    label: "Склад",
    key: "warehouseName"
  },
  {
    label: "Ответственный",
    key: "responsibleName"
  }
]

export const columnsInventoryItems = [
  {
    label: "Код",
    key: "nomenclatureId"
  },
  {
    label: "Наименование товара",
    key: "nomenclatureName"
  }
]

export const columnsSupplier = [
  {
    label: "№",
    key: "id"
  },
  {
    label: "Ниименование",
    key: "name"
  },
  {
    label: "Контакт",
    key: "contact"
  },
];

export const columnsClient = [
  {
    label: "Тип клиента",
    key: "type"
  },
  {
    label: "Имя клиента",
    key: "name"
  }
]

export const columnsCollections = [
  {
    label: "Тип",
    key: "typeName",
    render: (row: { typeName: string; }) => <span>{row.typeName}</span>,
  },
  {
    label: "Купюры",
    key: "sumPaperDeviceType",
    render: (row: { sumPaperDeviceType: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
      <input
        type="number"
        className="border border-opacity01 rounded-md px-3 py-2 w-full bg-background05"
        placeholder="00,00"
        value={row.sumPaperDeviceType}
        onChange={(e) => handleChange(row.id, "sumPaperDeviceType", e.target.value)}
      />
    ),
  },
  {
    label: "Монеты",
    key: "sumCoinDeviceType",
    render: (row: { sumCoinDeviceType: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
      <input
        type="number"
        className="border border-opacity01 rounded-md px-3 py-2 w-full bg-background05"
        placeholder="00,00"
        value={row.sumCoinDeviceType}
        onChange={(e) => handleChange(row.id, "sumCoinDeviceType", e.target.value)}
      />
    ),
  },
  {
    label: "Сумма всего",
    key: "sumFactDeviceType",
    type: "number",
    render: (row: { sumFactDeviceType: string; }) => <span>{row.sumFactDeviceType}</span>,
  },
  {
    label: "Недостача",
    key: "shortageDeviceType",
    type: "number",
    render: (row: { shortageDeviceType: string; }) => <span>{row.shortageDeviceType}</span>,
  },
  {
    label: "Безналичная оплата",
    key: "virtualSumDeviceType",
    type: "number",
    render: (row: { virtualSumDeviceType: string; }) => <span>{row.virtualSumDeviceType}</span>,
  }
]

export const columnsDeviceData = [
  {
    label: "Код",
    key: "deviceId"
  },
  {
    label: "Название",
    key: "deviceName"
  },
  {
    label: "Тип",
    key: "deviceType"
  },
  {
    label: "Предыдущая инкассация",
    key: "oldTookMoneyTime",
    type: "date"
  },
  {
    label: "Текущая инкассация",
    key: "tookMoneyTime",
    type: "date"
  },
  {
    label: "Купюры",
    key: "sumPaperDevice"
  },
  {
    label: "Монеты",
    key: "sumCoinDevice"
  },
  {
    label: "Сумма всего",
    key: "sumDevice"
  },
  {
    label: "Безналичная оплата",
    key: "virtualSumDevice"
  }
]


