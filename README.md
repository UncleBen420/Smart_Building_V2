Installation

1) you need to install a mosquitto broker to ensure the genericity between all the platform:
http://mosquitto.org/

# on ubuntu/debian
sudo add-apt-repository -y ppa:mosquitto-dev/mosquitto-ppa
sudo apt install -y mosquitto
#start the service
sudo service mosquitto start
# mosquitto 2 use a username and password
#enter mqtt_user as username and mqtt as password
sudo mosquitto_passwd -c /etc/mosquitto/password_file YOUR_MQTT_USERNAME
# then modify the conf file
sudo nano /etc/mosquitto/mosquitto.conf
# insert these lines inside
listener 1883
password_file /etc/mosquitto/password_file
# restart the service
sudo service mosquitto restart

# now that a broker run, you need to find the ip address of where the broker run and place it inside config/default at:
"url_mqtt":"mqtt://YOUR_IP_ADDRESS"
# now you need to run the KNX simulator
cd /KNX/actuasim
./actuasim.py &
# you need also to use the zwave raspberry or use the simulator by running the command
cd ZWAVE
node zwave_simulator.js

# now you can run the script:
./devices/launch_devices
# it will launch the mqtt wrapper for all the device

# now to connect to your cloud platform the instructions differ form each one

# for azure:

you need to run the azure listener. It listen on all the data topics and cast them into the right format for iot hub
you also need to setup mosquitto configuration to send the data to iot hub

