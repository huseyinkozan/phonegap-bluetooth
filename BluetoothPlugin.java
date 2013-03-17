/*
   Copyright December, 2012 Hüseyin Kozan - http://huseyinkozan.com.tr
   
   Copyright 2012 Wolfgang Koller - http://www.gofg.at/
   
   Modified and improved Agust, 2012 Hüseyin Kozan http://huseyinkozan.com.tr

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
 
package org.apache.cordova.plugin;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaInterface;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Set;
import java.util.UUID;

import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothServerSocket;
import android.bluetooth.BluetoothSocket;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Parcelable;
import android.util.Log;

public class BluetoothPlugin extends CordovaPlugin {
	
	private static final String ACTION_IS_SUPPORTED = 			"isSupported";
	private static final String ACTION_ENABLE = 				"enable";
	private static final String ACTION_DISABLE = 				"disable";
	private static final String ACTION_IS_ENABLED = 			"isEnabled";
	private static final String ACTION_GETADDRESS = 			"getAddress";
	private static final String ACTION_GETNAME = 				"getName";
	private static final String ACTION_REQUEST_DISCOVERABLE =	"requestDiscoverable";
	private static final String ACTION_STARTDISCOVERY = 		"startDiscovery";
	private static final String ACTION_CANCELDISCOVERY = 		"cancelDiscovery";
	private static final String ACTION_GETBONDEDDEVICES = 		"getBondedDevices";
	private static final String ACTION_CONNECT = 				"connect";
	private static final String ACTION_DISCONNECT = 			"disconnect";
	private static final String ACTION_LISTEN = 				"listen";
	private static final String ACTION_CANCEL_LISTENING =		"cancelListening";
	private static final String ACTION_READ = 					"read";
	private static final String ACTION_WRITE = 					"write";
	
	// min api 15 {
	private static final String ACTION_FETCHUUIDS = 			"fetchUUIDs";
	private static String ACTION_UUID = "";
	private static String EXTRA_UUID = "";
	private JSONArray m_gotUUIDs = null;
	public CallbackContext callback_uuids = null;
	// }
	
	private final int REQUEST_CODE_ENABLE = 1;
	private final int REQUEST_CODE_DISCOVERABLE = 2;
	
	private BluetoothAdapter m_bluetoothAdapter = null;
	private BPBroadcastReceiver m_bpBroadcastReceiver = null;
	
	public CallbackContext callback_enable = null;
	public CallbackContext callback_discovery = null;
	public CallbackContext callback_discoverable = null;
	public CallbackContext callback_listen = null;
	public CallbackContext callback_connect = null;
	public CallbackContext callback_read = null;
	
	private ArrayList<BluetoothSocket> m_sockets = new ArrayList<BluetoothSocket>();
	private JSONArray m_discoveredDevices = null;
	
	private ListenThread m_listenThread = null;
	
	private ArrayList<ReadThread> m_readThreads = new ArrayList<ReadThread>();

	/**
	 * Constructor for Bluetooth plugin
	 */
	public BluetoothPlugin() {
		
		m_bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
		m_bpBroadcastReceiver = new BPBroadcastReceiver();
		
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
			try {
				Field actionUUID = BluetoothDevice.class.getDeclaredField("ACTION_UUID");
				BluetoothPlugin.ACTION_UUID = (String) actionUUID.get(null);
				Log.d("BluetoothPlugin", "actionUUID: " + actionUUID.getName() + " / " + actionUUID.get(null));
				Field extraUUID = BluetoothDevice.class.getDeclaredField("EXTRA_UUID");
				BluetoothPlugin.EXTRA_UUID = (String) extraUUID.get(null);
				Log.d("BluetoothPlugin", "extraUUID: " + extraUUID.getName() + " / " + extraUUID.get(null));
			}
			catch( Exception e ) {
				logErr( e.getMessage() );
			}
		}
	}
	
	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		// Register for necessary bluetooth events
		this.cordova.getActivity().registerReceiver(m_bpBroadcastReceiver,
				new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED));
		this.cordova.getActivity().registerReceiver(m_bpBroadcastReceiver,
				new IntentFilter(BluetoothDevice.ACTION_FOUND));
		this.cordova.getActivity().registerReceiver(m_bpBroadcastReceiver, 
				new IntentFilter(BluetoothPlugin.ACTION_UUID));
	}

	
	@Override
	public void onDestroy() {
		super.onDestroy();
		if (m_listenThread != null)
			m_listenThread.cancel();
		m_listenThread = null;
		if ( m_bluetoothAdapter != null )
			m_bluetoothAdapter.cancelDiscovery();
		this.cordova.getActivity().unregisterReceiver(m_bpBroadcastReceiver);
	}

	
	
	@Override
	public boolean execute(String action, JSONArray args,
			final CallbackContext callbackContext) throws JSONException {
		
		logDbg("Action: " + action);
		
		if ( ACTION_IS_SUPPORTED.equals(action) ) 
		{
			callbackContext.sendPluginResult(new PluginResult(
					PluginResult.Status.OK, m_bluetoothAdapter != null));
			return true;
		}
		else if ( m_bluetoothAdapter == null )
		{
			String msg = "Bluetooth is not supported !";
			callbackContext.sendPluginResult(new PluginResult(
					PluginResult.Status.ERROR, msg));
			logErr(msg);
			return true;
		}
		else if ( ACTION_ENABLE.equals(action) )
		{
			this.callback_enable = callbackContext;
			PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			if ( ! m_bluetoothAdapter.isEnabled() )  {
				this.cordova.startActivityForResult(this, 
						new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE), 
						this.REQUEST_CODE_ENABLE);
			}
			callbackContext.sendPluginResult(pluginResult);
			return true;
		}
		else if ( ACTION_DISABLE.equals(action) )
		{
			PluginResult pluginResult;
			if ( ! m_bluetoothAdapter.disable() 
					&& ! ( m_bluetoothAdapter.getState() == BluetoothAdapter.STATE_TURNING_OFF
							|| m_bluetoothAdapter.getState() == BluetoothAdapter.STATE_OFF
						 ) ) {
				pluginResult = new PluginResult(PluginResult.Status.ERROR);
			} else {
				pluginResult = new PluginResult(PluginResult.Status.OK);
			}
			callbackContext.sendPluginResult(pluginResult);
			return true;
		}
		else if ( ACTION_IS_ENABLED.equals(action) )
		{
			boolean b = m_bluetoothAdapter.isEnabled();
			callbackContext.sendPluginResult(
					new PluginResult(PluginResult.Status.OK, b));
			return true;
		}
		else if ( ACTION_GETADDRESS.equals(action) )
		{
			String address = m_bluetoothAdapter.getAddress();
			callbackContext.sendPluginResult(
					new PluginResult(PluginResult.Status.OK, address));
			return true;
		}
		else if ( ACTION_GETNAME.equals(action) )
		{
			String name = m_bluetoothAdapter.getName();
			callbackContext.sendPluginResult(
					new PluginResult(PluginResult.Status.OK, name));
			return true;
		}
		else if ( ACTION_REQUEST_DISCOVERABLE.equals(action) )
		{
			final int duration = args.getInt(0);
			this.callback_discoverable = callbackContext;
			Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
			intent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, duration);
			this.cordova.startActivityForResult(
					this, intent, this.REQUEST_CODE_DISCOVERABLE);
			PluginResult pluginResult = 
					new PluginResult(PluginResult.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			callbackContext.sendPluginResult(pluginResult);
			return true;
		}
		else if ( ACTION_STARTDISCOVERY.equals(action) )
		{
			this.callback_discovery = callbackContext;
			m_discoveredDevices = new JSONArray();
			// be sure there are no ongoing discovery
			m_bluetoothAdapter.cancelDiscovery();
			if ( ! m_bluetoothAdapter.startDiscovery() ) {
				String msg = "Unable to start discovery";
				logErr(msg);
				callbackContext.sendPluginResult(
						new PluginResult(PluginResult.Status.ERROR, msg));
			} else {
				PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			}
			return true;
		}
		else if ( ACTION_CANCELDISCOVERY.equals(action) )
		{
			if ( m_bluetoothAdapter.cancelDiscovery() )
				callbackContext.success();
			else
				callbackContext.sendPluginResult(
						new PluginResult(PluginResult.Status.ERROR));
			return true;
		}
		else if ( ACTION_GETBONDEDDEVICES.equals(action) )
		{
			JSONArray bondedDevices = new JSONArray();
			Set<BluetoothDevice> bondSet = 
					m_bluetoothAdapter.getBondedDevices();
			for (Iterator<BluetoothDevice> it = bondSet.iterator(); it.hasNext();) {
				BluetoothDevice bluetoothDevice = (BluetoothDevice) it.next();
				JSONObject deviceInfo = new JSONObject();
				deviceInfo.put("name", bluetoothDevice.getName());
				deviceInfo.put("address", bluetoothDevice.getAddress());
				deviceInfo.put("isBonded", true);
				bondedDevices.put(deviceInfo);
			}
			callbackContext.success(bondedDevices);
			return true;
		}
		else if (ACTION_FETCHUUIDS.equals(action))
		{
			final String address = args.getString(0);
			this.callback_uuids = callbackContext;
			
			if (Build.VERSION.SDK_INT < Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1) {
				String msg = "Not supported, minimum SDK version is :" + 
						Build.VERSION_CODES.ICE_CREAM_SANDWICH_MR1;
				logErr(msg);
				callbackContext.error(msg);
				return true;
			}
			try {
				logDbg("Listing UUIDs for : " + address);
				// Fetch UUIDs from bluetooth device
				BluetoothDevice bluetoothDevice = 
						m_bluetoothAdapter.getRemoteDevice(address);
				// min api 15 !!!
				Method m = bluetoothDevice.getClass().
						getMethod("fetchUuidsWithSdp", (Class[]) null);
				m.invoke(bluetoothDevice, (Object[]) null );
				PluginResult pluginResult = new PluginResult(PluginResult.Status.NO_RESULT);
				pluginResult.setKeepCallback(true);
				callbackContext.sendPluginResult(pluginResult);
			} catch (Exception e) {
				logErr(e.toString() + " / " + e.getMessage());
				callbackContext.error(e.getMessage());
			}
			return true;
		}
		else if ( ACTION_CONNECT.equals(action) )
		{
			final String address = args.getString(0);
			final String uuid = args.getString(1);
			final boolean secure = args.getBoolean(2);
			this.callback_connect = callbackContext;
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					BluetoothSocket socket = null;
					try {
						logDbg("Connecting...");
						// Cancel discovery because it will slow down the connection
						if(m_bluetoothAdapter.isDiscovering())
							m_bluetoothAdapter.cancelDiscovery();
						BluetoothDevice bluetoothDevice = 
								m_bluetoothAdapter.getRemoteDevice(
										address);
						if (secure) {
							socket = connectSecureHelper(
									bluetoothDevice, 
									UUID.fromString(uuid));
						}
						else {
							socket = connectInsecureHelper(
									bluetoothDevice, 
									UUID.fromString(uuid));
						}
					} catch (Exception e) {
						logErr(e.toString() + " / " + e.getMessage());
						callback_connect.error(e.getMessage());
					}
					if(socket != null) {
						logDbg("Connected");
						m_sockets.add(socket);
						int socketId = m_sockets.indexOf(socket);
						callback_connect.sendPluginResult(
								new PluginResult(
										PluginResult.Status.OK, socketId));
					}
					else {
						callback_connect.error(0);
					}
				}
			});
			PluginResult pluginResult = new PluginResult(
					PluginResult.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			callbackContext.sendPluginResult(pluginResult);
			return true;
		}
		else if (ACTION_DISCONNECT.equals(action)) 
		{
			final int socketId = args.getInt(0);
			try {
				BluetoothSocket socket = m_sockets.get(socketId);
				logDbg("Close socket");
				socket.close();
				logDbg("Delete socket from list");
				m_sockets.remove(socketId);
				for (int i = 0; i < m_readThreads.size(); i++) {
					if (m_readThreads.get(i).socketId == socketId) {
						m_readThreads.remove(i);
						break;
					}
				}
				callbackContext.success();
			} catch (Exception e) {
				logErr(e.toString() + " / " + e.getMessage());
				callbackContext.error(e.getMessage());
			}
			return true;
		}
		else if ( ACTION_LISTEN.equals(action) )
		{
			final String name = args.getString(0);
			final String uuid = args.getString(1);
			final boolean secure = args.getBoolean(2);
			this.callback_listen = callbackContext;
			if (m_listenThread != null) {
				m_listenThread.cancel();
				m_listenThread = null;
			}
			m_listenThread = new ListenThread(
					this.cordova, name, 
					UUID.fromString(uuid), secure );
			m_listenThread.start();
			PluginResult pluginResult = new PluginResult(
					PluginResult.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			callbackContext.sendPluginResult(pluginResult);
			return true;
		}
		else if ( ACTION_CANCEL_LISTENING.equals(action) )
		{
			if (m_listenThread != null) {
				m_listenThread.cancel();
			}
			m_listenThread = null;
			callbackContext.success();
			return true;
		}
		else if ( ACTION_READ.equals(action) ) 
		{
			final int socketId = args.getInt(0);
			final int bufferSize = args.getInt(1);
			this.callback_read = callbackContext;
			ReadThread readThread = new ReadThread(
					m_sockets.get(socketId),socketId,bufferSize);
			readThread.start();
			m_readThreads.add(readThread);
			PluginResult pluginResult = new PluginResult(
					PluginResult.Status.NO_RESULT);
			pluginResult.setKeepCallback(true);
			callbackContext.sendPluginResult(pluginResult);
			return true;
		}
		else if ( ACTION_WRITE.equals(action) )
		{
			final int socketId = args.getInt(0);
			final JSONArray jsonArray = args.getJSONArray(1);
			try {
				OutputStream outputStream = m_sockets.get(socketId)
						.getOutputStream();
				byte[] buffer = new byte[jsonArray.length()];				
				for (int i = 0; i < jsonArray.length(); i++) {
					buffer[i] = (byte) jsonArray.getInt(i);
				}
				outputStream.write(buffer);
				callbackContext.success();
			} catch (Exception e) {
				logErr(e.toString() + " / " + e.getMessage());
				callbackContext.error(e.getMessage());
			}
			return true;
		}
		
		
		return false;
	}

	

	/**
	 * Helper class for handling all bluetooth based events
	 */
	private class BPBroadcastReceiver extends BroadcastReceiver {
		@Override
		public void onReceive(Context context, Intent intent) {
			
			String action = intent.getAction();
			// logDbg( "Action: " + action );
			
			if ( BluetoothDevice.ACTION_FOUND.equals(action) ) {
				BluetoothDevice bluetoothDevice = 
						intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
				try {
					JSONObject deviceInfo = new JSONObject();
					boolean isBonded = false;
					isBonded = bluetoothDevice.getBondState() == BluetoothDevice.BOND_BONDED;
					deviceInfo.put("name", bluetoothDevice.getName());
					deviceInfo.put("address", bluetoothDevice.getAddress());
					deviceInfo.put("isBonded", isBonded);
					m_discoveredDevices.put(deviceInfo);
				} catch (JSONException e) {
					logErr(e.getMessage());
				}
			}
			else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED.equals(action)) {
				sendDiscoveredDevices(intent);
			}
			else if (BluetoothPlugin.ACTION_UUID.equals(action)) {
				m_gotUUIDs = new JSONArray();
				Parcelable[] parcelUuids = 
						intent.getParcelableArrayExtra(BluetoothPlugin.EXTRA_UUID);
				if (parcelUuids != null) {
					logDbg("Found UUIDs : " + parcelUuids.length);
					// Sort UUIDs into JSON array and return it
					for (int i = 0; i < parcelUuids.length; ++i) {
						m_gotUUIDs.put(parcelUuids[i].toString());
					}
					returnUUIDs(intent);
				}
			}
		}
	};
	
	/**
	 * Receives activity results
	 */
	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent intent) {
		if (requestCode == this.REQUEST_CODE_ENABLE) 
		{
			if (resultCode == Activity.RESULT_OK)
				this.callback_enable.sendPluginResult(
						new PluginResult(PluginResult.Status.OK, true));
			else if (resultCode == Activity.RESULT_CANCELED)
				this.callback_enable.sendPluginResult(
						new PluginResult(PluginResult.Status.ERROR));
		}
		else if (requestCode == this.REQUEST_CODE_DISCOVERABLE)
		{
			if (resultCode == Activity.RESULT_CANCELED)
				this.callback_discoverable.sendPluginResult(
						new PluginResult(PluginResult.Status.ERROR));
			else
				this.callback_discoverable.sendPluginResult(
						new PluginResult(PluginResult.Status.OK, resultCode));
		}
	}
	

	
	
	/**
	 * PluginResult helper function for discoveryDevices 
	 * @param intent
	 */
	public void sendDiscoveredDevices(Intent intent) {
		this.callback_discovery.sendPluginResult(
				new PluginResult(PluginResult.Status.OK, m_discoveredDevices));
	}
	
	
	
	/**
	 * PluginResult helper function for returning UUIDs
	 * @param intent
	 */
	public void returnUUIDs(Intent intent) {
		this.callback_uuids.sendPluginResult(
				new PluginResult(PluginResult.Status.OK, m_gotUUIDs));
	}
	
	
	
	/**
	 * helper function
	 * @param device
	 * @param uuid
	 * @return
	 * @throws IOException
	 */
	private BluetoothSocket connectSecureHelper(
			BluetoothDevice device, UUID uuid) throws IOException {
		BluetoothSocket bluetoothSocket = 
				device.createRfcommSocketToServiceRecord(uuid);
		bluetoothSocket.connect();
		return bluetoothSocket;
	}
	
	
	/**
	 * helper function
	 * @param device
	 * @param uuid
	 * @return
	 * @throws IOException
	 */
	@TargetApi(10)
	private BluetoothSocket connectInsecureHelper(
			BluetoothDevice device, UUID uuid) throws IOException {
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.GINGERBREAD_MR1) {
			String msg = "Not supported, minimum SDK version is :" + 
					Build.VERSION_CODES.GINGERBREAD_MR1;
			logErr(msg);
			return null;
		}
		BluetoothSocket bluetoothSocket = 
				device.createInsecureRfcommSocketToServiceRecord(uuid);
		bluetoothSocket.connect();
		return bluetoothSocket;
	}
	
	
	// helper log functions
	private void logDbg(String msg) {
		Log.d("BluetoothPlugin", msg);
	}

	
	
	private void logErr(String msg) {
		Log.e("BluetoothPlugin", msg);
	}
	
	
	/**
	 * Listen Thread
	 */
	private class ListenThread extends Thread {
		private final BluetoothServerSocket mm_serverSocket;
		private CordovaInterface mm_cordova;
		private boolean m_running = false;
		public ListenThread(CordovaInterface cordova, String name, UUID uuid, boolean secure) {
			mm_cordova = cordova;
			BluetoothServerSocket tmp = null;
			try {
				if(secure) {
					tmp = m_bluetoothAdapter.listenUsingRfcommWithServiceRecord(name, uuid);
				}
				else {
					Method m = m_bluetoothAdapter.getClass().getMethod(
							"listenUsingInsecureRfcommWithServiceRecord", new Class [] {String.class,UUID.class});
					tmp = (BluetoothServerSocket) m.invoke(m_bluetoothAdapter, name, uuid);
				}
					
			} catch (Exception e) {
				logErr(e.toString() + " / " + e.getMessage());
			}
			mm_serverSocket = tmp;
		}
		public void run() {
			m_running = true;
			logDbg("ListenThread::run()");
			setName("ListenThread");
			while (m_running) {
				BluetoothSocket bluetoothSocket = null;
				try {
					if (mm_serverSocket == null) {
						String msg = "No ServerSocket !"; 
						logErr(msg);
						returnResult(
								new PluginResult(
										PluginResult.Status.ERROR, msg));
						break;
					}
					bluetoothSocket = mm_serverSocket.accept();
				} catch (IOException e) {
					logErr(e.toString() + " / " + e.getMessage());
				}
				if (bluetoothSocket != null) {
					m_sockets.add(bluetoothSocket);
					int socketId = m_sockets.indexOf(bluetoothSocket);
					returnResult(
							new PluginResult(
									PluginResult.Status.OK, socketId));
				}
				else {
					String msg = "Unable to open socket";
					logErr(msg);
					returnResult(
							new PluginResult(
									PluginResult.Status.ERROR, msg));
				}
			}
			m_running = false;
		}
		private void returnResult(final PluginResult pluginResult) {
			this.mm_cordova.getActivity().runOnUiThread(new Runnable() {
				public void run() {
					callback_listen.sendPluginResult(pluginResult);			
				} 
			});
		}
		public void cancel() {
			synchronized (ListenThread.this) {
				m_running = false;
			}
			logDbg("ListenThread::cancel()");
			if (mm_serverSocket != null) {
				try {
					mm_serverSocket.close();
				} catch (IOException e) {
					logErr("Cannot close ServerSocket !");
				}
			}
			else
				logErr("No ServerSocket");
		}
	}
	
	/**
	 * CommThread to read and write to socket.
	 * Auto shuts itself after a socket error.
	 */
	private class ReadThread extends Thread {
			private final BufferedReader mm_bufferedReader;
			public final int socketId;
			public final int mm_bufferSize;
			
			public ReadThread(BluetoothSocket socket, int socketId, int bufferSize) {
				this.socketId = socketId;
				mm_bufferSize = bufferSize;
				InputStream in = null;
				try {
					in = socket.getInputStream();
				} catch (IOException e) {
					logErr("Cannot create read scokets");
				}
				InputStreamReader isr = new InputStreamReader(in);
				mm_bufferedReader = new BufferedReader(isr);
			}
			
			@Override
			public void run() {
				logDbg("ReadThread::run()");
				while(true) {
					try {
						char[] buffer = new char [mm_bufferSize];
						if (mm_bufferedReader.read(buffer) >= 0) {
							JSONArray ja = new JSONArray();
							// logDbg("read = " + buffer.toString());
							for (int i = 0; i < buffer.length; i++) {
								ja.put((int)buffer[i]);
							}
							// logDbg("ja = " + ja.toString());
							PluginResult result = new PluginResult(
									PluginResult.Status.OK, ja);
							result.setKeepCallback(true);
							callback_read.sendPluginResult(result);
						}
					} catch (IOException e) {
						/* socket disconnected */
						logErr(e.toString() + " / " + e.getMessage());
						callback_read.error(e.getMessage());
						break;
					}
				}
			}
	}
	
	

}
