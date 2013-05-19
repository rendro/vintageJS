dist:
	@echo Concatenating files
	cat assets/scripts/jquery.vintage.js assets/scripts/vintage.presets.js assets/scripts/slideshow.js assets/scripts/script.js > assets/scripts/minified.js
	@echo Minify using closure-compiler
	closure-compiler assets/scripts/minified.js > assets/scripts/minified.js

.PHONY: dist
