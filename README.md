# Phonegap Bluetooth Eklentisi #

Phonegap (Cordova) 2.2.x için bir eklentidir.

For English please see [README_EN.md].

Bu projeye [BluetoothPlugin]'i çatallayarak başlamıştım. Eklenti ile Bluetooth donanımına 
javascript üzerinden erişilebiliyor. Çatalladığım eklentiyi 2.0 ile çalışacak şekilde
düzeltirken bazı eksiklerini gördüm ve yeni özellikler ekledim. Daha sonra da önceki 
fonksiyonlara verilen isimlerin değişmesi gerektiğini düşündüm. Phonegap eklentilerindeki
Bluetooth eklentisi ile farklılıkları olduğundan önceden yazılmış bir kodunuz varsa 
bu eklentiyi kullanırken yeni API fonksiyonlarına özellikle dikkat etmeniz gerekiyor.

## Platform Desteği ##
<table>
    <tr>
         <th>Fonksiyon</th>
         <th>Android</th>
         <th>En Düşük SDK Sürümü</th>
         <th>Ayrıntılar</th>
    </tr>
    <tr>
         <td>isSupported()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Bluetooth desteğinin olup olmadığını denetler.</td>
    </tr>
    <tr>
         <td>enable()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Kullanıcıdan Bluetooth u açması için isten gönderir.</td>
    </tr>
    <tr>
         <td>disable()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Bluetooth u kapatır.</td>
    </tr>
    <tr>
         <td>isEnabled()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Bluetooth un açık olup olmadığını kontrol eder.</td>
    </tr>
    <tr>
         <td>getAddress()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Çalıştırdığınız cihazın Bluetooth adresini getirir.</td>
    </tr>
    <tr>
         <td>getName()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Çalıştırdığınız cihazın Bluetooth taki görünür ismini getirir.</td>
    </tr>
    <tr>
         <td>requestDiscoverable()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Çalıştırdığınız cihazın diğer cihazlar tarafından görünmesi için 
         kullanıcıdan izin ister.</td>
    </tr>
    <tr>
         <td>startDiscovery()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Keşfedilebilir cihazları tarar.</td>
    </tr>
    <tr>
         <td>cancelDiscovery()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Yürümekte olan tarama işlemini iptal eder.</td>
    </tr>
    <tr>
         <td>getBondedDevices()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Eşleştirilmiş cihazları getirir.</td>
    </tr>
    <tr>
         <td>fetchUUIDs()</td>
         <td>Evet</td>
         <td>15</td>
         <td>Uzak cihazın UUID lerini sorgulayıp getirir.</td>
    </tr>
    <tr>
         <td>isFetchUUIDsSupported()</td>
         <td>Evet</td>
         <td>15</td>
         <td>Uzak cihazın UUID lerini sorgulama desteğini döndürür.</td>
    </tr>
    <tr>
         <td>connect()</td>
         <td>Evet</td>
         <td>5</td>
         <td>UUID kullanarak uzak cihazla bağlantı kurar.</td>
    </tr>
    <tr>
         <td>disconnect()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Mevcut bağlantıyı sonlandırır.</td>
    </tr>
    <tr>
         <td>listen()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Gelen bağlantı isteklerini dinler.</td>
    </tr>
    <tr>
         <td>cancelListening()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Gelen bağlantıları dinlemeyi durdurur.</td>
    </tr>
    <tr>
         <td>read()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Bağlantı kurulmuş cihazdan veri okur.<b>Tamamlanmadı!</b></td>
    </tr>
    <tr>
         <td>write()</td>
         <td>Evet</td>
         <td>5</td>
         <td>Bağlantı kurulmuş cihaza veri yazar.<b>Tamamlanmadı!</b></td>
    </tr>
</table>



# Nasıl Kullanılır #

## Android İçin ##
Sıradan bir Phonegap projesi oluşturup aşağıdaki dosyaları projeye aynı dizinlerde kopyalayın :
```
assets/www/bluetooth.js
src/org/apache/cordova/plugin/BluetoothPlugin.java
```
> **İpucu:** İndirmiş olduğunuz ekentinin ana dizindeyken tüm dizinleri kopyalayıp Eclipse teki 
projenize sağ tıklayabilirsiniz.

> Eğer örnek olarak verilen index.htm i çalıştırmak istiyorsanız aşağıdaki dosyalara da ihtiyacınız olacak:
>> assets/www/cordova-2.2.0.js

Bluetooth eklentisini kullanmadan önce projenizde bazı düzenlemeler yapmanız gerekiyor. Aşağıda 
bu verilen dosyalarda neler yapmanız gerektiği veriliyor.

#### AndroidManifest.xml ####
Bluetooth yetkisi alablmek için aşağıdaki satırları `<manifest>` ve `</manifest>` etiketlerinin
arasına girin :
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
```

#### res/xml/config.xml ####
Phonegap e yeni eklentinizi tanıtmak için aşağıdaki satırı `<plugin>` ve `</plugin>` etiketlerinin 
arasına girin :
```xml
<plugin name="BluetoothPlugin" value="org.apache.cordova.plugin.BluetoothPlugin"/>
```

#### /assets/www/XXXXXX.html ####
API yi javascript e dahil etmek için aşağıdaki satırı `<head>` and `</head>` etiketlerinin arasına girin : 
```html
<script type="text/javascript" charset="utf-8" src="bluetooth.js"></script>
```
Bununla birlikte javascript nesnesini hazırlamanız gerekiyor. Hazrılama işlemini aşağıda görüleceği 
üzere [onload] olayı ile yapabilirsiniz :
```javascript
var bluetoothPlugin = null;
function onload() {
   document.addEventListener("deviceready", function() {
		bluetoothPlugin = cordova.require( 'cordova/plugin/bluetooth' );
	}, false);
}
```
Tam bir örnek için *assets/www/index.html* dosyasına bakın.

# Lisans #
   Apache Lisansı, 2.0 Sürümü ile lisanslanmıştır. Ayrıntılı bilgi için [LICENSE] dosyasına bakın.

   [README_EN.md]: https://github.com/huseyinkozan/phonegap-bluetooth/blob/master/README_EN.md
   [BluetoothPlugin]: https://github.com/phonegap/phonegap-plugins/tree/master/Android/BluetoothPlugin
   [LICENSE]: https://github.com/huseyinkozan/phonegap-bluetooth/blob/master/LICENSE
   [onload]: http://www.w3schools.com/jsref/event_body_onload.asp
