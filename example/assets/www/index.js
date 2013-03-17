/*
   Copyright December, 2012 Hüseyin Kozan - http://huseyinkozan.com.tr
   
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


var socketId = -1;
var bluetoothPugin = null;

var listeningName = "BluetoothPlugin"
var listeningUUID = "e7babb53-0160-4192-a2b6-2ccb1e9aae67"

function onload() {

  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    document.addEventListener("deviceready", onDeviceReady, false);
  } else {
    // onDeviceReady();
  }
  
  disableBluetoothRelatedInputs(true);
  document.getElementById("listening-name").innerHTML = listeningName;
  document.getElementById("listening-uuid").innerHTML = listeningUUID;
  document.getElementById("connecting-uuid").innerHTML = listeningUUID;
  
}



function onDeviceReady() {

	bluetoothPugin = cordova.require( 'cordova/plugin/bluetooth' );
	bluetoothPugin.isSupported(
		function(supported) {
			if ( ! supported) {
			  document.open();
			  document.writeln("Bluetooth is not supported on your platform !");
			  document.close();
			  document.getElementById("enable-disable-button").disabled = true;
			  document.getElementById("request-discoverable-button").disabled = true;
			  disableBluetoothRelatedInputs(true);
		  }
		  else {
		    bluetoothPugin.isEnabled(
		      function(enabled) {
			      if (enabled) {
			        document.getElementById("enable-disable-button").value = "Off";
			        disableBluetoothRelatedInputs(false);
		        }
		        else {
			        document.getElementById("enable-disable-button").value = "On";
			        disableBluetoothRelatedInputs(true);
		        }
		      },
		      function() {
			      alert("Error while bluetooth enabled checking !");
			      disableBluetoothRelatedInputs(true);
		      });
		  }
		},
		function() {
			alert("Error while bluetooth support checking !");
      document.getElementById("page-content").disabled = true;
      disableBluetoothRelatedInputs(true);
		});
}




function requestDiscoverable(duration) {

  if ( ! bluetoothPugin)
    return;

	bluetoothPugin.requestDiscoverable(
		function(duration) {
      document.getElementById("enable-disable-button").value = "Off";
      disableBluetoothRelatedInputs(false);
			alert("Visible duration is " + duration + " seconds.");
		},
		function(error) {
			alert("Error : " + error);
		},
		duration /*seconds*/
	);
			
}





function toggleEnableDisable(item) {

  if(item.value == "Off") {
    item.disabled = true;
    if (bluetoothPugin) {
	    bluetoothPugin.disable( function() {
	      item.disabled = false;
        item.value = "On";
        disableBluetoothRelatedInputs(true);
		    alert( 'Disabling successfull' );
	    }, function() {
	      item.disabled = false;
        item.value = "Off";
        disableBluetoothRelatedInputs(false);
		    alert( 'Error disabling BT: ' + error );
	    } );
    }
  } else { /* On */
    item.disabled = true;
    if (bluetoothPugin) {
	    bluetoothPugin.enable( function() {
	      item.disabled = false;
        item.value = "Off";
        disableBluetoothRelatedInputs(false);
		    alert( 'Enabling successfull' );
	    }, function() {
	      item.disabled = false;
        item.value = "On";
        disableBluetoothRelatedInputs(true);
		    alert( 'Error enabling BT: ' + error );
	    } );
    }
  }
  
}




function getAddress() {

  if ( ! bluetoothPugin)
    return;

	bluetoothPugin.getAddress(
		function(address) {
			alert("Address is : " + address);
		},
		function(error) {
			alert("Error : " + error);
	});
			
}





function getName() {

  if ( ! bluetoothPugin)
    return;

	bluetoothPugin.getName(
		function(name) {
			alert("Name is : " + name);
		},
		function(error) {
			alert("Error : " + error);
	});
	
}




function toggleDiscovery(item) {
  
  if(item.value == "Cancel") {
    if (bluetoothPugin) {
      bluetoothPugin.cancelDiscovery(
        function() {
          item.value = "Discovery";
        },
        function() {
          item.value = "Cancel";
          alert("Discovery can not canceled");
        }
      );
    }
  } else { /* Discovery */
    item.value = "Cancel";
    if (bluetoothPugin) {
      bluetoothPugin.startDiscovery( 
        function(devices) {
          item.value = "Discovery";
          var select = document.getElementById("discovered-device-list");
          select.options.length = 0; /*clear*/
          for (var i = 0; i < devices.length; i++) {
            var text = devices[i].name + (devices[i].isBonded ?" (Bonded)":" (NotBonded)");
            var value = devices[i].address;
            select.options.add(new Option(text, value));
          }
          if (devices.length == 0) {
            alert("Can not find any device !");
          }
          else {
            alert("Found device count : " + devices.length);
          }
        }, 
        function(error) {
          item.value = "Discovery";
          alert( 'Error: ' + error ); 
        }
      );
    }
  }
}




function bondedDevices() {

  if ( ! bluetoothPugin)
    return;

  bluetoothPugin.getBondedDevices(
    function(devices) {
      var select = document.getElementById("bonded-device-list");
      select.options.length = 0; /*clear*/
      for (var i = 0; i < devices.length; i++) {
        var text = devices[i].name + (devices[i].isBonded ?" (Bonded)":" (NotBonded)");
        var value = devices[i].address;
        select.options.add(new Option(text, value));
      }
      if (devices.length == 0) {
        disableBondRelatedInputs(true);
        alert("Can not find any device !");
      }
      else {
        disableBondRelatedInputs(false);
        alert("Found device count : " + devices.length);
      }
    },
    function(error) {
      alert( 'Error: ' + error );
    }
  );
}




function fetchUUIDs() {

  var bondedDeviceList = document.getElementById("bonded-device-list");

  if (bondedDeviceList.options.length <= 0)
    return;

  if ( ! bluetoothPugin)
    return;
    
	bluetoothPugin.fetchUUIDs(
	  function(uuids) {
        var select = document.getElementById("uuid-list");
        select.options.length = 0; /*clear*/
        for (var i = 0; i < uuids.length; i++) {
          var text = uuids[i];
          var value = uuids[i];
          select.options.add(new Option(text, value));
        }
        if (uuids.length == 0) {
          disableUUIDRelatedInputs(true);
          alert("Can not find any device !");
        }
        else {
          disableUUIDRelatedInputs(false);
          alert("Found device count : " + uuids.length);
        }
      },
      function(error) { 
        alert( 'Error: ' + error ); 
      },
      bondedDeviceList.options[bondedDeviceList.selectedIndex].value
    );
}

function disableConnectionRelatedInputs(disable) {
	document.getElementById("message-text").disabled = disable;
	document.getElementById("send-message-button").disabled = disable;
}



function disableUUIDRelatedInputs(disable) {

  if (disable)
	  disableConnectionRelatedInputs(true);
}


function disableBondRelatedInputs(disable) {

  document.getElementById("fetch-uuids-button").disabled = disable;
  document.getElementById("uuid-list").disabled = disable;
  document.getElementById("connect-button").disabled = disable;
  if (disable)
    document.getElementById("disconnect-button").disabled = disable;
  document.getElementById("secure-connect-check").disabled = disable;
  if (disable)
    disableUUIDRelatedInputs(true);
  
}


function disableBluetoothRelatedInputs(disable) {

  document.getElementById("address-button").disabled = disable;
  document.getElementById("name-button").disabled = disable;
  document.getElementById("discovery-button").disabled = disable;
  document.getElementById("discovered-device-list").disabled = disable;
  document.getElementById("bonded-devices-button").disabled = disable;
  document.getElementById("bonded-device-list").disabled = disable;
  if (disable)
    disableBondRelatedInputs(true);
  document.getElementById("listen-button").disabled = disable;
  document.getElementById("secure-listen-check").disabled = disable;
  document.getElementById("listen-textarea").disabled = disable;
}





function connect() {

  if ( ! bluetoothPugin)
    return;
    
  if (socketId >= 0)
    return;

  var bondedDeviceList = document.getElementById("bonded-device-list");
  var secureCheck = document.getElementById("secure-connect-check");

  bluetoothPugin.connect(
    function(sockId) {
      socketId = sockId; 
      document.getElementById("disconnect-button").disabled = false;
      console.log( 'Socket-id: ' + socketId );
      disableConnectionRelatedInputs(false);
      alert("Connected, Socket-id:" + socketId);
    }, 
    function(error) {
      document.getElementById("disconnect-button").disabled = true;
      disableConnectionRelatedInputs(true);
      alert( 'Error: ' + error );
    }, 
    bondedDeviceList.options[bondedDeviceList.selectedIndex].value,
    listeningUUID,
    secureCheck.checked
  );

}





function disconnect() {

  if ( ! bluetoothPugin)
    return;
    
  if (socketId < 0)
  return;
  
  bluetoothPugin.disconnect(
    function(){
      alert("Disconnected");
      socketId = -1;
      disableConnectionRelatedInputs(true);
    },
    function(error){
      alert("Error while disconnecting : " + error)
    },
    socketId
  );

}




function toggleListen(item) {

  if(item.value == "Listen") {
    item.disabled = true;
    if (bluetoothPugin) {
      bluetoothPugin.listen(
        function(sockId){
          item.disabled = false;
          item.value = "Cancel";
          document.getElementById("listen-textarea").value = "Connected socket:" + sockId + "\n";
          bluetoothPugin.read(
      			function( p_data ) {
      				var str = "";
      				for ( var i = 0; i < p_data.length; i++) {
						str += String.fromCharCode(p_data[i]);
					}
      				document.getElementById("listen-textarea").value += "Data : >" + str + "<\n";
      			},
      			function( error ) {
      				document.getElementById("listen-textarea").value += "Error : >" + error + "<\n";
      			}, 
      			sockId);
        },
        function(error){
          item.disabled = false;
          item.value = "Listen";
          document.getElementById("listen-textare").value = "Error while listening : " + error + "\n";
        },
        listeningName,
        listeningUUID,
        document.getElementById("secure-listen-check").checked
      );
    }
  } else {
    item.disabled = true;
    if (bluetoothPugin) {
      bluetoothPugin.cancelListening(
        function(){
          item.disabled = false;
          item.value = "Listen";
          alert("Listening Canceled");
        },
        function(error){
          item.disabled = false;
          item.value = "Cancel";
          alert("Error while cancel the listening : " + error)
        }
      );
    }
  }
  
}


function sendMessage() {
	
	if ( ! bluetoothPugin)
	    return;
	
	if (socketId < 0)
		  return;
	
	var d = document.getElementById("message-text").value;
	var arr = new Array();
	for (var i=0; i<d.length; ++i) {
		arr[i] = d.charCodeAt(i);
	}
	var newLine = "\n";
	arr[arr.length] = newLine.charCodeAt(0);
	

	bluetoothPugin.write(
			function() {
				alert("Successfully Sent");
			}, function(error) {
				alert( 'Error: ' + error + ', for : ' + arr );
			},
			socketId,
			arr
	);
}





