import { Suspense } from 'react';
import { requirePermission } from '@/lib/server/admin/auth';
import { getCommittees,getProblemCategories } from '@/lib/content';
import { AdminNav } from '../AdminNav';
import { WalkIn } from './WalkIn';
import { moduleOn, MODULE_OFF } from '@/lib/server/admin/modules';
import { AdminPageHeader } from '../AdminPageHeader';
export default async function Page(){const user=await requirePermission('registrations',true);if(!(await moduleOn('registrations')))return <><AdminNav user={user}/><AdminPageHeader title="Walk-in registration" description={MODULE_OFF}/></>;const [committees,categories]=await Promise.all([getCommittees(),getProblemCategories()]);return <><AdminNav user={user}/><h1>Walk-in registration</h1><p>This staff-only form records an application while public registration remains closed. Review acceptance and payment before check-in.</p><Suspense><WalkIn committees={committees} categories={categories}/></Suspense></>;}
