/*

Copyright c 2009 Xyleme, Inc., 2060 Broadway, Suite 250, Boulder, C0 80302 USA.
All rights reserved.

This file and related documentation are protected by copyright and
are distributed under licenses regarding their use, copying, distribution,
and decompilation. No part of this product or related documentation may
be reproduced or transmitted in any form or by any means, electronic or
mechanical, for any purpose, without the express written permission of
Xyleme, Inc.

*/


var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
var isIE6  = ((navigator.appVersion.indexOf("MSIE") != -1) && (parseFloat(navigator.appVersion.split("MSIE")[1]) < 7)) ? true : false;
var isIE7  = ((navigator.appVersion.indexOf("MSIE") != -1) && (parseFloat(navigator.appVersion.split("MSIE")[1]) == 7)) ? true : false;
var lastOpen = null;

document.getElementsByClassName = function(cl) {
var retnode = [];
var myclass = new RegExp('\\b'+cl+'\\b');
var elem = this.getElementsByTagName('*');
for (var i = 0; i < elem.length; i++) {
var classes = elem[i].className;
if (myclass.test(classes)) retnode.push(elem[i]);
}
return retnode;
}; 

function showPopup(e){
    var availHeight;
    var availWidth;
 
    /*if(typeof(window.innerWidth) == 'number'){
        availHeight = window.innerHeight;
        availWidth = window.innerWidth;
    }else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)){
        availHeight = document.documentElement.clientHeight;
        availWidth = document.documentElement.clientWidth;
    }else if(document.body && (document.body.clientWidth || document.body.clientHeight)){
        availHeight = document.body.clientHeight;
        availWidth = document.body.clientWidth;
    }*/
	
	var id;
	var comp;
	if(isIE) {
		id = event.srcElement.id;
		comp = event.srcElement;
	} else {
		id = e.target.id;
		comp = e.target;
	}
	if ("search_result" == id) 
		id = comp.parentNode.id;
	if(lastOpen != null)
		document.getElementById(lastOpen + 'pop').style.display = "none";
	lastOpen = id;
 
    var popupWidth = 200;
    var popupHeight = 200;
    var left = (availWidth/2) - (popupWidth/2);
    var top = (availHeight/2) - (popupHeight/2);
    var popup = document.getElementById(id + 'pop');
	var span = document.getElementById(id);
    popup.style.zIndex="999";
	if(span != null) {
		// disable absolute positioning  in case of  <divLinkSpot>
		if(popup.parentNode.parentNode.id.indexOf("divLinkSpot") == -1)
			popup.style.position = 'absolute';
		else
			popup.style.position = '';
		if(isIE) {
			popup.style.left = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft + 5 + "px";
			popup.style.top = event.clientY + document.body.scrollTop + document.documentElement.scrollTop + 5 + "px";
		} else {
			popup.style.left = e.pageX + 5 + "px";
			popup.style.top = e.pageY + 5 + "px";
		}
	} else {
		popup.style.position="fixed";
		popup.style.top="43%";
		popup.style.left="43%";
	}
	popup.style.display="block";
	
	if(popup.offsetWidth < popup.offsetHeight) {
		var sizeDiff;
		sizeDiff = popup.offsetHeight - popup.offsetWidth;
		if(sizeDiff < popup.offsetLeft - 5)
			popup.style.left = (popup.offsetLeft - sizeDiff) + "px";
		else
			popup.style.left = "5px";
	}
	
	if((popup.offsetLeft + popup.offsetWidth) > document.body.offsetWidth) {
		var sizeDiff;
		sizeDiff = popup.offsetLeft + popup.offsetWidth - document.body.offsetWidth;
		if(sizeDiff < popup.offsetLeft - 5)
			popup.style.left = (popup.offsetLeft - sizeDiff) + "px";
		else
			popup.style.left = "5px";
	}
}

function Point()
{
	this.x = 0;
	this.y = 0;
}

function getAngle(x1, y1, x2, y2) {
	return Math.atan((y2-y1)/(x2-x1));
}

function rotate(angle, x, y) {
	var result = new Point();
	result.x = Math.cos(angle)*x - Math.sin(angle)*y;
	result.y = Math.sin(angle)*x + Math.cos(angle)*y;
	return result;
}

function drawArrows(x1, y1, x2, y2, jg, arrows) {
	if(x1 != x2) {
		var x20 = x2, y20 = y2;
		var flip = false;
		if(x1 > x2) {
			x2 = x1;
			y2 = y1;
			x1 = x20;
			y1 = y20;
			x20 = x2;
			y20 = y2;
			flip = true;
		}
		var angle = getAngle(x1, y1, x2, y2);
		if((arrows == "1" && !flip) || arrows=="3" || (arrows == "2" && flip)) {
			var pt = rotate(-angle, x2-x1, y2-y1);
			x2 = pt.x-15;
			y2 = pt.y-5;
			pt = rotate(angle, x2, y2);
			jg.drawLine(x20, y20, x1+pt.x, y1+pt.y);
			y2 += 10;
			pt = rotate(angle, x2, y2);
			jg.drawLine(x20, y20, x1+pt.x, y1+pt.y);
		}
		if((arrows == "2" && !flip) || arrows=="3" || (arrows == "1" && flip)) {
			x20 = x1;
			y20 = y1;
			var pt = rotate(-angle, x1-x2, y1-y2);
			x1 = pt.x+15;
			y1 = pt.y+5;
			pt = rotate(angle, x1, y1);
			jg.drawLine(x20, y20, x2+pt.x, y2+pt.y);
			y1 -= 10;
			pt = rotate(angle, x1, y1);
			jg.drawLine(x20, y20, x2+pt.x, y2+pt.y);
		}
	} else {
		//Vertical line
		var flip = false;
		if(y1 > y2) {
			var y = y2;
			y2 = y1;
			y1 = y;
			flip = true;
		}
		if((arrows == "1" && !flip) || arrows=="3" || (arrows == "2" && flip)) {
			jg.drawLine(x2, y2, x2-5, y2-15);
			jg.drawLine(x2, y2, x2+5, y2-15);
		}
		if((arrows == "2" && !flip) || arrows=="3" || (arrows == "1" && flip)) {
			jg.drawLine(x1, y1, x1-5, y1+15);
			jg.drawLine(x1, y1, x1+5, y1+15);
		}
	}
}

function getLeft(element, wrap)
{
	//  HACKS for IE6, IE8 and Safafi 
	var ieOffset7 = 10;
	var ieOffset6 = 25;
	if(element.children) {
		for(var i=0; i<element.children.length; i++)
		{
			if(element.children[i].tagName == "IMG")
			{
				if(isIE7) return element.children[i].offsetLeft - ieOffset7;
				if(isIE6) return element.children[i].offsetLeft - ieOffset6;
				return element.children[i].offsetLeft;
			}
		}
	} else {
		var children = element.childNodes;
		for(var i=0; i<element.childNodes.length; i++)
		{
			if(element.childNodes[i].tagName == "IMG")
			{
				return element.childNodes[i].offsetLeft;
			}
		}
	}
	return 0;
}

function alignMarginNote(id) {
    var currentNote = document.getElementById(id);
    if(currentNote.parentNode.className != "Glossary")
        do {
            var moved = false;
            if(isIE) {
                var figures = document.getElementsByClassName("WrapLeft");
                for(var i=0; i<figures.length; i++) {
                    if(currentNote != figures[i] && currentNote.offsetTop <= figures[i].offsetTop + figures[i].offsetHeight && 
                            currentNote.offsetTop >= figures[i].offsetTop) {
                        currentNote.style.left = figures[i].offsetParent.offsetLeft + "px";
                    }
                }
            }
            moved = moved || alingMarginNoteByClass(currentNote, "GlossaryItem");
            moved = moved || alingMarginNoteByClass(currentNote, "MarginNote");
            moved = moved || alingMarginNoteByClass(currentNote, "ObjectiveNote");
        } while(moved)
}

function alingMarginNoteByClass(currentNote, className) {
    var marginNotes = document.getElementsByClassName(className);
    var moved = false;
    for(var i=0; i<marginNotes.length; i++) {
        if(currentNote != marginNotes[i] && currentNote.offsetTop <= marginNotes[i].offsetTop + marginNotes[i].offsetHeight && 
                currentNote.offsetTop >= marginNotes[i].offsetTop) {
            currentNote.style.top = marginNotes[i].offsetTop + marginNotes[i].offsetHeight + 5 + "px";
            moved = true;
        }
    }
    return moved;
}

function getWindowHeight() {
	if (isIE)
		return document.documentElement.offsetHeight;
  	else
		return document.documentElement.scrollHeight;
}

// --------------common functions begin-----------------
// --- adds event handler to a page ---
function addEvent(obj, evType, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evType, fn, false);
        return true;
    } else if (obj.attachEvent) {
        var r = obj.attachEvent("on"+evType, fn);
        return r;
    } else {
        return false;
    }
}

// --- removes event handler to a page ---
function removeEvent(obj, evType, fn) {
	if (obj.removeEventListener) {
		obj.removeEventListener(evType, fn, false);
		return true;
	} else if (obj.detachEvent) {
		var r = obj.detachEvent("on"+evType, fn);
		return r;
	} else {
		return false;
	}
}

if (navigator.appName == "Netscape") {
	getElementsByName = function(tag, name) {
		arr = document.getElementsByName(name);
		return arr;
	}
} else {
	getElementsByName = function(tag, name) {
		var elem = document.getElementsByTagName(tag);
		var arr = new Array();
		for(i = 0,iarr = 0; i < elem.length; i++) {
			var att = elem[i].getAttribute("name");
			if(att == name) {
			   arr[iarr] = elem[i];
			   iarr++;
			}
		}
		return arr;
	}
}

function ExtractNumber(value) {
    var n = parseInt(value);		
    return n == null || isNaN(n) ? 0 : n;
}

/*retrieves element from document by id*/
function byId(id) {
    return document.getElementById(id);
}

/*defines weather @decendant element is decendant of @ancestor*/
function isDecendant(decendant, ancestor) {
    return ((decendant.parentNode==ancestor)  ||
        (decendant.parentNode!=document) &&
            isDecendant(decendant.parentNode,ancestor));
}

function getFlashMovieObject(movieName) {
  if (window.document[movieName]) 
  {
    return window.document[movieName];
  }
  if (navigator.appName.indexOf("Microsoft Internet")==-1)
  {
    if (document.embeds && document.embeds[movieName])
      return document.embeds[movieName]; 
  }
  else // if (navigator.appName.indexOf("Microsoft Internet")!=-1)
  {
    return document.getElementById(movieName);
  }
}
// --------------common functions end-----------------
	function highlight() {
		var addr = location.href;
		var pat = "";
		if (addr.indexOf("hl=true", 0)>=0){
			if(addr.indexOf("sok=web_mobile")>=0)
				pat=parent.document.getElementById("search").value;
			else
				pat=parent.parent.parent.frames[1].frames[0].frames[1].document.getElementById("search").value;
		} else {
			return;
		}
		var words = pat.split(" ");
		var counter=0;
		for (var i=0; i<words.length; i++){
			if (words[i]!=""){
				counter++;
				innerHighlight(document.body, words[i].toUpperCase(), counter);
			}
		}
	}
	
	function innerHighlight(node, pat, nw) {
		var color = "#00F030";
		var skip = 0;
		if (node.nodeType == 3) {
			var pos = node.data.toUpperCase().indexOf(pat);
			if (pos >= 0) {
				var spannode = document.createElement('span');
				spannode.style.background = color;
				spannode.id = "search_result";
				var middlebit = node.splitText(pos);
				var endbit = middlebit.splitText(pat.length);
				var middleclone = middlebit.cloneNode(true);
				spannode.appendChild(middleclone);
				middlebit.parentNode.replaceChild(spannode, middlebit);
				skip = 1;
			}
		}
		else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
			for (var i = 0; i < node.childNodes.length; ++i) {
				i += innerHighlight(node.childNodes[i], pat, nw);
			}
		}
		return skip;
	}
