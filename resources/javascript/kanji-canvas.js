/*
Copyright (c) 2019 Dominik Klein, Kanji Canvas

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
The copyright notice must include a backlink (hyperlink) to http://github.com/asdfjkl/kanjicanvas

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function (window, document) {
  'use strict';
  'Copyright (c) 2019 Dominik Klein, Kanji Canvas (http://github.com/asdfjkl/kanjicanvas)'; // copyright for minified file
  
  // define KanjiCanvas as a global
  // call KanjiCanvas.init(id) to initialize a canvas as a KanjiCanvas
  // `id` must be the id attribute of the canvas.
  // ex: KanjiCanvas.init('canvas-1');
  window.KanjiCanvas = new Object();
  
  
  // patterns loaded externally from ref-patterns folder
  KanjiCanvas.refPatterns = [];
  
  
  // tells if the user is in dark mode
  KanjiCanvas.darkMode = document.querySelector('.dark-mode') ? true : false;
  
  // tells if the user is using firefox, so we can adjust things, since firefox has alignment issues.
  KanjiCanvas.firefox = /Firefox/.test(navigator.userAgent);
  
  
  // color coded stroke colors (for 30 strokes -- not that we'll go that high with Genki kanji)
  // based on https://kanjivg.tagaini.net/viewer.html
  KanjiCanvas.strokeColors = ['#bf0000', '#bf5600', '#bfac00', '#7cbf00', '#26bf00', '#00bf2f', '#00bf85', '#00a2bf', '#004cbf', '#0900bf', '#5f00bf', '#b500bf', '#bf0072', '#bf001c', '#bf2626', '#bf6b26', '#bfaf26', '#89bf26', '#44bf26', '#26bf4c', '#26bf91', '#26a8bf', '#2663bf', '#2d26bf', '#7226bf', '#b726bf', '#bf2682', '#bf263d', '#bf4c4c', '#bf804c'];
  
  
  // init html page and canvas
  KanjiCanvas.init = function (id) {
    KanjiCanvas["canvas_" + id] = document.getElementById(id);
    KanjiCanvas["canvas_" + id].tabIndex = 0;
    KanjiCanvas["ctx_" + id] = KanjiCanvas["canvas_" + id].getContext("2d");
    KanjiCanvas["w_" + id] = KanjiCanvas["canvas_" + id].width;
    KanjiCanvas["h_" + id] = KanjiCanvas["canvas_" + id].height;
    KanjiCanvas["flagOver_" + id] = false;
    KanjiCanvas["flagDown_" + id] = false;
    KanjiCanvas["prevX_" + id] = 0;
    KanjiCanvas["currX_" + id] = 0;
    KanjiCanvas["prevY_" + id] = 0;
    KanjiCanvas["currY_" + id] = 0;
    KanjiCanvas["dot_flag_" + id] = false;
    KanjiCanvas["recordedPattern_" + id] = new Array();
    KanjiCanvas["currentLine_" + id] = null;
    KanjiCanvas.drawGuide(id);
    
    KanjiCanvas["canvas_" + id].addEventListener("mousemove", function (e) {
      KanjiCanvas.findxy('move', e, id)
    }, false);
    KanjiCanvas["canvas_" + id].addEventListener("mousedown", function (e) {
      KanjiCanvas.findxy('down', e, id)
    }, false);
    KanjiCanvas["canvas_" + id].addEventListener("mouseup", function (e) {
      KanjiCanvas.findxy('up', e, id)
    }, false);
    KanjiCanvas["canvas_" + id].addEventListener("mouseout", function (e) {
      KanjiCanvas.findxy('out', e, id)
    }, false);
	KanjiCanvas["canvas_" + id].addEventListener("mouseover", function (e) {
      KanjiCanvas.findxy('over', e, id)
    }, false);
    
    // touch events
    KanjiCanvas["canvas_" + id].addEventListener("touchmove", function (e) {
      KanjiCanvas.findxy('move', e, id);
    }, false);
    KanjiCanvas["canvas_" + id].addEventListener("touchstart", function (e) {
      KanjiCanvas.findxy('down', e, id);
    }, false);
    KanjiCanvas["canvas_" + id].addEventListener("touchend", function (e) {
      KanjiCanvas.findxy('up', e, id);
    }, false);
  };

  KanjiCanvas.draw = function (id, color) {
    KanjiCanvas["ctx_" + id].beginPath();
    KanjiCanvas["ctx_" + id].moveTo(KanjiCanvas["prevX_" + id], KanjiCanvas["prevY_" + id]);
    KanjiCanvas["ctx_" + id].lineTo(KanjiCanvas["currX_" + id], KanjiCanvas["currY_" + id]);
    KanjiCanvas["ctx_" + id].strokeStyle = color ? color : KanjiCanvas.darkMode ? "#AAA" : "#333";
    KanjiCanvas["ctx_" + id].lineCap = "round";
    //KanjiCanvas["ctx_" + id].lineJoin = "round";
    //KanjiCanvas["ctx_" + id].lineMiter = "round";
    KanjiCanvas["ctx_" + id].lineWidth = 4;
    KanjiCanvas["ctx_" + id].stroke();
    KanjiCanvas["ctx_" + id].closePath();
  };
  
  // draw kanji onto the canvas to aid with drawing
  KanjiCanvas.drawGuide = function (id) {
    if (KanjiCanvas["canvas_" + id].dataset.kanji) {
      if (KanjiCanvas["canvas_" + id].dataset.guide == 'false') return;
      
      var font = KanjiCanvas["canvas_" + id].dataset.size ? KanjiCanvas["canvas_" + id].dataset.size : 175;
      KanjiCanvas["ctx_" + id].font = font + "px " + (KanjiCanvas["canvas_" + id].dataset.font ? KanjiCanvas["canvas_" + id].dataset.font : "'メイリオ', 'Meiryo', 'Osaka', 'ＭＳ Ｐゴシック', 'MS PGothic', 'ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro', Arial, sans-serif");
      KanjiCanvas["ctx_" + id].textBaseline = "middle";
      KanjiCanvas["ctx_" + id].fillStyle = KanjiCanvas.darkMode ? "#222" : "#DDD";
      KanjiCanvas["ctx_" + id].fillText(KanjiCanvas["canvas_" + id].dataset.kanji, (KanjiCanvas["canvas_" + id].width / 2) - (font / 2), (KanjiCanvas["canvas_" + id].height / 2) + (KanjiCanvas.firefox ? font / (KanjiCanvas["canvas_" + id].dataset.kana == 'true' ? 12 : 6) : 0));
    }
  };

  KanjiCanvas.deleteLast = function (id) {
    KanjiCanvas["ctx_" + id].clearRect(0, 0, KanjiCanvas["w_" + id], KanjiCanvas["h_" + id]);
    KanjiCanvas.drawGuide(id);
    for(var i = 0;i<KanjiCanvas["recordedPattern_" + id].length-1;i++) {
      var stroke_i = KanjiCanvas["recordedPattern_" + id][i];
      for(var j = 0; j<stroke_i.length-1;j++) {
        KanjiCanvas["prevX_" + id] = stroke_i[j][0];
        KanjiCanvas["prevY_" + id] = stroke_i[j][1];

        KanjiCanvas["currX_" + id] = stroke_i[j+1][0];
        KanjiCanvas["currY_" + id] = stroke_i[j+1][1];
        KanjiCanvas.draw(id);
      }
    }
    KanjiCanvas["recordedPattern_" + id].pop();
  };

  KanjiCanvas.erase = function (id) {
    KanjiCanvas["ctx_" + id].clearRect(0, 0, KanjiCanvas["w_" + id], KanjiCanvas["h_" + id]);
    KanjiCanvas.drawGuide(id);
    KanjiCanvas["recordedPattern_" + id].length = 0;
  };

  KanjiCanvas.findxy = function (res, e, id) {
    var touch = e.changedTouches ? e.changedTouches[0] : null;
    
    if (touch) e.preventDefault(); // prevent scrolling while drawing to the canvas
    
    if (res == 'down') {
      var rect = KanjiCanvas["canvas_" + id].getBoundingClientRect();
      KanjiCanvas["prevX_" + id] = KanjiCanvas["currX_" + id];
      KanjiCanvas["prevY_" + id] = KanjiCanvas["currY_" + id];
      KanjiCanvas["currX_" + id] = (touch ? touch.clientX : e.clientX) - rect.left;
      KanjiCanvas["currY_" + id] = (touch ? touch.clientY : e.clientY) - rect.top;
      KanjiCanvas["currentLine_" + id] = new Array();
      KanjiCanvas["currentLine_" + id].push([KanjiCanvas["currX_" + id], KanjiCanvas["currY_" + id]]);

      KanjiCanvas["flagDown_" + id] = true;
	  KanjiCanvas["flagOver_" + id] = true;
      KanjiCanvas["dot_flag_" + id] = true;
      if (KanjiCanvas["dot_flag_" + id]) {
        KanjiCanvas["ctx_" + id].beginPath();
        KanjiCanvas["ctx_" + id].fillRect(KanjiCanvas["currX_" + id], KanjiCanvas["currY_" + id], 2, 2);
        KanjiCanvas["ctx_" + id].closePath();
        KanjiCanvas["dot_flag_" + id] = false;
      }
    }
    if (res == 'up') {
      KanjiCanvas["flagDown_" + id] = false;
	  if(KanjiCanvas["flagOver_" + id] == true) {
          KanjiCanvas["recordedPattern_" + id].push(KanjiCanvas["currentLine_" + id]);
	  }
    }

    if (res == "out") {
      KanjiCanvas["flagOver_" + id] = false;
	  if(KanjiCanvas["flagDown_" + id] == true) {
	      KanjiCanvas["recordedPattern_" + id].push(KanjiCanvas["currentLine_" + id]);
	  }
	  KanjiCanvas["flagDown_" + id] = false;
    }
	
	/*
	if (res == "over") {
    }
	*/

    if (res == 'move') {
      if (KanjiCanvas["flagOver_" + id] && KanjiCanvas["flagDown_" + id]) {
        var rect = KanjiCanvas["canvas_" + id].getBoundingClientRect();
        KanjiCanvas["prevX_" + id] = KanjiCanvas["currX_" + id];
        KanjiCanvas["prevY_" + id] = KanjiCanvas["currY_" + id];
        KanjiCanvas["currX_" + id] = (touch ? touch.clientX : e.clientX) - rect.left;
        KanjiCanvas["currY_" + id] = (touch ? touch.clientY : e.clientY) - rect.top;
        KanjiCanvas["currentLine_" + id].push([KanjiCanvas["prevX_" + id], KanjiCanvas["prevY_" + id]]);
        KanjiCanvas["currentLine_" + id].push([KanjiCanvas["currX_" + id], KanjiCanvas["currY_" + id]]);
        KanjiCanvas.draw(id);
      }
    }
  };

  // redraw to current canvas according to 
  // what is currently stored in KanjiCanvas["recordedPattern_" + id]
  // add numbers to each stroke
  KanjiCanvas.redraw = function (id, displayChange, showNumbers) {
      var answered = KanjiCanvas["canvas_" + id].dataset.strokesAnswer ? true : false;
    
      KanjiCanvas["ctx_" + id].clearRect(0, 0, KanjiCanvas["w_" + id], KanjiCanvas["h_" + id]);
      displayChange && !KanjiCanvas.quizOver && !answered && KanjiCanvas.drawGuide(id);
      
      // draw strokes
      for(var i = 0;i<KanjiCanvas["recordedPattern_" + id].length;i++) {
        var stroke_i = KanjiCanvas["recordedPattern_" + id][i];
        
        for(var j = 0; j<stroke_i.length-1;j++) {
          KanjiCanvas["prevX_" + id] = stroke_i[j][0];
          KanjiCanvas["prevY_" + id] = stroke_i[j][1];

          KanjiCanvas["currX_" + id] = stroke_i[j+1][0];
          KanjiCanvas["currY_" + id] = stroke_i[j+1][1];
          KanjiCanvas.draw(id, displayChange && !KanjiCanvas.quizOver && !answered ? null : KanjiCanvas.strokeColors[i]);
        }
      }
    
      // draw stroke numbers
      if (showNumbers) {
        var size = document.querySelector('.drawing-quiz') ? 15 : 20; // font size
        
        for(var i = 0;i<KanjiCanvas["recordedPattern_" + id].length;i++) {
          var stroke_i = KanjiCanvas["recordedPattern_" + id][i],
              x = stroke_i[Math.floor(stroke_i.length/2)][0] + 5,
              y = stroke_i[Math.floor(stroke_i.length/2)][1] - 5;
          
          KanjiCanvas["ctx_" + id].font = size.toString() + "px Arial";

          // outline
          KanjiCanvas["ctx_" + id].lineWidth = 3;
          KanjiCanvas["ctx_" + id].strokeStyle = KanjiCanvas.alterHex(KanjiCanvas.strokeColors[i] ? KanjiCanvas.strokeColors[i] : "#333333", 60, 'dec');
          KanjiCanvas["ctx_" + id].strokeText((i + 1).toString(), x, y);

          // fill
          KanjiCanvas["ctx_" + id].fillStyle = KanjiCanvas.strokeColors[i] ? KanjiCanvas.strokeColors[i] : "#333";
          KanjiCanvas["ctx_" + id].fillText((i + 1).toString(), x, y);
        }
      }
    
    if (!displayChange) KanjiCanvas["canvas_" + id].dataset.strokesAnswer = i;
  };
  
  
  // modifies hex colors to darken or lighten them
  KanjiCanvas.alterHex = function (hex, number, action) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
        color = [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)],
        i = 0, j = color.length;
    
    for (; i < j; i++) {
      switch (action) {
        case 'inc' :
          color[i] = ((color[i] + number) > 255 ? 255 : color[i] + number).toString(16);
          break;
          
        case 'dec' :
          color[i] = ((color[i] - number) < 0 ? 0 : color[i] - number).toString(16);
          break;
          
        default :
          break;
      }
      
      // add trailing 0
      if (color[i].length == 1) color[i] = color[i] + '0';
    }
    
    return '#' + color.join('');
  };
  

  // linear normalization for KanjiCanvas["recordedPattern_" + id]
  KanjiCanvas.normalizeLinear = function (id) {

    var normalizedPattern = new Array();
    KanjiCanvas.newHeight = 256;
    KanjiCanvas.newWidth = 256;
    KanjiCanvas.xMin = 256;
    KanjiCanvas.xMax = 0;
    KanjiCanvas.yMin = 256;
    KanjiCanvas.yMax = 0;
    // first determine drawn character width / length
    for(var i = 0;i<KanjiCanvas["recordedPattern_" + id].length;i++) {
      var stroke_i = KanjiCanvas["recordedPattern_" + id][i];
      for(var j = 0; j<stroke_i.length;j++) {
        KanjiCanvas.x = stroke_i[j][0];
        KanjiCanvas.y = stroke_i[j][1];
        if(KanjiCanvas.x < KanjiCanvas.xMin) {
          KanjiCanvas.xMin = KanjiCanvas.x;
        }
        if(KanjiCanvas.x > KanjiCanvas.xMax) {
          KanjiCanvas.xMax = KanjiCanvas.x;
        }
        if(KanjiCanvas.y < KanjiCanvas.yMin) {
          KanjiCanvas.yMin = KanjiCanvas.y;
        }
        if(KanjiCanvas.y > KanjiCanvas.yMax) {
          KanjiCanvas.yMax = KanjiCanvas.y;
        }
      }
    }	
    KanjiCanvas.oldHeight = Math.abs(KanjiCanvas.yMax - KanjiCanvas.yMin);
    KanjiCanvas.oldWidth  = Math.abs(KanjiCanvas.xMax - KanjiCanvas.xMin);

    for(var i = 0;i<KanjiCanvas["recordedPattern_" + id].length;i++) {
      var stroke_i = KanjiCanvas["recordedPattern_" + id][i];
      var normalized_stroke_i = new Array();
      for(var j = 0; j<stroke_i.length;j++) {
        KanjiCanvas.x = stroke_i[j][0];
        KanjiCanvas.y = stroke_i[j][1];
        KanjiCanvas.xNorm = (KanjiCanvas.x - KanjiCanvas.xMin) * (KanjiCanvas.newWidth / KanjiCanvas.oldWidth) ;
        KanjiCanvas.yNorm= (KanjiCanvas.y - KanjiCanvas.yMin) * (KanjiCanvas.newHeight / KanjiCanvas.oldHeight);
        normalized_stroke_i.push([KanjiCanvas.xNorm, KanjiCanvas.yNorm]);
      }
      normalizedPattern.push(normalized_stroke_i);
    }
    KanjiCanvas["recordedPattern_" + id] = normalizedPattern;
    KanjiCanvas.redraw(id);
  };
  
   // helper functions for moment normalization 

   KanjiCanvas.m10 = function (pattern) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
		    var stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				sum += stroke_i[j][0];
			}			
		}
		return sum;
	};
	
    KanjiCanvas.m01 = function (pattern) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
			var stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				sum += stroke_i[j][1];
			}			
		}
		return sum;
	};
		
    KanjiCanvas.m00 = function (pattern) {
	    var sum = 0;
		for(var i=0;i<pattern.length;i++) {
		   var stroke_i = pattern[i];
		   sum += stroke_i.length;
		}
		return sum;
	};
	
	 KanjiCanvas.mu20 = function (pattern, xc) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
			var stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				var diff = stroke_i[j][0] - xc;
				sum += (diff * diff);
			}			
		}
		return sum;
	};
	
	 KanjiCanvas.mu02 = function (pattern, yc) {
		var sum = 0;
		for(var i=0;i<pattern.length;i++) {
			var stroke_i = pattern[i];
			for(var j=0;j<stroke_i.length;j++) {
				var diff = stroke_i[j][1] - yc;
				sum += (diff * diff);
			}			
		}
		return sum;
	};
   
   	 KanjiCanvas.aran = function (width, height) {
		
		var r1 = 0.;
		if(height > width) {
			r1 = width / height;
		} else {
			r1 = height / width;
		}
		
		var a = Math.PI / 2.;
		var b = a * r1;
		var b1 = Math.sin(b);
		var c = Math.sqrt(b1);
		var d = c;
		
		var r2 = Math.sqrt(Math.sin((Math.PI/2.) * r1));
		return r2;
	};
	
	 KanjiCanvas.chopOverbounds = function (pattern) {
		
		var chopped = new Array();
		for(var i=0;i<pattern.length;i++) {
		    var stroke_i = pattern[i];
			var c_stroke_i = new Array();
			for(var j=0;j<stroke_i.length;j++) {
			    var x = stroke_i[j][0];
				var y = stroke_i[j][1];			
				if(x < 0) { x = 0; }
				if(x>=256) { x = 255; }
				if(y < 0) { y = 0; }
				if(y>=256) { y = 255; }
				c_stroke_i.push([x,y]);
			}
			chopped.push(c_stroke_i);
		}
		return chopped;		
	};
	
    KanjiCanvas.transform = function (pattern, x_, y_) {
	var pt = new Array();
		for(var i=0;i<pattern.length;i++) {
		    var stroke_i = pattern[i];
			var c_stroke_i = new Array();
			for(var j=0;j<stroke_i.length;j++) {
			    var x = stroke_i[j][0]+x_;
				var y = stroke_i[j][1]+y_;
				c_stroke_i.push([x,y]);
			}
			pt.push(c_stroke_i);
		}
		return pt;			
	};

	// main function for moment normalization
	KanjiCanvas.momentNormalize = function (id) {
			
		KanjiCanvas.newHeight = 256;
		KanjiCanvas.newWidth = 256;
		KanjiCanvas.xMin = 256;
		KanjiCanvas.xMax = 0;
		KanjiCanvas.yMin = 256;
		KanjiCanvas.yMax = 0;
		// first determine drawn character width / length
		for(var i = 0;i<KanjiCanvas["recordedPattern_" + id].length;i++) {
		  var stroke_i = KanjiCanvas["recordedPattern_" + id][i];
		  for(var j = 0; j<stroke_i.length;j++) {
			KanjiCanvas.x = stroke_i[j][0];
			KanjiCanvas.y = stroke_i[j][1];
			if(KanjiCanvas.x < KanjiCanvas.xMin) {
			  KanjiCanvas.xMin = KanjiCanvas.x;
			}
			if(KanjiCanvas.x > KanjiCanvas.xMax) {
			  KanjiCanvas.xMax = KanjiCanvas.x;
			}
			if(KanjiCanvas.y < KanjiCanvas.yMin) {
			  KanjiCanvas.yMin = KanjiCanvas.y;
			}
			if(KanjiCanvas.y > KanjiCanvas.yMax) {
			  KanjiCanvas.yMax = KanjiCanvas.y;
			}
		  }
		}	
		KanjiCanvas.oldHeight = Math.abs(KanjiCanvas.yMax - KanjiCanvas.yMin);
		KanjiCanvas.oldWidth  = Math.abs(KanjiCanvas.xMax - KanjiCanvas.xMin);
			
		var r2 = KanjiCanvas.aran(KanjiCanvas.oldWidth, KanjiCanvas.oldHeight);
		
		var aranWidth = KanjiCanvas.newWidth;
		var aranHeight = KanjiCanvas.newHeight;
		
		if(KanjiCanvas.oldHeight > KanjiCanvas.oldWidth) {
			aranWidth = r2 * KanjiCanvas.newWidth; 
		} else {
			aranHeight = r2 * KanjiCanvas.newHeight;
		}		
				
		var xOffset = (KanjiCanvas.newWidth - aranWidth)/2;
		var yOffset = (KanjiCanvas.newHeight - aranHeight)/2; 
		
		var m00_ = KanjiCanvas.m00(KanjiCanvas["recordedPattern_" + id]);
		var m01_ = KanjiCanvas.m01(KanjiCanvas["recordedPattern_" + id]);
		var m10_ = KanjiCanvas.m10(KanjiCanvas["recordedPattern_" + id]);
				
		var xc_ = (m10_/m00_);
		var yc_ = (m01_/m00_);
				
		var xc_half = aranWidth/2;
		var yc_half = aranHeight/2;
		
		var mu20_ = KanjiCanvas.mu20(KanjiCanvas["recordedPattern_" + id], xc_);
		var mu02_ = KanjiCanvas.mu02(KanjiCanvas["recordedPattern_" + id], yc_);

		var alpha = (aranWidth) / (4 * Math.sqrt(mu20_/m00_)) || 0;
		var beta = (aranHeight) / (4 * Math.sqrt(mu02_/m00_)) || 0;
			
		var nf = new Array();
		for(var i=0;i<KanjiCanvas["recordedPattern_" + id].length;i++) {
			var si = KanjiCanvas["recordedPattern_" + id][i];
			var nsi = new Array();
			for(var j=0;j<si.length;j++) {
				
				var newX = (alpha * (si[j][0] - xc_) + xc_half);
				var newY = (beta * (si[j][1] - yc_) + yc_half);
				
				nsi.push([newX,newY]);
			}
			nf.push(nsi);
		}
        
		return KanjiCanvas.transform(nf, xOffset, yOffset);
	};
	
  // distance functions
  KanjiCanvas.euclid = function (x1y1, x2y2) {
      var a = x1y1[0] - x2y2[0];
      var b = x1y1[1] - x2y2[1];
      var c = Math.sqrt( a*a + b*b );
	  return c;
  };

  // extract points in regular intervals
  KanjiCanvas.extractFeatures = function (kanji, interval) {
      var extractedPattern = new Array();
      var nrStrokes = kanji.length;
	  for(var i = 0;i<nrStrokes;i++) {
	      var stroke_i = kanji[i];
		  var extractedStroke_i = new Array();
		  var dist = 0.0;
	      var j = 0;
		  while(j < stroke_i.length) {
		      // always add first point
		      if(j==0) {
			  	  var x1y1 = stroke_i[0];
		          extractedStroke_i.push(x1y1);
			  }
		      if(j > 0) {
			      var x1y1 = stroke_i[j-1];
				  var x2y2 = stroke_i[j];
		          dist += KanjiCanvas.euclid(x1y1, x2y2);
              }
			  if((dist >= interval) && (j>1)) {
			      dist = dist - interval;
				  var x1y1 = stroke_i[j];
				  extractedStroke_i.push(x1y1);
			  }
			  j++;
		  }
		  // if we so far have only one point, always add last point
		  if(extractedStroke_i.length == 1) {
		      var x1y1 = stroke_i[stroke_i.length-1];
		      extractedStroke_i.push(x1y1);
		  } else {
		      if(dist > (0.75 * interval)) {
			      var x1y1 = stroke_i[stroke_i.length-1];
		          extractedStroke_i.push(x1y1);
			  }		  
		  }
		  extractedPattern.push(extractedStroke_i);
	  }
      return extractedPattern;
   };
   
   /* test extraction function
   KanjiCanvas.extractTest = function () {
      //var ex = KanjiCanvas.extractFeatures(KanjiCanvas["recordedPattern_" + id], 20.);
	  //KanjiCanvas["recordedPattern_" + id] = ex;

      //KanjiCanvas.redraw(id);
	  
	  var norm = normalizeLinearTest(test4);
	  var ex = KanjiCanvas.extractFeatures(norm, 20.);
	  //console.log(ex);
	  
   }*/
   
   KanjiCanvas.endPointDistance = function (pattern1, pattern2) {
       var dist = 0;
	   var l1 = typeof pattern1 == 'undefined' ? 0 : pattern1.length;
	   var l2 = typeof pattern2 == 'undefined' ? 0 : pattern2.length;
       if(l1 == 0 || l2 == 0) {
          return 0;
       } else {
	       var x1y1 = pattern1[0];
		   var x2y2 = pattern2[0];
		   dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
           x1y1 = pattern1[l1-1];
		   x2y2 = pattern2[l2-1];
		   dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
	   }
	   return dist;
   };
   
   KanjiCanvas.initialDistance = function (pattern1, pattern2) {
       var l1 = pattern1.length;
	   var l2 = pattern2.length;
	   var lmin = Math.min(l1,l2);
	   var lmax = Math.max(l1,l2);
	   var dist = 0;
	   for(var i = 0; i<lmin;i++) {
	       var x1y1 = pattern1[i];
		   var x2y2 = pattern2[i];
	       dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
	   }
	   return dist * (lmax / lmin);
   };
   
   // given to pattern, determine longer (more strokes)
   // and return quadruple with sorted patterns and their
   // stroke numbers [k1,k2,n,m] where n >= m and 
   // they denote the #of strokes of k1 and k2
   KanjiCanvas.getLargerAndSize = function (pattern1, pattern2) {
	   var l1 = typeof pattern1 == 'undefined' ? 0 : pattern1.length;
	   var l2 = typeof pattern2 == 'undefined' ? 0 : pattern2.length;
	   // definitions as in paper 
	   // i.e. n is larger 
	   var n = l1;
	   var m = l2;
	   var k1 = pattern1;
	   var k2 = pattern2;
	   if(l1 < l2) {
	       m = l1;
		   n = l2;
		   k1 = pattern2;
		   k2 = pattern1;
	   }	   	   
       return [k1,k2,n,m];
   };
   
   KanjiCanvas.wholeWholeDistance = function (pattern1, pattern2) {
       // [k1, k2, n, m]
       // a[0], a[1], a[2], a[3]
       var a = KanjiCanvas.getLargerAndSize(pattern1, pattern2);
	   var dist = 0;
	   for(var i = 0; i<a[3];i++) {
	       KanjiCanvas.j_of_i = parseInt(parseInt(a[2]/a[3]) * i);
		   var x1y1 = a[0][KanjiCanvas.j_of_i];
		   var x2y2 = a[1][i];
	       dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
	   }
	   return parseInt(dist/a[3]);
   };
   
   // initialize N-stroke map by greedy initialization
   KanjiCanvas.initStrokeMap = function (pattern1, pattern2, distanceMetric) {
       // [k1, k2, n, m]
       // a[0], a[1], a[2], a[3]
	   var a = KanjiCanvas.getLargerAndSize(pattern1, pattern2);
	   // larger is now k1 with length n
	   var map = new Array();
	   for(var i=0;i<a[2];i++) {
	      map[i] = -1;
	   }
	   var free = new Array();
	   for(var i=0;i<a[2];i++) {
	      free[i] = true;
	   }
	   for(var i=0;i<a[3];i++) {
           KanjiCanvas.minDist = 10000000;
		   KanjiCanvas.min_j = -1;
		   for(var j=0;j<a[2];j++) {
		       if(free[j] == true) {
			       var d = distanceMetric(a[0][j],a[1][i]);
  			       if(d < KanjiCanvas.minDist) {
				       KanjiCanvas.minDist = d;
					   KanjiCanvas.min_j = j;
			       }
			   }
		   }
		   free[KanjiCanvas.min_j] = false;
           map[KanjiCanvas.min_j] = i;
       }	   
	   return map;   
    };

	// get best N-stroke map by iterative improvement
	KanjiCanvas.getMap = function (pattern1, pattern2, distanceMetric) {
       // [k1, k2, n, m]
       // a[0], a[1], a[2], a[3]
       var a = KanjiCanvas.getLargerAndSize(pattern1, pattern2);
	   // larger is now k1 with length n
	   var L = 3;
	   var map = KanjiCanvas.initStrokeMap(a[0], a[1], distanceMetric);
	   for(var l=0;l<L;l++) {
	       for(var i=0;i<map.length;i++) {
		       if(map[i] != -1) {
                   KanjiCanvas.dii = distanceMetric(a[0][i], a[1][map[i]]);
				   for(var j=0;j<map.length;j++) {
				       // we need to check again, since 
					   // manipulation of map[i] can occur within
					   // the j-loop
					   if(map[i] != -1) {
					       if(map[j] != -1) {
						      var djj = distanceMetric(a[0][j],a[1][map[j]]);
                              var dij = distanceMetric(a[0][j],a[1][map[i]]);
                              var dji = distanceMetric(a[0][i],a[1][map[j]]);
							  if(dji + dij < KanjiCanvas.dii + djj) {
							      var mapj = map[j];
								  map[j] = map[i];
								  map[i] = mapj;
								  KanjiCanvas.dii = dij;
							  }
						   } else {
						       var dij = distanceMetric(a[0][j], a[1][map[i]]);
                               if(dij < KanjiCanvas.dii) {
                                  map[j] = map[i];
                                  map[i] = -1;
                                  KanjiCanvas.dii = dij;
							    }
						   }
					   }
				   }				   
               }
		   }
	   }
       return map;	   
	};
	
	// from optimal N-stroke map create M-N stroke map
	KanjiCanvas.completeMap = function (pattern1, pattern2, distanceMetric, map) {
       // [k1, k2, _, _]
       // a[0], a[1], a[2], a[3]
		var a = KanjiCanvas.getLargerAndSize(pattern1, pattern2);
	    if(!map.includes(-1)) {
		    return map;
		}
		// complete at the end
		var lastUnassigned = map[map.length];
		var mapLastTo = -1;
		for(var i = map.length -1; i>=0;i--) {
		    if(map[i] == -1) {
			    lastUnassigned = i;
			} else {
			    mapLastTo = map[i];
			    break;
			}
		}
		for(var i=lastUnassigned;i<map.length;i++) {
		    map[i] = mapLastTo;
		}
		// complete at the beginning
		var firstUnassigned = -1;
		var mapFirstTo = -1;
		for(var i = 0;i<map.length;i++) {
		    if(map[i] == -1) {
			    firstUnassigned = i;
			} else {
			    mapFirstTo = map[i];
				break;
			}
		}		
		for(var i=0;i<=firstUnassigned;i++) {
		    map[i] = mapFirstTo;
		}
		// for the remaining unassigned, check
		// where to "split"
        for(var i=0;i<map.length;i++) {
            if(i+1 < map.length && map[i+1] == -1) {
               // we have a situation like this:
               //   i       i+1   i+2   ...  i+n 
               //   start   -1    ?     -1   stop
               var start = i;

               var stop = i+1;
               while(stop<map.length && map[stop] == -1) {
                  stop++;
               }

               var div = start;
               var max_dist = 1000000;
               for(var j=start;j<stop;j++) {
                   var stroke_ab = a[0][start];
				   // iteration of concat, possibly slow
				   // due to memory allocations; optimize?!
			     	for(var temp=start+1;temp<=j;temp++) {
				       stroke_ab = stroke_ab.concat(a[0][temp]);
			    	}
				   var stroke_bc = a[0][j+1];

				   for(var temp=j+2;temp<=stop;temp++) {
				       stroke_bc = stroke_bc.concat(a[0][temp]);
				   }

				   var d_ab = distanceMetric(stroke_ab, a[1][map[start]]);
				   var d_bc = distanceMetric(stroke_bc, a[1][map[stop]]);				
                   if(d_ab + d_bc < max_dist) {
                       div = j;
                       max_dist = d_ab + d_bc;
                   }
               }
               for(var j=start;j<=div;j++) {
                   map[j] = map[start];
               }
               for(var j=div+1;j<stop;j++) {
                   map[j] = map[stop];
               }
            } 
        }
    return map;
	};
	
	// given two patterns, M-N stroke map and distanceMetric function,
	// compute overall distance between two patterns
	KanjiCanvas.computeDistance = function (pattern1, pattern2, distanceMetric, map) {
         // [k1, k2, n, m]
         // a[0], a[1], a[2], a[3]
	     var a = KanjiCanvas.getLargerAndSize(pattern1, pattern2);
		 var dist = 0.0;
		 var idx = 0;
		 while(idx < a[2]) {
		     var stroke_idx = a[1][map[idx]];
			 var start = idx;
			 var stop  = start+1;
			 while(stop<map.length && map[stop] == map[idx]) {
                  stop++;
             }
			 var stroke_concat = a[0][start];
			 for(var temp=start+1;temp<stop;temp++) {
				stroke_concat = stroke_concat.concat(a[0][temp]);
			 }
			 dist += distanceMetric(stroke_idx, stroke_concat);
			 idx = stop;
		 }
		 return dist;
	};
	
	// given two patterns, M-N strokemap, compute weighted (respect stroke
	// length when there are concatenated strokes using the wholeWhole distance
	KanjiCanvas.computeWholeDistanceWeighted = function (pattern1, pattern2, map) {
         // [k1, k2, n, m]
         // a[0], a[1], a[2], a[3]
	     var a = KanjiCanvas.getLargerAndSize(pattern1, pattern2);
		 var dist = 0.0;
		 var idx = 0;
		 while(idx < a[2]) {
		     var stroke_idx = a[1][map[idx]];
			 var start = idx;
			 var stop  = start+1;
			 while(stop<map.length && map[stop] == map[idx]) {
                  stop++;
             }
			 var stroke_concat = a[0][start];
			 for(var temp=start+1;temp<stop;temp++) {
				stroke_concat = stroke_concat.concat(a[0][temp]);
			 }
			 
			 var dist_idx = KanjiCanvas.wholeWholeDistance(stroke_idx, stroke_concat);
			 if(stop > start + 1) {
			    // concatenated stroke, adjust weight
				var mm = typeof stroke_idx == 'undefined' ? 0 : stroke_idx.length;
				var nn = stroke_concat.length;
				if(nn < mm) {
				   var temp = nn;
				   nn = mm;
				   mm = temp;
				}
                dist_idx = dist_idx * (nn/mm);				
			 }
			 dist += dist_idx;
			 idx = stop;
		 }
		 return dist;
	};
	
	// apply coarse classficiation w.r.t. inputPattern
	// considering _all_ referencePatterns using endpoint distance
	KanjiCanvas.coarseClassification = function (inputPattern)  {
	   var inputLength = inputPattern.length;
	   var candidates = [];
	   for(var i=0;i<KanjiCanvas.refPatterns.length;i++) {
	       var iLength = KanjiCanvas.refPatterns[i][1];
		   if(inputLength < iLength + 2 && inputLength > iLength-3) {
		       var iPattern = KanjiCanvas.refPatterns[i][2];
			   var iMap = KanjiCanvas.getMap(iPattern, inputPattern, KanjiCanvas.endPointDistance);
			   iMap =  KanjiCanvas.completeMap(iPattern, inputPattern, KanjiCanvas.endPointDistance, iMap);
			   var dist = KanjiCanvas.computeDistance(iPattern, inputPattern, KanjiCanvas.endPointDistance, iMap);
			   var m = iLength;
			   var n = iPattern.length;
			   if(n < m) {
			       var temp = n;
				   n = m;
				   m = temp;
			   }
			   candidates.push([i, (dist * (m/n))]);
		   }
	   }
	   candidates.sort(function(a, b){return a[1]-b[1]});
	   /*
	   var outStr = "";
	   for(var i=0;i<candidates.length;i++) {
	       outStr += candidates[i][0];
		   outStr += " ";
		   outStr += candidates[i][1];
		   outStr += KanjiCanvas.refPatterns[candidates[i][0]][0];
		   outStr += "|";	   
	   }	   
	   document.getElementById("coarseCandidateList").innerHTML = outStr;
	   */
	   return candidates;
	};
	
	// fine classfication. returns best 100 matches for inputPattern
	// and candidate list (which should be provided by coarse classification
	KanjiCanvas.fineClassification = function (inputPattern, inputCandidates) {
	   var inputLength = inputPattern.length;
	   var candidates = [];
	   for(var i=0;i<Math.min(inputCandidates.length, 100);i++) {
	       var j = inputCandidates[i][0];
	       var iLength = KanjiCanvas.refPatterns[j][1];
		   var iPattern = KanjiCanvas.refPatterns[j][2];
		      		   if(inputLength < iLength + 2 && inputLength > iLength-3) {

		   var iMap = KanjiCanvas.getMap(iPattern, inputPattern, KanjiCanvas.initialDistance);

		   iMap =  KanjiCanvas.completeMap(iPattern, inputPattern, KanjiCanvas.wholeWholeDistance, iMap);
		   if(KanjiCanvas.refPatterns[j][0] == "委") {
		     console.log("finished imap, fine:");
		     console.log(iMap);
			 console.log("weight:")
			 console.log(KanjiCanvas.computeDistance(iPattern, inputPattern, KanjiCanvas.wholeWholeDistance, iMap));
			 console.log("weight intended:")
			 console.log(KanjiCanvas.computeDistance(iPattern, inputPattern, KanjiCanvas.wholeWholeDistance, [0,1,2,3,4,7,5,6]));
			 }
		   var dist = KanjiCanvas.computeWholeDistanceWeighted(iPattern, inputPattern, iMap);
		   var n = inputLength;
		   var m = iPattern.length;
		   if(m > n) {
		       m = n;
		   }
		   dist = dist / m;
		   candidates.push([j, dist]);
	   }
	   }
	   candidates.sort(function(a, b){return a[1]-b[1]});
	   var outStr = "";
	   for(var i=0;i<Math.min(candidates.length, 10);i++) {
	       //outStr += candidates[i][0];
		   //outStr += " ";
		   //outStr += candidates[i][1];
		   outStr += KanjiCanvas.refPatterns[candidates[i][0]][0];
		   outStr += "  ";	   
	   }	   
	   //document.getElementById("candidateList").innerHTML = outStr;
      
      return outStr;
	};
	
	KanjiCanvas.recognize = function (id) {
		   
	   var mn = KanjiCanvas.momentNormalize(id);
      
	   var extractedFeatures = KanjiCanvas.extractFeatures(mn, 20.);
  
	   var map = KanjiCanvas.getMap(extractedFeatures, KanjiCanvas.refPatterns[0][2] ,KanjiCanvas.endPointDistance);
	   map = KanjiCanvas.completeMap(extractedFeatures, KanjiCanvas.refPatterns[0][2],KanjiCanvas.endPointDistance, map);

	   var candidates = KanjiCanvas.coarseClassification(extractedFeatures);
      
	   KanjiCanvas.redraw(id);
	   
      return KanjiCanvas.fineClassification(extractedFeatures, candidates);
	};
	
	/* test moment normalization 
	function MomentTest() {
	  KanjiCanvas["recordedPattern_" + id] = test4;
	  var mn = KanjiCanvas.momentNormalize(id);
	  KanjiCanvas["recordedPattern_" + id] = mn;
	  console.log(mn);
	  KanjiCanvas.redraw(id);
	
	} */
	
	/* copy current drawn pattern
	   as array to clipboard
	   i.e. to add missing patterns
	*/
	KanjiCanvas.copyStuff = function (id) {
	  KanjiCanvas.s = "";
      
	  for (var i = 0, j = KanjiCanvas["recordedPattern_" + id].length; i < j; i++) {
	    console.log(i + 1, KanjiCanvas["recordedPattern_" + id][i], KanjiCanvas["recordedPattern_" + id][i].toString());
	    console.log(KanjiCanvas["recordedPattern_" + id][i]);
	    console.log(JSON.stringify(KanjiCanvas["recordedPattern_" + id][i]));
	    KanjiCanvas.s += "[" + JSON.stringify(KanjiCanvas["recordedPattern_" + id][i]) + "],";
	  }
      
	  KanjiCanvas.copyToClipboard(KanjiCanvas.s);
	};
  
	KanjiCanvas.copyToClipboard = function (str) {
		var el = document.createElement('textarea');
		el.value = str;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		document.body.removeChild(el);
	};
  
    
  // event listener for shortcuts
  document.addEventListener('keydown', function (e) {
    var id = document.activeElement.id;
    
    if (KanjiCanvas["canvas_" + id] && e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        // undo
        case 'z' :
          e.preventDefault();
          KanjiCanvas.deleteLast(id);
          break;

        // erase
        case 'x' :
          e.preventDefault();
          KanjiCanvas.erase(id);
          break;
        
        // recognize
        case 'f' :
          if (/debug/.test(window.location.search)) {
            e.preventDefault();
            console.log(KanjiCanvas.recognize(id));
          }
          break;

        default :
          break;
      }
    }
  });
}(window, document));