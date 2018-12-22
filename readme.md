# Installing a microServiceBus-**node**
*microServiceBus-node is the agent that needs to run on your device, and requires node.js and npm to be install prior to installing the agent.*

[Node.js®](nodejs.org) is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices. Node.js provides lost of useful scenarios outside the scope of microSeviceBus.com® and as such it can be used together with other applications and solutions deployed on Node.js.

Along with Node.js comes [npm](npm.org), which is a package manager for Node.js along with other things. After installing Node.js, you can use npm to install the microServiceBus.node package, and from there, you’re pretty much set to get started.

To complete this process, just follow these three steps:

1. Install Node.js and npm package.
2. Create the node.
3. Start the node.
## 1. Install Node.js and npm package:
To install Node.js go to https://nodejs.org/download/ and download the installation media for your platform. Make sure you install the npm package manager as well.

#### Windows
Download the latest stable version and install the msi using the default settings. This will install both **Node.js** and **npm**.


#### Ubuntu or Debian
If you are on a Ubuntu or Debian operating system you simply open a terminal and use the following command: 
sudo apt-get update 
sudo apt-get install nodejs 

While there, continue to install npm using the following command:
```
sudo apt-get install npm
```

#### Raspberry Pi

To make npm work on a Raspberry Pi you might need to set the registry to HTTP using this following command:

Raspberry Pi 2 Model B  
```bash
https://nodejs.org/dist/v9.9.0/node-v9.9.0-linux-armv7l.tar.gz
tar -xvf node-v9.9.0-linux-armv7l.tar.gz
cd node-v9.9.0-linux-armv7l
#Copy to /usr/local:

sudo cp -R * /usr/local/
```

for more info: http://blog.wia.io/installing-node-js-v4-0-0-on-a-raspberry-pi/

### Get the microServiceBus npm package:
Open a terminal or command window and create a directory of your choice. Then type the following:
```bash 
npm install microservicebus-node  
```
This command creates and installs the package in a folder called node_modules. Browse to the _node_modules/microservicebus-node_ folder. 
Before you start your node, you need a temporary verification code which you can generate from the Node page.

## 2. Create a node:
With the microServiceBus-node installed we need create the **node** in the microServiceBus.com portal. There are a number of ways to create and automatically provision nodes. 
For now, we’ll keep it simple and use the [Nodes](/Nodes) page.

Navigate to the [Nodes](/Nodes) page and create a node using the *CREATE NEW NODE* button on the top. Give the node a name and description and hit *CREATE*.

Back at the the [Nodes](/Nodes), your new *Node* should be visible in the list.


## 3. Start the node:
With the microServiceBus-node package installed and the *Node* created in the portal, it’s time to start the node. The first time you start the node, it has no knowledge of what organization it belongs to nor does it have any access keys to authenticate to microServiceBus.com or you IoT hub for that matter. There are many ways you can pre-configure the node before it’s started, but again we’ll keep it simple.

### Get a temporary verification code
On the Nodes page in the portal, click the *GENERATE* button. Copy the generated verification code and go back to your terminal or console. The verification code is unique and valid for 30 min, and can be used to configure a node.
In your terminal/console, type the following:

```bash  
node start -c [YOUR CODE] -n  [YOUR NODE NAME]

Eg:
node start -c ABC123 -n device1

```
This should start the *Node*, which should begin by downloading microServiceBus-**core**, which together with microServiceBus-node make up the agent that we generally refer to as “The Node”.

The installation should complete after a couple of minutes, after which it will authenticate it self using the temporary verification token you generated before. In the final step before completion, the *Node* will install the necessary packages for communication with your IoT hub, after which you should see you *Node online in the portal.

If you want to stop the *Node*, simply hit CTRL+C/CMD+C in the terminal/console. To start it up again, simply type:
```
node start
``` 

## Running as a daemon (Optional)
**Step 1: Create A Unit File**

Open a sample unit file using the command as shown below:
```
sudo nano /lib/systemd/system/msb.service
```
**Step 2: Add in the following text :**
```
 [Unit]
 Description=My Sample Service
 After=multi-user.target

 [Service]
 Type=idle
 ExecStart=/usr/local/bin/node /root/msb/node_modules/microservicebus-node/start

 [Install]
 WantedBy=multi-user.target
```
**Step 3: Set permissions**
The permission on the unit file needs to be set to 644 :
```
sudo chmod 644 /lib/systemd/system/msb.service
```
**Step 4: Configure systemd**
Now the unit file has been defined we can tell systemd to start it during the boot sequence:
```
sudo systemctl daemon-reload
sudo systemctl enable msb.service
sudo reboot
```

##### See also 
[Working with Node.js services](wiki/nodejs)

[Installing on Ubuntu Core](https://github.com/axians/microServiceBus-node/wiki/IoT-Devices)

[Back to help]()
