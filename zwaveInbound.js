var self;
var zwave;
var nodes = [];
var homeid = null;
var startupInterval;

var exports = module.exports = {
    Start: function () {
        self = this;

        this.AddNpmPackage('openzwave-shared@1.4.1', true, function (err) {
            if (!err) {
                let ZWave = require('openzwave-shared');
                let driverpath = self.GetPropertyValue('static', 'driverpath');
                zwave = new ZWave({
                    ConsoleOutput: false,
                    //driverattempts: 100,
                });

                zwave.on('driver ready', function (home_id) {
                    self.Debug('scanning homeid=0x%s...', home_id.toString(16));
                });

                zwave.on('driver failed', function () {
                    self.ThrowError(null, '00002', 'failed to start driver');
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
                    //self.Debug('node added (' + nodeid + ')');
                    //self.SubmitMessage({ switchNodes: self.switchNodes }, 'application/json', []);
                });

                zwave.on('node ready', function (nodeid, nodeinfo) {
                    self.Debug('node ready (' + nodeid + ')');
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
                    let switchNodes = {};
                    for (let n = 0; n < nodes.length; n++) {
                        if (nodes[n] && nodes[n].classes[37]) {
                            switchNodes['switch-' + n] = { id: n, c: 37, i: nodes[n].classes[37][0].instance, index: nodes[n].classes[37][0].index, value: nodes[n].classes[37][0].value };
                        }
                    }

                    self.Debug(JSON.stringify(switchNodes));

                    self.SubmitMessage({ switches: switchNodes }, 'application/json', []);
                });

                zwave.on('value added', function (nodeid, comclass, value) {
                    //self.Debug('value added (' + nodeid + ')');
                    if (!nodes[nodeid]['classes'][comclass])
                        nodes[nodeid]['classes'][comclass] = {};
                    nodes[nodeid]['classes'][comclass][value.index] = value;
                });

                zwave.on('value changed', function (nodeid, comclass, value) {
                    self.Debug('value changed (' + nodeid + ')');

                    if (nodes[nodeid]['ready']) {
                        console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
                            value['label'],
                            nodes[nodeid]['classes'][comclass][value.index]['value'],
                            value['value']);

                        console.log("mSB: " + JSON.stringify(value));
                        nodes[nodeid]['classes'][comclass][value.index] = value;

                        let switchNodes = {};
                        for (let n = 0; n < nodes.length; n++) {
                            if (nodes[n] && nodes[n].classes[37]) {
                                switchNodes['switch-' + n] = { id: n, c: 37, i: nodes[n].classes[37][0].instance, index: nodes[n].classes[37][0].index, value: nodes[n].classes[37][0].value };
                            }
                        }

                        self.SubmitMessage({ switches: switchNodes }, 'application/json', []);
                    }

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
        if (zwave)
            zwave.disconnect();
        if (startupInterval)
            clearInterval(startupInterval);
    },

    Process: function (state, context) {
        this.Debug('');
        this.Debug('***************************');
        //this.Debug('Incomming state: ' + JSON.stringify(state))
        if (zwave) {
            for (var node in state.desired.switches) {
                try {
                    var switchnode = state.desired.switches[node];
            /*        
                    self.Debug(JSON.stringify(switchnode));
                    self.Debug(JSON.stringify(node));
                    self.Debug(switchnode.id);
                    self.Debug(JSON.stringify(nodes));
          */          
                    if (nodes[switchnode.id]) {
                        self.Debug(JSON.stringify(switchnode));
                        zwave.setValue(switchnode.id, switchnode.c, switchnode.i, 0, switchnode.value);
                    }
                }
                catch (e) {
                    self.Debug(e)
                    self.Debug(JSON.stringify(nodes));
                }
            }
        }
        /*
        else {
            self.Debug('zwave not ready');
            startupInterval = setInterval(function () {
                if (zwave) {
                    clearInterval(startupInterval);
                    for (var node in state.desired.switches) {
                        try {
                            var switchnode = state.desired.switches[node];
        
                            if (nodes[switchnode.id]) {
                                self.Debug(JSON.stringify(switchnode));
                                zwave.setValue(switchnode.id, switchnode.c, switchnode.i, 0, switchnode.value);
                            }
                        }
                        catch (e) {
                            self.Debug(e)
                            self.Debug(JSON.stringify(nodes));
                        }
                    }
                }
            }, 200);
        }
        */
    }
};
