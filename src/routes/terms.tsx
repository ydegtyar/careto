import { createFileRoute } from '@tanstack/react-router';
import { TERMS_OF_SERVICE_CONTENT } from '@/shared/ui/LegalLayout/LegalContent';
import { LegalLayout } from '@/shared/ui/LegalLayout/LegalLayout';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return <LegalLayout document={TERMS_OF_SERVICE_CONTENT} docType="terms" />;
}
