const {ipcRenderer} = require('electron');

ipcRenderer.on('update-markdown', (event,markdown) => {
  let source = document.getElementById('source');
  source.innerHTML = markdown;
  slideshow.loadFromString(source.innerHTML);
});

ipcRenderer.on('go-nextslide', (event) => {
  slideshow.gotoNextSlide();
});

ipcRenderer.on('go-prevslide', (event) => {
  slideshow.gotoPreviousSlide();
});

ipcRenderer.on('go-firstslide', (event) => {
  slideshow.gotoFirstSlide();
});

ipcRenderer.on('go-lastslide', (event) => {
  slideshow.gotoLastSlide();
});

