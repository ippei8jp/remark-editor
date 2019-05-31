const fs = require('fs');
const builder = require('electron-builder');
const Platform = builder.Platform;
const packagejson = JSON.parse(fs.readFileSync('./src/package.json', 'utf8'));

builder.build({
    platform: 'win',
    arch: 'x64',
    config: {
        'appId': `local.test.${packagejson.name}`,
        'win':{
            'target': 'portable',
            'icon': 'build/app_256x256.png'
        },
        'directories': {
            'buildResources': 'build',
            'app':            'src',
            'output':         'dist'
        }
    }
})
.then(() => {
    // handle result
    console.log(`**** Build DONE!! ****`);
})
.catch((error) => {
  // handle error
    console.log(`Build error : ${error}`);
});
