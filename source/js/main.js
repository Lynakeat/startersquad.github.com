$(function () {

  var header = $('.header');
  var lastId;
  var menuItems = $('.menu_link');
  var popoverTriggers = $('[data-toggle="popover"]');
  var topMenuHeight = 115; // topMenu.outerHeight() + 15

  // Anchors corresponding to menu items
  var scrollItems = menuItems.map(function () {
    var item = $($(this).data('target'));
    if (item.length) {
      return item;
    }
  });
  var win = $(window);
  var doc = $(document);

  // maps elements ids on page to its name in ga stats
  var idsToPageMap = {
    'menu-item-waarom': '/screen2-waarom-wasbundles',
    'menu-item-krijgt': '/screen3-dit-krijgt-u-met-wasbundles',
    'menu-item-hoe-kan-dit': '/screen4-hoe-kan-wasbundles-dit-aanbieden'
  };

  // Logs unique ga events
  var _gaEvents = {};
  var logGaPageview = function (type, name) {
    var id = type + name;
    if (!_gaEvents.hasOwnProperty(id)) {
      _gaq.push([type, name]);
      _gaEvents[id] = true;
    }
  };
  var logGaEvent = function (category, section, name) {
    console.log(category, section, name);
    var type = '_trackEvent';
    var id = type + category + section + name;
    if (!_gaEvents.hasOwnProperty(id)) {
      _gaq.push([type, category, section, name]);
      _gaEvents[id] = true;
    }
  };

  popoverTriggers.popover({
    container: 'body',
    html: true
  });

  // hide other popovers on click
  popoverTriggers.on('click', function () {
    popoverTriggers.not(this).popover('hide');
  });

  // hide all popovers when clicked anywhere outside
  $('body').on('click', function (e) {
    if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
      $('[data-toggle="popover"]').popover('hide');
    }
  });

  // buttons moving to the top of the page
  $('.cta').click(function (e) {
    e.preventDefault();

    $('html, body').stop().animate({
      scrollTop: 0
    }, 400);
  });

  // menu scroll to
  $('[data-target]').click(function (e) {
    e.preventDefault();

    var item = $(this);

    $('html, body').stop().animate({
      scrollTop: $(item.data('target')).offset().top
    }, 800);
  });

  win.scroll(function () {
    // highlight active menu item
    // ------------------------------------------

    // Get container scroll position
    var offsetTop = $(this).scrollTop(),
      totalOffset = offsetTop + topMenuHeight;

    // Get id of current scroll item
    var cur = scrollItems.map(function () {
      if ($(this).offset().top < totalOffset)
        return this;
    });

    // Get the id of the current element
    cur = cur[cur.length - 1];
    var id = cur && cur.length ? cur[0].id : '';

    if (lastId !== id) {
      lastId = id;
      // Set/remove active class
      menuItems.removeClass('__active')
        .filter('[data-target=#' + id + ']').addClass('__active');

      // push view
      if (idsToPageMap[id]) {
        logGaPageview('_trackPageview', idsToPageMap[id]);
      }
    }

    // update header class
    // -----------------
    if (offsetTop > topMenuHeight/2) {
      header.addClass('__narrow');
    } else {
      header.removeClass('__narrow');
    }

    // bottom of the page reached
    if (win.scrollTop() + win.height() === doc.height()) {
      logGaPageview('_trackPageview', '/screen5-bottom-of-page');
    }

  });

  $(window).trigger('scroll');

  // track forms submits, page track value is stored in form data-track attribute
  $('body').delegate('form', 'submit', function (e) {
    e.preventDefault();

    var form = $(this);
    var track = form.data('track') || '/feedback-verstuurd';

    _gaq.push(['_trackPageview', track]);

    setTimeout(function () {
      form.get(0).submit();
    }, 150);
  });

  $('[data-track-click]').click(function () {
    var track = $(this).data('track-click');

    logGaEvent.apply(null, track.split('|'));
  });

});
