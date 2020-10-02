var u, fso, shell, stm;
fso = new ActiveXObject("Scripting.FileSystemObject");
shell = new ActiveXObject("WScript.Shell");
stm = new ActiveXObject("ADODB.Stream");
function Ajax() {
  this.xhr = new ActiveXObject("Msxml2.XMLHTTP");
}
Ajax.prototype = {
  get: function(url, bytes) {
    this.xhr.open("GET", url, false);
    this.xhr.send();
    return bytes ? this.xhr.responseBody : this.xhr.responseText;
  }
};
u = {
  ajax: new Ajax(),
  readFile: function(str, m, charset) {
    var s = "", arr = [];
    charset = charset || "utf-8";
    if (str && fso.FileExists(str) && fso.GetFile(str).Size > 0) {
      stm.Type = 2;
      stm.Open();
      stm.Charset = charset;
      stm.LoadFromFile(str);
      s = stm.ReadText();
      stm.Close();
      arr = (s = s.replace(/\x0d/g, "")).split("\n");
    }
    return m ? s : arr;
  },
  createFile: function(text, str, charset) {
    charset = charset || "utf-8";
    str = str || fso.GetTempName();
    text = text || "";
    stm.Type = 2;
    stm.Open();
    stm.Charset = charset;
    stm.WriteText(text);
    stm.SaveToFile(str, 2);
    stm.Close();
    return str;
  },
  bomcut: function(str) {
    var buffer, len;
    if (str && fso.FileExists(str) && fso.GetFile(str).Size > 0) {
      stm.Type = 1;
      stm.Open();
      stm.LoadFromFile(str);
      len = stm.Size - 3;
      stm.Position = 3;
      buffer = stm.Read(len);
      stm.Position = 0;
      stm.Write(buffer);
      stm.Position = len;
      stm.SetEOS();
      stm.SaveToFile(str, 2);
      stm.Close();
    }
  }
};
/*
Aria2 启动器
zyxubing@qq.com

tracker服务器地址可以从下面的网址中获取，每天更新一次
https://trackerslist.com/all.txt
https://trackerslist.com/all_aria2.txt
https://XIU2.github.io/TrackersListCollection/all.txt
https://github.com/XIU2/TrackersListCollection/blob/master/all.txt
https://ngosang.github.io/trackerslist/trackers_all.txt
https://github.com/ngosang/trackerslist/blob/master/trackers_all.txt

最佳跟踪器列表相对稳定，简洁。
所有跟踪器列表在数量上更多，理论上更好。
跟踪器的数量不会影响BT软件的操作，所以我建议使用所有跟踪器列表，以最大限度地提高下载速度！
最佳跟踪器列表： （139 个跟踪器）https://trackerslist.com/best.txt
所有跟踪器列表： （302 个跟踪器）https://trackerslist.com/all.txt
HTTP（S） 跟踪器列表： （90个跟踪器）https://trackerslist.com/http.txt

Aria2 格式跟踪器：
为了便于向 Aria2 添加跟踪器，我还制作了 Aria2 格式的跟踪器列表。更新是一致的。
最佳跟踪器列表：https://trackerslist.com/best_aria2.txt
所有跟踪器列表：https://trackerslist.com/all_aria2.txt
HTTP（S） 跟踪器列表：https://trackerslist.com/http_aria2.txt
*/
!function() {
  var ConfFile = "aria2.conf";
  var software = "aria2c.exe";
  var i, s, arr, bt = false;
  /* 读取当前最新BT服务器地址列表 */
  try {
    s = u.ajax.get("https://ngosang.github.io/trackerslist/trackers_all.txt");
  } catch (e) {
    /* 偶尔会出现取不到列表，原因不明，或许是因为墙的缘故 */
    s = "udp://62.138.0.158:6969/announce udp://188.241.58.209:6969/announce udp://93.158.213.92:1337/announce udp://151.80.120.114:2710/announce udp://151.80.120.114:2710/announce udp://208.83.20.20:6969/announce udp://5.206.19.247:6969/announce udp://37.235.174.46:2710/announce udp://54.37.235.149:6969/announce udp://89.234.156.205:451/announce udp://159.100.245.181:6969/announce udp://185.181.60.67:80/announce udp://194.143.148.21:2710/announce udp://185.19.107.254:80/announce udp://51.15.226.113:6969/announce udp://142.44.243.4:1337/announce udp://51.15.40.114:80/announce udp://176.113.71.19:6961/announce udp://46.148.18.250:2710/announce udp://46.148.18.254:2710/announce";
  }
  s = s.replace(/\s+/g, ",").replace(/\,+$/, "");
  arr = u.readFile(ConfFile);
  for (i = 0; arr.length > i; i++) if (-1 != arr[i].indexOf("bt-tracker")) {
    bt = true;
    arr[i] = "bt-tracker=" + s;
  }
  bt || arr.push("bt-tracker=" + s, "");
  /* 将修改的内容写入到配置文件 需要修改就用 */
  u.createFile(arr.join("\r\n"), ConfFile);
  u.bomcut(ConfFile);
  /* 结束已经运行的aria2c.exe进程 */
  shell.Run("taskkill.exe /f /im "+software, 0, true);
  /* 以隐藏窗口的方式运行aria2 */
  shell.Run(software+" --conf-path="+ConfFile, 0);
}();
