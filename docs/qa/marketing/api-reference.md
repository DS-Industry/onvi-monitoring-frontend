# Marketing API reference (из фронта)

Источник: `src/services/api/marketing/index.ts`.  
Base prefix большинства методов: `user/loyalty/...`.  
Документ для QA: сверка Network tab ↔ экран.

## Clients

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createClient` | POST | `user/loyalty/client` | Clients drawer, Cards add |
| `updateClient` | PATCH | `user/loyalty/client` | Client profile, Card |
| `getClients` | GET | `user/loyalty/clients` | Clients list |
| `getClientById` | GET | `user/loyalty/client/{id}` | Client profile, Card |
| `importCards` | POST | `user/loyalty/import-cards` | Clients import |
| `getUserKeyStatsByOrganizationId` | GET | `user/loyalty/user-key-stats` | Client/Card profile |
| `getClientLoyaltyStats` | GET | `user/loyalty/client-loyalty-stats` | Client/Card profile |
| `getClientCards` | GET | `user/loyalty/client/{clientId}/cards` | Card tabs |
| `getClientActivity` | GET | `user/loyalty/client/{clientId}/activity` | Card activity |
| `getClientNotes` | GET | `user/loyalty/client/{clientId}/notes` | Card notes |
| `createClientNote` | POST | `user/loyalty/client/{clientId}/notes` | Card notes |
| `updateClientNote` | PATCH | `user/loyalty/client/{clientId}/notes/{noteId}` | Card notes |
| `deleteClientNote` | DELETE | `user/loyalty/client/{clientId}/notes/{noteId}` | Card notes |

## Tags (вспомогательные)

| Function | Method | Path |
|----------|--------|------|
| `createTag` | POST | `user/loyalty/tag` |
| `getTags` | GET | `user/loyalty/tag` |
| `deleteTag` | DELETE | `user/loyalty/tag/{id}` |

## Cards

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getCards` | GET | `user/loyalty/cards` | Clients / lookups |
| `getCardsPaginated` | GET | `user/loyalty/cards/paginated` | Cards list |
| `getCardById` | GET | `user/loyalty/card/{cardId}` | Card detail |
| `updateCard` | PATCH | `user/loyalty/card/{cardId}` | Card detail |
| `assignCard` | PATCH | `user/loyalty/card/assign` | Client profile loyalty |
| `createEquiring` | POST | `user/loyalty/card/equiring` | (equiring flow) |
| `getCardOperationsById` | GET | `user/loyalty/card/{id}/operations` | Client/Corp ops |

## Corporate clients

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getCorporateClients` | GET | `user/loyalty/corporate-clients` | List, import |
| `getCorporateClientById` | GET | `user/loyalty/corporate-clients/{id}` | Profile |
| `createCorporateClient` | POST | `user/loyalty/corporate-clients` | Drawer |
| `updateCorporateClient` | PUT | `user/loyalty/corporate-clients/{id}` | Drawer |
| `getCorporateClientStatsById` | GET | `user/loyalty/corporate-clients/{id}/stats` | Profile |
| `getCorporateClientCardsById` | GET | `user/loyalty/corporate-clients/{id}/cards` | Profile |
| `getCorporateClientOperationsById` | GET | `user/loyalty/corporate-clients/{id}/cards/operations` | Profile |
| `createCorporateBonusOperation` | POST | `user/loyalty/corporate-clients/{id}/bonus-operations` | Profile |

## Loyalty programs

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getLoyaltyPrograms` | GET | `user/loyalty/participant-programs?organizationId=` | Many pickers |
| `getLoyaltyProgramsPaginated` | GET | `user/loyalty/participant-programs-paginated` | Loyalty list |
| `getLoyaltyProgramById` | GET | `user/loyalty/program/{id}` | Wizard / campaign |
| `createLoyaltyProgram` / `createNewLoyaltyProgram` | POST | `user/loyalty/program` | Wizard create |
| `updateLoyaltyProgram` / `updateNewLoyaltyProgram` | PATCH | `user/loyalty/program` | Wizard |
| `deleteLoyaltyProgram` | DELETE | `user/loyalty/program/{id}` | Loyalty list |
| `publishLoyaltyProgram` | PATCH | `user/loyalty/program/{id}/publish` | Publication |
| `unpublishLoyaltyProgram` | PATCH | `user/loyalty/program/{id}/unpublish` | Publication |
| `getLoyaltyProgramAnalytics` | GET | `user/loyalty/program/{id}/analytics` | Stats step |
| `getLoyaltyProgramTransactionAnalytics` | GET | `user/loyalty/program/{id}/transaction-analytics` | Stats step |
| `getPosesParticipants` | GET | `user/loyalty/program/{id}/participant-poses` | Participants / Geography |
| `getBonusRedemptionRules` | GET | `user/loyalty/program/bonus-redemption-rules` | Levels |
| `patchBonusRedemption` | PATCH | `user/loyalty/program/bonus-redemption-rules` | Levels |
| `createTier` | POST | `user/loyalty/tier` | Levels |
| `updateTier` | PATCH | `user/loyalty/tier` | Levels |
| `getTiers` | GET | `user/loyalty/tier` | Levels, import |
| `getTierById` | GET | `user/loyalty/tier/{id}` | Levels |
| `deleteTier` | DELETE | `user/loyalty/tier/{id}` | Levels |
| `createBenefit` / `updateBenefit` / `getBenefits` / `getBenefitById` | * | `user/loyalty/benefit`… | Levels |
| `createBenefitAction` / `getBenefitActions` | * | benefit-action endpoints | Levels |
| `requestHubStatus` | POST | `user/loyalty/programs/{id}/request-hub` | Hub flows |
| Public / participant requests | GET/POST/PUT | `user/loyalty/public-programs`, `participant-request(s)`, `approve/reject-hub`, `approve/reject-participant` | Join / admin |

## Orders (transactions)

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getLoyaltyProgramOrders` | GET | `user/loyalty/program/{programId}/orders` | Marketing transactions |
| `updateOrderStatus` | PATCH | `user/loyalty/program/{programId}/orders/{orderId}/status` | Refund |

## Marketing campaigns

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `getMarketingCampaign` | GET | `user/loyalty/marketing-campaigns` | List |
| `createMarketingCampaign` | POST | `user/loyalty/marketing-campaigns` | (legacy/alt create) |
| `createNewMarketingCampaign` | POST | `user/loyalty/marketing-campaign/create` | Wizard create |
| `getMarketingCampaignById` | GET | `user/loyalty/marketing-campaigns/{id}` | Profile, wizard |
| `updateMarketingCampaign` / edit | PUT | `user/loyalty/marketing-campaign/edit/{id}` | Profile launch/edit |
| `deleteMarketingCampaign` / `deleteDraftMarketingCampaign` | DELETE | `user/loyalty/marketing-campaigns/{id}` | List, profile |
| `pauseMarketingCampaign` | PATCH | `user/loyalty/marketing-campaigns/{id}/pause` | Profile |
| `cancelMarketingCampaign` | PATCH | `user/loyalty/marketing-campaigns/{id}/cancel` | Profile |
| `reactivateMarketingCampaign` | PATCH | `user/loyalty/marketing-campaigns/{id}/reactivate` | Profile |
| `getMarketingCampaignAnalytics` | GET | `user/loyalty/marketing-campaigns/{id}/analytics` | Stats |
| `getMarketingConditionsById` | GET | `user/loyalty/marketing-campaigns/{id}/conditions` | Profile, Terms |
| `createNewMarketingConditions` | POST | `user/loyalty/marketing-campaigns/{id}/conditions` | Terms |
| `deleteMarketingCondition` | DELETE | `user/loyalty/marketing-campaigns/{id}/conditions/{index}` | Terms |
| Action create/update | POST/PUT | `user/loyalty/marketing-campaign/action/create`, `.../action/update/{campaignId}` | Terms |
| Spend milestone | POST | `user/loyalty/marketing-campaign/spend-milestone/create` | Terms |
| Mobile display | GET/PUT | `user/loyalty/marketing-campaigns/{id}/mobile-display` | Promotion |

## Promocodes

| Function | Method | Path | Страница |
|----------|--------|------|----------|
| `createPromocode` | POST | `user/loyalty/promocode` | Promo mgmt, Card |
| `getPromocodes` | GET | `user/loyalty/promocodes` | Promo mgmt |
| `getPersonalPromocodes` (via get) | GET | `user/loyalty/personal-promocodes` | Card promocodes |
| `getPromocode` | GET | `user/loyalty/promocode/{id}` | Drawer |
| `updatePromocode` | PATCH | `user/loyalty/promocode/{id}` | Drawer |
| `deletePromocode` | DELETE | `user/loyalty/promocode/{id}` | List / Card |
| `createManualTransaction` | POST | `user/loyalty/manual-transaction` | **Не в UI** (tab commented) |

## Permissions (смежные)

| Function | Method | Path |
|----------|--------|------|
| `getLoyaltyProgramPermissionById` | GET | `user/permission/loyalty-program/{userId}` |
| `getLoyaltyProgramPermissionByOrgId` | GET | `user/permission/loyalty-program` |
| `loyaltyProgramsConnection` | PATCH | `user/permission/loyalty-program-user/{userId}` |

## Balance transfers (если доступно в UI вне этого меню)

| Function | Method | Path |
|----------|--------|------|
| list | GET | `user/loyalty/balance-transfers` |
| approve | POST | `user/loyalty/balance-transfer/{transferId}/approve` |

## Segments

Нет API-вызовов из текущих роутов `/marketing/segments*`.
