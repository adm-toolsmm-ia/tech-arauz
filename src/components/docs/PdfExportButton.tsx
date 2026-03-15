'use client';

import React from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfExportButtonProps {
  contentRef: React.RefObject<HTMLElement | null>;
  title: string;
  className?: string;
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  contentRef,
  title,
  className,
}) => {
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!contentRef.current) return;

    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: [15, 15, 20, 15] as [number, number, number, number],
        filename: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf()
        .set(opt as any)
        .from(contentRef.current)
        .save();
    } catch (err) {
      console.error('[PdfExportButton] export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className={className}
    >
      <FileDown className="mr-1.5 size-4" />
      {exporting ? 'Exportando...' : 'Exportar PDF'}
    </Button>
  );
};
