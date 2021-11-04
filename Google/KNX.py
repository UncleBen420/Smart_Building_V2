import datetime
import json
import os
import ssl
import time
import urllib
import json
import jwt
import paho.mqtt.client as mqtt


# GCP parameters 
project_id = "my-first-project-326708"  # Your project ID.
registry_id = "Smartbuild"  # Your registry name.
device_id = "zwave" # Your device name.
private_key_file = 'rsa_private.pem'  # Path to private key.
algorithm = 'RS256'  # Authentication key format.
cloud_region = 'europe-west1'  # Project region.
ca_certs = 'roots.pem'  # CA root certificate path.
mqtt_bridge_hostname = 'mqtt.googleapis.com'  # GC bridge hostname.
mqtt_bridge_port = 8883  # Bridge port.
message_type = 'event'  # Message type (event or state).

def create_jwt(project_id, private_key_file, algorithm):
    # Create a JWT (https://jwt.io) to establish an MQTT connection.
    token = {
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
        'aud': project_id
    }
    with open(private_key_file, 'r') as f:
        private_key = f.read()
    print('Creating JWT using {} from private key file {}'.format(
        algorithm, private_key_file))
    return jwt.encode(token, private_key, algorithm=algorithm)


def error_str(rc):
    # Convert a Paho error to a human readable string.
    return '{}: {}'.format(rc, mqtt.error_string(rc))


class Device(object):
    # Device implementation.
    def __init__(self):
        self.connected = False
        
        


    def wait_for_connection(self, timeout):
        # Wait for the device to become connected.
        total_time = 0
        while not self.connected and total_time < timeout:
            time.sleep(1)
            total_time += 1

        if not self.connected:
            raise RuntimeError('Could not connect to MQTT bridge.')

    def on_connect(self, unused_client, unused_userdata, unused_flags, rc):
        # Callback on connection.
        print('Connection Result:', error_str(rc))
        self.connected = True

    def on_disconnect(self, unused_client, unused_userdata, rc):
        # Callback on disconnect.
        print('Disconnected:', error_str(rc))
        self.connected = False

    def on_publish(self, unused_client, unused_userdata, unused_mid):
        # Callback on PUBACK from the MQTT bridge.
        print('Published message acked.')

    def on_subscribe(self, unused_client, unused_userdata, unused_mid,
                     granted_qos):
        # Callback on SUBACK from the MQTT bridge.
        print('Subscribed: ', granted_qos)
        if granted_qos[0] == 128:
            print('Subscription failed.')

    def on_message(self, unused_client, unused_userdata, message):
        # Callback on a subscription.
        payload = message.payload.decode('utf-8')
        print('Received message \'{}\' on topic \'{}\' with Qos {}'.format(payload, message.topic, str(message.qos)))
        
        if not payload:
            return
        
           
def main():

    client = mqtt.Client(
        client_id='projects/{}/locations/{}/registries/{}/devices/{}'.format(
            project_id,
            cloud_region,
            registry_id,
            device_id))
    client.username_pw_set(
        username='unused',
        password=create_jwt(
            project_id,
            private_key_file,
            algorithm))
    client.tls_set(ca_certs=ca_certs, tls_version=ssl.PROTOCOL_TLSv1_2)

    device = Device()

    client.on_connect = device.on_connect
    client.on_publish = device.on_publish
    client.on_disconnect = device.on_disconnect
    client.on_subscribe = device.on_subscribe
    client.on_message = device.on_message
    client.connect(mqtt_bridge_hostname, mqtt_bridge_port)
    client.loop_start()

    mqtt_telemetry_topic = '/devices/{}/events'.format(device_id)
    mqtt_config_topic = '/devices/{}/config'.format(device_id)

    # Wait up to 5 seconds for the device to connect.
    device.wait_for_connection(5)

    client.subscribe(mqtt_config_topic, qos=1)
    
    try:        
        while True:
            os.system('cmd /c "./knx_client_script.py raw '0/4/1' 0 1 0
"')
            stream = os.popen('echo Returned output')
            output = stream.read()
            data = json.loads(output)
            print('Publishing payload',data)
            client.publish(mqtt_telemetry_topic, data, qos=1)                
            time.sleep(6)     

    except KeyboardInterrupt:
        # Exit script on ^C.
        pass
        client.disconnect()
        client.loop_stop()
        print('Exit with ^C. Goodbye!')
        

if __name__ == '__main__':
    main()