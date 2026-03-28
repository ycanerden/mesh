# Mesh macOS menu bar app build
APP_NAME = MeshBar
BUNDLE   = $(APP_NAME).app
BINARY   = $(BUNDLE)/Contents/MacOS/$(APP_NAME)

.PHONY: build bundle zip clean run

build:
	swiftc $(APP_NAME).swift -o $(APP_NAME) -framework Cocoa -framework WebKit

bundle: build
	mkdir -p $(BUNDLE)/Contents/MacOS $(BUNDLE)/Contents/Resources
	cp $(APP_NAME) $(BINARY)
	cp Info.plist $(BUNDLE)/Contents/Info.plist

zip: bundle
	ditto -c -k --sequesterRsrc --keepParent $(BUNDLE) $(APP_NAME)-1.0.zip
	@echo "✅ $(APP_NAME)-1.0.zip ready"

run: bundle
	open $(BUNDLE)

clean:
	rm -rf $(APP_NAME) $(BUNDLE) $(APP_NAME)-*.zip
