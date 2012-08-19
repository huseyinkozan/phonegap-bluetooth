# Phonegap Bluetooth Plugin #

Plugin for Phonegap (Cordova) 2.0

This project was started as a fork of [BluetoothPlugin]. With this plugin, you can access 
Bluetooth stack using javascript on Phonegap. After add some new functionality and 
change some function names, I decided to move it as a new project. So, if you have an 
application which uses old [BluetoothPlugin], you must migrate to new API functions.

## Platform Support ##
<table>
    <tr>
         <th>Function</th>
         <th>Android</th>
         <th>Min SDK Version</th>
         <th>Details</th>
    </tr>
    <tr>
         <td>isSupported()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Checks if system supports Bluetooth</td>
    </tr>
    <tr>
         <td>enable()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Requests to enable the Bluetooth</td>
    </tr>
    <tr>
         <td>disable()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Disables Bluetooth</td>
    </tr>
    <tr>
         <td>isEnabled()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Checks if Bluetooth enabled</td>
    </tr>
    <tr>
         <td>getAddress()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Gets self Bluetooth address</td>
    </tr>
    <tr>
         <td>getName()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Gets self Bluetooth name</td>
    </tr>
    <tr>
         <td>requestDiscoverable()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Requests to enable the device shown by others</td>
    </tr>
    <tr>
         <td>startDiscovery()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Trys to find devices by discovery</td>
    </tr>
    <tr>
         <td>cancelDiscovery()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Cancels ongoing discovery</td>
    </tr>
    <tr>
         <td>getBondedDevices()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Gets bonded (paired) devices</td>
    </tr>
    <tr>
         <td>fetchUUIDs()</td>
         <td>Yes</td>
         <td>15</td>
         <td>Gets list of UUIDs from remote device</td>
    </tr>
    <tr>
         <td>connect()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Connects to remote device service with UUID</td>
    </tr>
    <tr>
         <td>connectInsecure()</td>
         <td>Yes</td>
         <td>10</td>
         <td>Connects to remote device service with UUID insecurely</td>
    </tr>
    <tr>
         <td>disconnect()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Closes current connection</td>
    </tr>
    <tr>
         <td>listen()</td>
         <td>Planned</td>
         <td>-</td>
         <td>Listens incoming connections</td>
    </tr>
    <tr>
         <td>read()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Reads data from connected device</td>
    </tr>
    <tr>
         <td>write()</td>
         <td>Yes</td>
         <td>5</td>
         <td>Writes data to connected device</td>
    </tr>
</table>



# How to Use #

## Android ##
Copy required files in to specified folders :
```
assets/www/bluetooth.js
src/org/apache/cordova/plugin/BluetoothPlugin.java
```
> **Tip:** You can just copy folders and paste it into the project with right click in Eclipse.

> If you want to run example index.html you also need these files :
> > assets/www/jquery-1.8.0.js
> > assets/www/cordova-2.0.0.js

Before using the Bluetooth plugin, you must do some changes on Phonegap project.

#### AndroidManifest.xml ####
Add the following lines between `<manifest>` and `</manifest>` tags to get Bluetooth permission:
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
```

#### res/xml/config.xml ####
Add the following line between `<plugin>` and `</plugin>` tags to inform Phonegap about new plugin :
```xml
<plugin name="BluetoothPlugin" value="org.apache.cordova.plugin.BluetoothPlugin"/>
```

#### /assets/www/XXXXXX.html ####
Add the following line between `<head>` and `</head>` tags to include javascript file of the API :
```html
<script type="text/javascript" charset="utf-8" src="bluetooth.js"></script>
```
And you also need to initialize javascript object. You can do it [onload] event :
```javascript
var g_bluetoothPlugin = null;
function onload() {
   document.addEventListener("deviceready", function() {
		g_bluetoothPlugin = cordova.require( 'cordova/plugin/bluetooth' );
	}, true);
}
```
Please see *assets/www/index.html* for example usage.

# License #
   Licensed under the Apache License, Version 2.0. See [LICENSE] file for furthere information.


   [BluetoothPlugin]: https://github.com/phonegap/phonegap-plugins/tree/master/Android/BluetoothPlugin
   [LICENSE]: https://github.com/huseyinkozan/phonegap-bluetooh/blob/master/LICENSE
   [onload]: http://www.w3schools.com/jsref/event_body_onload.asp