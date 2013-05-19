dist:
	@echo Concatenating files
	cat assets/scripts/jquery.vintage.js assets/scripts/vintage.presets.js assets/scripts/slideshow.js assets/scripts/script.js > assets/scripts/concat.js

	@echo Minify using closure-compiler
	closure-compiler assets/scripts/concat.js > assets/scripts/minified.js
	rm -r assets/scripts/concat.js

	@echo Compile LESS
	lessc --yui-compress assets/styles/less/style.less > assets/styles/style.css

.PHONY: dist
