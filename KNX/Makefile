.ONESHELL:

sources := knx_client_script.py
py_artifacts := __pycache__/
git_artifacts := .git*
lab_artifacts := labo-setup/
py_files := $(wildcard *.py)

.PHONY: help

all: help

pycheck: $(py_files)
	python -m py_compile $?

# ensure symlinks are local to the source directory
_slink:
	dname=$(dir $(slink))
	lname=$(notdir $(slink))
	pushd $$dname >/dev/null
	ln -sf $$lname.$(suffix) $$lname
	popd >/dev/null

incomplete: $(sources)
	$(MAKE) suffix=incomplete _slink slink=$<
labo: incomplete

unlock:
	git-crypt unlock

complete: $(sources)
	$(MAKE) suffix=complete _slink slink=$<

solution: complete

RUSER := marco
RHOST := pcnabil
RPATH := /home/marco/IoT/KNX
deploy: complete pycheck
	# use a subshell to correctly see the last newline. Rsync exclude is
	# handeled via STDIN
	(cat | rsync -CaLhv --exclude-from=- ./ $(RUSER)@$(RHOST):$(RPATH)) <<EOT
	$(addsuffix .complete,$(sources))
	$(addsuffix .incomplete,$(sources))
	$(py_artifacts)
	$(git_artifacts)
	$(lab_artifacts)
	EOT


clean:
	rm -rf __pycache__/

reset: clean incomplete
	# No-op

define _help_msg :=
Usage:

  make [target]

Targets:

  clean         remove build artifacts and specious files & dirs
  complete      prepare the source code for the 'solution' build
  deploy        deploy the (complete) app to "$(RHOST):$(RPATH)"
  help          guess what ;-)
  incomplete    prepare the source code for the 'labo' build
  labo          alias => 'incomplete'
  pycheck       syntay check of Python modules
  solution      alias => 'complete'
  unlock        decrypt sensitive files
endef

# the shell no-op silences 'nothing to be done...' messages
help:
	@: $(info $(_help_msg))
