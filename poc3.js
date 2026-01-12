console.log("[XSS] Executed from Shaka Player");
document.body.insertAdjacentHTML(
  "beforeend",
  "<h1 style='color:red'>XSS via Shaka</h1>"
);
