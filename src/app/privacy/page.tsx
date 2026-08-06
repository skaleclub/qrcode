import LegalPage, { getLegalDoc, legalTitle } from '@/components/legal/LegalPage'

// Matches the marketing pages: edits published from the admin panel appear
// within a minute even without the explicit revalidate on save.
export const revalidate = 60

export async function generateMetadata() {
  const doc = await getLegalDoc('privacy')
  return { title: `${legalTitle('privacy', doc)} | XmartMenu` }
}

export default function PrivacyPage() {
  return <LegalPage docKey="privacy" />
}
