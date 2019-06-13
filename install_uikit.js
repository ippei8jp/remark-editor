const fs = require('fs');
const path = require('path');
const download = require('download');
// 対象のzipファイルはunzipモジュールでは展開できない
const DecompressZip = require('decompress-zip');

const target_url = 'https://github.com/uikit/uikit/releases/download/v3.1.5/uikit-3.1.5.zip';
const tmp_dir    = 'download';
const tmp_file   = `${tmp_dir}/uikit.zip`;
let   dist_dir   = 'src/uikit/';
const extract_target   = '';

// ファイル存在チェック付きmkdir
function alt_mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

// windows環境ではdist_dirのディレクトリ区切りを/から\\に変更するため、ダミーのjoinを実行
// (unzipper.extract() で'You cannot extract a file outside of the target path' エラーが発生するため)
if (process.platform === 'win32') {
    dist_dir = path.join(dist_dir, ".");
}

// テンポラリディレクトリ/コピー先ディレクトリがなければ作成する
alt_mkdir(tmp_dir);
alt_mkdir(dist_dir);

// テンポラリファイルへダウンロード
console.log("downloading " + target_url);
download(target_url, '.', {filename : tmp_file}).then(() => {
    // ダウンロード完了
    console.log("Extructing... ");
    // 展開する
    var unzipper = new DecompressZip(tmp_file)

    unzipper.on('error', function (err) {
        console.log('Caught an error' + err);
    });

    unzipper.on('extract', function (log) {
        console.log('Finished extracting');
    });

    unzipper.on('progress', function (fileIndex, fileCount) {
        console.log('Extracted file ' + (fileIndex + 1) + ' of ' + fileCount);
    });

    unzipper.extract({
        path: dist_dir,
        filter: function (file) {
            return file.type !== "SymbolicLink";
        }
    });
});
