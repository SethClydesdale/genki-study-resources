// # MODIFICATIONS FOR ALL PAGES #
(function () {
  
  // # LINK MODIFICATIONS #
  if (window.location.protocol == 'file:') {
    // append index.html to links if this project is hosted on the local file system
    // it makes browsing easier offline, since otherwise links will just open the directory and not the file
    for (var a = document.querySelectorAll('a[href$="/"]'), i = 0, j = a.length; i < j; i++) {
      if (!/http/.test(a[i].href)) {
        a[i].href += 'index.html';
      }
    }
  }

  
  // # SECTION ANCHORS #
  // adds an anchor link to headings, so students can get the direct link for a section
  for (var h = document.getElementById('content').querySelectorAll('h1, h2, h3, h4, h5, h6'), i = 0, j = h.length; i < j; i++) {
    if (h[i].id) {
      h[i].insertAdjacentHTML('afterbegin', '<a href="#' + h[i].id + '" class="anchor"><span class="anchor-icon">&#xf0c1;</span></a>');
    }
  }
  
}());