# QA: раздел Оборудование (equipment)

Документация для тестировщиков и менеджеров продукта по разделу **Оборудование**.

## Как читать документы

В файлах `01`–`08` порядок блоков:

1. **О странице** — зачем экран, что менеджерит, кто пользуется, связи, правила.
2. **Тест-кейсы (ТК-\*)** — предусловия + таблица **Шаг | Действие | Ожидаемый результат**.

Общая модель и словарь: [00-overview.md](./00-overview.md).  
Как работает контур: [00-how-it-works.md](./00-how-it-works.md).  
Чеклист: [qa-checklist.md](./qa-checklist.md).  
HTTP-справка: [api-reference.md](./api-reference.md).

Домен backend: `src/core/equipment-core/` (`techTask`, `equipment/incident`, `techExpenseReport`); моточасы и простой устройств — `src/core/business-core/pos/device/`.

Складские сценарии здесь **не** описывать. Связь одна: отчёт по расходу после отправки может создать складской документ типа **Передача в эксплуатацию** (`COMMISSIONING`). См. [Склад → Документы](../warehouse/02-documents.md). Статья финучёта **не** создаётся.

## Предусловия для теста

1. План организации **BUSINESS** или **CUSTOM**.
2. Права по subject экрана: **`Incident`**, **`TechTask`** (на экране указано, какие именно).
3. Выбрана организация в сессии.
4. Есть хотя бы один объект (АМС) с устройствами.

## Оглавление сценариев

| Документ | Экраны |
|----------|--------|
| [00-overview.md](./00-overview.md) | Модель раздела, словарь, доступы |
| [00-how-it-works.md](./00-how-it-works.md) | Сценарий пользователя, формулы, расхождения |
| [01-tech-tasks.md](./01-tech-tasks.md) | Технические задачи (контекст + ТК T) |
| [02-failures.md](./02-failures.md) | Поломки оборудования (контекст + ТК B) |
| [03-chemical.md](./03-chemical.md) | Расход химии (контекст + ТК H) |
| [04-consumption-rate.md](./04-consumption-rate.md) | Норма расхода (контекст + ТК N) |
| [05-consumables.md](./05-consumables.md) | Расходники объекта (контекст + ТК C) |
| [06-expense-report.md](./06-expense-report.md) | Отчет по расходу (контекст + ТК E) |
| [07-engine-hours.md](./07-engine-hours.md) | Моточасы (контекст + ТК M) |
| [08-idle-devices.md](./08-idle-devices.md) | Простой платежных устройств (контекст + ТК D) |
| [api-reference.md](./api-reference.md) | Справочник HTTP (для отладки Network) |
| [qa-checklist.md](./qa-checklist.md) | Сводный чеклист Pass/Fail |

## Быстрая карта меню

Полное меню **Оборудование** из `src/routes/index.tsx` и `routes.*` в `src/config/i18n/locales/ru/ru.json`.

| Пункт меню RU | Куда ведёт | Документ |
|---------------|------------|----------|
| Расход химии | `/equipment/chemical/consumption` | 03 |
| Технические задачи | `/equipment/technical/tasks` | 01, группа |
| Список задач | `/equipment/technical/tasks/list` | 01 |
| Норма расхода | `/equipment/consumption/rate` | 04 |
| ОтЧЕТЫ | заголовок секции (`routes.from`) | — |
| Поломки оборудования | `/equipment/failure` | 02 |
| Расходники объекта | `/equipment/object-consumables` | 05 |
| Отчет по расходу | `/equipment/expense-report` | 06 |
| Моточасы | `/equipment/engine-hours` | 07 |
| Простой платежных устройств | `/equipment/idle-payment-devices` | 08 |

Только по URL / из списка: `/equipment/expense-report/edit`. Маршрут `/equipment/technical/tasks/list/item` в роутере есть, из UI списка **не** открывается (карточка — модалка).

Источники: фронт `src/routes/index.tsx`, `src/pages/Equipment/`, `src/services/api/equipment/index.ts`; backend `src/app/platform-user/core-controller/incident.ts`, `equipment.ts`, `techTask.ts`, `techExpense.ts`, `device.ts`; prisma `TechTask*`, `Incident`, `TechExpense*`, `TechConsumables`, `ProgramTechRate`.
