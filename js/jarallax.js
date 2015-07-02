/*!
 * Jarallax
 * Version: 0.2.4b
 * website: http://jarallax.com
 *
 * Copyright 2013, Jacko Hoogeveen
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * http://jarallax.com/license.html
 * 
 * Date: 08 Jun 2013
 */

////////////////////////////////////////////////////////////////////////////////
// jarallax class //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
var Jarallax = function () {
  this.FPS = 24;
  this.FPS_INTERVAL = 1000 / this.FPS;
  this.FRAME_DATA_SAMPLE = 24;
  this.FRAME_DATA_REFRESH = 12;
  this.fpsTop = 0;
  this.fpsBottom = 1000;
  this.animations = [];
  this.defaultValues = [];
  this.progress = 0.0;
  this.properties = {};
  this.prevProgress = 0.0;
  this.controllers = [];
  this.maxProgress = 1;
  this.timer = undefined;
  this.allowWeakProgress = true;
  this.frameRate = this.FPS;
  this.stepSize = 0;
  this.jumping = false;
  
  for(var argument in arguments) {
    if (arguments[argument] instanceof Array){
      this.controllers = arguments[argument];
    } else if (arguments[argument].isController) {
      this.controllers.push(arguments[argument]);
    } else if (arguments[argument] instanceof Object) {
      this.properties = arguments[argument];
    } else {
      console.log('WARNING: bad argument ' + argument);
    }
  }
  
  if (!this.controller) {
    if($.browser.iDevice) {
      this.controllers.push(new ControllerApple(false));
    } else if ($.browser.mozilla) {
      this.controllers.push(new ControllerScroll(false,
          this.properties.horizontal, this.properties.disableVertical));
    } else {
      this.controllers.push(new ControllerScroll(true,
          this.properties.horizontal, this.properties.disableVertical));
    }
  }

  for (var i in this.controllers) {
    this.controllers[i].activate(this);
  }

  this.frameChart = [];
  for(var j = 1; j <= 600; j++) {
    this.frameChart[j] = (1000 / j);
  }
};

////////////////////////////////////////////////////////////////////////////////
// Jarallax methods ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
Jarallax.prototype.setProgress = function (progress, isWeak) {
  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }
  
  if(this.progress != progress){
    this.progress = progress;
    if (this.allowWeakProgress || !weak) {
      
      this.previousTime = new Date();
      this.currentTime = new Date();
      var weak = isWeak || false;

      for (var defaultValue in this.defaultValues) {
        this.defaultValues[defaultValue].activate(this.progress);
      }

      for (var animation in this.animations) {
        this.animations[animation].activate(this.progress);
      }

      for (var controller in this.controllers) {
        this.controllers[controller].update(this.progress);
      }

      this.currentTime = new Date();
      this.stepSize = Math.max(this.currentTime - this.previousTime, this.stepSize);
    }
  }
};

Jarallax.prototype.clearAnimations = function() {
  this.animations = [];
};

Jarallax.prototype.clearDefaults = function() {
  this.defaultValues = [];
};

Jarallax.prototype.clearControllers = function() {
  this.controllers = [];
};

Jarallax.prototype.jumpToProgress = function (progress, time, fps) {
  if (!progress.indexOf) {
    progress = progress / this.maxProgress;
  } else if (progress.indexOf('%') != -1) {
    progress = parseFloat(progress) / 100;
  }

  if(progress == this.progress) {
    return false;
  }

  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }

  this.smoothProperties = {};
  this.smoothProperties.timeStep = 1000 / fps;
  this.smoothProperties.steps = time / this.smoothProperties.timeStep;
  this.smoothProperties.currentStep = 0;

  this.smoothProperties.startProgress = this.progress;
  this.smoothProperties.diffProgress = progress - this.progress;
  this.smoothProperties.previousValue = this.progress;
  this.smooth();
  this.allowWeakProgress = false;

  return false;
};

Jarallax.prototype.smooth = function (externalScope) {
  var scope;
  if (!externalScope) {
    scope = this;
  } else {
    scope = externalScope;
  }

  scope.smoothProperties.currentStep++;
  clearTimeout(scope.timer);
  if (scope.smoothProperties.currentStep < scope.smoothProperties.steps) {
    var position = scope.smoothProperties.currentStep / scope.smoothProperties.steps;
    var newProgress = Jarallax.EASING.easeOut(position,
                                       scope.smoothProperties.startProgress,
                                       scope.smoothProperties.diffProgress,
                                       1,
                                       5);

    scope.jumpingAllowed = true;
    scope.setProgress(newProgress);
    scope.jumpingAllowed = false;
    scope.timer = window.setTimeout(function(){scope.smooth(scope);}, scope.smoothProperties.timeStep);
    scope.smoothProperties.previousValue = newProgress;
    scope.allowWeakProgress = false;
  } else {
    scope.jumpingAllowed = true;
    scope.setProgress(scope.smoothProperties.startProgress + scope.smoothProperties.diffProgress);
    scope.jumpingAllowed = false;
    scope.clearSmooth(scope);
  }
};

Jarallax.prototype.clearSmooth = function(scope){
  scope.allowWeakProgress = true;
  clearTimeout(scope.timer);
  delete scope.smoothProperties;
};

Jarallax.prototype.setDefault = function (selector, values) {
  if (!selector) {
    throw new Error('no selector defined.');
  }

  if (JarallaxTools.isValues(values))
  {
    var newDefault = new JarallaxObject(selector, values);
    newDefault.activate();
    this.defaultValues.push(newDefault);
  }
};

Jarallax.prototype.addStatic = function (selector, values) {
  if (!selector) {
    throw new Error('no selector defined.');
  }

  if (JarallaxTools.isValues(values))
  {
    var newDefault = new JarallaxStatic(selector, values[0], values[1]);
    this.defaultValues.push(newDefault);
  }
};

Jarallax.prototype.addCounter = function (properties) {
  this.animations.push(new JarallaxCounter(this, properties));
};

Jarallax.prototype.addController = function (controller, activate) {
  this.controllers.push(controller);

  if (activate) {
    controller.activate(this);
  }
};

Jarallax.prototype.addAnimation = function (selector, values, platforms, allMustBeTrue) {
  if (!platforms) {
    platforms = ['any'];
  } else if(platforms.substring) {
    platforms = [platforms];
  } else {
    platforms = platforms || [JarallaxTools.Platform.Any];
  }

  if (JarallaxTools.PlatformAllowed(platforms, allMustBeTrue)) {
    var newAnimation;

    if (!selector) {
      throw new Error('no selector defined.');
    }

    var returnValue = [];
    if (JarallaxTools.isValues(values)) {
      if (values.length) {
        for (var i = 0; i < values.length - 1; i++) {
          if (values[i] && values[i + 1])
          {
            if (values[i].progress && values[i + 1].progress) {
              if (values[i + 1].progress.indexOf('%') == -1) {
                if (this.maxProgress < values[i + 1].progress) {
                  this.maxProgress = values[i + 1].progress;
                }
              }
              newAnimation = new JarallaxAnimation(selector, values[i], values[i + 1], this);
              this.animations.push(newAnimation);
              returnValue.push(newAnimation);
            }
            else
            {
              throw new Error('no animation boundry found.');
            }
          }
          else
          {
            throw new Error('bad animation data.');
          }
        }
      } else {
        if (!values.progress) {
          values.progress = '100%';
        }
        var startValues = {};

        for (var j in values) {
          startValues[j] = $(selector).css(j);
        }

        startValues.progress = '0%';


        newAnimation = new JarallaxAnimation(selector, startValues, values, this);
        this.animations.push(newAnimation);
        returnValue.push(newAnimation);
      }
    }
    return returnValue;
  }
  return false;
};

Jarallax.prototype.cloneAnimation = function (selector, adittionalValues, animations) {
  if (!selector) {
    throw new Error('no selector defined.');
  }

  var newAnimations = [];
  var adittionalValuesArray = [];

  for (var i = 0; i < animations.length + 1; i++) {
    if (adittionalValues instanceof Array) {
      adittionalValuesArray.push(adittionalValues[i]);
    } else {
      adittionalValuesArray.push(adittionalValues);
    }
  }

  for (i = 0; i < animations.length; i++) {
    var currentAnimation = animations[i];
    var newStart = JarallaxTools.clone(currentAnimation.startValues);
    var newEnd = JarallaxTools.clone(currentAnimation.endValues);

    var adittionalValueStart = adittionalValuesArray[i];
    var adittionalValueEnd = adittionalValuesArray[i + 1];

    for (var j in newStart) {
      if (adittionalValueStart[j]) {
        newStart[j] = JarallaxTools.calculateNewValue(adittionalValueStart[j], newStart[j]);
      }
    }

    for (var k in newEnd) {
      if (adittionalValueEnd[k]) {
        newEnd[k] = JarallaxTools.calculateNewValue(adittionalValueEnd[k], newEnd[k]);
      }
    }

    newAnimations.push(this.addAnimation(selector, [newStart, newEnd])[0]);

  }
  return newAnimations;
};

////////////////////////////////////////////////////////////////////////////////
// Jarallax static methods /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
Jarallax.EASING = {
  'linear':function (currentTime, beginningValue, changeInValue, duration, power) {
    return currentTime / duration * changeInValue + beginningValue;
  },

  'easeOut':function (currentTime, beginningValue, changeInValue, duration, power) {
   if (power === undefined) {
    power = 2;
   }
   return ((Math.pow((duration - currentTime) / duration, power) * -1) + 1) * changeInValue + beginningValue;
  },
  'easeIn':function (currentTime, beginningValue, changeInValue, duration, power) {
   if (power === undefined) {
    power = 2;
   }
   return Math.pow(currentTime / duration, power) * changeInValue + beginningValue;
  },
  'easeInOut':function (currentTime, beginningValue, changeInValue, duration, power) {
   if (power === undefined) {
    power = 2;
   }
   changeInValue /= 2;
   currentTime *= 2;
   if (currentTime < duration) {
     return Math.pow(currentTime / duration, power) * changeInValue + beginningValue;
   } else {
     currentTime = currentTime - duration;
     return ((Math.pow((duration - currentTime) / duration, power) * -1) + 1) * changeInValue + beginningValue + changeInValue;
   }

   return Math.pow(currentTime / duration, power) * changeInValue + beginningValue;
  }
};

Jarallax.EASING.none = Jarallax.EASING.linear;

////////////////////////////////////////////////////////////////////////////////
// Jarallax tools //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
JarallaxTools = {};

JarallaxTools.hasNumbers = function(t) {
  var expr = new RegExp('\\d');
  return expr.test(t);
  
};

JarallaxTools.isValues = function(object) {
  if(!object) {
    throw new Error('no values set.');
  }
  
  if(typeof object != 'object') {
    throw new Error('wrong data type values. expected: "object", got: "' + 
        typeof object + '"');
  }
  
  if(object.size === 0) {
    throw new Error('Got an empty values object');
  }
  
  return true;
};

JarallaxTools.PlatformAllowed = function(platforms, allMustBeTrue, invert){
  allMustBeTrue = allMustBeTrue || false;
  invert = invert || false;
  for (var i = 0; i < platforms.length; i++) {
    if(platforms[i] == 'any'){
      return !invert;
    }
    if(jQuery.browser[platforms[i]]) {
      if(!allMustBeTrue) {
        return !invert;
      }
    } else if(allMustBeTrue) {
      return invert;
    }
  }
  
  return !invert ? allMustBeTrue : !allMustBeTrue;
};

JarallaxTools.calculateNewValue = function (modifier, original) {
  var result;
  var units = JarallaxTools.getUnits(original);
  if (modifier.indexOf('+') === 0) {
    result = String(parseFloat(original) + parseFloat(modifier) + units);
  } else if (modifier.indexOf('-') === 0) {
    result = String(parseFloat(original) + parseFloat(modifier) + units);
  } else if (modifier.indexOf('*') === 0) {
    result = String(parseFloat(original) * parseFloat(modifier.substr(1)) + units);
  } else if (modifier.indexOf('/') === 0) {
    result = String(parseFloat(original) / parseFloat(modifier.substr(1)) + units);
  } else {
    result = modifier;
  }
  
  if(original.indexOf){
    if(original.indexOf('%') > 0){
      return result + '%';
    }
  }
  return result;
};

JarallaxTools.getUnits = function (string) {
  return string.replace(/\d+/g, '');
};

JarallaxTools.clone = function (obj) {
  var newObj = {};
  for(var i in obj){
    newObj[i] = obj[i];
  }
  
  return newObj;
};

Position = function(x, y){
  this.x = x;
  this.y = y;
};

Position.prototype.add = function(value){
  return new Position(this.x + value.x,
                      this.y + value.y);
};

Position.prototype.subract = function(value){
  return new Position(this.x - value.x,
                      this.y - value.y);
};

////////////////////////////////////////////////////////////////////////////////
// Platforms ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

JarallaxTools.Platforms = ['webkit',
                           'opera',
                           'msie',
                           'mozilla',
                           'android',
                           'blackBerry',
                           'webOs',
                           'windowsPhone',
                           'iDevice',
                           'iPad',
                           'iPhone',
                           'iPod',
                           'msie',
                           'mobile',
                           'nonMobile'];


jQuery.browser.android = /android/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.blackBerry = /blackberry/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.webOs = /webos/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.windowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.iDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.iPad = /ipad/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.iPhone = /iphone/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.iPod = /ipod/i.test(navigator.userAgent.toLowerCase());
jQuery.browser.mobile = jQuery.browser.android ||
                        jQuery.browser.blackBerry ||
                        jQuery.browser.webOs ||
                        jQuery.browser.windowsPhone ||
                        jQuery.browser.iDevice;
jQuery.browser.nonMobile = !jQuery.browser.mobile;


// This script sets OSName variable as follows:
// "Windows"    for all versions of Windows
// "MacOS"      for all versions of Macintosh OS
// "Linux"      for all versions of Linux
// "UNIX"       for all other UNIX flavors 
// "Unknown OS" indicates failure to detect the OS

jQuery.platform = {};
jQuery.platform.windows = navigator.appVersion.indexOf("Win")!=-1;
jQuery.platform.macOs = navigator.appVersion.indexOf("Mac")!=-1;
jQuery.platform.unix = navigator.appVersion.indexOf("X11")!=-1;
jQuery.platform.linux = navigator.appVersion.indexOf("Linux")!=-1;
jQuery.platform.unknown = !(jQuery.platform.windows ||
                            jQuery.platform.macOs || 
                            jQuery.platform.unix || 
                            jQuery.platform.linux);

////////////////////////////////////////////////////////////////////////////////
// Jarallax Controller base class //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
JarallaxController = function() {
  this.isActive = false;
  this.bindings = [];
  this.isController = true;
};


JarallaxController.prototype.activate = function(jarallax) {
  this.isActive = true;
  if (!this.jarallax || this.jarallax !== jarallax) {
    this.jarallax = jarallax;
  }
};

JarallaxController.prototype.deactivate = function(jarallax) {
  this.isActive = false;
};

JarallaxController.prototype.update = function(progress) {
  //do nothing
};

////////////////////////////////////////////////////////////////////////////////
// Jarallax counter class //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
JarallaxCounter = function(jarallax, properties) {
  if (!properties) {
    throw new Error('No properties defined.');
  } else if (!properties.selector) {
    throw new Error('No selector defined. properties.selector.');
  }
  
  this.jarallax = jarallax;
  this.selector = properties.selector;
  this.startNumber = properties.startNumber || 0;
  this.endNumber = properties.endNumber || 100;
  this.startProgress = properties.startProgress || '0%';
  this.endProgress = properties.endProgress || '100%';
  this.decimals = properties.decimals || 0;
  this.stepSize = properties.stepSize;
  
  if (this.decimals === 0 && this.stepSize < 1) {
    tmp = this.stepSize.toString().split('.');
    this.decimals = tmp[1].length;
  }
};

JarallaxCounter.prototype.activate = function() {
  var rawDiff = this.endNumber - this.startNumber;
  var rawNumber = rawDiff * this.jarallax.progress + this.startNumber;
  
  
  
  if (this.startProgress.indexOf('%') >= 0) {
    start = parseInt(this.startProgress,10) / 100;
  } else if (JarallaxTools.hasNumbers(this.startProgress)) {
    start = parseInt(this.startProgress,10) / this.jarallax.maxProgress;
  }
  
  if (this.endProgress.indexOf('%') >= 0) {
    end = parseInt(this.endProgress,10) / 100;
  } else if (JarallaxTools.hasNumbers(this.endProgress)) {
    end = parseInt(this.endProgress,10) / this.jarallax.maxProgress;
  }
  
  if (this.jarallax.progress < start) {
    $(this.selector).html(this.startNumber);
  } else if (this.jarallax.progress > end) {
    $(this.selector).html(this.endNumber);
  } else {
    var duration = end - start;
    var currentTime = (this.jarallax.progress-start);
    var changeInValue = this.endNumber - this.startNumber ;
    var result =  Jarallax.EASING.none(currentTime, this.startNumber , 
        changeInValue, duration);
    
    if (this.stepSize) {
      result = Math.round(result / this.stepSize) * this.stepSize;
    }
    
    if (this.decimals > 0) {
      result = result.toFixed(this.decimals);
    }
    
    $(this.selector).html(result);
  }
};

////////////////////////////////////////////////////////////////////////////////
// Jarallax object class ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

JarallaxObject = function (selector, values) {
  this.selector = selector;
  this.values = values;
};

JarallaxObject.prototype.activate = function (position) {
  for (var i in this.values) {
    $(this.selector).css(i ,this.values[i]);
  }
};

////////////////////////////////////////////////////////////////////////////////
// Jarallax animation class ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
JarallaxAnimation = function (selector, startValues, endValues, jarallax) {
  this.progress = -1;
  this.selector = selector;
  this.startValues = startValues;
  this.endValues = endValues;
  this.jarallax = jarallax;
};

JarallaxAnimation.prototype.activate = function (progress) {
  if (this.progress != progress) {
    var start;
    var end;
    var style;
    
    if (this.startValues.style === undefined) {
      style = {easing:'linear'};
    } else{
      style = this.startValues.style;
    }
    
    if (this.startValues.progress.indexOf('%') >= 0) {
      start = parseInt(this.startValues.progress,10) / 100;
    } else if (JarallaxTools.hasNumbers(this.startValues.progress)) {
      start = parseInt(this.startValues.progress,10) / this.jarallax.maxProgress;
    }
    
    if (this.endValues.progress.indexOf('%') >= 0)
    {
      end = parseInt(this.endValues.progress,10) / 100;
    } else if (JarallaxTools.hasNumbers(this.endValues.progress)) {
      end = parseInt(this.endValues.progress,10) / this.jarallax.maxProgress;
    }
    
    if (this.startValues.event) {
      this.dispatchEvent(this.progress, progress, start, end);
    }
    
    if (progress >= start && progress <= end ) {
      for(var i in this.startValues) {
        if (i !== 'progress' && i !== 'style' && i !== 'event') {
          if (undefined !== this.endValues[i] && i !== 'display' && i !== 'backgroundImage') {
            var units = JarallaxTools.getUnits(this.startValues[i]+'');
            units = units.replace('-','');
            var startValue = parseFloat(this.startValues[i]);
            var endValue = parseFloat(this.endValues[i]);
            
            var duration = end - start;
            var currentTime = (progress-start);
            var changeInValue = endValue - startValue ;
            var result =  Jarallax.EASING[style.easing](currentTime, 
                startValue , changeInValue, duration, style.power);
            
            if(units == 'px'){
              result = parseInt(result, 10);
            }
            
            if(units !== '.'){
              result+= units;
            }
            
            if (i !== 'rotate') {
              $(this.selector).css(i,result);
            } else {
              $(this.selector).rotate(Math.round(result));
            }
          } else {
            if (i !== 'rotate') {
              $(this.selector).css(i,this.startValues[i]);
            } else {
              $(this.selector).rotate(Math.round(this.startValues[i]));
            }
          }
        }
      }
    }
    this.progress = progress;
  }
};

JarallaxAnimation.prototype.dispatchEvent = function(progressOld, progressNew, 
    start, end) {
  var events = this.startValues.event;
  var eventData = {};
  eventData.animation = this;
  eventData.selector = this.selector;
  
  if (progressNew >= start && progressNew <= end ) {
    if (events.start && progressOld < start) {
      eventData.type = 'start';
      events.start(eventData);
    }
    
    if (events.start && progressOld > end) {
      eventData.type = 'rewind';
      events.start(eventData);
    }
    
    if (events.animating) {
      eventData.type = 'animating';
      events.animating(eventData);
    } 
    
    if (events.forward && progressOld < progressNew) {
      eventData.type = 'forward';
      events.forward(eventData);
    }
    
    if (events.reverse && progressOld > progressNew) {
      eventData.type = 'reverse';
      events.reverse(eventData);
    }
    
  } else {
    if (events.complete && progressOld < end && progressNew > end) {
      eventData.type = 'complete';
      events.complete(eventData);
    }
    
    if (events.rewinded && progressOld > start && progressNew < start) {
      eventData.type = 'rewind';
      events.rewinded(eventData);
    }
  }
};

////////////////////////////////////////////////////////////////////////////////
// Apple mobile controller /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerApple = function(scrollPage) {
  if(scrollPage === undefined) {
    this.scrollPage = true;
  } else {
    this.scrollPage = scrollPage;
  }
  
  this.target = $('body');
  this.scrollPostion = new Position(0, 0);
};

ControllerApple.prototype = new JarallaxController();

ControllerApple.prototype.activate = function(jarallax) {
  
  JarallaxController.prototype.activate.call(this, jarallax);
  
  this.scrollSpace = $('body').height() - $(window).height();
  this.target.bind('touchmove', {scope: this}, this.onMove);
  this.target.bind('touchstart', {scope: this}, this.onTouch);
  
};

ControllerApple.prototype.deactivate = function(jarallax) {
  JarallaxController.prototype.deactivate.call(this, jarallax);
  this.target.unbind('touchmove');
  this.target.unbind('touchstart');
};

ControllerApple.prototype.onTouch = function(event) {
  var controller = event.data.scope;
  var targetEvent = event.originalEvent.touches.item(0);
  
  controller.startPosition = new Position(targetEvent.clientX, targetEvent.clientY);
  
  event.preventDefault();
};

ControllerApple.prototype.onMove = function(event) {
  var controller = event.data.scope;
  var targetEvent = event.originalEvent.touches.item(0);
  var tempPosition = new Position(targetEvent.clientX, targetEvent.clientY);
  var vector = tempPosition.subract(controller.startPosition);
  controller.startPosition = tempPosition;
  controller.scrollPostion = vector.add(controller.scrollPostion);
  
  controller.scrollPostion.y = Math.max(Math.min(controller.scrollPostion.y, 0),-controller.scrollSpace);
  controller.jarallax.setProgress(-controller.scrollPostion.y / controller.scrollSpace, false);
  $('body').scrollTop(controller.scrollSpace * controller.jarallax.progress);
  
  if (!controller.scrollPage) {
    event.preventDefault();
  }
};

ControllerApple.prototype.update = function(progress) {
  this.position.y = Math.round(progress * this.scrollSpace);
};

////////////////////////////////////////////////////////////////////////////////
// onDrag controller /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerDrag = function(selector, start, end){
  this.object = $(selector);
  this.start = start;
  this.end = end;
  this.container = "";
  this.width = 0;
  
  this.startX = 0;
  this.startY = 0;
};

ControllerDrag.prototype = new JarallaxController();

ControllerDrag.prototype.activate = function(jarallax){
  JarallaxController.prototype.activate.call(this, jarallax);
  this.container = "#scrollbar";
  this.object.draggable({containment:this.container, axis: 'x'});
  this.object.bind("drag", {scope: this}, this.onDrag);
  this.container = $(this.container);
  this.width = $(this.container).innerWidth() - this.object.outerWidth();
};


ControllerDrag.prototype.onDrag = function(event){
  var controller = event.data.scope;
  
  if (controller.isActive) {
    var x = parseInt($(this).css('left'), 10);
    var position = (x / event.data.scope.width);
    event.data.scope.jarallax.setProgress(position);
  }
};

ControllerDrag.prototype.deactivate = function(jarallax){
  JarallaxController.prototype.deactivate.call(this, jarallax);
  this.object.unbind('drag');
  this.object.draggable('destroy');
};

ControllerDrag.prototype.update = function(progress){
  this.object.css('left', progress * this.width);
};

////////////////////////////////////////////////////////////////////////////////
// Keyboard controller /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerKeyboard = function(keys, preventDefault, repetitiveInput) {
  this.repetitiveInput = repetitiveInput;
  this.preventDefault = preventDefault || false;
  this.keys = keys || {38:-0.01, 40:0.01};
  this.keysState = {};
};

ControllerKeyboard.prototype = new JarallaxController();

ControllerKeyboard.prototype.activate = function(jarallax) {
  JarallaxController.prototype.activate.call(this, jarallax);
  $(document.documentElement).keydown({scope: this}, this.keyDown);
  $(document.documentElement).keyup({scope: this}, this.keyUp);
  
  for(var key in this.keys){
    this.keysState[key] = false;
  }
};

ControllerKeyboard.prototype.deactivate = function(jarallax) {
  JarallaxController.prototype.deactivate.call(this, jarallax);
};

ControllerKeyboard.prototype.keyDown = function(event) {
  var controller = event.data.scope;
  
  if (controller.isActive) {
    for(var key in controller.keys) {
      if(key == event.keyCode) {
        if(controller.keysState[key] !== true || controller.repetitiveInput) {
          controller.jarallax.setProgress(controller.jarallax.progress + controller.keys[key]);
        }
        controller.keysState[key] = true;
        if(controller.preventDefault) {
          event.preventDefault(); 
        }
      }
    }
  }
};

ControllerKeyboard.prototype.keyUp = function(event) {
  if (this.isActive) {
    var controller = event.data.scope;
    for(var key in controller.keys) {
      if(key == event.keyCode) {
        controller.keysState[key] = false;
      }
    }
  }
};

ControllerKeyboard.prototype.update = function(progress) {
  //empty
};

////////////////////////////////////////////////////////////////////////////////
// Mobile controller ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerMobile = function(disableDefault, height){
  this.disableDefault = disableDefault || false;
  this.y = 0;
  this.previousY = undefined;
  this.height = height;
};

ControllerMobile.prototype = new JarallaxController();

ControllerMobile.prototype.activate = function(jarallax){
  JarallaxController.prototype.activate.call(this, jarallax);
  
  if (!this.height) {
    this.height = this.height = parseInt($("body").css('height'),10);
    if (this.height ==  $(window).height) {
      this.height = parseInt($("#wrapper").css('height'),10);
    }
  }
  $('body').bind('touchmove', {scope: this}, this.onTouchMove);
  $('body').bind('touchend', {scope: this}, this.onTouchEnd);
  //TODO:
  //horizontal scrolling
  //flip_direction
};

ControllerMobile.prototype.onTouchEnd = function(event){
  this.previousY = undefined;
};

ControllerMobile.prototype.onTouchMove = function(event, manuel){
  if(this.isActive) {
    if (this.disableDefault) {
      event.preventDefault();
    }
    
    var scope = event.data.scope;
    var targetEvent = manuel ? event : event.originalEvent.touches.item(0);    
    
    if(scope.previousY === undefined) {
      scope.previousY = targetEvent.clientY;
    }
    else
    {
      scope.y += (targetEvent.clientY - scope.previousY);
      scope.y = scope.y < scope.height ? scope.y : scope.height;
      scope.y = scope.y > 0 ? scope.y : 0;
      scope.previousY = targetEvent.clientY;
      var poss = scope.y/scope.height;
      
      scope.jarallax.setProgress(scope.y/scope.height);
    }
  }
};


ControllerMobile.prototype.deactivate = function(jarallax){
  JarallaxController.prototype.deactivate.call(this, jarallax);
  $('body').unbind('touchmove');
};

ControllerMobile.prototype.update = function(progress){
  //empty
};


////////////////////////////////////////////////////////////////////////////////
// Mousewheel controller ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerMousewheel = function(sensitivity, preventDefault){
  this.sensitivity = -sensitivity;
  this.preventDefault = preventDefault || false;
};


ControllerMousewheel.prototype = new JarallaxController();

ControllerMousewheel.prototype.activate = function(jarallax){
  JarallaxController.prototype.activate.call(this, jarallax);
  $('body').bind('mousewheel', {scope: this} , this.onScroll);
};

ControllerMousewheel.prototype.deactivate = function(jarallax){
  $('body').unbind('mousewheel');
  JarallaxController.prototype.deactivate(this, jarallax);
};

ControllerMousewheel.prototype.onScroll = function(event, delta){
  var controller = event.data.scope;
  
  if (controller.isActive) {
    controller.jarallax.setProgress(controller.jarallax.progress + controller.sensitivity * delta);
    if(controller.preventDefault){
      event.preventDefault(); 
    }
  }
};

ControllerMousewheel.prototype.update = function(progress){
  //empty
};

////////////////////////////////////////////////////////////////////////////////
// Scroll controller ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerScroll = function(smoothing, horizontal, convertScroll) {
  this.target = $(window);
  this.horizontal = horizontal;
  this.convertScroll = convertScroll;
  $(window).scrollTop(0);
  $(window).scrollLeft(0);
  
  if (!horizontal) {
    var height = parseInt($("body").css('height'),10);
    this.scrollSpace = height - this.target.height();
  } else {
    var width = parseInt($("body").css('width'),10);
    this.scrollSpace = width - this.target.width();
  }
  
  this.smoothing = smoothing || false;
  this.targetProgress = 0;
};

ControllerScroll.prototype = new JarallaxController();

ControllerScroll.prototype.activate = function(jarallax) {
  JarallaxController.prototype.activate.call(this, jarallax);
  if (this.convertScroll) {
    scrollConverter.activate();
  }
  this.target.bind('scroll', {scope: this} , this.onScroll);
};

ControllerScroll.prototype.deactivate = function(jarallax) {
  JarallaxController.prototype.deactivate.call(this, jarallax);
  if (this.convertScroll) {
    scrollConverter.deactivate();
  }
  this.target.unbind('scroll');
};

ControllerScroll.prototype.onScroll = function(event) {
  var controller = event.data.scope;
  //console.log(controller.target.scrollTop());
  
  if(controller.jarallax.jumping){
    if(!controller.jarallax.jumpingAllowed) {
      controller.jarallax.clearSmooth(controller.jarallax);
    }
  }

  if (controller.isActive) {
    var progress;
    if (!controller.horizontal) {
      var y = event.data.y || controller.target.scrollTop();
      progress = y/controller.scrollSpace;
    } else {
      var x = event.data.x || controller.target.scrollLeft();
      progress = x/controller.scrollSpace;
    }
    
    if(!controller.smoothing){
      controller.jarallax.setProgress(progress, true);
    } else {
      controller.targetProgress = Math.min(progress, 1);
      controller.smooth();
    }
  }
};

ControllerScroll.prototype.smooth = function(externalScope) {
  var scope;
  if (!externalScope) {
    scope = this;
  } else {
    scope = externalScope;
  }

  var oldProgress = scope.jarallax.progress;
  var animationSpace =  scope.targetProgress - oldProgress;
  clearTimeout(scope.timer);

  if(animationSpace > 0.0001 || animationSpace < -0.0001){
    var newProgress = oldProgress + animationSpace / 5;

    scope.timer = window.setTimeout(function(){
        scope.smooth(scope);}, scope.jarallax.FPS_INTERVAL);
    scope.jarallax.setProgress(newProgress, true);
  }else{
    scope.jarallax.setProgress(scope.targetProgress, true);
  }
};

ControllerScroll.prototype.update = function(progress) {
  var scrollPosition = parseInt(progress * this.scrollSpace, 10);
  if(!this.jarallax.allowWeakProgress) {
    if (this.horizontal) {
      $(window).scrollLeft(scrollPosition);
    } else {
      $(window).scrollTop(scrollPosition);
    }
  }
};

////////////////////////////////////////////////////////////////////////////////
// Time controller /////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
ControllerTime = function(speed, interval, type) {
  this.interval = interval;
  this.speed = speed;
  this.playForward = true;
  this.type = type || ControllerTime.TYPES.NORMAL;
};

ControllerTime.prototype = new JarallaxController();


ControllerTime.prototype.activate = function(jarallax) {
  JarallaxController.prototype.activate.call(this, jarallax);
  this.progress = 0;
  this.timer = setInterval(this.onInterval.bind(this, {scope: this}), this.interval);
};

ControllerTime.prototype.deactivate = function(jarallax) {
  JarallaxController.prototype.deactivate.call(this, jarallax);
  clearInterval(this.timer);
};


ControllerTime.prototype.onInterval = function(event) {
  var scope = event.scope;
  if (this.isActive) {
    if(this.playForward) {
      this.progress+= this.speed;
    }else{
      this.progress-= this.speed;
    }
    
    if(this.progress >= 1) {
      switch(this.type) {
        case ControllerTime.TYPES.NORMAL:
          this.progress = 1;
          this.deactivate(this.jarallax);
          break;
        case ControllerTime.TYPES.LOOP:
          this.progress = 0;
          break;
        case ControllerTime.TYPES.BOUNCE:
          this.progress = 1 - this.speed;
          this.playForward = false;
          break;
      }
    } else if(this.progress <= 0) {
      this.progress = 0 + this.speed;
      this.playForward = true;
    }
    this.jarallax.setProgress(this.progress);
  }
};

ControllerTime.TYPES = {NORMAL: 0,
                        LOOP: 1,
                        BOUNCE: 2};

ControllerTime.prototype.update = function(progress) {
  this.progress = progress;
};

// VERSION: 2.2 LAST UPDATE: 13.03.2012
/* 
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 * 
 * Made by Wilq32, wilq32@gmail.com, Wroclaw, Poland, 01.2009
 * Website: http://code.google.com/p/jqueryrotate/ 
 */

// Documentation removed from script file (was kinda useless and outdated)

(function($) {
var supportedCSS,styles=document.getElementsByTagName("head")[0].style,toCheck="transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
for (var a=0;a<toCheck.length;a++) if (styles[toCheck[a]] !== undefined) supportedCSS = toCheck[a];
// Bad eval to preven google closure to remove it from code o_O
// After compresion replace it back to var IE = 'v' == '\v'
var IE = eval('"v"=="\v"');

jQuery.fn.extend({
    rotate:function(parameters)
    {
        if (this.length===0||typeof parameters=="undefined") return;
            if (typeof parameters=="number") parameters={angle:parameters};
        var returned=[];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {

                    var paramClone = $.extend(true, {}, parameters); 
                    var newRotObject = new Wilq32.PhotoEffect(element,paramClone)._rootObj;

                    returned.push($(newRotObject));
                }
                else {
                    element.Wilq32.PhotoEffect._handleRotation(parameters);
                }
            }
            return returned;
    },
    getRotateAngle: function(){
        var ret = [];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    ret[i] = element.Wilq32.PhotoEffect._angle;
                }
            }
            return ret;
    },
    stopRotate: function(){
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    clearTimeout(element.Wilq32.PhotoEffect._timer);
                }
            }
    }
});

// Library agnostic interface

Wilq32=window.Wilq32||{};
Wilq32.PhotoEffect=(function(){

	if (supportedCSS) {
		return function(img,parameters){
			img.Wilq32 = {
				PhotoEffect: this
			};
            
            this._img = this._rootObj = this._eventObj = img;
            this._handleRotation(parameters);
		}
	} else {
		return function(img,parameters) {
			// Make sure that class and id are also copied - just in case you would like to refeer to an newly created object
            this._img = img;

			this._rootObj=document.createElement('span');
			this._rootObj.style.display="inline-block";
			this._rootObj.Wilq32 = 
				{
					PhotoEffect: this
				};
			img.parentNode.insertBefore(this._rootObj,img);
			
			if (img.complete) {
				this._Loader(parameters);
			} else {
				var self=this;
				// TODO: Remove jQuery dependency
				jQuery(this._img).bind("load", function()
				{
					self._Loader(parameters);
				});
			}
		}
	}
})();

Wilq32.PhotoEffect.prototype={
    _setupParameters : function (parameters){
		this._parameters = this._parameters || {};
        if (typeof this._angle !== "number") this._angle = 0 ;
        if (typeof parameters.angle==="number") this._angle = parameters.angle;
        this._parameters.animateTo = (typeof parameters.animateTo==="number") ? (parameters.animateTo) : (this._angle); 

        this._parameters.step = parameters.step || this._parameters.step || null;
		this._parameters.easing = parameters.easing || this._parameters.easing || function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; }
		this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
        this._parameters.callback = parameters.callback || this._parameters.callback || function(){};
        if (parameters.bind && parameters.bind != this._parameters.bind) this._BindEvents(parameters.bind); 
	},
	_handleRotation : function(parameters){
          this._setupParameters(parameters);
          if (this._angle==this._parameters.animateTo) {
              this._rotate(this._angle);
          }
          else { 
              this._animateStart();          
          }
	},

	_BindEvents:function(events){
		if (events && this._eventObj) 
		{
            // Unbinding previous Events
            if (this._parameters.bind){
                var oldEvents = this._parameters.bind;
                for (var a in oldEvents) if (oldEvents.hasOwnProperty(a)) 
                        // TODO: Remove jQuery dependency
                        jQuery(this._eventObj).unbind(a,oldEvents[a]);
            }

            this._parameters.bind = events;
			for (var a in events) if (events.hasOwnProperty(a)) 
				// TODO: Remove jQuery dependency
					jQuery(this._eventObj).bind(a,events[a]);
		}
	},

	_Loader:(function()
	{
		if (IE)
		return function(parameters)
		{
			var width=this._img.width;
			var height=this._img.height;
			this._img.parentNode.removeChild(this._img);
							
			this._vimage = this.createVMLNode('image');
			this._vimage.src=this._img.src;
			this._vimage.style.height=height+"px";
			this._vimage.style.width=width+"px";
			this._vimage.style.position="absolute"; // FIXES IE PROBLEM - its only rendered if its on absolute position!
			this._vimage.style.top = "0px";
			this._vimage.style.left = "0px";

			/* Group minifying a small 1px precision problem when rotating object */
			this._container =  this.createVMLNode('group');
			this._container.style.width=width;
			this._container.style.height=height;
			this._container.style.position="absolute";
			this._container.setAttribute('coordsize',width-1+','+(height-1)); // This -1, -1 trying to fix ugly problem with small displacement on IE
			this._container.appendChild(this._vimage);
			
			this._rootObj.appendChild(this._container);
			this._rootObj.style.position="relative"; // FIXES IE PROBLEM
			this._rootObj.style.width=width+"px";
			this._rootObj.style.height=height+"px";
			this._rootObj.setAttribute('id',this._img.getAttribute('id'));
			this._rootObj.className=this._img.className;			
		    this._eventObj = this._rootObj;	
		    this._handleRotation(parameters);	
		}
		else
		return function (parameters)
		{
			this._rootObj.setAttribute('id',this._img.getAttribute('id'));
			this._rootObj.className=this._img.className;
			
			this._width=this._img.width;
			this._height=this._img.height;
			this._widthHalf=this._width/2; // used for optimisation
			this._heightHalf=this._height/2;// used for optimisation
			
			var _widthMax=Math.sqrt((this._height)*(this._height) + (this._width) * (this._width));

			this._widthAdd = _widthMax - this._width;
			this._heightAdd = _widthMax - this._height;	// widthMax because maxWidth=maxHeight
			this._widthAddHalf=this._widthAdd/2; // used for optimisation
			this._heightAddHalf=this._heightAdd/2;// used for optimisation
			
			this._img.parentNode.removeChild(this._img);	
			
			this._aspectW = ((parseInt(this._img.style.width,10)) || this._width)/this._img.width;
			this._aspectH = ((parseInt(this._img.style.height,10)) || this._height)/this._img.height;
			
			this._canvas=document.createElement('canvas');
			this._canvas.setAttribute('width',this._width);
			this._canvas.style.position="relative";
			this._canvas.style.left = -this._widthAddHalf + "px";
			this._canvas.style.top = -this._heightAddHalf + "px";
			this._canvas.Wilq32 = this._rootObj.Wilq32;
			
			this._rootObj.appendChild(this._canvas);
			this._rootObj.style.width=this._width+"px";
			this._rootObj.style.height=this._height+"px";
            this._eventObj = this._canvas;
			
			this._cnv=this._canvas.getContext('2d');
            this._handleRotation(parameters);
		}
	})(),

	_animateStart:function()
	{	
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this._animateStartTime = +new Date;
		this._animateStartAngle = this._angle;
		this._animate();
	},
    _animate:function()
    {
         var actualTime = +new Date;
         var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;

         // TODO: Bug for animatedGif for static rotation ? (to test)
         if (checkEnd && !this._parameters.animatedGif) 
         {
             clearTimeout(this._timer);
         }
         else 
         {
             if (this._canvas||this._vimage||this._img) {
                 var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
                 this._rotate((~~(angle*10))/10);
             }
             if (this._parameters.step) {
                this._parameters.step(this._angle);
             }
             var self = this;
             this._timer = setTimeout(function()
                     {
                     self._animate.call(self);
                     }, 10);
         }

         // To fix Bug that prevents using recursive function in callback I moved this function to back
         if (this._parameters.callback && checkEnd){
             this._angle = this._parameters.animateTo;
             this._rotate(this._angle);
             this._parameters.callback.call(this._rootObj);
         }
     },

	_rotate : (function()
	{
		var rad = Math.PI/180;
		if (IE)
		return function(angle)
		{
            this._angle = angle;
			this._container.style.rotation=(angle%360)+"deg";
		}
		else if (supportedCSS)
		return function(angle){
            this._angle = angle;
			this._img.style[supportedCSS]="rotate("+(angle%360)+"deg)";
		}
		else 
		return function(angle)
		{
            this._angle = angle;
			angle=(angle%360)* rad;
			// clear canvas	
			this._canvas.width = this._width+this._widthAdd;
			this._canvas.height = this._height+this._heightAdd;
						
			// REMEMBER: all drawings are read from backwards.. so first function is translate, then rotate, then translate, translate..
			this._cnv.translate(this._widthAddHalf,this._heightAddHalf);	// at least center image on screen
			this._cnv.translate(this._widthHalf,this._heightHalf);			// we move image back to its orginal 
			this._cnv.rotate(angle);										// rotate image
			this._cnv.translate(-this._widthHalf,-this._heightHalf);		// move image to its center, so we can rotate around its center
			this._cnv.scale(this._aspectW,this._aspectH); // SCALE - if needed ;)
			this._cnv.drawImage(this._img, 0, 0);							// First - we draw image
		}

	})()
}

if (IE)
{
Wilq32.PhotoEffect.prototype.createVMLNode=(function(){
document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
		try {
			!document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
			return function (tagName) {
				return document.createElement('<rvml:' + tagName + ' class="rvml">');
			};
		} catch (e) {
			return function (tagName) {
				return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
			};
		}		
})();
}

})(jQuery);

/*
scrollConverter 1.0
https://github.com/koggdal/scroll-converter

Copyright 2011 Johannes Koggdal (http://koggdal.com/)
Developed for BombayWorks (http://bombayworks.com/)

Released under MIT license
*/

window.scrollConverter = (function (window, document, undefined) {

	// Private vars
	var docElem = document.documentElement,
		active = false,
		hasDeactivated = false,
		eventsBound = false;

	// Private methods
	var scrollCallback = function (offset, event, callback) {

			// Abort the scrolling if it's inactive
			if (!active) {
				return;
			}

			var delta, numPixelsPerStep, change, newOffset,
				docOffset, scrollWidth, winWidth, maxOffset;

			// Set scrolling parameters
			delta = 0;
			numPixelsPerStep = 10;

			// Find the maximum offset for the scroll
			docOffset = (docElem ? docElem.offsetWidth : 0) || 0;
			scrollWidth = document.body.scrollWidth || 0;
			winWidth = docElem ? docElem.clientWidth : 0;
			maxOffset = Math.max(docOffset, scrollWidth) - winWidth;

			// "Normalize" the wheel value across browsers
			//  The delta value after this will not be the same for all browsers.
			//  Instead, it is normalized in a way to try to give a pretty similar feeling in all browsers.
			// 
			//  Firefox and Opera
			if (event.detail) {
				delta = event.detail * -240;
			}
			// IE, Safari and Chrome
			else if (event.wheelDelta) {
				delta = event.wheelDelta * 5;
			}

			// Get the real offset change from the delta
			//  A positive change is when the user scrolled the wheel up (in regular scrolling direction)
			//  A negative change is when the user scrolled the wheel down
			change = delta / 120 * numPixelsPerStep;
			newOffset = offset.x - change;

			// Do the scroll if the new offset is positive
			if (newOffset >= 0 && newOffset <= maxOffset) {
				offset.x = newOffset;
				offset.setByScript = true;
				window.scrollTo(offset.x, offset.y);
			}
			// Keep the offset within the boundaries
			else if (offset.x !== 0 && offset.x !== maxOffset) {
				offset.x = newOffset > maxOffset ? maxOffset : 0;
				offset.setByScript = true;
				window.scrollTo(offset.x, offset.y);
			}

			// Fire the callback
			if (typeof callback === "function") {
				callback(offset);
			}
		},

		getOffset = function (axis) {
			axis = axis.toUpperCase();
			var pageOffset = "page" + axis + "Offset",
				scrollValue = "scroll" + axis,
				scrollDir = "scroll" + (axis === "X" ? "Left" : "Top");

			// Get the scroll offset for all browsers
			return window[pageOffset] || window[scrollValue] || (function () {
				var rootElem = document.documentElement || document.body.parentNode;
				return ((typeof rootElem[scrollDir] === "number") ? rootElem : document.body)[scrollDir];
			}());
		},

		bindEvents = function (offset, cb) {

			var callback = function (e) {

					// Fix event object for IE8 and below
					e = e || window.event;

					// Trigger the scroll behavior
					scrollCallback(offset, e, cb);

					// Prevent the normal scroll action to happen
					if (e.preventDefault && e.stopPropagation) {
						e.preventDefault();
						e.stopPropagation();
					} else {
						return false;
					}
				},

				updateOffsetOnScroll = function () {

					// Update the offset variable when the normal scrollbar is used
					if (!offset.setByScript) {
						offset.x = getOffset("x");
						offset.y = getOffset("y");
					}
					offset.setByScript = false;
				};

			// Safari, Chrome, Opera, IE9+
			if (window.addEventListener) {

				// Safari, Chrome, Opera, IE9
				if ("onmousewheel" in window) {
					window.addEventListener("mousewheel", callback, false);
					window.addEventListener("scroll", updateOffsetOnScroll, false);
				}
				// Firefox
				else {
					window.addEventListener("DOMMouseScroll", callback, false);
					window.addEventListener("scroll", updateOffsetOnScroll, false);
				}
			}
			// IE8 and below
			else {
				document.attachEvent("onmousewheel", callback);
				window.attachEvent("onscroll", updateOffsetOnScroll);
			}
		},

		deactivateScrolling = function (e) {
			e.preventDefault();
			e.stopPropagation();
			return false;
		};

	// Return a public API
	return {

		// Activate the scrolling switch
		//  An optional callback can be passed in, which will fire at every scroll update
		activate: function (callback) {

			// Set state
			active = true;

			// Bind events if it hasn't been done before
			if (!eventsBound) {
				var offset = { x: 0, y: 0 };
				bindEvents(offset, callback);
				eventsBound = true;
			}

			// Remove event handlers if it was previously deactivated
			if (hasDeactivated) {
				if (window.addEventListener) {
					window.removeEventListener("scroll", deactivateScrolling, true);
				} else {
					window.detachEvent("onscroll", deactivateScrolling);
				}
				hasDeactivated = false;
			}
		},

		deactivate: function () {
			active = false;
		},

		deactivateAllScrolling: function () {

			// Set state
			active = false;
			hasDeactivated = true;

			// Bind event handlers to disable the scroll
			if (window.addEventListener) {
				window.addEventListener("scroll", deactivateScrolling, true);
			} else {
				window.attachEvent("onscroll", deactivateScrolling);
			}
		}
	};
}(window, document));