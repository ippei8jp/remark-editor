const fs = require('fs');
const path = require('path');
const unzip = require('unzip');
const download = require('download');

const target_url = 'https://github.com/connors/photon/archive/v0.1.2-alpha.zip';
const tmp_dir    = 'download';
const tmp_file   = `${tmp_dir}/photon.zip`;
const dist_dir   = 'src/photon';
const extract_target   = 'photon-0.1.2-alpha/dist/';

// ファイル存在チェック付きmkdir
function alt_mkdir(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

// テンポラリディレクトリ/コピー先ディレクトリがなければ作成する
alt_mkdir(tmp_dir);
alt_mkdir(dist_dir);

// テンポラリファイルへダウンロード
console.log("downloading " + target_url);
download(target_url, '.', {filename : tmp_file}).then(() => {
    // ダウンロード完了
    console.log("Extructing... ");
    let rs = fs.createReadStream(tmp_file)
    let uzp = rs.pipe(unzip.Parse());
    uzp.on('entry', (entry) => {
        let filename = entry.path;    // ファイル名
        let type     = entry.type;    // 'Directory' または 'File'
        if (filename.toLowerCase().indexOf(extract_target) >= 0) {
            // ファイル名にextract_targetが含まれている場合
            // ファイル名からextract_targetを除き、dist_dirを付加する
            let dist_name = path.join(dist_dir, filename.replace(extract_target, ''));
            if (type === 'Directory') {
                // 対象がディレクトリならディレクトリを作成する
                console.log(`mkdir:   ${dist_name}`);
                alt_mkdir(dist_name);
                entry.autodrain();
            }
            else if (type === 'File') {
                // 対象がファイルなら展開する
                console.log(`extract: ${dist_name}`);
                entry.pipe(fs.createWriteStream(dist_name));
            }
            else {
                // それ以外(念のため)
                console.log(`unknown: ${filename}`);
                entry.autodrain();
            }
        }
        else {
            // ファイル名にextract_targetが含まれていない場合
            // console.log(`skip: ${filename}`);
            entry.autodrain();
        }
    });
    uzp.on('close', () => {
        console.log("**** DONE ****");
    });
    /*
    rs.on('close', () => {
        console.log("#### DONE ####");
    });
    */
});
