// Halloween Shenanigans: https://github.com/SethClydesdale/scroll-spider
(function() {
  window._scrollSpider = {
    
    config : {
      side : 'right',
      offset : '0px',
      
      tooltip : 'ハッピーハロウィン！',
      image : 'resources/images/spider.png',
      web : 'background-color:#000;width:2px;height:999em;position:absolute;right:42%;bottom:95%;'
    },
    
    // move the spider based on the percentage the document has been scrolled
    move : function() {
      _scrollSpider.spider.style.top = ((document.body.scrollTop + document.documentElement.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100) + '%';
    },
    
    // scroll the page to the top
    goingUp : false,
    toTop : function() {
      if (!_scrollSpider.goingUp && (document.body.scrollTop || document.documentElement.scrollTop)) {
        var body = document.body.scrollTop ? document.body : document.documentElement;
        
        _scrollSpider.goingUp = true;
        _scrollSpider.scroll = {
          top : body.scrollTop, // cached scroll position
          body : body,
          by : (document.documentElement.scrollHeight - document.documentElement.clientHeight) / 100, // scroll by 1% of the total document height
          
          // interval for scrolling the document ( and spider ) back to the top
          window : window.setInterval(function() {
            if (_scrollSpider.scroll.top > 0) {
              _scrollSpider.scroll.body.scrollTop = _scrollSpider.scroll.top -= _scrollSpider.scroll.by;
              _scrollSpider.move();
            } else {
              window.clearInterval(_scrollSpider.scroll.window); 
              _scrollSpider.goingUp = false;
            }
          }, 10)
        };
        
      }
    },
    
    // offset the spider based on the height of the image
    // this is so it's visible when the document is scrolled to 100%
    applyOffset : function() {
      var img = _scrollSpider.spider.getElementsByTagName('IMG')[0];
      
      if (img && img.complete) {
        _scrollSpider.spider.style.marginTop = '-' + img.height + 'px';
      } else {
        window.addEventListener('load', _scrollSpider.applyOffset);
      }
    },
    
    // initial setup of the scrolling spider element
    init : function() {
      var spider = document.createElement('DIV');
      
      spider.id = 'scrollSpider';
      spider.innerHTML = '<div style="' + _scrollSpider.config.web + '"></div><img src="' + _scrollSpider.config.image + '" onclick="_scrollSpider.toTop();" style="cursor:pointer;" title="' + _scrollSpider.config.tooltip + '">';
      spider.style.position = 'fixed';
      spider.style[/left|right/i.test(_scrollSpider.config.side) ? _scrollSpider.config.side : 'right'] = _scrollSpider.config.offset;
      spider.style.top = '0%';
      
      document.body.appendChild(spider);
      
      _scrollSpider.spider = spider;
      _scrollSpider.move();
      _scrollSpider.applyOffset();
      
      window.addEventListener('scroll', _scrollSpider.move);
    }
    
  };
  
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', _scrollSpider.init); // perform initialization when the DOM is loaded
  }
}());
