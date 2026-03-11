document.querySelectorAll(".menu-item").forEach(item => {

    item.onclick = function(){
    
    alert(this.innerText);
    
    };
    
    });
    
    
    document.getElementById("logout").onclick = function(){
    
    if(confirm("Are you sure you want to logout?")){
    
    alert("Logged out successfully!");
    
    }
    
    };