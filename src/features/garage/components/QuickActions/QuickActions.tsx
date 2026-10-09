import BuildIcon from '@mui/icons-material/Build';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useRouter } from '@tanstack/react-router';
import type { Vehicle } from '@/data/client/types';
import styles from './QuickActions.module.scss';

interface Props {
  vehicle?: Vehicle;
}

export function QuickActions({ vehicle }: Props) {
  const router = useRouter();

  const isEv = vehicle?.powertrain === 'ev';
  const refuelLabel = isEv ? 'Recharge' : 'Refuel';
  const RefuelIcon = isEv ? EvStationIcon : LocalGasStationIcon;

  const actions = [
    {
      id: 'refuel',
      label: refuelLabel,
      icon: <RefuelIcon sx={{ fontSize: 22 }} />,
      onClick: () => router.navigate({ to: '/entries/new', search: { kind: 'refuel' } }),
    },
    {
      id: 'service',
      label: 'Service',
      icon: <BuildIcon sx={{ fontSize: 22 }} />,
      onClick: () => router.navigate({ to: '/entries/new', search: { kind: 'service' } }),
    },
    {
      id: 'expense',
      label: 'Expense',
      icon: <ReceiptIcon sx={{ fontSize: 22 }} />,
      onClick: () => router.navigate({ to: '/entries/new', search: { kind: 'expense' } }),
    },
  ];

  return (
    <div className={styles.container}>
      {actions.map((act) => (
        <button key={act.id} type="button" onClick={act.onClick} className={styles.actionBtn}>
          <div className={styles.iconDisc}>{act.icon}</div>
          <span className={styles.label}>{act.label}</span>
        </button>
      ))}
    </div>
  );
}
