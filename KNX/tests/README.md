Tests for smarthepia deployment
===============================

KNX gateway address:    129.194.184.31
Video monitor:          http://129.194.184.223/video1.mjpg
Terminal login:         ssh 129.194.186.252

First, set a command alias ;-)

    $ alias knx='knx_client_script.py -i 129.194.184.31 -c 0.0.0.0:0 -d 0.0.0.0:0'


#### Radiator valves ####

1. Open/close:

        knx raw '0/4/10' 50 2 2
        knx valve set '4/10' 50

2. Read status:

        knx raw '0/4/10' 0 1 0
        knx valve get '4/10'

#### Window blinds ####

1. Full open:

        knx raw '1/4/10' 0 1 2
        knx blind open '4/10'

2. Full close:

        knx raw '1/4/10'  1 1 2
        knx blind close '4/10'

3. Open/close:

        knx raw '3/4/10' 50 2 2
        knx blind set '4/10' 50

2. Read status:

        knx raw '4/4/10' 0 1 0
        knx blind get '4/10'


Bugs
====

Read status returns the actual value + 1.


To do
=====

* Scriptify the above tests ;-)
* Provide a test harness
