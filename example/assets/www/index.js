

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
  
  disableBluetoothConnectionRelatedInputs(true);
  document.getElementById("listening-name").innerHTML = listeningName;
  document.getElementById("listening-uuid").innerHTML = listeningUUID;
  
  
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
			  disableBluetoothConnectionRelatedInputs(true);
		  }
		  else {
		    bluetoothPugin.isEnabled(
		      function(enabled) {
			      if (enabled) {
			        document.getElementById("enable-disable-button").value = "Off";
			        disableBluetoothConnectionRelatedInputs(false);
		        }
		        else {
			        document.getElementById("enable-disable-button").value = "On";
			        disableBluetoothConnectionRelatedInputs(true);
		        }
		      },
		      function() {
			      alert("Error while bluetooth enabled checking !");
			      disableBluetoothConnectionRelatedInputs(true);
		      });
		  }
		},
		function() {
			alert("Error while bluetooth support checking !");
      document.getElementById("page-content").disabled = true;
      disableBluetoothConnectionRelatedInputs(true);
		});
}




function requestDiscoverable(duration) {

  if ( ! bluetoothPugin)
    return;

	bluetoothPugin.requestDiscoverable(
		function(duration) {
      document.getElementById("enable-disable-button").value = "Off";
      disableBluetoothConnectionRelatedInputs(false);
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
        disableBluetoothConnectionRelatedInputs(true);
		    alert( 'Disabling successfull' );
	    }, function() {
	      item.disabled = false;
        item.value = "Off";
        disableBluetoothConnectionRelatedInputs(false);
		    alert( 'Error disabling BT: ' + error );
	    } );
    }
  } else { /* On */
    item.disabled = true;
    if (bluetoothPugin) {
	    bluetoothPugin.enable( function() {
	      item.disabled = false;
        item.value = "Off";
        disableBluetoothConnectionRelatedInputs(false);
		    alert( 'Enabling successfull' );
	    }, function() {
	      item.disabled = false;
        item.value = "On";
        disableBluetoothConnectionRelatedInputs(true);
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



function disableUUIDRelatedInputs(disable) {

  document.getElementById("connect-button").disabled = disable;
  document.getElementById("secure-connect-check").disabled = disable;
  
}


function disableBondRelatedInputs(disable) {

  document.getElementById("fetch-uuids-button").disabled = disable;
  document.getElementById("uuid-list").disabled = disable;
  if (disable)
    disableUUIDRelatedInputs(true);
  
}


function disableBluetoothConnectionRelatedInputs(disable) {

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
  
}





function toggleConnect(item) {

  var bondedDeviceList = document.getElementById("bonded-device-list");
  var uuidList = document.getElementById("uuid-list");
  var secureCheck = document.getElementById("secure-connect-check");

  if(item.value == "Connect") {
    item.value = "Disconnect";
    if (bluetoothPugin) {
      bluetoothPugin.connect(
        function(sockId) {
          socketId = sockId; 
          console.log( 'Socket-id: ' + socketId );
          alert("Connected, Socket-id:" + socketId);
        }, 
        function(error) {
          item.value = "Connect";
          alert( 'Error: ' + error );
        }, 
        bondedDeviceList.options[bondedDeviceList.selectedIndex].value,
        uuidList.options[uuidList.selectedIndex].value,
        secureCheck.checked
      );
    }
  } else { /* Disconnect */
    item.disabled = true;
    if (bluetoothPugin) {
      bluetoothPugin.disconnect(
        function(){
          item.disabled = false;
          item.value = "Connect";
          alert("Disconnected");
          socketId = -1;
        },
        function(error){
          item.disabled = false;
          item.value = "Disconnect";
          alert("Error while disconnecting : " + error)
        },
        socketId
      );
    }
  }

}





function toggleListen(item) {

  if(item.value == "Listen") {
    item.disabled = true;
    if (bluetoothPugin) {
      bluetoothPugin.listen(
        function(sockId){
          item.disabled = false;
          item.value = "Cancel";
          alert("Connected socket:" + sockId);
        },
        function(error){
          item.disabled = false;
          item.value = "Listen";
          alert("Error while listening : " + error)
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



function readDevice() {

  if ( ! bluetoothPugin)
    return;
    
	bluetoothPugin.read(
			function( p_data ) {
				$( '#bt-data-dump' ).html( p_data );
			},
			function( error ) {
				alert( 'Error: ' + error );
			}, 
			socketId);
}

function writeDevice() {

  if ( ! bluetoothPugin)
    return;
    
	bluetoothPugin.write(
			function(){
				alert("Wrote");
			}, function(error) {
				alert( 'Error: ' + error );
			}, 
			socketId,
			[10,20,30,40,50]);
}




