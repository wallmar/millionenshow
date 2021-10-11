import './sass/style.scss'

const context = require.context('./images', true, /\.(jpg)$/);
const files={};

context.keys().forEach((filename)=>{
    files[filename] = context(filename);
});
