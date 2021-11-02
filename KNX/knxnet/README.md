[![Build Status](https://travis-ci.org/leadrien/knxnet.svg?branch=master)](https://travis-ci.org/leadrien/knxnet)

# Knxnet #

Knxnet is a Python-3 library for creating and decoding KNXnet/IP *telegrams*
(frames) to be sent to a KNX UDP/IP gateway.

**This library was developed to suit the needs of the project HES-SO/EMG4B. It
is not complete and some commands/parameters are missing.**


## Installation ##

The following instructions are intended for an Ubuntu Linux instance with
Python 3.
```shell
$ sudo apt-get update
$ sudo apt-get install git pip python-setuptools
```
**N.B.** Python 3 is now the default interpreter in most recent Linux
distributions. Do not use Python 2! If unsure, check with:
```shell
$ python -V
```
Then (notice the `user` switch):
```shell
$ pip install --user ./
```

## Usage ##

* Create a frame:

```python
BinaryFrame = create_frame(SERVICE_TYPE_DESCRIPTOR, *param)
```

[See below](#service-type-descriptor) for details about the `SERVICE_TYPE_DESCRIPTOR`.

* Decode a frame:

```python
KnxnetObject = decode_frame(frame)
```

then you have access to all fields in the KNX frame (**FIXME: add details**).


### Service type descriptor ###

The following `SERVICE_TYPE_DESCRIPTOR` are defined, with the required
parameters for frame creation:

- CONNECTION_REQUEST:
```python
create_frame(ServiceTypeDescriptor.CONNECTION_REQUEST,
             CONTROL_ENPOINT,
             DATA_ENDPOINT)
```
- CONNECTION_RESPONSE:
```python
create_frame(ServiceTypeDescriptor.CONNECTION_RESPONSE,
             CHANNEL_ID,
             STATUS,
             DATA_ENDPOINT)
```
- CONNECTION_STATE_REQUEST
```python
create_frame(ServiceTypeDescriptor.CONNECTION_STATE_REQUEST,
             CHANNEL_ID,
             CONTROL_ENPOINT)
```
- CONNECTION_STATE_RESPONSE
```python
create_frame(ServiceTypeDescriptor.CONNECTION_STATE_RESPONSE,
             CHANNEL_ID,
             STATUS)
```
- DISCONNECT_REQUEST
```python
create_frame(ServiceTypeDescriptor.DISCONNECT_REQUEST,
             CHANNEL_ID,
             CONTROL_ENPOINT)
```
- DISCONNECT_RESPONSE
```python
create_frame(ServiceTypeDescriptor.DISCONNECT_RESPONSE,
             CHANNEL_ID,
             STATUS)
```
- TUNNELLING_REQUEST
```python
create_frame(ServiceTypeDescriptor.TUNNELLING_REQUEST,
             DEST_GROUP_ADDR,
             CHANNEL_ID,
             DATA,
             DATA_SIZE,
             APCI)
```

**N.B.** The three parameters DATA, DATA_SIZE and APCI are also referred to as the
*PAYLOAD* of the request.

- TUNNELLING_ACK
```python
create_frame(ServiceTypeDescriptor.TUNNELLING_ACK,
             CHANNEL_ID,
             STATUS)
```

### Parameters type ###

*`CONTROL_ENDPOINT`* and *`DATA_ENDPOINT`* are either HPAI objects (**FIXME:
add reference**) or a tuples with IP as *string* and port as *int*. In a
NAT-based VLAN, put everything to zero: `('0.0.0.0', 0)`.

*`CHANNEL_ID`* is a *byte*.

*`STATUS`* is a *byte*: `0` means "all OK", else an error occurred.

*`DEST_GROUP_ADDR`* is the destination group address as *string*,
f.i. '16/5/2', or as `GroupAdress` object (**FIXME: add reference**).

*`DATA`* is a `datapoint` type. **N.B.** Only *boolean* and *8-bit unsigned*
are currently supported.

*`DATA_SIZE`* is the number of bytes, as *int*.

*`APCI`* is the *Application Layer Protocol Control Information* (service
ID). See your deployment specifications to know which value to use.
