# QA: раздел Управление (finance)

Документация для тестировщиков и менеджеров продукта по разделу **Управление**.

## Как читать документы

В файлах `01`–`09` порядок блоков:

1. **О странице** — зачем экран, что менеджерит, кто пользуется, связи, правила.
2. **Тест-кейсы (ТК-\*)** — предусловия + таблица **Шаг | Действие | Ожидаемый результат**.

Общая модель и словарь: [00-overview.md](./00-overview.md).  
Как работает контур: [00-how-it-works.md](./00-how-it-works.md).  
Чеклист прогона: [qa-checklist.md](./qa-checklist.md).  
HTTP-справка: [api-reference.md](./api-reference.md).

Домен backend: `src/core/finance-core/cashCollection/`, `src/core/manager-paper-core/`.

Продажа при проведении сама создаёт статью — в **Статьях** ту же продажу не дублировать. Табель на статьи не влияет.

## Предусловия для теста

1. План организации **SPACE**, **BUSINESS** или **CUSTOM**.
2. Права по subject экрана: **`CashCollection`**, **`ManagerPaper`**, **`ShiftReport`**, **`Pos`**, **`PartnerReport`** (на экране указано, какие именно).
3. Выбрана организация в сессии.
4. Есть хотя бы один объект (АМС / POS) с устройствами.

## Оглавление сценариев

| Документ                                     | Экраны                                          |
| -------------------------------------------- | ----------------------------------------------- |
| [00-overview.md](./00-overview.md)           | Модель раздела, словарь, доступы                |
| [00-how-it-works.md](./00-how-it-works.md)   | Сценарий пользователя, формулы, расхождения     |
| [01-collection.md](./01-collection.md)       | Инкассация: список + создание (контекст + ТК C) |
| [02-timestamps.md](./02-timestamps.md)       | Отсечки (контекст + ТК T)                       |
| [03-articles.md](./03-articles.md)           | Статьи (контекст + ТК A)                        |
| [04-directory.md](./04-directory.md)         | Справочник статей (контекст + ТК D)             |
| [05-period-report.md](./05-period-report.md) | Отчет за период (контекст + ТК P)               |
| [06-timesheet.md](./06-timesheet.md)         | Табель (контекст + ТК W)                        |
| [07-sale.md](./07-sale.md)                   | Продажа (контекст + ТК Y)                       |
| [08-debug.md](./08-debug.md)                 | Отладка (контекст + ТК F)                       |
| [09-partners.md](./09-partners.md)           | Расчет с партнерами (контекст + ТК N)           |
| [api-reference.md](./api-reference.md)       | Справочник HTTP (для отладки Network)           |
| [qa-checklist.md](./qa-checklist.md)         | Сводный чеклист Pass/Fail                       |

## Быстрая карта меню

Полное меню **Управление** из `src/routes/index.tsx` и `routes.*` в `src/config/i18n/locales/ru/ru.json`.

| Пункт меню RU                 | Куда ведёт                                         | Документ |
| ----------------------------- | -------------------------------------------------- | -------- |
| Инкассация                    | `/finance/collection`                              | 01       |
| Отсечки                       | `/finance/timestamp`                               | 02       |
| Табель учета рабочего времени | `/finance/timesheet`                               | 06       |
| Просмотр табеля               | `/finance/timesheet/view`                          | 06       |
| Финансовый учет               | `/finance/financial/accounting`                    | группа   |
| Статьи                        | `/finance/financial/accounting/articles`           | 03       |
| Справочник статей             | `/finance/financial/accounting/directory/articles` | 04       |
| Отчет за период               | `/finance/report/period`                           | 05       |
| Продажа                       | `/finance/saleDocument`                            | 07       |
| Отладка                       | `/finance/debugging`                               | 08, группа; тот же path у группы партнёров |
| Ложные зачисления             | `/finance/debugging/false/deposits`                | 08       |
| Загрузка файла с операциями   | `/finance/debugging/device-data-raw/upload`        | 08       |
| Расчет с партнерами           | `/finance/debugging` (группа)                      | 09       |
| Расчет прибыли                | `/finance/settlements-partners/profit-calculation` | 09       |
| Мои Отчеты                    | `/finance/settlements-partners/my-reports`         | 09       |
| Процент объектов              | `/finance/settlements-partners/percentage-objects` | 09       |

Только по URL / из списка: `/finance/collection/creation`, `/finance/report/period/edit`, `/finance/saleDocument/create`, `/finance/saleDocument/view`, `/finance/debugging/false/deposit`.

Источники: фронт `src/routes/index.tsx`, `src/pages/Finance/`, `src/services/api/finance/index.ts`, `src/services/api/sale/index.ts`; backend `src/app/platform-user/core-controller/finance.ts`, `managerPaper.ts`, `sale.ts`, `finance-partner.ts`, `src/core/finance-core/cashCollection/`, prisma `CashCollection*`, `ManagerPaper`, `ManagerPaperType`, `ManagerReportPeriod`.
