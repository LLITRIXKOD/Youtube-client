function $(elem) {
  return document.querySelector(elem);
}
function addClass(el, className) {
  const element = el;
  if (element.classList) {
    element.classList.add(className);
  } else {
    element.className += ` ${className}`;
  }
}
function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  }
}
function extendObj(_def, addons) {
  const def = _def;
  const propArray = Object.values(def);
  propArray.forEach((val) => {
    if (addons[val] !== undefined) {
      def.val = addons[val];
    }
  });
}

const SliderPlugin = (function plugin() {
  const fifiSlider = function fiSlider(settings) {
    const _ = this;

    // always loop
    _.def = {
      target: $('.slider'),
      dotsWrapper: $('.dots-wrapper'),
      transition: {
        speed: 300,
        easing: '',
      },
      swipe: true,
      autoHeight: true,
      afterChangeSlide: function afterChangeSlide() {},
    };

    extendObj(_.def, settings);

    _.init();
  };

  fifiSlider.prototype.buildDots = function dots() {
    const _ = this;

    for (let i = 0; i < _.totalSlides; i += 1) {
      const dot = document.createElement('li');
      dot.setAttribute('data-slide', i + 1);
      dot.textContent = i + 1;
      _.def.dotsWrapper.appendChild(dot);
    }

    _.def.dotsWrapper.addEventListener(
      'click',
      (e) => {
        if (e.target && e.target.nodeName === 'LI') {
          _.curSlide = e.target.getAttribute('data-slide');
          _.gotoSlide();
        }
      },
      false,
    );
  };
  fifiSlider.prototype.getCurLeft = function curLeft() {
    const _ = this;
    _.curLeft = Number(_.sliderInner.style.left.split('px')[0]);
  };
  fifiSlider.prototype.gotoSlide = function toSlide() {
    const _ = this;

    _.sliderInner.style.transition = `left ${_.def.transition.speed / 1000}s ${
      _.def.transition.easing
    }`;
    _.sliderInner.style.left = `${-_.curSlide * _.slideW}px`;
    addClass(_.def.target, 'isAnimating');
    setTimeout(() => {
      _.sliderInner.style.transition = '';
      removeClass(_.def.target, 'isAnimating');
    }, _.def.transition.speed);
    _.setDot();
    if (_.def.autoHeight) {
      _.def.target.style.height = `${_.allSlides[_.curSlide].offsetHeight}px`;
    }
    _.def.afterChangeSlide(_);
  };
  fifiSlider.prototype.init = function fifiInit() {
    const _ = this;

    function onResize(c, t) {
      let time = t;
      const onresize = function resize() {
        clearTimeout(time);
        time = setTimeout(c, 100);
      };
      return onresize;
    }

    function loadedImg(el) {
      let loaded = false;
      function loadHandler() {
        if (loaded) {
          return;
        }
        loaded = true;
        _.loadedCnt += 1;
        if (_.loadedCnt >= _.totalSlides + 2) {
          _.updateSliderDimension();
        }
      }
      const img = el.querySelector('img');
      if (img) {
        img.onload = loadHandler;
        img.src = img.getAttribute('data-src');
        img.style.display = 'block';
        if (img.complete) {
          loadHandler();
        }
      } else {
        _.updateSliderDimension();
      }
    }

    window.addEventListener(
      'resize',
      onResize(() => {
        _.updateSliderDimension();
      }),
      false,
    );

    // wrap slider-inner
    const nowHTML = _.def.target.innerHTML;
    _.def.target.innerHTML = `<div class="slider-inner">${nowHTML}</div>`;

    _.allSlides = 0;
    _.curSlide = 0;
    _.curLeft = 0;
    _.totalSlides = _.def.target.querySelectorAll('.slide').length;

    _.sliderInner = _.def.target.querySelector('.slider-inner');
    _.loadedCnt = 0;

    // append clones
    const cloneFirst = _.def.target.querySelectorAll('.slide')[0].cloneNode(true);
    _.sliderInner.appendChild(cloneFirst);
    const cloneLast = _.def.target.querySelectorAll('.slide')[_.totalSlides - 1].cloneNode(true);
    _.sliderInner.insertBefore(cloneLast, _.sliderInner.firstChild);

    _.curSlide += 1;
    _.allSlides = _.def.target.querySelectorAll('.slide');

    // _.def.target.style.height = "1px";
    _.sliderInner.style.width = `${(_.totalSlides + 2) * 100}%`;
    for (let i = 0; i < _.totalSlides + 2; i += 1) {
      _.allSlides[i].style.width = `${100 / (_.totalSlides + 2)}%`;
      loadedImg(_.allSlides[i]);
    }

    _.buildDots();
    _.setDot();

    function addListenerMulti(el, s, fn) {
      s.split(' ').forEach(e => el.addEventListener(e, fn, false));
    }
    function removeListenerMulti(el, s, fn) {
      s.split(' ').forEach(e => el.removeEventListener(e, fn, false));
    }

    _.isAnimating = false;

    function swipeMove(e) {
      let touch = e;
      if (e.type === 'touchmove') {
        touch = e.targetTouches[0] || e.changedTouches[0];
      }
      _.moveX = touch.pageX;
      _.moveY = touch.pageY;

      // for scrolling up and down
      if (Math.abs(_.moveX - _.startX) < 40) return;

      _.isAnimating = true;
      addClass(_.def.target, 'isAnimating');
      e.preventDefault();

      if (_.curLeft + _.moveX - _.startX > 0 && _.curLeft === 0) {
        _.curLeft = -_.totalSlides * _.slideW;
      } else if (_.curLeft + _.moveX - _.startX < -(_.totalSlides + 1) * _.slideW) {
        _.curLeft = -_.slideW;
      }
      _.sliderInner.style.left = `${_.curLeft + _.moveX - _.startX}px`;
    }

    function swipeEnd() {
      _.getCurLeft();

      if (Math.abs(_.moveX - _.startX) === 0) return;

      _.stayAtCur = !!(Math.abs(_.moveX - _.startX) < 40 || typeof _.moveX === 'undefined');
      _.dir = _.startX < _.moveX ? 'left' : 'right';

      if (!_.stayAtCur) {
        if (_.dir === 'left') {
          _.curSlide -= 1;
        } else {
          _.curSlide += 1;
        }
        if (_.curSlide < 0) {
          _.curSlide = _.totalSlides;
        } else if (_.curSlide === _.totalSlides + 2) {
          _.curSlide = 1;
        }
      }

      _.gotoSlide();

      delete _.startX;
      delete _.startY;
      delete _.moveX;
      delete _.moveY;

      _.isAnimating = false;
      removeClass(_.def.target, 'isAnimating');
      removeListenerMulti(_.sliderInner, 'mousemove touchmove', swipeMove);
      removeListenerMulti($('body'), 'mouseup touchend', swipeEnd);
    }

    function startSwipe(e) {
      let touch = e;
      _.getCurLeft();
      if (!_.isAnimating) {
        if (e.type === 'touchstart') {
          touch = e.targetTouches[0] || e.changedTouches[0];
        }
        _.startX = touch.pageX;
        _.startY = touch.pageY;
        addListenerMulti(_.sliderInner, 'mousemove touchmove', swipeMove);
        addListenerMulti($('body'), 'mouseup touchend', swipeEnd);
      }
    }

    if (_.def.swipe) {
      addListenerMulti(_.sliderInner, 'mousedown touchstart', startSwipe);
    }
  };

  fifiSlider.prototype.setDot = function setDotFifi() {
    const _ = this;
    let tardot = _.curSlide - 1;

    for (let j = 0; j < _.totalSlides; j += 1) {
      removeClass(_.def.dotsWrapper.querySelectorAll('li')[j], 'active');
    }

    if (_.curSlide - 1 < 0) {
      tardot = _.totalSlides - 1;
    } else if (_.curSlide - 1 > _.totalSlides - 1) {
      tardot = 0;
    }
    addClass(_.def.dotsWrapper.querySelectorAll('li')[tardot], 'active');
  };
  fifiSlider.prototype.updateSliderDimension = function updateSliderDimensionFifi() {
    const _ = this;

    _.slideW = Number(_.def.target.querySelectorAll('.slide')[0].offsetWidth);
    _.sliderInner.style.left = `${-_.slideW * _.curSlide}px`;

    if (_.def.autoHeight) {
      _.def.target.style.height = `${_.allSlides[_.curSlide].offsetHeight}px`;
    } else {
      for (let i = 0; i < _.totalSlides + 2; i += 1) {
        if (_.allSlides[i].offsetHeight > _.def.target.offsetHeight) {
          _.def.target.style.height = `${_.allSlides[i].offsetHeight}px`;
        }
      }
    }
    _.def.afterChangeSlide(_);
  };
  return fifiSlider;
}());

const slider = new SliderPlugin({
  target: $('.slider'),
  dotsWrapper: $('.dots-wrapper'),
});

export default slider;
