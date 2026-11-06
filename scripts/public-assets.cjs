/* Publish recognized media only; reject symlinks and unexpected source files. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const types={
  images:new Set(['.avif','.gif','.ico','.jpeg','.jpg','.png','.svg','.webp']),
  videos:new Set(['.mp4','.webm']),
  fonts:new Set(['.otf','.ttf','.woff','.woff2'])
};
const metadata=new Set(['.DS_Store','Thumbs.db','Desktop.ini']);
function publicAssets(root){
  const files=[];
  function visit(directory,kind){
    const full=path.join(root,directory),stat=fs.lstatSync(full);
    if(stat.isSymbolicLink())throw new Error('Public assets must not contain symlinks: '+directory);
    if(stat.isDirectory()){
      for(const name of fs.readdirSync(full)){
        if(metadata.has(name))continue;
        const next=kind||(directory==='assets'?name:null);
        if(!types[next])throw new Error('Unexpected public asset directory: '+directory+'/'+name);
        visit(path.join(directory,name),next);
      }
    }else if(stat.isFile()&&types[kind]?.has(path.extname(directory).toLowerCase()))files.push(directory);
    else throw new Error('Unexpected public asset file: '+directory);
  }
  visit('assets',null);
  return files;
}
module.exports={publicAssets};
