var Slideshow = function($node) {
  var $items  = $node.find('li'),
      currIdx = 0,
      active  = 'active',
      click   = 'click',
      max     = $items.length-1,
      slide   = function(back) {
        $items.eq( back ? (currIdx-1 < 0 ? max : --currIdx) : (currIdx+1 > max ? 0 : ++currIdx)).trigger(click);
      };

  $node.on(click, 'li', function() {
    var $this = $(this);
    if ($this.hasClass(active)) { return; }
    $this.siblings( ['.',active].join('') ).addBack().toggleClass('active');
    currIdx = $this.index();
    $node.trigger('slideshow:change', $this);
  }).on(click, '.js_next', function() {
    slide();
  }).on(click, '.js_prev', function() {
    slide(true);
  });

  return {
    getCurrentSlide: function() {
      return $items.eq(currIdx);
    }
  };
};
