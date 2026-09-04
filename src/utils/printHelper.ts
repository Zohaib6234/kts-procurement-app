/**
 * Universal Dedicated Document Printer for Karachi Transport Service (KTS)
 * Opens an isolated print window with full styling, company logo, and auto triggers window.print().
 * Completely eliminates background application interference, modals clipping, and iframe restrictions.
 */

export const triggerDirectPrint = (printableHtmlContent: string, documentTitle: string = 'KTS Official Document') => {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  
  if (!printWindow) {
    // If popup blocker intervened, fallback to standard window.print()
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${documentTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 24px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            vertical-align: top;
          }
          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .no-print {
            display: none !important;
          }
          @media print {
            body {
              padding: 0;
            }
            .print-controls {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-controls" style="margin-bottom: 20px; padding: 12px 18px; background: #091e3a; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; color: white;">
          <div style="font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 8px;">
            <span>Karachi Transport Service (KTS) — Official Print Ready Preview</span>
          </div>
          <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
              🖨️ Print Now
            </button>
            <button onclick="window.close()" style="background: #334155; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
              ✕ Close
            </button>
          </div>
        </div>
        <div id="print-content">
          ${printableHtmlContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
