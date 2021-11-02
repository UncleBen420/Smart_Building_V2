# MSE IoT course -- Lab 1: KNX #

The first part of the course is based on KNX, [an open standard for commercial
and domestic building automation.](https://en.wikipedia.org/wiki/KNX_%28standard%29 "KNX --
Wikipedia")


## Scenario  ##

Several KNX-compatible *actuators* for radiator valves and window blinds
are deployed across the rooms and the floors of a (virtual) building. We want
to read the status of, and send actuation commands to any of them, so as to
change a radiator's valve or a window's blinds position.  Each actuator is
assigned a *group address*, which is a triple (3-level-style) like:

    <action>/<floor>/<block>

where the physical location is given by `<floor>/<block>`, whereas `<action>`
specifies the command type. Notice that this is arbitrary, indeed the action
can change but the target actuator is the same. Thus, something like

    1/2/3

may mean: do whatever is associated with action `1` (e.g., commands for a
radiator valve) to the actuator(s) located at floor 2, block 3. The real action
is specified further by the telegram's *payload*.

Your **goal** is to complete a Python client script (`knx_client_script.py`)
whose CLI is already defined -- see below.

**N.B.** Python 3 is now the default interpreter in most recent Linux
distributions. Do not use Python 2! If unsure, check with:
```shell
$ python -V
```

## Installation ##

You need to install:

* the support library: `knxnet`
* the simulator: `actuasim`

This Git repo holds the relative project submodules. Clone it *recursively*:

```shell
$ git clone --recursive https://gitedu.hesge.ch/lsds/teaching/master/iot/knx.git
```

Follow instructions (README) in the corresponding sub-directories of this
repository, or at the following links:

* [`knxnet/README`](https://gitedu.hesge.ch/adrienma.lescourt/knxnet_iot/-/blob/master/README.md "knxnet readme")
* [`actuasim/README`](https://gitedu.hesge.ch/adrienma.lescourt/actuasim_iot/-/blob/master/README.md "actuasim readme")

## Develop  ##

You shall complete the part marked with `@@@ TO BE COMPLETED @@@` in file
`knx_client_script.py`, function `send_knx_request()` where the KNX protocol
is to be implemented. This CLI-based script and has two modes: raw and
target. To know more about its usage (if you are not in a GNU/Linux shell, you
might need to put `python` before the script name):

```shell
$ ./knx_client_script.py --man
```

Raw mode (you shall mostly use this):
```shell
$ ./knx_client_script.py raw --help
```

Target mode:
```shell
$ ./knx_client_script.py {blind,valve} --help
```

See examples below in the test section.

**N.B.** The above `knx_client_script.py` file is a *symlink* to the file
`knx_client_script.py.incomplete`. If you have troubles with the symlink,
rename the target `knx_client_script.py.incomplete` and edit it
directly. Please, ignore the file `knx_client_script.py.complete` -- that is
the encrypted solution ;-)

### Tests ###

A simulator is available to test your client script in this repo's subdir
`actuasim/`. Provided that the needed dependencies are installed, you can
launch it with:
```shell
$ ./actuasim.py &
```

These are the tests that you shall perform against `actuasim`. The client
script is configured to talk by default to a locally installed simulator
instance.

Two commands are listed for each test: they are equivalent. Please, focus on
using the "raw" mode, whose CL prototype is:
```
knx_client_script.py raw GROUP_ADDRESS PAYLOAD
```

#### Configuration for a real KNX gateway ####

In order to test against a real KNX deployment you need to pass some extra
parameters (by default, `-i 127.0.0.1` is used for the simulator):
```shell
knx_client_script.py -i GATEWAY_IP_ADDRESS -c 0.0.0.0:0 -d 0.0.0.0:0 ...
```

thus, define a command alias, f.i. (with the *real* GATEWAY_IP_ADDRESS):
```shell
$ alias knx-real='./knx_client_script.py -i GATEWAY_IP_ADDRESS -c 0.0.0.0:0 -d 0.0.0.0:0'
```

then, in the following sections, replace `./knx_client_script.py` with
`knx-real`.

#### Radiator valves ####

1. Open/close:
```shell
$ ./knx_client_script.py raw '0/4/1' 50 2 2
$ ./knx_client_script.py valve set '4/1' 50
```

2. Read status:
```shell
$ ./knx_client_script.py raw '0/4/1' 0 1 0
$ ./knx_client_script.py valve get '4/1'
```

#### Window blinds ####

1. Full open:
```shell
$ ./knx_client_script.py raw '1/4/1' 0 1 2
$ ./knx_client_script.py blind open '4/1
```

2. Full close:
```shell
$ ./knx_client_script.py raw '1/4/1'  1 1 2
$ ./knx_client_script.py blind close '4/1'
```

3. Open/close:
```shell
$ ./knx_client_script.py raw '3/4/1' 50 2 2
$ ./knx_client_script.py blind set '4/1' 50
```

2. Read status:
```shell
$ ./knx_client_script.py raw '4/4/1' 0 1 0
$ ./knx_client_script.py blind get '4/1'
```

## Maintenance  ##

This section is for code *maintainers*. Students are however encouraged to
read :-)

Most tasks are available via the included `Makefile`. See:
```shell
$ make help
```
Source code for the solution build and other sensitive files are encrypted. If
you have just cloned this repo and need to work on sensitive stuff, **the
first thing to do** is to run (your GPG public key must be registered by a
repo's owner/maintainer -- see
[here](https://githepia.hesge.ch/lsds-collab-test/cours-x/project-1/-/blob/master/README.md
"Git-crypted test repo help")):
```shell
$ make unlock
```
Unlocked content will be anyway encrypted on subsequent push operations. It
won't work if the working dir is dirty! Labo's files usually come in two
versions: `<whatever>.complete` and `<whatever>.incomplete`. At any time, only
one of them (by default the `.incomplete`)is simlinked from a deployable
`<whatever>` file -- i.e., this latter is a symlink and should never, ever by
removed. Thus , you can just edit `<whatever>`

It is good practice to have this repo labo-ready, thus *before* pushing new
stuff, you should always call:
```shell
$ make reset
```
To deploy a (complete) build/solution somewhere, use (remot user, host and path might
need to be adapted):
```shell
$ [RUSER=... RHOST=... RPATH=...] make deploy
```

### Git submodules  ###

To allow recursive cloning with **public** access, submodules' urls in
`.gitmodules` must use `https`, such as:

    url = https://gitedu.hesge.ch/adrienma.lescourt/actuasim_iot.git


### TO-DO ###

* Provide an install script
* Provide a test harness
