
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components

standalone:
	@echo "(function() {" > markit.js
	@cat index.js >> markit.js
	@echo "})();" >> markit.js
	@sed -i .bak 's/module.exports/window.markit/' markit.js
	@rm markit.js.bak

.PHONY: clean build
