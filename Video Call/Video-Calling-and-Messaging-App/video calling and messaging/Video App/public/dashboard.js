inputId = document.getElementById('input-name');

// accessing username from browser local sotrage
var username = localStorage.getItem('name');

// if username is present , will fill the displayname with the value in local storage
if(username!=''){
  inputId.value = username;
}

// for new meeting
function redir(){
  if(inputId.value==='')
  alert("Enter display name");
  else{
    localStorage.setItem("name",inputId.value);
    window.location="http://localhost:5000/create";
    }
}

// for showing new meeting button
function hideIt(){
  document.getElementsByClassName('hide')[0].style.visibility='visible';
}

// for joining existing meeting
function joinIt(){
  var inp=document.getElementById('input');
  if(inputId.value==='')
  alert("Enter display name");
  else{
    localStorage.setItem("name",inputId.value);
    var inp=document.getElementById('input');
    window.location=inp.value;
  }
}