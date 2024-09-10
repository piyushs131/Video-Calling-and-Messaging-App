var btn1=document.getElementById('btn');
var btn2=document.getElementById('btn');

btn.addEventListener("click",()=>{
    alert('Login');
})

if(document.getElementById) {
    window.alert = function(txt) {
        createCustomAlert(txt);
    }
}

var stickerLeft;
function createCustomAlert(txt) {
    d = document;

    if(d.getElementById("modalContainer")) return;

    mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
    mObj.id = "modalContainer";
    mObj.style.height = d.documentElement.scrollHeight + "px";

    alertObj = mObj.appendChild(d.createElement("div"));
    alertObj.id = "alertBox";
    if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
    alertObj.style.left = (window.innerWidth-478 )/2 + "px";
    stickerLeft=(window.innerWidth-478 )/2; 
    alertObj.style.visiblity="visible";

    msg = alertObj.appendChild(d.createElement("p"));

    msg.innerHTML = txt;
    var wrapper=alertObj.appendChild(d.createElement('div'));
    wrapper.classList="wrapper";

    btn1 = wrapper.appendChild(d.createElement("a"));
    btn2 = wrapper.appendChild(d.createElement("a"));
    btn3 = wrapper.appendChild(d.createElement("a"));

    btn1.id = "closeBtn";
    btn2.id = "closeBtn";
    btn3.id = "closeBtn";

    btn1.classList="google";
    btn2.classList="fb";
    btn3.classList="github";
    
    btn1.innerHTML=`<i class="fab fa-google fa-lg "></i>`
    btn2.innerHTML='<i class="fab fa-facebook fa-lg"></i>';
    btn3.innerHTML='<i class="fab fa-github fa-lg"></i>';

    btn1.href = "http://localhost:5000/auth/google";
    btn2.href = "http://localhost:5000/auth/facebook";
    btn3.href = "http://localhost:5000/auth/github";
    
    btn1.focus();
    btn2.focus();
    btn3.focus();

    alertObj.style.display = "block";
}

function removeCustomAlert() {
    document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}

// adding event listener of mousedown to document
document.addEventListener('mousedown',down);

// function to close alert when you click any other part part from the authnetication button
function down(e){
    if(e.clientX<stickerLeft||e.clientX>stickerLeft+478)
    removeCustomAlert();
    if(e.clientY<50||e.clientY>document.querySelector('#alertBox').offsetHeight)
    removeCustomAlert();
}