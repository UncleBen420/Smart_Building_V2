# Actuasim

The aim of Actuasim is to reproduce a very simple KNX-base building automation
deplyment.  It can be used to reproduce an existing building, in order to
develop the KNX automation without disturbing people in their offices.  It
replaces a KNXnet/IP *gateway*, handles all received datagram and triggers the
corresponding actions. And as much as the real building, blinds and valves
positions can be set by the user as well.

# Usage

The program is written in Python3, and depends on:

- [Knxnet](https://githepia.hesge.ch/adrienma.lescourt/knxnet_iot)
- [PyQt5](https://riverbankcomputing.com/software/pyqt)

The following instructions are intended for an Ubuntu Linux instance with
Python 3.
```shell
$ sudo apt-get update
$ sudo apt-get install python-pyqt5
```
**N.B.** Python 3 is now the default interpreter in most recent Linux
distributions. Do not use Python 2! If unsure, check with:
```shell
$ python -V
```

Then, simply call (if you are not in a GNU/Linux shell, you might need to put
`python` before the script name):
```shell
$ ./actuasim.py &
```

Once launched, Actuasim will load a file `saved_rooms.json` containing the
building configuration with all the KNX addresses. If this file does not
exist, it is created with a default configuration composed of 2 rooms, each
one has 2 blinds and two radiator valves.

Whenever the application is closed, the building configuration with the
current position of blinds and valves are stored in this `saved_rooms.json`
file.

You can edit this it to set up your specific building configuration.

By default, Actuasim is listening on UDP port 3671.

A `actuasim.log` file is written to monitor every received frame or event with
the decoded data.


# Simulated hardware

- **Window blind**: tunneling data can either be a *boolean* to command the
    blind to fully move down (1) or up (0), or a *byte* to set the blind to an
    intermediate position [0..255].

- **Radiator valve**: tunneling data is one *byte* to set the valve to an
  intermediate position [0..255].
