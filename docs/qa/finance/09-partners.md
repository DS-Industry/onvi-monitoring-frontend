# Расчет с партнерами — сценарии для тестировщика

> Меню: **Управление → Расчет с партнерами**.  
> Формат ТК: **Предусловия → Шаги → Ожидаемый результат**.

Общие предусловия: план **SPACE / BUSINESS / CUSTOM**, организация, права `PartnerReport`.  
Пользователи: партнёры и финансисты. **Мои Отчеты** — партнёр видит только свои объекты и свою прибыль.

Исключения «сумма долей ≠ 100%, только разработчик» — **не ТК продукта**.

Группа меню в роутах сидит на том же path, что **Отладка** (`/finance/debugging`); рабочие экраны — под `/finance/settlements-partners/…`.

---

## О странице

### Процент объектов (`/finance/settlements-partners/percentage-objects`)

| | |
|--|--|
| **Зачем** | Задать доли партнёров по объекту один раз (актуальное состояние для новых отчётов). |
| **Что менеджерит** | `PosCalculation`, `PosPartnerPercent`. API: `createPosCalculation`, `createPosPartnerPercent`, `getPosCalculations`, `updatePosCalculation`, `deletePosPartnerPercent`, `getWorkerPartners`, `getPosByCalculation`. |
| **Кто пользуется** | Маршрут: `create` на `PartnerReport`. Правка/добавление долей на UI: `update`. |
| **Связи** | Новый месячный отчёт читает **текущие** проценты. Старые отчёты не пересчитываются. |
| **Правила** | Query: `page`, `size`, `city`, `posId`, `partnerId`. UI: сумма долей должна быть **100%** (`finance.partnersPercentSumMustBe100`), submit при не-100% disabled. Статусы доли: ACTIVE / INACTIVE. |

### Расчет прибыли (`/finance/settlements-partners/profit-calculation`)

| | |
|--|--|
| **Зачем** | Раз в месяц зафиксировать доходы/расходы объекта и excel; расчёт сохраняется. |
| **Что менеджерит** | `PosPartnerReport`. API: `createPosPartnerReport`, `getPosPartnerReports`, `updatePosPartnerReport` (файл, revenue, expenditure). |
| **Кто пользуется** | `create` на `PartnerReport`. |
| **Связи** | Берёт актуальное состояние процентов; файл S3 `partner-report/…`. |
| **Правила** | Query: `page`, `size`, `city`, `posId`, `dateStart`, `dateEnd`, `partnerId`. В API фильтр объекта уходит как `posCalculationId`. Upload: `.csv,.png,.xlsx,.xls`. Пересчёта уже сохранённого отчёта при смене % **нет**. |

### Мои Отчеты (`/finance/settlements-partners/my-reports`)

| | |
|--|--|
| **Зачем** | Партнёр смотрит только свои объекты и свою прибыль. |
| **Что менеджерит** | `getPosPartnerReportsMe` → `GET user/finance-partner/pos-partner-reports/me`. |
| **Кто пользуется** | `read` на `PartnerReport`. Строки роли `"Partner"` во фронте нет — фильтр `/me` по `user.id`. |
| **Связи** | Сохранённые месячные отчёты, где текущий user есть в meta как партнёр. |
| **Правила** | Query: `page`, `size`, `city`, `posId`, `dateStart`, `dateEnd`. `partnerId` в query **не** передаётся. |

---

## ТК-N1. Задать проценты (ожидание 100% в UI)

**Предусловия:** `create` (и `update` для редактирования) на `PartnerReport`; объект без расчёта или с расчётом.

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | **Расчет с партнерами → Процент объектов** | `/finance/settlements-partners/percentage-objects`, заголовок «Процент объектов» |
| 2 | Создать расчёт: объект, стоимость, партнёры с % | Пока сумма ≠ 100%, подсказка «Сумма процентов всех участников должна быть равна 100%», сохранить нельзя |
| 3 | Сумма = 100% → сохранить | Расчёт и доли сохранены |

---

## ТК-N2. Создать месячный отчёт с excel

**Предусловия:** заданы проценты; `create` PartnerReport.

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | **Расчет прибыли** | `/finance/settlements-partners/profit-calculation`, заголовок «Расчет прибыли» |
| 2 | Указать доходы, расходы, месяц, приложить excel (xlsx/xls/csv) | Отчёт сохранён, файл доступен. Доли в отчёте — **на момент создания** (актуальные %) |

---

## ТК-N3. Смена процентов не меняет старый отчёт

**Предусловия:** есть сохранённый месячный отчёт; можно менять %.

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | Изменить проценты на объекте (снова 100%) | Новое состояние для **следующих** отчётов |
| 2 | Открыть ранее сохранённый отчёт | Выручка, расход, доли/суммы партнёра **как были**. Автопересчёта нет |

---

## ТК-N4. «Мои Отчеты» — только свои объекты

**Предусловия:** пользователь с `read` PartnerReport; есть отчёты по нему и по чужому партнёру.

| Шаг | Действие | Ожидаемый результат |
|-----|----------|---------------------|
| 1 | **Мои Отчеты** | `/finance/settlements-partners/my-reports`, запрос `…/pos-partner-reports/me` |
| 2 | Смотреть список | Только объекты/прибыль **текущего** пользователя. Чужих партнёров нет |

---

## Краткая справка (для отладки)

- `POST/GET/PATCH user/finance-partner/pos-calculation`, `pos-partner-percent`, `PATCH …/pos-partner-percent/delete`, `GET …/pos-by-calculation`, `POST/GET/PATCH …/pos-partner-report`, `GET …/pos-partner-reports`, `GET …/pos-partner-reports/me`.
- Subject: `PartnerReport`. Feature подписки — как на контроллере finance-partner.
- Исключения 100% «только разработчик» в ТК не входят.
