var normalAttr = [
  'width',
  'height',
  'left',
  'top',
  'bottom',
  'right',
  'marginLeft',
  'marginTop',
  'marginBottom',
  'marginRight'
];

var css3Attr = [
  'rotate',
  'rotateX',
  'rotateY',
  'skewX',
  'skewY',
  'translateX',
  'translateY',
  'translateZ',
  'scale',
  'scaleX',
  'scaleY'
];

function indexOf(arr, item){
  for(var i=0,len=arr.length; i<len; i++){
    if(arr[i] === item){
      return i;
    }
  }
  return -1;
}

function css(ele, attr, val){
  if(typeof attr === 'string' && typeof val === 'undefined'){
    if(indexOf(css3Attr, attr) !== -1){
      return transform(ele, attr);
    }
    var ret = getComputedStyle(ele)[attr];
    return indexOf(normalAttr, attr) !== -1 ? parseFloat(ret) : ret * 1 === ret * 1 ? ret*1 : ret;  
  }
  
  function setAttr(attr, val){
    if(indexOf(css3Attr, attr) !== -1){
      return transform(ele, attr, val);
    }
    if(indexOf(normalAttr, attr) !== -1){
      ele.style[attr] = val ? val + 'px' : val;
    }else{
      ele.style[attr] = val;
    }
  }
  
  // 批量设置
  if(typeof attr === 'object'){
    for(var key in attr){
      setAttr(key, attr[key]);
    }
    return;
  }
  
  setAttr(attr, val);
}

css.init3d = function (el){
  css(el, {
    rotate: 0,
    rotateX: 0,
    rotateY: 0,
    translateX: 0,
    translateY: 0,
    translateZ: 0,
    skewX: 0,
    skewY: 0,
    scale: 1,
    scaleX: 1,
    scaleY: 1
  });
};

function transform(el, attr, val){
  el._transform = el._transform || {};

  if(typeof val === 'undefined'){
    return el._transform[attr];
  }
  
  el._transform[attr] = val;
  
  var str = '';
  
  for(var key in el._transform){
    var value = el._transform[key];
    switch (key) {
      case 'translateX':
      case 'translateY':
      case 'translateZ':
        str += `${key}(${value}px) `;
        break;
      case 'rotate':
      case 'rotateX':
      case 'rotateY':
      case 'skewX':
      case 'skewY':
        str += `${key}(${value}deg) `;
        break;
      default:
        str += `${key}(${value}) `;
    }
  }
  
  el.style.transform = str.trim();
}

function animation(props){
  var el = props.el;
  
  if(el.animation) return;
  
  var duration = props.duration || 400,
      fx = props.fx || 'easeOut',
      cb = props.cb,
      attrs = props.attrs || {};
  
  var beginData = {}, changeData = {};
  
  for(var key in attrs){
    beginData[key] = css(el, key);
    changeData[key] = attrs[key] - beginData[key];
  }
  
  var startTime = Date.now();
  
  (function startMove(){
    el.animation = window.requestAnimationFrame(startMove);
    
    var time = Date.now() - startTime;
    
    if(time > duration){
      time = duration;
      window.cancelAnimationFrame(el.animation);
      el.animation = null;
    }
    
    for(var key in attrs){
      var currentPos = Tween[fx](time, beginData[key], changeData[key], duration);
      css(el, key, currentPos);
    }
    
    if(time === duration && typeof cb === 'function'){
      cb.call(el);
    }
  })();
}

animation.stop = function (el){
  window.cancelAnimationFrame(el.animation);
  el.animation = null;
};

var Tween = {
	linear: function (t, b, c, d){  //匀速
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){  //加速曲线
		return c*(t/=d)*t + b;
	},
	easeOut: function(t, b, c, d){  //减速曲线
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(t, b, c, d){  //加速减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d){  //加加速曲线
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(t, b, c, d){  //减减速曲线
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d){  //加加速减减速曲线
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p){  //正弦衰减曲线（弹动渐入）
		if (t === 0) { 
			return b; 
		}
		if ( (t /= d) == 1 ) {
			return b+c; 
		}
		if (!p) {
			p=d*0.3; 
		}
		if (!a || a < Math.abs(c)) {
			a = c; 
			var s = p/4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(t, b, c, d, a, p){    //*正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},    
	elasticBoth: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d/2) == 2 ) {
			return b+c;
		}
		if (!p) {
			p = d*(0.3*1.5);
		}
		if ( !a || a < Math.abs(c) ) {
			a = c; 
			var s = p/4;
		}
		else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		if (t < 1) {
			return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
					Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) * 
				Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	},
	backIn: function(t, b, c, d, s){     //回退加速（回退渐入）
		if (typeof s == 'undefined') {
		   s = 1.70158;
		}
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 3.70158;  //回缩的距离
		}
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}, 
	backBoth: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 1.70158; 
		}
		if ((t /= d/2 ) < 1) {
			return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		}
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d){    //弹球减振（弹球渐出）
		return c - Tween['bounceOut'](d-t, 0, c, d) + b;
	},       
	bounceOut: function(t, b, c, d){//*
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		}
		return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	},      
	bounceBoth: function(t, b, c, d){
		if (t < d/2) {
			return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
}

function shake(props){
  var el = props.el;
  
  if(el.shake) return;
  
  var dir = props.dir || 'X',
      times = props.times || 20,
      cb = props.cb;
  
  if(times < 20) times = 20;
  if(times > 100) times = 100;
  
  var arr = [];
  
  for(var i=times; i>=0; i--){
    arr[arr.length] = -i;
    arr[arr.length] = i;
  }
  arr.length--;
  
  var index = 0;
  var start = 0;
  
  (function move(){
    el.shake = window.requestAnimationFrame(move);
    
    if(index === arr.length){
      window.cancelAnimationFrame(el.shake);
      el.shake = null;
      if(typeof cb === 'function'){
        return cb.call(el);
      }
      return;
    }
    
    css(el, 'translate' + dir, start + arr[index++]);
  })();
}

function add0(n){
  return n < 10 ? '0' + n : '' + n;
}

function rp(arr, int){
  var min = Math.min(...arr);
  var max = Math.max(...arr);
  var ret = Math.random() * (max - min) + min;
  return int ? Math.round(ret) : ret;
}

function duang(ele1, ele2){
  var rect1 = ele1.getBoundingClientRect();
  var rect2 = ele2.getBoundingClientRect();
  return rect1.right > rect2.left && rect1.left < rect2.right && rect1.bottom > rect2.top && rect1.top < rect2.bottom;
}

function getRect(ele){
  return ele.getBoundingClientRect()
}

function dragEle(props){
  var downEle = props.downEle;
  var moveEle = props.moveEle || downEle;
  var scrope = props.scrope || true;
  var beforeFn = props.beforeFn;
  var moveFn = props.moveFn;
  var endFn = props.endFn;
  var called = props.called || downEle;
  
  var dx, dy, 
      offsetParent = moveEle.offsetParent,
      parentRect = getRect(offsetParent);
  
  downEle.addEventListener('mousedown', function (e){
    e.preventDefault();
    
    beforeFn&&beforeFn.call(called);
    
    var moveTargetRect = getRect(moveEle);
    
    dx = e.pageX - moveTargetRect.left;
    dy = e.pageY - moveTargetRect.top;
    
    document.addEventListener('mousemove', docMove);
    offsetParent.addEventListener('mousemove', startMove);
    offsetParent.addEventListener('mouseup', cancelMove);
  });
  
  function startMove(e){
    var x = e.pageX - dx - parentRect.left;
    var y = e.pageY - dy - parentRect.top;

    if(scrope){
      if(x < 0) x = 0;
      if(x > offsetParent.clientWidth - moveEle.offsetWidth){
        x = offsetParent.clientWidth - moveEle.offsetWidth;
      }
      
      if(y < 0) y = 0;
      if(y > offsetParent.clientHeight - moveEle.offsetHeight){
        y = offsetParent.clientHeight - moveEle.offsetHeight;
      }
    }
    
    moveEle.style.left = x +'px';
    moveEle.style.top = y + 'px';
    
    moveFn&&moveFn.call(called);
  }
  
  function cancelMove(){
    endFn&&endFn.call(called);
    document.removeEventListener('mousemove', docMove);
    offsetParent.removeEventListener('mousemove', startMove);
    offsetParent.removeEventListener('mouseup', cancelMove);
  }
  
  function docMove(e){
    var x = e.pageX, y = e.pageY;
    if(x < parentRect.left || x > parentRect.right || y < parentRect.top || y > parentRect.bottom){
      cancelMove();
    }
  }
}

function createColor(){
  return `rgb(${rp([55, 255], true)}, ${rp([55, 255], true)}, ${rp([55, 255], true)})`;
}

function mouseWheel(ele, upFn, downFn){
  if(window.onmousewheel === null){
    ele.addEventListener('mousewheel', fn);
  }else{
    ele.addEventListener('DOMMouseScroll', fn);
  }

  function fn(e){
    var dir;
    
    if(e.detail){
      dir = e.detail < 0 ? true : false;
    }
    if(e.wheelDelta){
      dir = e.wheelDelta > 0 ? true : false;
    }
    
    if(dir){
      upFn&&upFn.call(ele, e);
    }else{
      downFn&&downFn.call(ele, e);
    }
  }
}
