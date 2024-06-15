var ws
var input = document.getElementById('usernameinput')
var input2 = document.getElementById('serverinput')
var input3 = document.getElementById('downloadinput')
var input4 = document.getElementById('messagebox')
var connectbutton = document.getElementById("connectbutton");
//var connectunsecure = document.getElementById("connectunsecure");
var inputFocused = false
var messageBoxFocused = false
var username
var ID
var trackName
let leaderboardFrame = $("#leaderboard").contents().find('body');

connectbutton.addEventListener("click", function(event) {
  document.getElementById('chatviewUpload').innerHTML = "";
  document.getElementById('chatviewLogParent').style.display = "inline"
  let filesArray = FS.readdir('/');
  let tracksToDelete = filesArray.filter(element => element.includes(".TRK"));
  tracksToDelete.forEach((element, index) => {
    FS.unlink(`/${element}`)
  });
  tracksToDelete = filesArray.filter(element => element.includes(".HIG"));
   tracksToDelete.forEach((element, index) => {
    FS.unlink(`/${element}`)
  });
  tracksToDelete = filesArray.filter(element => element.includes(".RPL"));
   tracksToDelete.forEach((element, index) => {
    if (element != 'DEFAULT.RPL') {
      FS.unlink(`/${element}`)
    }
  });
  tracksToDelete = filesArray.filter(element => element.includes(".trk"));
  tracksToDelete.forEach((element, index) => {
    FS.unlink(`/${element}`)
  });
  tracksToDelete = filesArray.filter(element => element.includes(".hig"));
   tracksToDelete.forEach((element, index) => {
    FS.unlink(`/${element}`)
  });
  tracksToDelete = filesArray.filter(element => element.includes(".rpl"));
   tracksToDelete.forEach((element, index) => {
    if (element != 'DEFAULT.RPL') {
      FS.unlink(`/${element}`)
    }
  });
  connectbutton.disabled = true;
  connectbutton.innerHTML = 'Connected!'
  //connectunsecure.disabled = true;
  //connectunsecure.innerHTML = 'Connected!'
  let server = input2.value
  username = input.value
  input.value = ''
  input2.value = ''
  console.log('Attempting connection to WebSocket server...')
  ws = new WebSocket(`wss://${server}`)
  ws.binaryType = "arraybuffer";
  ws.addEventListener('open', (event) => {
    console.log('Connection was successful!')
    ws.send(`{ "username" : "${username}" }`);
    var checkForReplayInterval = setInterval(getReplayFromFS, 1000);
    ws.addEventListener('message', event => {
      var response = event.data
      if (response instanceof ArrayBuffer) {
        var view = new Uint8Array(response);
        console.log(view)
        FS.writeFile(`/${trackName}.TRK`, view)
        var x = document.getElementById("warning");
        x.style.display = "none";
        return
      }
      var responseJSON = JSON.parse(response)
      if (responseJSON.hasOwnProperty('timer')) {
        // var doc = document.getElementById('timer').contentWindow.document;
        // doc.open();
        // doc.write(responseJSON.timer);
        // doc.close();
        let remainingTime = sToTime(responseJSON.timer)
        $("#timer").html(remainingTime);
      }
      if (responseJSON.hasOwnProperty('leaderboard')) {
        var leaderboard = responseJSON.leaderboard
        // var doc = document.getElementById('leaderboard').contentWindow.document;
        // doc.open();
        $("#leaderboard").html(``);
        leaderboard.forEach((element, index) => {
          if (element.time === 999999) {
            // doc.write(`#${index + 1}: ${element.username} (???)<br>`);
            $("#leaderboard").append(`#${index + 1}: ${element.username} (???)<br>`);
          } else {
            //doc.write(`#${index + 1}: ${element.username} (${msToTime(element.time/**50*/)})<br>`);
            $("#leaderboard").append(`#${index + 1}: ${element.username} (${msToTime(element.time/**50*/)})<br>`);
          }
        });
        // doc.close();
      }
      if (responseJSON.hasOwnProperty('warning')) {
        var x = document.getElementById("warning");
        x.style.display = "block";
        FS.unlink(`/${trackName}.TRK`)
      }
      if (responseJSON.hasOwnProperty('ID')) {
        console.log(responseJSON)
        ID = responseJSON.ID
      }
      if (responseJSON.hasOwnProperty('track')) {
        let buffer = _base64ToArrayBuffer(responseJSON.track)
        let view = new Uint8Array(buffer);
        console.log(view)
        trackName = responseJSON.name
        trackName = trackName.replace(/\.[^/.]+$/, "")
        FS.writeFile(`/${trackName}.TRK`, view)
        var x = document.getElementById("warning");
        x.style.display = "none";
        return
      }
      if (responseJSON.hasOwnProperty('chat')) {
        var chatlog = responseJSON.chat.slice(0).slice(-8)
        // var doc = document.getElementById('leaderboard').contentWindow.document;
        // doc.open();
        $("#chatviewLog").html(``);
        chatlog.forEach((element, index) => {
          $("#chatviewLog").append(`${element}<br>`);
        });
        $("#chatviewLog").scrollTop($("#chatviewLog")[0].scrollHeight);
      }
    });
  });
  ws.addEventListener('close', event => {
    alert(`Connection to server was either lost or closed. Please reload the page and try again.`)
    connectbutton.innerHTML = 'Disconnected'
    connectunsecure.innerHTML = 'Disconnected'
  })
});

/*connectunsecure.addEventListener("click", function(event) {
  document.getElementById('chatviewUpload').innerHTML = "";
  document.getElementById('chatviewLogParent').style.display = "inline"
  let filesArray = FS.readdir('/');
  let tracksToDelete = filesArray.filter(element => element.includes(".TRK"));
  tracksToDelete.forEach((element, index) => {
    FS.unlink(`/${element}`)
  });
  tracksToDelete = filesArray.filter(element => element.includes(".HIG"));
   tracksToDelete.forEach((element, index) => {
    FS.unlink(`/${element}`)
  });
  tracksToDelete = filesArray.filter(element => element.includes(".RPL"));
   tracksToDelete.forEach((element, index) => {
    if (element != 'DEFAULT.RPL') {
      FS.unlink(`/${element}`)
    }
  });
  connectbutton.disabled = true;
  connectbutton.innerHTML = 'Connected!'
  connectunsecure.disabled = true;
  connectunsecure.innerHTML = 'Connected!'
  let server = input2.value
  username = input.value
  input.value = ''
  input2.value = ''
  console.log('Attempting connection to WebSocket server...')
  ws = new WebSocket(`ws://${server}`)
  ws.binaryType = "arraybuffer";
  ws.addEventListener('open', (event) => {
    console.log('Connection was successful!')
    ws.send(`{ "username" : "${username}" }`);
    var checkForReplayInterval = setInterval(getReplayFromFS, 1000);
    ws.addEventListener('message', event => {
      var response = event.data
      if (response instanceof ArrayBuffer) {
        var view = new Uint8Array(response);
        console.log(view)
        FS.writeFile(`/${trackName}.TRK`, view)
        var x = document.getElementById("warning");
        x.style.display = "none";
        return
      }
      var responseJSON = JSON.parse(response)
      if (responseJSON.hasOwnProperty('timer')) {
        // var doc = document.getElementById('timer').contentWindow.document;
        // doc.open();
        // doc.write(responseJSON.timer);
        // doc.close();
        let remainingTime = sToTime(responseJSON.timer)
        $("#timer").html(remainingTime);
      }
      if (responseJSON.hasOwnProperty('leaderboard')) {
        var leaderboard = responseJSON.leaderboard
        // var doc = document.getElementById('leaderboard').contentWindow.document;
        // doc.open();
        $("#leaderboard").html(``);
        leaderboard.forEach((element, index) => {
          if (element.time === 999999) {
            // doc.write(`#${index + 1}: ${element.username} (???)<br>`);
            $("#leaderboard").append(`#${index + 1}: ${element.username} (???)<br>`);
          } else {
            //doc.write(`#${index + 1}: ${element.username} (${msToTime(element.time)})<br>`);
            $("#leaderboard").append(`#${index + 1}: ${element.username} (${msToTime(element.time)})<br>`);
          }
        });
        // doc.close();
      }
      if (responseJSON.hasOwnProperty('warning')) {
        var x = document.getElementById("warning");
        x.style.display = "block";
        FS.unlink(`/${trackName}.TRK`)
      }
      if (responseJSON.hasOwnProperty('ID')) {
        console.log(responseJSON)
        ID = responseJSON.ID
      }
      if (responseJSON.hasOwnProperty('track')) {
        let buffer = _base64ToArrayBuffer(responseJSON.track)
        let view = new Uint8Array(buffer);
        console.log(view)
        trackName = responseJSON.name
        trackName = trackName.replace(/\.[^/.]+$/, "")
        FS.writeFile(`/${trackName}.TRK`, view)
        var x = document.getElementById("warning");
        x.style.display = "none";
        return
      }
      if (responseJSON.hasOwnProperty('chat')) {
        var chatlog = responseJSON.chat.slice(0).slice(-8)
        // var doc = document.getElementById('leaderboard').contentWindow.document;
        // doc.open();
        $("#chatviewLog").html(``);
        chatlog.forEach((element, index) => {
          $("#chatviewLog").append(`${element}<br>`);
        });
        $("#chatviewLog").scrollTop($("#chatviewLog")[0].scrollHeight);
      }
    });
  });
  ws.addEventListener('close', event => {
    alert(`Connection to server was either lost or closed. Please reload the page and try again.`)
    connectbutton.innerHTML = 'Disconnected'
    connectunsecure.innerHTML = 'Disconnected'
  })
});
*/

function getReplayFromFS() {
  /* var replayCheck = FS.analyzePath('/DEFAULT.RPL')
  if (replayCheck.exists == true) {
    var replay = FS.readFile('/DEFAULT.RPL', { encoding : 'binary' })
    ws.send(`{"replay" : "${_arrayBufferToBase64(replay.buffer)}", "username" : "${username}", "ID" : "${ID}"}`)
    console.log('Automatically sent replay!')
    FS.unlink('/DEFAULT.RPL')
  } */
  var replayCheck = FS.analyzePath(`/${trackName}.HIG`)
  if (replayCheck.exists == true) {
    var replay = FS.readFile(`/${trackName}.HIG`, { encoding : 'binary' })
    ws.send(`{"replay" : "${_arrayBufferToBase64(replay.buffer)}", "username" : "${username}", "ID" : "${ID}" }`)
    console.log('Automatically sent replay!')
    FS.unlink(`/${trackName}.HIG`)
  }
}

function msToTime(s) {
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

function sToTime(s) {
    function pad(n, z) {
        z = z || 2;
        return ('00' + n).slice(-z);
    }

    s = s * 1000

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(mins) + ':' + pad(secs)
}

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function _base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function simulateKeyEvent(charCode, pressed) 
{
    var name = pressed ? "keydown" : "keyup";
    var event = document.createEvent('KeyboardEvent');
    var getter = {
        get: function() { return this.keyCodeVal; }
    };

    if(!element) return;

    // Chromium Hack
    Object.defineProperty(event, 'keyCode', getter);
    Object.defineProperty(event, 'which', getter);
    Object.defineProperty(event, 'charCode', getter);   

    if(event.initKeyboardEvent) 
    {
        event.initKeyboardEvent(name, true, true, document.defaultView, false, false, false, false, charCode, charCode);
    } 
    else 
    {
        event.initKeyEvent(name, true, true, document.defaultView, false, false, false, false, charCode, 0);
    }

    event.keyCodeVal = charCode;

    if(event.keyCode !== charCode) 
    {
        alert("keyCode mismatch " + event.keyCode + "(" + event.which + ")");
    }

    element.dispatchEvent(event);
}

function downloadFile(name) {
  var fileToDownload = FS.readFile(`/${name}`, { encoding : 'binary' })
  saveByteArray(name, fileToDownload)
}
function uploadFile() {
  let file = $("#uploadinput").prop("files")[0];
  let filename = file.name
  let promise = file.arrayBuffer()
  promise.then(function(result) {
    let view = new Uint8Array(result);
    FS.writeFile(`/${filename}`, view)
    console.log(`Uploaded ${filename}`)
    document.getElementById('uploadinput').value = ""
  });
}

function sendMessage() {
  let messageToSend = input4.value
  ws.send(`{ "message" : "${messageToSend.replace(/"/g, '&quot;')}", "username" : "${username.replace(/"/g, '&quot;')}"}`)
  input4.value = ""
}

function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {type: "application/octet-stream"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
};


window.addEventListener('keydown', function(event){
  if (inputFocused == true) {
    if (messageBoxFocused == true && event.keyCode == 13) {
      sendMessage()
    }
    event.stopPropagation()
  }
}, true);

window.addEventListener('keyup', function(event){
  if (inputFocused == true) {
    event.stopPropagation()
  }
}, true);

window.addEventListener('keypress', function(event){
  if (inputFocused == true) {
    event.stopPropagation()
  }
}, true); 

/* window.addEventListener('beforeunload', (event) => {
  if (!ws) return
  ws.send(`{ "disconnect" : "me when amogus", "username" : "${username}", "ID" : "${ID}" }`)
}); */

window.onbeforeunload = function () {
  if (!ws) return
  ws.send(`{ "disconnect" : "me when amogus", "username" : "${username}", "ID" : "${ID}" }`)
};

input.addEventListener('focus', (event) => {
  inputFocused = true
}, true);
input2.addEventListener('focus', (event) => {
  inputFocused = true
}, true);
input3.addEventListener('focus', (event) => {
  inputFocused = true
}, true);
input4.addEventListener('focus', (event) => {
  inputFocused = true
  messageBoxFocused = true
}, true);

input.addEventListener('blur', (event) => {
  inputFocused = false
}, true);
input2.addEventListener('blur', (event) => {
  inputFocused = false
}, true);
input3.addEventListener('blur', (event) => {
  inputFocused = false
}, true);
input4.addEventListener('blur', (event) => {
  inputFocused = false
  messageBoxFocused = true
}, true);
