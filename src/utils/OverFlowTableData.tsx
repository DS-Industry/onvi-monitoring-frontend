import Input from "@/components/ui/Input/Input";

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
    label: "Страна",
    key: "country",
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
    label: "Организация",
    key: "organizationName"
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
    key: "createdByName",
  },
  {
    label: "Обновил",
    key: "updatedByName",
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
    label: "Общее время (мин)",
    key: "totalTime",
    type: "number"
  },
  {
    label: "Среднее время (мин)",
    key: "averageTime",
    type: "number"
  },
  {
    label: "Последняя программа",
    key: "lastOper",
    type: "date",
  },
]

export const columnsProgramsPosPortal = [
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
    label: "Общее время (мин)",
    key: "totalTime",
    type: "number"
  },
  {
    label: "Среднее время (мин)",
    key: "averageTime",
    type: "number"
  },
  {
    label: "Выручка по программам",
    key: "totalProfit",
    type: "number"
  },
  {
    label: "Средний чек",
    key: "averageProfit",
    type: "number"
  }
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
    key: "posName"
  },
  {
    label: "Тип объекта",
    key: "type"
  },
  {
    label: "Сотрудник",
    key: "workerName"
  },
  {
    label: "Дата поломки",
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
    label: "Время исправления",
    key: "repair"
  },
  {
    label: "Простой",
    key: "downtime"
  },
  {
    label: "Комментарий",
    key: "comment"
  },
  {
    label: "Программа",
    key: "programName"
  }
]

export const columnsTechTasks = [
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
    key: "Вода + шампунь, факт",
    type: "number"
  },
  {
    label: "Вода + шампунь, время",
    key: "Вода + шампунь, время",
    type: "number"
  },
  {
    label: "Вода + шампунь, пересчет",
    key: "Вода + шампунь, пересчет",
    type: "number"
  },
  {
    label: "Активная химия, факт",
    key: "Активная химия, факт",
    type: "number"
  },
  {
    label: "Активная химия, время",
    key: "Активная химия, время",
    type: "number"
  },
  {
    label: "Активная химия, пересчет",
    key: "Активная химия, пересчет",
    type: "number"
  },
  {
    label: "Мойка дисков, факт",
    key: "Мойка дисков, факт",
    type: "number"
  },
  {
    label: "Мойка дисков, время",
    key: "Мойка дисков, время",
    type: "number"
  },
  {
    label: "Мойка дисков, пересчет",
    key: "Мойка дисков, пересчет",
    type: "number"
  },
  {
    label: "Щетка + пена, факт",
    key: "Щетка + пена, факт",
    type: "number"
  },
  {
    label: "Щетка + пена, время",
    key: "Щетка + пена, время",
    type: "number"
  },
  {
    label: "Щетка + пена, пересчет",
    key: "Щетка + пена, пересчет",
    type: "number"
  },
  {
    label: "Воск + защита, факт",
    key: "Воск + защита, факт",
    type: "number"
  },
  {
    label: "Воск + защита, время",
    key: "Воск + защита, время",
    type: "number"
  },
  {
    label: "Воск + защита, пересчет",
    key: "Воск + защита, пересчет",
    type: "number"
  },
  {
    label: "T-POWER, факт",
    key: "T-POWER, факт",
    type: "number"
  },
  {
    label: "T-POWER, время",
    key: "T-POWER, время",
    type: "number"
  },
  {
    label: "T-POWER, пересчет",
    key: "T-POWER, пересчет",
    type: "number"
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
      <Input
        type="number"
        value={row.literRate}
        changeValue={(e) => handleChange(row.id, "literRate", e.target.value)}
        error={row.literRate < 0}
      />
    ),
  },
  {
    label: "Концентрация 1/х",
    key: "concentration",
    render: (row: { concentration: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
      <Input
        type="number"
        value={row.concentration}
        changeValue={(e) => handleChange(row.id, "concentration", e.target.value)}
        error={row.concentration < 0}
      />
    ),
  },
];

export const columnsInventory = [
  {
    label: "Код",
    key: "sku"
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
      <Input
        type="number"
        // className="border border-opacity01 rounded-md px-3 py-2 w-full bg-background05"
        placeholder="00,00"
        value={row.sumPaperDeviceType}
        error={!row.sumPaperDeviceType}
        helperText={!row.sumPaperDeviceType ? "Sum Paper Device type is required." : undefined}
        changeValue={(e) => handleChange(row.id, "sumPaperDeviceType", e.target.value)}
      />
    ),
  },
  {
    label: "Монеты",
    key: "sumCoinDeviceType",
    render: (row: { sumCoinDeviceType: number; id: number; }, handleChange: (arg0: number, arg1: string, arg2: string) => void) => (
      <Input
        type="number"
        // className="border border-opacity01 rounded-md px-3 py-2 w-full bg-background05"
        placeholder="00,00"
        value={row.sumCoinDeviceType}
        error={!row.sumCoinDeviceType}
        helperText={!row.sumCoinDeviceType ? "Sum Coin Device type is required." : undefined}
        changeValue={(e) => handleChange(row.id, "sumCoinDeviceType", e.target.value)}
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
    key: "sumPaperDevice",
    type: "number"
  },
  {
    label: "Монеты",
    key: "sumCoinDevice",
    type: "number"
  },
  {
    label: "Сумма всего",
    key: "sumDevice",
    type: "number"
  },
  {
    label: "Безналичная оплата",
    key: "virtualSumDevice",
    type: "number"
  }
]

export const columnsCollectionsData = [
  {
    label: "№ Документа",
    key: "id"
  },
  {
    label: "Мойка/Филиал",
    key: "posId"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Период",
    key: "period"
  },
  {
    label: "Инкассация",
    key: "sumFact"
  },
  {
    label: "Сумма по картам",
    key: "sumCard"
  },
  {
    label: "Безналичная оплата",
    key: "sumVirtual"
  },
  {
    label: "Прибыль",
    key: "profit"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Недостача",
    key: "shortage"
  }
]

export const columnsShifts = [
  {
    label: "Мойка/филиал",
    key: "posName"
  },
  {
    label: "Период",
    key: "period",
    type: "period"
  },
  {
    label: "Дата форматирования",
    key: "createdAt",
    type: "date"
  },
  {
    label: "Ответственный",
    key: "createdByName"
  },
  {
    label: "Изменения в отчете",
    key: "updatedAt",
    type: "date"
  }
]

export const columnsDataCashOper = [
  {
    label: "На начало смены",
    key: "cashAtStart",
    type: "number"
  },
  {
    label: "Пополнение",
    key: "replenishmentSum",
    type: "number"
  },
  {
    label: "Расход",
    key: "expenditureSum",
    type: "number"
  },
  {
    label: "На конец смены",
    key: "cashAtEnd",
    type: "number"
  }
]

export const columnsDataCashOperRefund = [
  {
    label: "Устройство",
    key: "deviceName"
  },
  {
    label: "Дата и время",
    key: "eventDate",
    type: "date"
  },
  {
    label: "Сумма",
    key: "sum",
    type: "number"
  },
  {
    label: "Комментарий",
    key: "comment"
  }
]

export const columnsDataCashOperCleaning = [
  {
    label: "Наименование",
    key: "deviceName"
  },
  {
    label: "Программа",
    key: "programName"
  },
  {
    label: "Кол-во программ",
    key: "countProgram",
    type: "number"
  },
  {
    label: "Общее время",
    key: "time"
  }
]

export const columnsDataCashOperSuspiciously = [
  {
    label: "Устройство",
    key: "deviceName"
  },
  {
    label: "Время включения",
    key: "programDate",
    type: "date"
  },
  {
    label: "Программа",
    key: "programName"
  },
  {
    label: "Время работы",
    key: "programTime"
  },
  {
    label: "Время включения (Предыдущая)",
    key: "lastProgramDate",
    type: "date"
  },
  {
    label: "Программа (Предыдущая)",
    key: "lastProgramName"
  },
  {
    label: "Время работы (Предыдущая)",
    key: "lastProgramTime"
  }
]

export const columnsEmployees = [
  {
    label: "ФИО Сотрудника",
    key: "name"
  },
  {
    label: "Должность",
    key: "position"
  },
  {
    label: "Роль СRM",
    key: "roleName"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Работает с",
    key: "createdAt"
  }
]

export const columnsRoles = [
  {
    label: "Роль СRM",
    key: "name"
  },
  {
    label: "Права доступа",
    key: "description"
  }
] 

export const columnsTransactions = [
  {
    label: "Отчет",
    key: "reportTemplateId"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Дата начала создания",
    key: "startTemplateAt",
    type: "date"
  },
  {
    label: "Дата окончания создания",
    key: "endTemplateAt",
    type: "date"
  }
]

export const columnsWarehouses = [
  {
    label: "Наименование",
    key: "name"
  },
  {
    label: "Расположение",
    key: "location"
  },
  {
    label: "Менеджер",
    key: "manager"
  },
  {
    label: "Автомойка/ Филиал",
    key: "posName"
  }
]

export const columnsPlanFact = [
  {
    label: "ID",
    key: "posId"
  },
  {
    label: "Название",
    key: "posName"
  },
  {
    label: "План за указанный период",
    key: "plan",
    type: "number"
  },
  {
    label: "Наличные",
    key: "cashFact",
    type: "number"
  },
  {
    label: "Безналичные",
    key: "virtualSumFact",
    type: "number"
  },
  {
    label: "Яндекс зачисления",
    key: "yandexSumFact",
    type: "number"
  },
  {
    label: "Факт итог",
    key: "sumFact",
    type: "number"
  },
  {
    label: "Выполнен план",
    key: "completedPercent",
    type: "percent"
  },
  {
    label: "Не выполнен план",
    key: "notCompletedPercent",
    type: "percent"
  }
]

export const columnsEmployee = [
  {
    label: "ФИО Сотрудника",
    key: "name"
  },
  {
    label: "Город",
    key: "placement"
  },
  {
    label: "Организация",
    key: "organization"
  },
  {
    label: "Должность",
    key: "position"
  },
  {
    label: "Месячный оклад",
    key: "monthlySalary",
    type: "number"
  },
  {
    label: "Дневной оклад",
    key: "dailySalary",
    type: "number"
  },
  {
    label: "Проценты",
    key: "percentageSalary",
    type: "number"
  }
]

export const columnsPositions = [
  {
    label: "Должность",
    key: "name"
  },
  {
    label: "Описание",
    key: "description"
  }
]

export const columnsSalaryCalcCreation = [
  {
    label: "Мойка/Филиал",
    key: "posName"
  },
  {
    label: "ФИО Сотрудника",
    key: "fullName"
  },
  {
    label: "Должность",
    key: "jobTitle"
  },
  {
    label: "Оклад",
    key: "salary",
    type: "number"
  },
  {
    label: "Посменное начисление",
    key: "shift",
    type: "number"
  },
  {
    label: "Процент",
    key: "percent",
    type: "number"
  },
  {
    label: "Количество отработанных смен",
    key: "shifts",
    type: "number"
  }
]

export const columnsClients = [
  {
    label: "Тип клиента",
    key: "type"
  },
  {
    label: "Имя клиента",
    key: "name"
  },
  {
    label: "Город",
    key: "city"
  },
  {
    label: "Телефон",
    key: "phone"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Теги",
    key: "tags",
    type: "tags"
  },
  {
    label: "Комментарий",
    key: "comment"
  }
]

export const columnsLoyaltyPrograms = [
  {
    label: "Название программы",
    key: "name"
  },
  {
    label: "Статус",
    key: "status"
  },
  {
    label: "Дата запуска",
    key: "startDate",
    type: "date"
  }
]