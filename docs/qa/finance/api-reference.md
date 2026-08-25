# Finance API reference (из фронта)

Источник: `src/services/api/finance/index.ts`, `sale/index.ts`, `pos/index.ts`, `deviceDataRawFile.ts`.  
Документ для QA: сверка Network tab ↔ экран.

---

## Инкассация (`cash-collection`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `postCollection` | POST | `user/finance/cash-collection` | Создание, кнопка **Сформировать** |
| `recalculateCollection` | POST | `user/finance/cash-collection/recalculate/{id}` | Карточка, **Пересчитать** |
| `sendCollection` | POST | `user/finance/cash-collection/send/{id}` | Карточка, **Пересчитать и отправить** |
| `returnCollection` | PATCH | `user/finance/cash-collection/return/{id}` | Карточка, **Вернуть** |
| `getCollectionById` | GET | `user/finance/cash-collection/{id}` | Карточка |
| `deleteCollectionById` | DELETE | `user/finance/cash-collection/{id}` | Карточка, удаление (не SENT) |
| `getCollections` | GET | `user/finance/cash-collections` | Список |

Query списка: `dateStart`, `dateEnd`, `posId`, `placementId` (город), `page`, `size`, `organizationId`.

CASL / feature (backend): `CashCollection`, feature `CashCollection`. send/recalculate/delete — create; return — update; get/list — read.

---

## Отсечки (`time-stamp`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getTimestamp` | GET | `user/finance/time-stamp/{posId}` | Отсечки, после выбора АМС |
| `postTimestamp` | POST | `user/finance/time-stamp/{deviceId}` | Кнопка **Проинкассировал** |

Тело POST: `{ dateTimeStamp }` (в UI — `new Date()`).  
GET/POST: subject `CashCollection`, feature `CashCollection`.

---

## Табель (`shift-report`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getShifts` | GET | `user/finance/shift-reports` | Календарь |
| `createDayShift` | POST | `user/finance/shift/create` | Создание смены |
| `getDayShiftById` | GET | `user/finance/shift-report/{id}` | Просмотр смены |
| `updateDayShift` | PATCH | `user/finance/shift-report/{id}` | Оценка / сохранение |
| `deleteDayShift` | DELETE | `user/finance/shift-report/{id}` | Удаление (UI не SENT) |
| `sendDayShift` | POST | `user/finance/shift-report/send/{id}` | **Отправить** |
| `returnDayShift` | PATCH | `user/finance/shift-report/return/{id}` | **Вернуть** |
| `createCashOper` | POST | `user/finance/shift-report/oper/{id}` | Размен / возврат |
| `getCashOperById` | GET | `user/finance/shift-report/oper/{id}` | Размен |
| `getCashOperRefundById` | GET | `user/finance/shift-report/refund/{id}` | Возвраты |
| `getCashOperCleanById` | GET | `user/finance/shift-report/clean/{id}` | Уборка (только чтение) |
| `getCashOperSuspiciousById` | GET | `user/finance/shift-report/suspiciously/{id}` | Подозрительные (только чтение) |

Query календаря: `posId`, `dateStart`, `dateEnd`, `city`.  
Типы cash oper: `REPLENISHMENT` (размен), `REFUND` (возврат).  
CASL / feature: `ShiftReport`. send — create; return — update.

---

## Продажа (`sale`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getSaleDocuments` | GET | `user/sale/documents` | Список |
| `postSaleDocument` | POST | `user/sale/document` | Создание = проведение |
| `getSaleDocument` | GET | `user/sale/document/{id}` | Просмотр |
| `returnSaleDocument` | POST | `user/sale/document/return/{id}` | **Вернуть** |
| `getManagers` | GET | `user/sale/manager/{warehouseId}` | Выбор менеджера |
| `getAllStockLevelSales` | GET | `user/warehouse/inventory-item/sale/{warehouseId}` | Позиции с остатком и ценой |

CRUD цен `user/sale/price` экраны продажи **не** вызывают.  
CASL create документа: `ManagerPaper` create. Return: `Warehouse` update.

---

## Ложные зачисления и сырой файл

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getFalseDepositDevice` | GET | `/user/pos/false-operations/{posId}` | Список ложных |
| `getFalseDepositDeviceById` | GET | `/user/device/false-operations/{deviceId}` | Карточка устройства |
| `deleteFalseOperations` | DELETE | `/user/device/operations` | Удаление отмеченных (`{ ids }`) |
| `getPresignedUploadUrl` | POST | `/user/s3/presigned-url` | Загрузка файла |
| `registerDeviceDataRawFile` | POST | `/user/device/data-raw-file` | Регистрация ключа `{ key }` |

Ключ S3: `device-data-raw/{timestamp}-{filename}`.  
Subject: `Pos`. Отдельной сущности false-deposit нет.

---

## Статьи и справочник (`manager-paper`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createManagerPaper` | POST | `user/manager-paper` | Статьи, создание (multipart, опционально `file`) |
| `updateManagerPaper` | PATCH | `user/manager-paper` | Статьи, правка строки (multipart) |
| `getAllManagerPaper` | GET | `user/manager-paper` | Список статей |
| `deleteManagerPapers` | DELETE | `user/manager-paper/many` | **Удалить выбранное** |
| `getAllManagerPaperGraph` | GET | `user/manager-paper/statistic` | Карточки Доходы/Расходы/Баланс |
| `getAllManagerPaperTypes` | GET | `user/manager-paper/type` | Статьи (выбор типа), справочник |
| `createManagerPaperType` | POST | `user/manager-paper/type` | Справочник, создание |
| `updateManagerPaperType` | PATCH | `user/manager-paper/type` | Справочник, правка |

CASL: статьи create — `create`; patch на backend повешен на **delete** ability; delete — `delete`; типы create/update — **`update`**. Feature `ManagerPaper`.

Автостатья инкассации **не** создаётся этими POST: только событие после `send` cash-collection. Автостатья продажи — событие после `POST user/sale/document`.

---

## Отчет за период (`manager-paper/period`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createManagerPaperPeriod` | POST | `user/manager-paper/period` | Список, drawer |
| `updateManagerPaperPeriod` | PATCH | `user/manager-paper/period` | Список, inline-save |
| `sendManagerPaperPeriod` | PATCH | `user/manager-paper/period/send/{id}` | **Карточка** edit (**Отправить**). Список меню send API **не** вызывает |
| `returnManagerPaperPeriod` | PATCH | `user/manager-paper/period/return/{id}` | Карточка (**Возвраты**). Список меню return API **не** вызывает |
| `getAllManagerPeriods` | GET | `user/manager-paper/period` | Список |
| `getManagerPeriodById` | GET | `user/manager-paper/period/{id}` | Карточка |
| `deleteManagerPaperPeriod` | DELETE | `user/manager-paper/period/{id}` | Список и карточка (не SENT) |

CASL: create/update/send/delete периода — **create**; return — **update**; get — read. Feature `ManagerPaper`.

---

## Партнёры (`finance-partner`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createPosCalculation` | POST | `user/finance-partner/pos-calculation` | Процент объектов |
| `getPosCalculations` | GET | `user/finance-partner/pos-calculations` | Процент объектов |
| `updatePosCalculation` | PATCH | `user/finance-partner/pos-calculation` | Процент объектов |
| `createPosPartnerPercent` | POST | `user/finance-partner/pos-partner-percent` | Доли |
| `deletePosPartnerPercent` | PATCH | `user/finance-partner/pos-partner-percent/delete` | Снять долю |
| `getPosByCalculation` | GET | `user/finance-partner/pos-by-calculation` | Объекты расчёта |
| `getWorkerPartners` | GET | `user/permission/worker-partner/{orgId}` | Список партнёров |
| `createPosPartnerReport` | POST | `user/finance-partner/pos-partner-report` | Расчет прибыли |
| `getPosPartnerReports` | GET | `user/finance-partner/pos-partner-reports` | Расчет прибыли |
| `updatePosPartnerReport` | PATCH | `user/finance-partner/pos-partner-report` | Файл / суммы |
| `getPosPartnerReportsMe` | GET | `user/finance-partner/pos-partner-reports/me` | **Мои Отчеты** |

Subject: `PartnerReport`. Исключения суммы долей ≠ 100% «только разработчик» в ТК не входят.

---

## Вспомогательные

| Function | Method | Path | Зачем |
|----------|--------|------|-------|
| `getAllWorkers` | GET | `user/permission/worker-by-pos/{posId}` | Сотрудники на объекте (инкассация, табель) |
| `getWorkerManager` | GET | `user/permission/worker-manger/{orgId}` | Ответственный на инкассации (`?name=`) |
