# Analytics Module Documentation

## Overview
The **Analytics Module** in Careto ("Glacier Auto") provides deep vehicle expense and maintenance intelligence with a mobile-first dark glassmorphic UI.

Analytics is organized across four tabs:
1. **General**: TCO overview, category distribution, consumption anomaly detector, spending trend, business deductibles.
2. **Refueling**: Fuel intelligence, chained full-to-full efficiency, routine telemetry, brand price rankings, optimization savings insight, monthly fuel expenses, benchmark range markers, fuel type allocation, price trajectories.
3. **Services**: Scheduled vs breakdown maintenance rate, service cadence, sinking fund reserve tracker, parts vs labor allocation, monthly service trajectory, predictive component wear forecast, workshop efficiency against benchmark, and odometer cost progression.
4. **Expenses**: Detailed granular breakdown.

---

## Metric Definitions & Formulas Table

| Metric | Tab | Formula / Definition | Unit / Fallback |
| :--- | :--- | :--- | :--- |
| **Total Cost** | Refueling | $\sum \text{total\_cost}$ in period | `$`, fallback `—` |
| **Cost Per Day** | Refueling / Services | $\text{Total Cost} / \text{Days in selected period}$ | `$/day`, fallback `—` |
| **Cost Per Distance** | Refueling / Services | $\text{Total Cost} / (\text{Max Odometer} - \text{Min Odometer})$ | `$/km` or `$/mi` |
| **Fuel Volume** | Refueling | $\sum \text{liters}$ in period | `L` |
| **Weighted Avg Price** | Refueling | $\sum \text{total\_cost} / \sum \text{liters}$ (weighted, not simple arithmetic mean) | `$/L` |
| **Chained Efficiency** | Refueling | Full-tank to full-tank: for each full fill, liters added since previous full fill (including partial fills in between) / $\Delta\text{km} \times 100$ | `L/100km` or `MPG` |
| **Refueling Routine Frequency** | Refueling | $\text{Days in period} / (\text{Refuel count} - 1)$ | `days` |
| **Refueling Routine Interval** | Refueling | $\text{Distance in period} / (\text{Refuel count} - 1)$ | `km` or `mi` |
| **Current Estimated Range** | Refueling | $(\text{Tank Capacity} / \text{Avg Efficiency}) \times 100$ | `km` or `mi` |
| **Full Tank Consistency** | Refueling | $(\text{Full-tank fills} / \text{Total fills}) \times 100$ | `%` |
| **Gas Stations Ranking Diff %** | Refueling | $((\text{Station Avg Price} - \text{Overall Weighted Avg}) / \text{Overall Weighted Avg}) \times 100$ | `%` (negative = green, positive = red) |
| **Optimization Insight Savings** | Refueling | $\sum_{\text{non-best}} (\text{price\_per\_liter} - \text{best\_avg\_price}) \times \text{liters}$; Annualized: $(\text{Savings} / \text{period days}) \times 365$ | `$` |
| **Maintenance Rate** | Services | $(\text{Scheduled service events} / \text{Total service events}) \times 100$ | `%` |
| **Service Cadence** | Services | $(\text{Max Odometer} - \text{Min Odometer}) / (\text{Event count} - 1)$ | `km` or `mi` |
| **Sinking Fund Progress** | Services | $(\text{Accumulated reserve} / \text{Target amount}) \times 100$ | `%` |
| **Predictive Component Life %** | Services | $\text{used} = \max(\frac{\Delta\text{km}}{\text{interval\_km}}, \frac{\Delta\text{days}}{\text{interval\_days} \times \text{seasonal\_factor}})$; $\text{remaining\%} = \operatorname{clamp}(1 - \text{used}, 0, 1) \times 100$ | `%` |
| **Workshop Benchmark Diff** | Services | $((\text{Workshop Hourly Rate} - \text{Benchmark Rate}) / \text{Benchmark Rate}) \times 100$ | `%` |

---

## Configurable Thresholds & Constants

- **Component Life Status Thresholds**:
  - $\ge 60\%$: `OK` (Cyan `#38bdf8` / Green)
  - $30\%\text{--}59\%$: `Due soon` (Amber `#fbbf24`, row highlighted)
  - $< 30\%$: `Critical` (Red `#f87171`)
- **Station Optimization Savings**:
  - Minimum refuels for a brand to qualify as "cheapest benchmark": 2 refuels.
  - Minimum number of distinct brands to show insight: 2 brands.
- **Workshop Benchmark**:
  - Standard hourly benchmark: `$85.00/hr` (configurable via constants or system median).
- **Default Period Presets**:
  - Refueling tab default: `All Time` (`all`)
  - Services tab default: `6 Months` (`6M`)
  - Supported presets: `1M`, `3M`, `6M`, `1Y`, `all`, `custom`

---

## Extending with General and Expenses Tabs

1. **General Tab**:
   - Query filters (`tab`, `preset`, `from`, `to`) and the top vehicle selector already share URL state and store context.
   - Additional cards can be added by registering components under `src/features/analytics/general/`.
2. **Expenses Tab**:
   - Add endpoint `/api/analytics/expenses` in `api/analytics/[action].ts`.
   - Add hook `useExpensesAnalytics` in `src/features/analytics/hooks/useAnalyticsQueries.ts`.
   - Implement `ExpensesTabContent.tsx` in `src/features/analytics/expenses/` and render it when `currentTab === 'expenses'`.
