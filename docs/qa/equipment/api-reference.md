# Equipment API reference (из фронта)

Источник: `src/services/api/equipment/index.ts`.  
Документ для QA: сверка Network tab ↔ экран.

Префикс путей как в клиенте: `user/...`.

---

## Инциденты (`incident`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getIncident` | GET | `user/incident` | Поломки, список |
| `createIncident` | POST | `user/incident` | **Зафиксировать поломку** |
| `updateIncident` | PATCH | `user/incident` | Редактирование / закрытие |
| `createSimpleIncident` | POST | `user/incident/simple` | **Заявить о поломке** |

Query GET: `dateStart`, `dateEnd`, `posId?`, `placementId?` (`city`).  
Simple body: `posId`, `workerId`, `appearanceDate`, `comment`.  
CASL / feature (backend): полный create — **UpdateIncident**, feature `Incident`; simple — **CreateIncident**; GET списка без AbilitiesGuard.

---

## Справочники для поломок / задач

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getPoses` | GET | `user/pos/filter` | фильтры объектов |
| `getWorkers` | GET | `user/permission/worker/{orgId}` | поломки, фильтр исполнителя задач |
| `getDevices` | GET | `user/device/filter/pos/{posId}` | полная форма поломки |
| `getEquipmentKnots` | GET | `user/equipment/pos/{posId}` | узлы |
| `getIncidentEquipmentKnots` | GET | `user/equipment/incident-info/{id}` | узлы инцидента |
| `getPrograms` | GET | `user/device/program/type` | программа в поломке |

---

## Техзадачи (`tech-task`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createTechTask` | POST | `user/tech-task` | **Создать задачу** |
| `updateTechTask` | PATCH | `user/tech-task` | карточка: сохранить, PAUSE, RETURNED, FINISHED |
| `deleteTechTask` | DELETE | `user/tech-task/{id}` | карточка |
| `bulkDeleteTechTasks` | DELETE | `user/tech-task/bulk/delete` | список |
| `getTechTaskExecution` | GET | `user/tech-task/me` | список |
| `getTechTaskItem` | GET | `user/tech-task/item` | шаблоны |
| `getTechTaskShapeItem` | GET | `user/tech-task/{id}` | карточка |
| `createTechTaskShape` | POST | `user/tech-task/{id}` | **Завершить** (значения) |
| `createTechTaskShapeWithUrls` | POST | `user/tech-task/{id}/with-urls` | страница `/list/item` (из меню не открывается) |
| `getTags` | GET | `user/tech-task/tag` | теги |
| `createTag` | POST | `user/tech-task/tag` | в экранах списка задач **не** вызывается |
| `getTechTaskComments` | GET | `user/tech-task/{id}/comments` | комментарии |
| `createTechTaskComment` | POST | `user/tech-task/{id}/comments` | комментарии |
| `getTechTaskManage` | GET | `user/tech-task/manage` | в Equipment UI **не** вызывается |
| `getTechTaskReport` | GET | `user/tech-task/report` | в Equipment UI **не** вызывается |

Query списка `/me`: `posId`, `status`, `page`, `size`, `organizationId`, `name`, `tags`, `startDate`, `endDate`, `authorId`, `executorId`.  
Feature backend: `TechTask`. Chemistry-report — `ReadIncidentAbility`.

---

## Химия и нормы

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getChemicalReport` | GET | `user/tech-task/chemistry-report` | Расход химии |
| `getConsumptionRate` | GET | `user/equipment/rate/{posId}` | Норма расхода |
| `patchProgramCoefficient` | PATCH | `user/equipment/rate/{id}` | **Сохранить** нормы |

Query химии: `dateStart`, `dateEnd`, `posId`, `placementId`.  
PATCH body: `valueData[{ programTechRateId, literRate, concentration }]`.  
Feature: `TechTask`. Rate GET — ReadIncident; PATCH — UpdateIncident.

---

## Расходники и отчёт по расходу (`tech-expense`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getTechConsumables` | GET | `user/tech-expense/consumables/{posId}` | Расходники |
| `createTechConsumables` | POST | `user/tech-expense/consumables` | добавить связь |
| `deleteTechConsumables` | DELETE | `user/tech-expense/consumables/many` | удалить |
| `getTechExpenseReports` | GET | `user/tech-expense/report` | список отчётов |
| `createTechExpenseReport` | POST | `user/tech-expense/report` | **Добавить** |
| `getTechExpenseReport` | GET | `user/tech-expense/report/{reportId}` | карточка |
| `recalculateTechExpenseReport` | POST | `user/tech-expense/report/recalculate/{reportId}` | **Пересчитать** |
| `sendTechExpenseReport` | POST | `user/tech-expense/report/send/{reportId}` | **Отправить** |
| `sendWarehouseTechExpenseReport` | POST | `user/tech-expense/report/send-warehouse/{reportId}` | **Провести на складе** |
| `cancelWarehouseTechExpenseReport` | POST | `user/tech-expense/report/cancel-warehouse/{reportId}` | **Отменить проведение по складу** |
| `returnTechExpenseReport` | POST | `user/tech-expense/report/return/{reportId}` | **Вернуть** |
| `deleteTechExpenseReport` | DELETE | `user/tech-expense/report/{reportId}` | удаление |

Query списка отчётов: `startPeriod`, `endPeriod`, `posId`, `page`, `size`.  
Feature: `TechTask`. `@CheckAbilities` на cancel-warehouse — UpdateTechTask; остальные expense-endpoint’ы без CheckAbilities в контроллере. Складской тип: `COMMISSIONING`.

---

## Моточасы и простой (`device`)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getEngineHours` | GET | `user/device/tech-params/engine-hours` | Моточасы |
| `updateDeviceTechParams` | PATCH | `user/device/tech-params/{deviceId}` | inline-edit |
| `getDowntime` | GET | `user/device/downtime` | Простой платежных устройств |

Engine-hours query: `dateStart`, `dateEnd`, `placementIds`, `posIds`, `excess`, `organizationId`.  
Downtime query: `dateStart`, `dateEnd`, `placementIds`, `posIds`, `downtimeType`, `organizationId`, `page`, `size`.  
Ability: ReadIncident; feature `TechTask`.
