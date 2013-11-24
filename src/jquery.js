$.fn.vintage = function(options, effect) {
  return this.each(function() {
    if (!$.data(this, 'vintageJS')) {
      $.data(this, 'vintageJS', new VintageJS( this, options, effect ));
    }
  });
};
