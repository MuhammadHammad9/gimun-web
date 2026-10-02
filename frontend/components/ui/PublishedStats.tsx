export function PublishedStats({stats}:{stats?:{label:string;value:string}[]}) {
  if(!stats?.length)return null;
  return <dl className="grid grid-cols-2 lg:grid-cols-4 gap-6">{stats.map(stat=><div key={stat.label} className="rounded-2xl border border-line-2 bg-raised p-6"><dt className="text-sm text-text-2">{stat.label}</dt><dd className="mt-2 text-3xl font-bold text-text">{stat.value}</dd></div>)}</dl>;
}
