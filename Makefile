EXTENSION	:= "advanced-websocket-client"
EXTVERSION	:= $(shell grep '"version":' manifest.json | awk '{print $$2}' | tr -d '",')

dist:
	zip -r "$(EXTENSION)-$(EXTVERSION).zip" . -x@exclude.lst
