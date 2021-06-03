function OpenUserProfile(){
    var path = window.location.pathname;
    var page = path.split("/").pop();
   if(page != "index.html"){
        document.getElementById("profileID").value = (localStorage.getItem("uName").replace("@gmail.com", ""));
        document.getElementById("profileDepartment").value = localStorage.getItem("Depart");
        document.getElementById("profilePosition").value = localStorage.getItem("uRole");
//       document.getElementById("profileName").innerHTML = localStorage.getItem("FName");
       document.getElementById("profileEmail").value = localStorage.getItem("uEmail");
       
       document.getElementById("profilefName").value = localStorage.getItem("firName");
       document.getElementById("profilemName").value = localStorage.getItem("midName");
       document.getElementById("profilelName").value = localStorage.getItem("lasName");
       document.getElementById("updateStaffProfileBtn").style.display="none";
       
   }
}



$(document).ready(function(){
      OpenUserProfile();
    getTBeditStaff();
});