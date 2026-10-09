import { createFileRoute } from '@tanstack/react-router';
import { PRIVACY_POLICY_CONTENT } from '@/shared/ui/LegalLayout/LegalContent';
import { LegalLayout } from '@/shared/ui/LegalLayout/LegalLayout';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalLayout document={PRIVACY_POLICY_CONTENT} docType="privacy" />;
}
