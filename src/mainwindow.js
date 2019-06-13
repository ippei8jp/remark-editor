// for FileSystem accsess
const fs = require('fs');

// for electron accsess
const { dialog } = require('electron').remote;

// Initialize Editor
require('ace-min-noconflict');
require('ace-min-noconflict/mode-markdown');

var editor = ace.edit("editor");
editor.getSession().setMode("ace/mode/markdown");
editor.getSession().setUseWrapMode(true);
editor.focus();

// webviewタグ アクセス用
var webview = document.getElementById('webview');

// for Guest Debug
if (process.env.DEBUG_GUEST) {
  webview.addEventListener('dom-ready', () => {
    webview.openDevTools()
  });
}

// Emitted whenever the document is changed
editor.on("change", (e) => {
  if (e.data.range.start.row != e.data.range.end.row) {
    webview.send('update-markdown', editor.getValue());
  }
});

// control fullscreen mode
var editorPane = document.getElementById('editor');

webview.addEventListener('enter-html-full-screen', () => {
  editorPane.setAttribute('style', 'display:none');
});

webview.addEventListener('leave-html-full-screen', () => {
  editorPane.removeAttribute('style');
});

// =================================================
// ファイル関連処理

// ファイル関連ボタン
const fileOpenBtn = document.getElementById('file-open');
const fileSaveBtn  = document.getElementById('file-save');

// ファイルオープンボタン
fileOpenBtn.onclick = function() {
    dialog.showOpenDialog( { properties: ['openFile'],
                             filters: [ { name: 'Markdown files', extensions: ['md', 'txt'] },
                                        { name: 'All files',      extensions: ['*']         } ]
                           }, (filenames) => {
                                if (filenames) {
                                    readFile(filenames[0]);
                                }
                           });
}

// ファイルセーブボタン
fileSaveBtn.onclick = function() {
    dialog.showSaveDialog( { properties: ['openFile'],
                             filters: [ { name: 'Markdown files', extensions: ['md', 'txt'] },
                                        { name: 'All files',      extensions: ['*']         } ]
                           }, (fileName) => {
                                if (fileName) {
                                    const data = editor.getValue();
                                    console.log(data);
                                    writeFile(fileName, data);
                                }
                           } );
}

// ファイル読み込み処理本体
function readFile(path) {
    fs.readFile(path, (error, text) => {
        if (error != null) {
            alert('read error : ' + error);
            return;
        }
        //alert(text.toString().length);
        editor.setValue(text.toString(), -1);
    });
}

// ファイル保存処理本体
function writeFile(path, data) {
    fs.writeFile(path, data, (error) => {
        if (error != null) {
            alert("save error.");
            return;
        }
    });
}

// =================================================
// webviewのデバッグウィンドウの制御
document.getElementById('webview-debug').onclick = function() {
    if (webview.isDevToolsOpened()) {
        webview.closeDevTools();
    }
    else {
        webview.openDevTools();
    }
};

// =================================================
// ZOOM関連処理

// Zoom関連ボタン
const zoomRstBtn = document.getElementById('webview-zoomreset');
const zoomInBtn  = document.getElementById('webview-zoomin');
const zoomOutBtn = document.getElementById('webview-zoomout');

// Zoomテーブル
var ZoomPreset = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];

// 次のズーム位置の探索
ZoomPreset.search  = (value) => {
    var left = 0;                                       // 左端のindex
    var right = ZoomPreset.length - 1;                  // 右端のindex   ここは this.length - 1 じゃダメ(以下同文)

    if (value <= ZoomPreset[left]) {
        // 左端と一致 or 小さい
        return {decrement: ZoomPreset[left], increment: ZoomPreset[left + 1]};
    }
    if (value >= ZoomPreset[right]) {
        // 右端と一致 or 大きい
        return {decrement: ZoomPreset[right - 1], increment: ZoomPreset[right]};
    }

    while ((right - left) > 1) {
        // right と left は隣り合っていない
        let mid = Math.floor((right + left) / 2);       // 中央のindex
        if (value > ZoomPreset[mid]) {
            // 中央値より大きい
            left = mid;                 // 左側を捨てる
        } else if (value < ZoomPreset[mid]) {
            // 中央値より小さい
            right = mid;                // 右側を捨てる
        } else {
            // 中央値と一致
            return {decrement: ZoomPreset[mid - 1], increment: ZoomPreset[mid + 1]};
        }
    }
    // right と left は隣り合っている
    return {decrement: ZoomPreset[left], increment: ZoomPreset[right]};
}

// ボタンのステータス変更
function changeButtonState(btn, flag) {
    if (flag) {
        // 有効
        btn.disabled = false;                   // ボタンを有効に
        // photon-kitの場合はactiveクラスで無効表示
        // btn.classList.remove('active');         // 無効のときactive class を追加するのでここでは削除
    }
    else {
        // 無効
        btn.disabled = true;                    // ボタンを無効に
        // photon-kitの場合はactiveクラスで無効表示
        // btn.classList.add('active');            // 無効のときactive class を追加するので
    }
}


// Zoomパラメータを変更
function changeZoomLevel(newZoom) {
    let min = ZoomPreset[0];
    let max = ZoomPreset[ZoomPreset.length - 1]

    // 最大/最小制限
    if (newZoom < min)      newZoom = min;
    if (newZoom > max)      newZoom = max;

    // 新しいZoomパラメータを設定
    webview.setZoomFactor(newZoom);

    // 新しいZoomパラメータを表示
    zoomRstBtn.innerText = Math.round(newZoom * 100) + '%';

    // ボタンステータスの変更
    if (newZoom <= min) {
        // 最小値に達した
        changeButtonState(zoomOutBtn, false);       // ズームアウトボタンを無効に
    }
    else {
        changeButtonState(zoomOutBtn, true);        // ズームアウトボタンを有効に
    }
    if (newZoom >= max) {
        // 最大値に達した
        changeButtonState(zoomInBtn, false);        // ズームインボタンを無効に
    }
    else {
        changeButtonState(zoomInBtn, true);         // ズームインボタンを有効に
    }
}

// Zoomパラメータの初期化
function resetZoomFactor()
{
    // Zoomパラメータを1に
    changeZoomLevel(1.0);
}

// webviewのDOM初期化完了イベントハンドラ
webview.addEventListener('dom-ready', function() {
    // Zoomパラメータ初期化
    resetZoomFactor();
});

// ズームリセットボタン
zoomRstBtn.onclick = resetZoomFactor;

// ズームインボタン
zoomInBtn.onclick = function() {
    let zoomFactor = webview.getZoomFactor();           // 現在のZoomパラメータ
    zoomFactor = Math.round(zoomFactor * 100) / 100;    // 小数2桁に四捨五入
    let next = ZoomPreset.search(zoomFactor).increment;
    changeZoomLevel(next);                              // 新しいZoomパラメータを設定
}

// ズームアウトボタン
zoomOutBtn.onclick = function() {
    let zoomFactor = webview.getZoomFactor();           // 現在のZoomパラメータ
    zoomFactor = Math.round(zoomFactor * 100) / 100;    // 小数2桁に四捨五入
    let next = ZoomPreset.search(zoomFactor).decrement;
    changeZoomLevel(next);                              // 新しいZoomパラメータを設定
}

// =================================================
// ページ移動関連処理
// ページ移動関連ボタン
const goFirstBtn = document.getElementById('webview-go-first');
const goPrevBtn  = document.getElementById('webview-go-prev');
const goNextBtn  = document.getElementById('webview-go-next');
const goLastBtn  = document.getElementById('webview-go-last');

goFirstBtn.onclick = function() {
    webview.send('go-firstslide');
}

goPrevBtn.onclick = function() {
    webview.send('go-prevslide');
}

goNextBtn.onclick = function() {
    webview.send('go-nextslide');
}

goLastBtn.onclick = function() {
    webview.send('go-lastslide');
}
