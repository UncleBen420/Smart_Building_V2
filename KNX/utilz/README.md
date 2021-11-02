# Utility programs for the KNX lab #

## KNX over SSH ##

If the KNX gateway is only accessible from a bastion/DMZ host via SSH, put the
following in your `~/.bashrc` (replace `$KNX_GATEWAY_IP`, `$USER` and
`$BASTION_HOST` with the real values):

``` shell
function bassh() {
    local host=${1:?'arg #1 missing: remote host'}
    shift
    local command="$@"
    local usage="bassh REMOTE_HOST COMMAND"

    [ "$command" ] || {
        echo -e >&2 "[error] no command provided\nUsage: ${usage}"
        return 1
    }

    ssh ${host} -t bash -ic "'${command}'"
}

alias knx='knx_client_script.py -i $KNX_GATEWAY_IP x -c 0.0.0.0:0 -d 0.0.0.0:0'
alias knxssh='bassh $USER@$BASTION_HOST "knx"'
```

Then you'l be able to call the KNX client script from another host like this:

``` shell
$ knxssh ...
```

## camstream ##

The demo uses a webcam pointed at a window with KNX-enabled
blinds. `camstream` is a utility to stream a v4l2-based webcam to an `icecast`
server, so that the webcam's stream can be remotely read either in a Web
browser or via any http(s)-capable media player.

### Icecast setup ###

Install `icecast` via your GNU/Linux distribution's package manager. Review
its configuration file, usually `/etc/icecast.xml`. An example
`icecast-config.xml` is provided in this repo: it uses a single stream (mount
point) named "iot-lab" and expects a local source
authenticated through username "source" and a password. You need to set the
following parameters (two passwords and your streaming box's IP address):

```xml
<authentication>
  <source-password>*******</source-password>
  <admin-password>*******</admin-password>
</authentication>
<listen-socket>
  <bind-address>YOUR-IP-ADDRESS</bind-address>
</listen-socket>
```

Start your Icecast server and check it's alive via its Web interface (login as
`admin` with the password set above) at
[http://YOUR-IP-ADDRESS:8000/](http://YOUR-IP-ADDRESS:8000/).


### Stream it! ###

Help? Just run:

```shell
$ camstream
```

Check the default ENV options. You most probably need to adjust `IHOST` and
`VDEVICE`.

Connect a webcam to your streaming box with the running Icecast instance,
configured as above. Launch `camstream` (by default it connects to
`localhost`) with the source password set above:

```shell
$ IHOST=YOUR-IP-ADDRESS camstream stream SOURCE-PASSWORD
```

Wait some seconds. You should see a live stream listed at
[http://YOUR-IP-ADDRESS:8000/admin/listmounts.xsl](http://YOUR-IP-ADDRESS:8000/admin/listmounts.xsl). You
can now play the stream with your favourite media player, f.i.:

```shell
$ vlc http://YOUR-IP-ADDRESS:8000/iot-lab
```

Or in a Web browser pointed at the the same URL :-)

### Audio capture ###

By default camstream captures only the video stream. To also stream audio,
first get to know which ALSA device corresponds to your webcam (or any
microphone connected to another audio card). Here we see it's card #2.

```shell
$ arecord -l
**** List of CAPTURE Hardware Devices ****
...
card 2: C525 [HD Webcam C525], device 0: USB Audio [USB Audio]
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

Thus, you'd start A/V streaming like this:

```shell
$ ACARD=2 IHOST=YOUR-IP-ADDRESS camstream stream SOURCE-PASSWORD
```
