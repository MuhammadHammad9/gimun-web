import { Suspense } from 'react';
import { requirePermission } from '@backend/server/admin/auth';
import { getCommittees,getProblemCategories } from '@backend/lib/content';
import { AdminNav } from '../AdminNav';
import { WalkIn } from './WalkIn';
export default async function Page(){const user=await requirePermission('registrations',true);const [committees,categories]=await Promise.all([getCommittees(),getProblemCategories()]);return <><AdminNav user={user}/><h1>Walk-in registration</h1><p>This staff-only form records an application while public registration remains closed. Review acceptance and payment before check-in.</p><Suspense><WalkIn committees={committees} categories={categories}/></Suspense></>;}
