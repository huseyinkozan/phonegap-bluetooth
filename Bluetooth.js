/*
   Copyright December, 2012 Hüseyin Kozan - http://huseyinkozan.com.tr
   
   Copyright 2012 Wolfgang Koller - http://www.gofg.at/
   
   Modified and improved December, 2012 Hüseyin Kozan http://huseyinkozan.com.tr

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

cordova.define("cordova/plugin/bluetooth", function(require, exports, module) {
  var exec = require('cordova/exec');
  
  var Bluetooth = function() {};
  
  /**
   * Check if Bluetooth API is supported on this platform
   *
   * Example;
   *     isSupported(
   *           function(supported){if(supported) alert("supported"); else alert("not supported")},
   *           function(error){alert(error);});
   * 
   * successCallback(supported) : function to be called when checking support was successful
   * failureCallback(message) : function to be called when checking support was not possible / did fail
   */
  Bluetooth.prototype.isSupported = function(successCallback,failureCallback) {
    return exec(successCallback, failureCallback, 'BluetoothPlugin', 'isSupported', []);
  }
  
  /**
   * Enable Bluetooth
   *
   * Example;
   *     enable(
   *           function(){alert("success");},
   *           function(error){alert(error);});
   * 
   * successCallback() : function to be called when enabling of Bluetooth was successful
   * failureCallback(message) : function to be called when enabling was not possible / did fail
   */
  Bluetooth.prototype.enable = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'enable', []);
  }
  
  /**
   * Disable Bluetooth
   *
   * Example;
   *     disable(
   *           function(){alert("success");},
   *           function(error){alert(error);});
   * 
   * successCallback() : function to be called when disabling of Bluetooth was successful
   * failureCallback(message) : function to be called when disabling was not possible / did fail
   */
  Bluetooth.prototype.disable = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'disable', []);
  }
  
  /**
   * Checks if Bluetooth is enabled
   *
   * Example;
   *     isEnabled(
   *           function(){alert("enabled");},
   *           function(error){alert("disabled, error:"+error);});
   * 
   * successCallback() : function to be called after successful return.
   * failureCallback(message) : function to be called due to failure
   */
  Bluetooth.prototype.isEnabled = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'isEnabled', []);
  }
  
  /**
   * Returns device address as string. For example, "00:11:22:AA:BB:CC".
   *
   * Example;
   *     getAddress(
   *           function(address){alert("Adapters address is : " + address);},
   *           function(error){alert(error);});
   * 
   * successCallback(address) : function to be called when getting the adapter address.
   * failureCallback(message) : function to be called due to failure
   */
  Bluetooth.prototype.getAddress = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'getAddress', []);
  }
  
  /**
   * Returns device name as string.
   *
   * Example;
   *     getName(
   *           function(name){alert("Adapters name is : " + name);},
   *           function(error){alert(error);});
   * 
   * successCallback(name) : function to be called when getting the adapter's friendly name.
   * failureCallback(message) : function to be called due to failure
   */
  Bluetooth.prototype.getName = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'getName', []);
  }
  
  /**
   * Request discoverable from user for given duration
   *
   * Example;
   *     requestDiscoverable(
   *           function(duration){alert("Discoverable duration is : " + duration);},
   *           function(error){alert(error);},
   *           200 );
   * 
   * successCallback(duration) : function to be called after user confirms request.
   * failureCallback(message) : function to be called when there was a problem while requesting
   * duration : default is 120, maximum is 300 seconds
   */
  Bluetooth.prototype.requestDiscoverable = function(successCallback,failureCallback, duration) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'requestDiscoverable', [duration]);
  }
  
  /**
   * Search for devices  and list them
   *
   * Example;
   *     startDiscovery(
   *           function(deviceJsonArray){
   *             for(int i=0;i<deviceJsonArray.length;i++){
   *               uuidJsonArray[i].name;
   *               uuidJsonArray[i].address;
   *               uuidJsonArray[i].isBonded;
   *             }
   *           },
   *           function(error){alert(error);});
   * 
   * successCallback(deviceJsonArray) : function to be called when discovery of other devices has finished.
   * failureCallback(message) : function to be called when there was a problem while discovering devices
   */
  Bluetooth.prototype.startDiscovery = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'startDiscovery', []);
  }
  
  /**
   * Cancels ongoing discovery
   *
   * Example;
   *     cancelDiscovery(
   *           function(){alert("success");},
   *           function(error){alert(error);},
   *           0 );
   * 
   * successCallback() : function to be called after successfully canceled.
   * failureCallback(message) : function to be called due to failure
   */
  Bluetooth.prototype.cancelDiscovery = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'cancelDiscovery', []);
  }
  
  /**
   * Return bonded (paired) devices
   * 
   * Example;
   *     getBondedDevices(
   *           function(deviceJsonArray){
   *             for(int i=0;i<deviceJsonArray.length;i++){
   *               uuidJsonArray[i].name;
   *               uuidJsonArray[i].address;
   *               uuidJsonArray[i].isBonded;
   *             }
   *           },
   *           function(error){alert(error);});
   * 
   * successCallback(deviceJsonArray) : function to be called after success.
   * failureCallback(message) : function to be called due to failure
   */
  Bluetooth.prototype.getBondedDevices = function(successCallback,failureCallback) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'getBondedDevices', []);
  }
  
  /**
   * Return list of available UUIDs for a given device
   * Needs minimum SDK API 15
   * 
   * Example;
   *     fetchUUIDs(
   *           function(uuidJsonArray){for(int i=0;i<uuidJsonArray.length;i++){uuidJsonArray[i];}},
   *           function(error){alert(error);},
   *           "00:11:22:AA:BB:CC");
   * 
   * successCallback(uuidJsonArray) : function to be called when listing of UUIDs has finished.
   * failureCallback(message) : function to be called when there was a problem while listing UUIDs
   * address : address string of the remote
   */
  Bluetooth.prototype.fetchUUIDs = function(successCallback,failureCallback,address) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'fetchUUIDs', [address]);
  }
  
  /**
   * Open an RFComm channel for a given device & uuid endpoint
   * Insecure connection needs minimum SDK API 10
   * 
   * Example;
   *     connect(
   *           function(socketId){alert("Connected to : " + socketId)},
   *           function(error){alert(error);},
   *           "00:11:22:AA:BB:CC",
   *           "fa87c0d0-afac-11de-8a39-0800200c9a66",
   *           true);
   * 
   * successCallback(socketId) : function to be called when the connection was successful.
   * failureCallback(message) :  function to be called when there was a problem while opening the connection
   * address : Bluetooth device address string
   * uuid : UUID string
   * secure boolean if connection is secure or not
   */
  Bluetooth.prototype.connect = function(successCallback,failureCallback,address,uuid, secure) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'connect', [address, uuid, secure]);
  }
  
  /**
   * Close a RFComm channel for a given socket-id
   * 
   * Example;
   *     disconnect(
   *           function(){alert("success");},
   *           function(error){alert(error);},
   *           0 );
   * 
   * successCallback() : function to be called when the connection was closed successfully
   * failureCallback(message) : function to be called when there was a problem while closing the connection
   * socketId : socket id
   */
  Bluetooth.prototype.disconnect = function(successCallback,failureCallback,socketId) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'disconnect', [socketId]);
  }
  
  
  /**
   * Listens incoming connections
   * Insecure listening needs minimum SDK API 10
   *
   * Example;
   *     listen(
   *           function(socketId){alert("Connected to : " + socketId)},
   *           function(error){alert(error);},
   *           "BluetoothChatSecure",
   *           "fa87c0d0-afac-11de-8a39-0800200c9a66",
   *           true);
   * 
   * successCallback(socketid) : function to be called on every new connection establish
   * failureCallback(message) : function to be called when there was a problem while listening
   * name : Listening service name
   * uuid : Listening service UUID
   * secure : boolean if connection is secure or not
   */
  Bluetooth.prototype.listen = function(successCallback,failureCallback,name,uuid,secure) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'listen', [name,uuid,secure]);
  }
  
  /**
   * Cancels listening incoming connections
   * 
   * Example;
   *     cancelListening(
   *           function(){alert("success");},
   *           function(error){alert(error);});
   * 
   * successCallback() : function to be called when stops listening successfully
   * failureCallback(message) : function to be called when there was a problem \ 
   *                            while stopping listening
   */
  Bluetooth.prototype.cancelListening = function(successCallback,failureCallback) {
    return exec(successCallback, failureCallback, 'BluetoothPlugin', 'cancelListening', []);
  }
  
  /**
   * Registers a callback function which called after a successful read
   * 
   * Example;
   *     read(
   *           function(byteArray){for(int i=0;i<byteArray.length;i++){byteArray[i];}},
   *           function(error){alert(error);},
   *           0);
   * 
   * successCallback(byteArray) : function to be called after each successful read.
   * failureCallback(message) : function to be called when there was a problem while \
   *                            reading or after socket has been closed.
   * socketId : connected socket id
   * bufferSize : internal buffer size while reading, default is 1024
   */
  Bluetooth.prototype.read = function(successCallback,failureCallback,socketId,bufferSize) {
	  bufferSize = typeof bufferSize !== 'undefined' ? bufferSize : 1024;
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'read', [socketId,bufferSize]);
  }
  
  /**
   * Write to a connected socket
   * 
   * Example;
   *     write(
   *           function(){alert("success");},
   *           function(error){alert(error);},
   *           0,
   *           {10,20,30,40});
   * 
   * successCallback() : function to be called when writing was successful.
   * failureCallback(message) : function to be called when there was a problem while writing
   * socketId : socket id which already connected.
   * jsonArray : data that wanted to send
   */
  Bluetooth.prototype.write = function(successCallback,failureCallback,socketId,jsonArray) {
      return exec(successCallback, failureCallback, 'BluetoothPlugin', 'write', [socketId,jsonArray]);
  }
  
  var bluetooth = new Bluetooth();
  module.exports = bluetooth;
});
