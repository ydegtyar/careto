import type { Entry, Vehicle } from '@/data/client/types';

export function exportAnalyticsCSV(entries: Entry[], vehicle?: Vehicle) {
  const headers = [
    'ID',
    'Kind',
    'Date',
    'Odometer (m)',
    'Amount',
    'Currency',
    'USD Minor',
    'Business',
  ];
  const rows = entries.map((e) => [
    e.id,
    e.kind,
    e.occurred_on,
    e.odometer_m ?? '',
    ((e.amount_minor ?? 0) / 100).toFixed(2),
    e.currency ?? 'USD',
    e.usd_minor ?? e.amount_minor ?? 0,
    e.business ? 'Yes' : 'No',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `careto_tax_report_${vehicle?.name.replace(/\s+/g, '_') || 'vehicle'}_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAnalyticsPDF(entries: Entry[], vehicle?: Vehicle) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalSpent =
    entries.reduce((sum, e) => sum + (e.usd_minor ?? e.amount_minor ?? 0), 0) / 100;
  const businessEntries = entries.filter((e) => e.business === 1);
  const businessSpent =
    businessEntries.reduce((sum, e) => sum + (e.usd_minor ?? e.amount_minor ?? 0), 0) / 100;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax & Mileage Deductible Report - Careto</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1a202c; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #718096; font-size: 13px; margin-bottom: 20px; }
          .summary-card { background: #f7fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
          th { background: #edf2f7; font-weight: 600; }
        </style>
      </head>
      <body>
        <h1>Careto Telemetry — Tax & Mileage Report</h1>
        <div class="subtitle">Vehicle: ${vehicle?.name || 'Active Vehicle'} | Date Generated: ${new Date().toLocaleDateString()}</div>

        <div class="summary-card">
          <strong>Summary Overview:</strong><br/>
          Total Logged Expenditures: $${totalSpent.toFixed(2)}<br/>
          Business Expenses Total: $${businessSpent.toFixed(2)}<br/>
          Logged Entries Count: ${entries.length}
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Odometer (km)</th>
              <th>Amount ($)</th>
              <th>Business Use</th>
            </tr>
          </thead>
          <tbody>
            ${entries
              .map(
                (e) => `
              <tr>
                <td>${e.occurred_on}</td>
                <td>${e.kind.toUpperCase()}</td>
                <td>${e.odometer_m ? (e.odometer_m / 1000).toLocaleString() : '-'}</td>
                <td>$${((e.amount_minor ?? 0) / 100).toFixed(2)}</td>
                <td>${e.business ? 'Yes' : 'No'}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
