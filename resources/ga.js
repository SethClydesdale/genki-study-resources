// Google Analytics
// disabled if used locally or on another host
if (window.location.hostname == 'sethclydesdale.github.io') {
  (function () {
    var tid = 'UA-114289226-1',
        ga = document.createElement('SCRIPT');

    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + tid;
    ga.type = 'text/javascript';
    ga.async = true;
    document.getElementsByTagName('HEAD')[0].appendChild(ga);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', tid);
  }());
}
