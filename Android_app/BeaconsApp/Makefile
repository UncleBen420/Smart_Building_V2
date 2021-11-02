.ONESHELL:

.PHONY: help

all: help

clean:
	./gradlew cleanBuildCache clean
	rm -rf .gradle/ .idea/ app/build/ build/

# solution build
build: clean
	./gradlew build

install: build
	./gradlew installDebug

uninstall:
	./gradlew uninstallDebug


define _help_msg :=
Usage:

  make [target]

Targets:

  clean         remove build artifacts and specious files & dirs
  help          guess what ;-)
  build        	build the app
  install       build & push the app to device
  uninstall     remove the app from device

endef

# the shell no-op silences 'nothing to be done...' messages
help:
	@: $(info $(_help_msg))
