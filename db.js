// Open database
// Create objectstore
// Make transaction
let db;
let openRequest = indexedDB.open("myDatabase");

openRequest.addEventListener("success",(event)=>{
  db = openRequest.result;
})
openRequest.addEventListener("error",(event)=>{

})
openRequest.addEventListener("upgradeneeded",(event)=>{
  db = openRequest.result;

  db.createObjectStore("video",{ keyPath: "id"});
  db.createObjectStore("image",{ keyPath: "id"});
})

