var self;
var zwave;
var nodes = [];
var homeid = null;

var exports = module.exports = {
    Start: function () {
        self = this;

        this.AddNpmPackage('openzwave-shared', true, function (err) {
            if (!err) {
                let ZWave = require('openzwave-shared');
                let driverpath = self.GetPropertyValue('security', 'driverpath');
                zwave = new ZWave({
                    ConsoleOutput: false,
                    driverattempts: 100,
                });

                zwave.on('driver ready', function (home_id) {
                    self.Debug('scanning homeid=0x%s...', homeid.toString(16));
                });

                zwave.on('driver failed', function () {
                    this.ThrowError(null, '00002', ('failed to start driver');
                    zwave.disconnect();
                });

                zwave.on('node added', function (nodeid) {
                    nodes[nodeid] = {
                        manufacturer: '',
                        manufacturerid: '',
                        product: '',
                        producttype: '',
                        productid: '',
                        type: '',
                        name: '',
                        loc: '',
                        classes: {},
                        ready: false,
                    };
                    self.Debug('node added (' + nodeid + ')');
                    console.log(JSON.stringify(nodes));
                    self.SubmitMessage(switchNodes, 'application/json', []);
                });

                zwave.on('node ready', function (nodeid, nodeinfo) {
                    var stateNodes = [];
                    nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
                    nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
                    nodes[nodeid]['product'] = nodeinfo.product;
                    nodes[nodeid]['producttype'] = nodeinfo.producttype;
                    nodes[nodeid]['productid'] = nodeinfo.productid;
                    nodes[nodeid]['type'] = nodeinfo.type;
                    nodes[nodeid]['name'] = nodeinfo.name;
                    nodes[nodeid]['loc'] = nodeinfo.loc;
                    nodes[nodeid]['ready'] = true;
                    for (var comclass in nodes[nodeid]['classes']) {
                        switch (comclass) {
                            case 0x25: // COMMAND_CLASS_SWITCH_BINARY
                            case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
                                zwave.enablePoll(nodeid, comclass);
                                break;
                        }

                        var values = nodes[nodeid]['classes'][comclass];
                    }
                    self.SubmitMessage(switchNodes, 'application/json', []);
                });

                zwave.on('value changed', function (nodeid, comclass, value) {
                    if (nodes[nodeid]['ready']) {
                        console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
                            value['label'],
                            nodes[nodeid]['classes'][comclass][value.index]['value'],
                            value['value']);

                        console.log("mSB: " + JSON.stringify(value));
                    }
                    nodes[nodeid]['classes'][comclass][value.index] = value;
                    self.SubmitMessage(switchNodes, 'application/json', []);
                });

                zwave.on('scan complete', function () {
                    self.Debug('Scan complete');
                    zwave.requestAllConfigParams(3);

                    zwave.addNode();
                });

                zwave.connect(driverpath);
            }
            else {
                this.ThrowError(null, '00001', 'Unable to install the openzwave-shared npm package');
                return;
            }
        });
    },

    Stop: function () {
        zwave.disconnect();
    },

    Process: function (state, context) {
        state.desired.zwaveNodes.forEach(function(n){
            self.Debug("Updating state: " + n.node_id + "-> " + n.value)
            zwave.setValue(n.node_id, n.class_id, n.instance, n.value);
        });
    },

    switchNodes: function () {
        var arr = nodes.filter(function (n) {
            return n.classes[37];
        });
        return arr;
    }
};
