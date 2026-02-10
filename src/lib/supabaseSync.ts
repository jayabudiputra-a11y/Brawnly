import { saveArticlesSnap, isTTLExpired } from "./enterpriseStorage";

const Q="brawnly_sync_q";

function pushQ(j:any){
 try{
  const q=JSON.parse(localStorage.getItem(Q)||"[]");
  q.push(j);
  localStorage.setItem(Q,JSON.stringify(q));
 }catch{}
}

export async function syncArticles(fetcher:()=>Promise<any[]>){
 try{

  if(!navigator.onLine){
   return false;
  }

  if(!isTTLExpired()){
   return false;
  }

  const data=await fetcher();
  saveArticlesSnap(data);

  return true;

 }catch{
  pushQ({t:Date.now()});
  return false;
 }
}
