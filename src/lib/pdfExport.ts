// Export utilities for CSV and PDF

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return;

  const headers = columns.map(c => c.label).join(",");
  const rows = data.map(row =>
    columns.map(c => {
      const value = row[c.key];
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = value === null || value === undefined ? "" : String(value);
      if (stringValue.includes(",") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(",")
  );

  const csv = [headers, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  title: string,
  columns: { key: keyof T; label: string }[]
) {
  if (data.length === 0) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const tableRows = data.map(row =>
    `<tr>${columns.map(c => `<td style="border: 1px solid #ddd; padding: 8px;">${row[c.key] ?? ""}</td>`).join("")}</tr>`
  ).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; font-size: 24px; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-weight: 600; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background-color: #fafafa; }
        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
      <table>
        <thead>
          <tr>${columns.map(c => `<th>${c.label}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${tableRows}
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
