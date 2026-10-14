import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HandymanIcon from '@mui/icons-material/Handyman';
import RepeatIcon from '@mui/icons-material/Repeat';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import type { Vehicle } from '@/data/client/types';
import type { ServicesAnalyticsResponseDto } from '../../../../api/_lib/analytics/types';
import { DonutCard } from '../shared/DonutCard';
import { styles } from '../shared/glacier.styles';
import { KpiCard } from '../shared/KpiCard';
import { LogServiceStickyCta } from './LogServiceStickyCta';
import { MonthlyServiceTrajectoryCard } from './MonthlyServiceTrajectoryCard';
import { OdometerCostProgressionCard } from './OdometerCostProgressionCard';
import { PredictiveComponentLifeCard } from './PredictiveComponentLifeCard';
import { WorkshopEfficiencyCard } from './WorkshopEfficiencyCard';

interface Props {
  data: ServicesAnalyticsResponseDto;
  vehicle?: Vehicle;
  isLoading?: boolean;
}

export const ServicesTabContent = ({ data, vehicle, isLoading }: Props) => {
  const {
    summary,
    allocation,
    monthlyTrajectory,
    componentLife,
    workshopEfficiency,
    costProgression,
  } = data;
  const distanceUnit = vehicle?.distance_unit || 'km';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Summary KPI Cards (2x2) */}
      <div style={styles.grid2x2}>
        <KpiCard
          title="Total Service"
          icon={<HandymanIcon sx={{ fontSize: 18 }} />}
          value={
            summary.totalServiceCost !== null
              ? `$${summary.totalServiceCost.toLocaleString()}`
              : null
          }
          isLoading={isLoading}
          subMetrics={[
            {
              label: 'Per day',
              value: summary.costPerDay !== null ? `$${summary.costPerDay}` : null,
              highlightColor: 'cyan',
            },
            {
              label: `Per ${distanceUnit}`,
              value: summary.costPerKm !== null ? `$${summary.costPerKm}` : null,
              highlightColor: 'cyan',
            },
          ]}
        />

        <KpiCard
          title="Maintenance Rate"
          icon={<VerifiedUserIcon sx={{ fontSize: 18 }} />}
          value={
            summary.maintenanceRatePercent !== null ? `${summary.maintenanceRatePercent}%` : null
          }
          unit="Scheduled"
          isLoading={isLoading}
          valueColor="#34d399"
          subMetrics={[
            {
              label: 'Breakdowns',
              value: `${summary.breakdownIncidentsCount} incidents`,
              highlightColor: summary.breakdownIncidentsCount === 0 ? 'green' : 'red',
            },
          ]}
        />

        <KpiCard
          title="Service Cadence"
          icon={<RepeatIcon sx={{ fontSize: 18 }} />}
          value={
            summary.serviceCadenceKm !== null
              ? `${summary.serviceCadenceKm.toLocaleString()}`
              : null
          }
          unit={distanceUnit}
          isLoading={isLoading}
          subMetrics={[
            {
              label: 'Cadence Days',
              value:
                summary.serviceCadenceDays !== null
                  ? `Avg ${summary.serviceCadenceDays}d interval`
                  : null,
              highlightColor: 'purple',
            },
          ]}
        />

        <KpiCard
          title="Sinking Fund"
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
          value={
            summary.sinkingFundReserve !== null
              ? `$${summary.sinkingFundReserve.toLocaleString()}`
              : null
          }
          unit={
            summary.sinkingFundProgressPercent !== null
              ? `[${summary.sinkingFundProgressPercent}%]`
              : undefined
          }
          isLoading={isLoading}
          subMetrics={[
            {
              label: 'Target',
              value:
                summary.sinkingFundTarget !== null
                  ? `$${summary.sinkingFundTarget.toLocaleString()} (${summary.sinkingFundLabel || 'reserve'})`
                  : null,
              highlightColor: 'cyan',
            },
          ]}
        />
      </div>

      {/* 2. Parts & Labor Allocation Donut */}
      <DonutCard
        title="Parts & Labor Allocation"
        centerText={`${allocation.taskCount} Tasks`}
        centerSubText="Recorded"
        items={allocation.items.map((i) => ({
          name: i.name,
          value: i.cost,
          color: i.color,
          sharePercent: i.sharePercent,
          subLabel: `$${i.cost}`,
        }))}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--mui-palette-text-secondary)',
            }}
          >
            <span>
              Parts:{' '}
              <strong style={{ color: 'var(--mui-palette-text-primary)' }}>
                ${allocation.partsCost}
              </strong>
            </span>
            <span>
              Labor:{' '}
              <strong style={{ color: 'var(--mui-palette-text-primary)' }}>
                ${allocation.laborCost}
              </strong>
            </span>
          </div>
        }
      />

      {/* 3. Monthly Service Trajectory */}
      <MonthlyServiceTrajectoryCard data={monthlyTrajectory} />

      {/* 4. Predictive Component Life */}
      <PredictiveComponentLifeCard items={componentLife} distanceUnit={distanceUnit} />

      {/* 5. Workshop Efficiency */}
      <WorkshopEfficiencyCard data={workshopEfficiency} />

      {/* 6. Odometer & Cost Progression */}
      <OdometerCostProgressionCard data={costProgression} distanceUnit={distanceUnit} />
    </div>
  );
}
