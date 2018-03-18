// Google Analytics
// disabled if used locally or on another host
if (window.location.hostname == 'sethclydesdale.github.io') {
  (function () {
    var tid = 'UA-114289226-1',
        gtag = document.createElement('SCRIPT');

    gtag.src = 'https://www.googletagmanager.com/gtag/js?id=' + tid;
    gtag.type = 'text/javascript';
    gtag.async = true;
    document.getElementsByTagName('HEAD')[0].appendChild(gtag);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', tid);
  }());
}


