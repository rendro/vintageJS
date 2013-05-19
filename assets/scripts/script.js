var active     = 'active',
    click      = 'click',
    disabled   = 'disabled',
    $slideshow = $('.js_slideshow'),
    $controls  = $('.js_controls'),
    $select    = $controls.find('select'),
    $reload    = $controls.find('.js_reload'),
    slideshow  = new Slideshow( $slideshow );

$('.js_toggle').on(click, 'dt', function() {
  $(this).addClass(active).siblings('dt').removeClass(active);
});

// add a vintage API to each image in the slideshow
$slideshow.find('img').vintage();

//setup dropdown
$.each(vintagePresets, function(idx, effect) {
  $select.append( ['<option value="', idx, '">', [idx.charAt(0).toUpperCase(), idx.substr(1)].join(''), '</option>'].join('') );
});

$controls.on('change', 'select', function() {
  var selectedEffect = this.value,
      currSlide      = slideshow.getCurrentSlide(),
      vjsApi         = currSlide.find('img').data('vintageJS');
  if (selectedEffect in vintagePresets) {
    currSlide.data('currEffect', selectedEffect);

    if (selectedEffect === 'random') {
      $reload.removeClass(disabled);
      vjsApi.vintage( vintagePresets[ selectedEffect ]() );
    } else {
      $reload.addClass(disabled);
      vjsApi.vintage( vintagePresets[ selectedEffect ] );
    }
  } else {
    currSlide.data('currEffect', false);
    vjsApi.reset();
  }
}).on(click, '.js_reload', function() {
  $select.trigger('change');
});



$slideshow.on('slideshow:change', function(e, $slide) {
  var effect = $slide.data('currEffect');
  $select.val(effect || '');
});

$.getScript([(/^http:/.test(document.location)?'http':'https'),'://platform.twitter.com/widgets.js'].join(''));
