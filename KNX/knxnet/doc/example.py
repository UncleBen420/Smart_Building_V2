"""
This is just an example of how to use `knxnet`, have fun!
"""
import socket, sys
from knxnet import *

gateway_ip = '127.0.0.1' # localhost IP is for the simulator. Replace with the
                         # real IP for the physical gateway
gateway_port = 3671      # default for both the simualtor and the physical
                         # gateway

# These values are the for the simulator -- mind that the port *differs* from
# the gateway's! Replace both with ('0.0.0.0', 0) in a NAT-based VLAN
# (physical deployment)
data_endpoint = ('127.0.0.1', 3672)
control_enpoint = ('127.0.0.1', 3672)

# -> Socket creation
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('', gateway_port))

# -> Sending Connection request
conn_req_object = knxnet.create_frame(
    knxnet.ServiceTypeDescriptor.CONNECTION_REQUEST,
    control_enpoint,
    data_endpoint
)
conn_req_dtgrm = conn_req_object.frame # -> Serializing
sock.sendto(
    conn_req_dtgrm,
    (gateway_ip, gateway_port)
)

# <- Receiving Connection response
data_recv, addr = sock.recvfrom(1024)
conn_resp_object = knxnet.decode_frame(data_recv)

# <- Retrieving channel_id from Connection response
conn_channel_id = conn_resp_object.channel_id
