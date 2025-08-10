import SlackSuccess from '@/components/SlackSuccess';
import { Suspense } from 'react';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlackSuccess />
    </Suspense>
  );
}
