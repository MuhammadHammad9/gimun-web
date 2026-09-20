export type NavigationItem={id:string;label:string;href:string;area:'header'|'footer'|'mobile'|'all';parentId?:string;description?:string};
export const defaultNavigation:NavigationItem[]=[
  {id:'gimun',label:'GIMUN',href:'/gimun',area:'all'},
  {id:'gimun-overview',parentId:'gimun',label:'Overview & eligibility',href:'/gimun',area:'all'},
  {id:'committees',parentId:'gimun',label:'Committees & topics',href:'/gimun/committees',area:'all'},
  {id:'gimun-rules',parentId:'gimun',label:'Rules of procedure',href:'/gimun/rules',area:'all'},
  {id:'gmc',label:'GMC',href:'/moot-cup',area:'all'},
  {id:'gmc-overview',parentId:'gmc',label:'Overview & format',href:'/moot-cup',area:'all'},
  {id:'categories',parentId:'gmc',label:'Problem categories',href:'/moot-cup/categories',area:'all'},
  {id:'gmc-rules',parentId:'gmc',label:'Rules & written arguments',href:'/moot-cup/rules',area:'all'},
  {id:'clarifications',parentId:'gmc',label:'Clarifications',href:'/moot-cup/clarifications',area:'all'},
  {id:'schedule',label:'Schedule',href:'/schedule',area:'all'},
  {id:'info',label:'Info',href:'/about',area:'all'},
  {id:'about',parentId:'info',label:'About',href:'/about',area:'all'},
  {id:'venue',parentId:'info',label:'Venue & travel',href:'/about/venue',area:'all'},
  {id:'faq',parentId:'info',label:'FAQ',href:'/about/faq',area:'all'},
  {id:'team',parentId:'info',label:'Team',href:'/about/team',area:'all'},
  {id:'resources',parentId:'info',label:'Resources',href:'/resources',area:'all'},
  {id:'announcements',parentId:'info',label:'Announcements',href:'/announcements',area:'all'},
  {id:'results',parentId:'info',label:'Results',href:'/results',area:'all'},
  {id:'sponsors',parentId:'info',label:'Sponsors',href:'/about/sponsors',area:'all'},
  {id:'gallery',parentId:'info',label:'Gallery',href:'/about/gallery',area:'all'},
  {id:'contact',parentId:'info',label:'Contact',href:'/contact',area:'all'},
];
export function navigationTree(items:NavigationItem[]=defaultNavigation,area:'header'|'footer'|'mobile'){
 const visible=items.filter(i=>i.area==='all'||i.area===area);
 return visible.filter(i=>!i.parentId).map(item=>({...item,dropdown:visible.filter(c=>c.parentId===item.id).map(c=>({...c,trackBadge:undefined as 'GIMUN'|'GMC'|undefined}))}));
}
