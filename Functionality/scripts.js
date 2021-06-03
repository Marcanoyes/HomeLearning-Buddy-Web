
//=================IMPORT ACCOUNT STUFF
var dontlogout = 0;
var userID = [];
var fName = [];
var mName = [];
var lName = [];
var dept = [];
var course= [];
var position = [];
var email = [];
var contact = [];

function addImportQueueStaff(ID,fname,mname,lname,department,post){
    userID.push(ID);
    fName.push(fname);
    mName.push(mname);
    lName.push(lname);
    dept.push(department);
    position.push(post);
}

function addImportQueueStudent(ID,fname,mname,lname,department,crs,Email,ContactNo){
    userID.push(ID);
    fName.push(fname);
    mName.push(mname);
    lName.push(lname);
    dept.push(department);
    course.push(crs);
    email.push(Email);
    contact.push(ContactNo);
}

function addImportQueueSubject(ID,desc,department,crs,units,SY,Sem){
    userID.push(ID);
    fName.push(desc);
    dept.push(department);
    course.push(crs);
    mName.push(units);
    lName.push(SY);
    position.push(Sem);
}

function clearImportQueue(){
    userID = [];
    fName = [];
    mName = [];
    lName = [];
    dept = [];
    course = [];
    position = [];
    email = [];
    contact = [];
}

function getItem(x,y){
    var string = x[y];
    return string;
}

function importAccs(role){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    localStorage.setItem("countImported","0");
    dontlogout = 1; 
    var countofimported = userID.length.toString();
    for(i=0; i<userID.length; i++){
        firebase.auth().createUserWithEmailAndPassword(getItem(userID,i)+"@gmail.com",getItem(userID,i))
    .then((userCredential) => {
            user = userCredential.user;
            console.log(user.id);
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorMessage);
            
    });
        
        if(role == "Staff"){
            var importAccInfo = firebase.database().ref("Staff/" + getItem(userID,i));
            importAccInfo.update({
                fName : getItem(fName,i),
                mName : getItem(mName,i), 
                lName : getItem(lName,i), 
                dept : getItem(dept,i),
                position : getItem(position,i)
            });
        }else if(role == "Student"){
            var importAccInfo = firebase.database().ref("Student/" + getItem(userID,i));
            importAccInfo.update({
                fName : getItem(fName,i),
                mName : getItem(mName,i), 
                lName : getItem(lName,i), 
                dept : getItem(dept,i),
                course : getItem(course,i),
                email : getItem(email,i),
                contact : getItem(contact,i),
                Password : getItem(userID,i)
            });
            
            var subjectBlock = document.getElementById("subjectNameID").innerHTML;
            var subjectNsec = subjectBlock.split(" | ");
            var subjCode = subjectNsec[0];
            var blockNo = subjectNsec[1];
            var importAccInfoSubjs = firebase.database().ref("Student/" + getItem(userID,i)+"/Subjects/"+subjCode);
            importAccInfoSubjs.update({
                block : blockNo
            });
            
            if(page=="subjectsTeacher.html"){
                var teacherID = localStorage.getItem("uName").replace("@gmail.com", "");
                var putTeacherIDintoSubjects = firebase.database().ref("Subjects/"+subjCode+"/Sections/"+blockNo);
                putTeacherIDintoSubjects.update({
                    TeacherInCharge : teacherID
                });
            }
            
            
            
            
            var putIDintoSubjects = firebase.database().ref("Subjects/"+subjCode+"/Sections/"+blockNo+"/"+getItem(userID,i));
            putIDintoSubjects.update({
                fName : getItem(fName,i),
                mName : getItem(mName,i), 
                lName : getItem(lName,i), 
                dept : getItem(dept,i),
                course : getItem(course,i)
            });
            
            if(page=="subjectsTeacher.html"){
                var putSubjectintoTeacher = firebase.database().ref("Staff/"+teacherID+"/Assigned Class/"+subjCode+" | "+blockNo);
                putSubjectintoTeacher.update({
                    active: true
                }).then(function() {

                }).catch(function(error) {
                });
            }
            
        }
        
        
        
    }
    
    if(role=="Staff"){
        createUserLog("imported ( "+countofimported+" ) staff account(s).");
                swal({
                      title: "Success!",
                      text:  "Imported ( "+countofimported+" ) staff account(s).",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        var n=localStorage.getItem("uName");
                        var m=localStorage.getItem("uPass");
                        firebase.auth().signInWithEmailAndPassword(n,m)
                        .then((userCredential) => {
                            if(role=="Staff"){
                                goTo("accountStaff.html");
                            }else if(role=="Student"){
                                goTo("dashboardTeacher.html");
                            }
                        }).catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                                    //        window.alert(localStorage.getItem("uName")+"\n"+localStorage.getItem("uPass"));
                        });
                    
                    });
        
    }else if(role=="Student"){
        var text1="";
        var text2="";
        if(page=="subjectsTeacher.html"){
            text1="created "+subjCode+" | "+blockNo+" and imported ( "+countofimported+" ) students";
            text2=subjCode+" | "+blockNo+" has been created & imported ( "+countofimported+" ) students";
        }else if(page=="dashboardTeacher.html"||page=="subjects.html"){
            text1="imported ( "+countofimported+" ) students into "+subjCode+" | "+blockNo;
            text2="imported ( "+countofimported+" ) students into "+subjCode+" | "+blockNo;
        }
        
        createUserLog(text1);
                swal({
                      title: "Success!",
                      text: text2,
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        var n=localStorage.getItem("uName");
                        var m=localStorage.getItem("uPass");
                        firebase.auth().signInWithEmailAndPassword(n,m)
                        .then((userCredential) => {
                            if(role=="Staff"){
                                goTo("accountStaff.html");
                            }else if(role=="Student" && page=="subjectsTeacher.html"){
                                goTo("dashboardTeacher.html");
                            }else if(role=="Student" && page=="dashboardTeacher.html"){
                                $("#addStudentToSubjModal").modal('toggle');
                                getClassTeacher(
                                    localStorage.getItem("dashTeachcode"),
                                    localStorage.getItem("dashTeachblock"),
                                    localStorage.getItem("dashTeachdesk"));
                            }else if(role=="Student" && page=="subjects.html"){
                                $("#addStudentToSubjModal").modal('toggle');
                                getClassTeacher(
                                    localStorage.getItem("dashTeachcode"),
                                    localStorage.getItem("dashTeachblock"),
                                    localStorage.getItem("dashTeachdesk"));
                                
                            }
                        }).catch((error) => {
                            var errorCode = error.code;
                            var errorMessage = error.message;
                                    //        window.alert(localStorage.getItem("uName")+"\n"+localStorage.getItem("uPass"));
                        });
                    
                    });
        
    }
    
    
    clearImportQueue();
    
//    firebase.auth().signOut().then(() => {
//        }).catch((error) => {
//            // An error happened.
//        });
    
    
}

var x = document.getElementById("dptCrsSub"); 
    
function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 1; i--) {
      selectElement.remove(i);
   }
}

function importSubjects(){
    var countofsubjs = userID.length.toString();
    
    for(i=0; i<userID.length; i++){
        var importSubInfo = firebase.database().ref("Subjects/"+getItem(userID,i));
                importSubInfo.update({
                    subID : getItem(userID,i),
                    subDesc: getItem(fName,i),
                    dept : getItem(dept,i),
                    course : getItem(course,i),
                    
                    units : getItem(mName,i),
                    SY : getItem(lName,i),
                    SM : getItem(position,i)
                }).then(function() {
                    swal({
                          title: "Success!",
                          text: "Imported ( "+countofsubjs+" ) subjects",
                          icon: "success",
                          button: "OK",
                        }).then((answer) => {
                            createUserLog("imported ( "+countofsubjs+" ) subjects");
                            $("#addSubjModal").modal('toggle');
                            goTo("subjects.html");
                        });
                    }).catch(function(error) {
//                        window.alert(error.message);
                    });
    }
    
    
    
    
}




function importClearTable(role){
    

    if(role=='Staff'){
        $("#tableBodyStaff tr").remove();   
        document.getElementById("staffFile").value = '';
    }
    else if('Student'){
        $("#tableBodyStudent  tr").remove(); 
        document.getElementById("studentFile").value = '';
    }
    clearImportQueue();
}



function getUsers(role){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    var nodatadiv=document.getElementById("checkifEmpty").style.display="grid";
    firebase.auth().onAuthStateChanged((user) => {
    if (user) {
            if(role=="Staff" || role=="Admin"){
                var Parent = document.getElementById("viewStaffAccs");
            }
            else if(role == "Student"){
                var Parent = document.getElementById("viewStudentAccs");
            }

    while(Parent.hasChildNodes())
    {
       Parent.removeChild(Parent.firstChild);
    }
        
    var deptSelection = document.getElementById("dptOutVal");
                var departTeacher=localStorage.getItem("Depart");
                
                var op = document.getElementById("dptOutVal").getElementsByTagName("option");
                for (var i = 0; i < op.length; i++) {
                    if(op[i].value != departTeacher){
                        op[i].disabled = true;
                        op[i].selected = false;
                        
                    }else{
                        op[i].disabled = false;
                        op[i].selected = true;
                        deptSel = document.getElementById("dptOutVal").value;
                    }
                }
        
    
        
    var dept = document.getElementById("dptOutVal").value;
    firebase.database().ref(role).orderByKey().once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                if(role == "Staff" && page=="accountStaff.html"){
                    var UserID = childSnapshot.key;
                    var department = childData['dept'];
                    var fullName = childData['fName'] +" "+childData['mName']+" "+childData['lName'];
                    var position = childData['position'];
                    
                    if(dept == "All" && position == "Professor"){
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                        document.getElementById("viewStaffAccs").innerHTML +=
                        "<tr class=\"trRow\" data-toggle=\"modal\" data-target=\"#AccountStaffModal\" onclick=\"getStaffAccDets('"+UserID+"')\"><td>" + UserID + "</td><td class=\"trTable\">" + fullName +"<img src='Icons/deleteicon.png' class='delicon' onclick=\"deleteAccFromDatabase('"+UserID+"','Staff|"+position+"')\">"+ "</td><td>" + department+ "</td><td>" + position + "</td></tr>";
                    }else{
                        if(dept == department && position == "Professor"){
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                        document.getElementById("viewStaffAccs").innerHTML +=
                        "<tr class=\"trRow\" data-toggle=\"modal\" data-target=\"#AccountStaffModal\" onclick=\"getStaffAccDets('"+UserID+"')\"><td>" + UserID + "</td><td class=\"trTable\">" + fullName +"<img src='Icons/deleteicon.png' class='delicon' onclick=\"deleteAccFromDatabase('"+UserID+"','Staff|"+position+"')\">"+ "</td><td>" + department+ "</td><td>" + position + "</td></tr>";
                        }
                    }
                }else if(role == "Staff"){
                    var UserID = childSnapshot.key;
                    var department = childData['dept'];
                    var fullName = childData['fName'] +" "+childData['mName']+" "+childData['lName'];
                    var position = childData['position'];
                    
                    if(dept == "All" && position == "Secretary"||position == "Dean" && dept == "All"){
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                        document.getElementById("viewStaffAccs").innerHTML +=
                        "<tr data-toggle=\"modal\" data-target=\"#ViewAdminModal\"  onclick=\"getStaffAccAdmin('"+UserID+"')\"><td>" + UserID + "</td><td>" + fullName + "</td><td>" + department+ "</td><td>" + position + "</td></tr>";
                    }else{
                        if(dept == department && position == "Secretary"||position == "Dean" && dept == "All"){
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                        document.getElementById("viewStaffAccs").innerHTML +=
                        "<tr data-toggle=\"modal\" data-target=\"#ViewAdminModal\"  onclick=\"getStaffAccAdmin('"+UserID+"')\"><td>" + UserID + "</td><td>" + fullName + "</td><td>" + department+ "</td><td>" + position + "</td></tr>";
                        }
                    }
                }else if(role == "Student"){
                    var UserID = childSnapshot.key;
                    var department = childData['dept'];
                    var fullName = childData['fName'] +" "+childData['mName']+" "+childData['lName'];
                    var userCourse = childData['course'];
//                    document.getElementById("viewStudentAccs").innerHTML =
//                        "<tr><th>User ID</th><th>Full Name</th><th>Department</th></tr>";
                    if(dept == "All"){
                        if(department=="CAS"){
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                            document.getElementById("viewStudentAccs").innerHTML +=
                        "<tr class=\"trRow\" data-toggle=\"modal\" data-target=\"#EditAccountModal\" onclick=\"getTBedited('"+UserID+"')\"><td>" + UserID + "</td><td class=\"trTable\">" + fullName +"<img src='Icons/deleteicon.png' class='delicon' onclick=\"deleteAccFromDatabase('"+UserID+"','Student')\">"+"</td><td>" + department+"</td></tr>";
                        }
                        else{
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                             document.getElementById("viewStudentAccs").innerHTML +=
                        "<tr class=\"trRow\" data-toggle=\"modal\" data-target=\"#EditAccountModal\" onclick=\"getTBedited('"+UserID+"')\"><td>" + UserID + "</td><td class=\"trTable\">" + fullName +"<img src='Icons/deleteicon.png' class='delicon' onclick=\"deleteAccFromDatabase('"+UserID+"','Student')\">"+ "</td><td>" + department+" - "+userCourse+"</td></tr>";
                        }
                       
                    }else{
                        if(dept == department){
                          if(department=="CAS"){
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                            document.getElementById("viewStudentAccs").innerHTML +=
                        "<tr class=\"trRow\" data-toggle=\"modal\" data-target=\"#EditAccountModal\" onclick=\"getTBedited('"+UserID+"')\"><td>" + UserID + "</td><td class=\"trTable\">" + fullName +"<img src='Icons/deleteicon.png' class='delicon' onclick=\"deleteAccFromDatabase('"+UserID+"','Student')\">"+"</td><td>" + department+"</td></tr>";
                        }
                        else{
                        var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                             document.getElementById("viewStudentAccs").innerHTML +=
                        "<tr class=\"trRow\" data-toggle=\"modal\" data-target=\"#EditAccountModal\" onclick=\"getTBedited('"+UserID+"')\"><td>" + UserID + "</td><td class=\"trTable\">" + fullName +"<img src='Icons/deleteicon.png' class='delicon' onclick=\"deleteAccFromDatabase('"+UserID+"','Student')\">"+ "</td><td>" + department+" - "+userCourse+"</td></tr>";
                        }
                               
                        }
                    }
                }
                
                
        })
    })
    
    
//    var displayOver = document.getElementById("noAccountText");
//    if(Parent.hasChildNodes())
//    {
//        displayOver.style.display = "none";
//    }
//    else{
//        displayOver.style.display = "inline";
//    }
        // ...
        } else {
            if(dontlogout==1){
                
            }else{
                location.href = "loginPage.html";
            }
        }
    });
    
}

//=================IMPORT ACCOUNT STUFF




function Authenti(x){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
            var uid = user.uid;
            location.href = x;
            localStorage.setItem("CU",uid);
        // ...
        } else {
            location.href = "loginPage.html";
        }
    });
}
var count = 0;
function loadDash(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var path = window. location. pathname;
            var page = path. split("/"). pop();
            if(page == "dashboardMain.html"){
                var student = document.getElementById('tableStudentsDashboard');
                var staff = document.getElementById('tableStaffDashboard');
                var subjects = document.getElementById('tableSubjectsDashboard');
                var announcements = document.getElementById('tableAnnouncementsDashboard');


                while(student.hasChildNodes())
                {
                   student.removeChild(student.firstChild);
                }
                while(staff.hasChildNodes())
                {
                   staff.removeChild(staff.firstChild);
                }
                while(subjects.hasChildNodes())
                {
                   subjects.removeChild(subjects.firstChild);
                }
                while(announcements.hasChildNodes())
                {
                   announcements.removeChild(announcements.firstChild);
                }
                
                
                firebase.database().ref("Student").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        var fullName = childData['fName'] + " " +childData['mName']+ " " +childData['lName']
                        
                        student.innerHTML +=
                        "<tr><td>" + childKey + "</td><td>" + fullName + "</td></tr>";
                        document.getElementById('countStudents').innerHTML = student.rows.length;
                    })
                })
                
                firebase.database().ref("Staff").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        var fullName = childData['fName'] + " " +childData['mName']+ " " +childData['lName']
                        
                        if(childData['position']=="Secretary"||childData['position']=="Professor"){
                            staff.innerHTML +=
                            "<tr><td>" + childKey + "</td><td>" + fullName + "</td></tr>";
                            
                        }
                        
                        
                        document.getElementById('countStaff').innerHTML = staff.rows.length;
                    })
                })
                
                firebase.database().ref("Subjects").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var Code = childSnapshot.key;
                        var childData = childSnapshot.val();
                        var Desc = childData['subDesc']
                        
                        subjects.innerHTML +=
                        "<tr><td>" + Code + "</td><td>" + Desc + "</td></tr>";
                        document.getElementById('countSubjects').innerHTML = subjects.rows.length;
                    })
                })
                
                firebase.database().ref("Posts - ALL").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        var titleOf = childData['title']
                        var Audience = childData['department']
                        if(Audience!=""){
                            announcements.innerHTML +="<tr><td>" + Audience + "</td><td>" + titleOf + "</td></tr>";
                        }
                        document.getElementById('countAnnouncements').innerHTML = announcements.rows.length;
                    })
                })
            }
            
            if(page=="dashboardTeacher.html"){
               var teachID = localStorage.getItem("uName").replace("@gmail.com", "");
                firebase.database().ref("Staff/"+teachID+"/Assigned Class").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var childData = childSnapshot.val();
                        var subjectNsec = childKey.split(" | ");
                        firebase.database().ref("Subjects").orderByKey().equalTo(subjectNsec[0]).once('value', function(snapshot){
                        snapshot.forEach(function(childSnapshot){
                            var childK= childSnapshot.key;
                            var childD = childSnapshot.val();
                            CreateSectionDiv(subjectNsec[1],subjectNsec[0],childD['subDesc']);
                        })
                        })
                    })
                })
            }
            
            
            
        } else {
            location.href = "loginPage.html";
        }
    });
}


//========BASIC FUNCTIONS==============

function Login(){
    dontlogout = 0;
    var userName = document.getElementById("userName").value;
    var passWord = document.getElementById("passWord").value;
    
    if(userName.length>13 || passWord.length<6){
        swal("Oops...", "Invalid login credentials!", "error");
        document.getElementById("userName").value = "";
        document.getElementById("passWord").value = "";
    }
    
    firebase.database().ref("Staff").orderByKey().equalTo(userName).once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var pos = childData['position'];
            var deprt = childData['dept'];
            var lastName = childData['lName'];
            var midName = childData['mName'];
            var firName = childData['fName'];
            var FULLNAME = firName+" "+midName+" "+lastName;
            var eMail = childData['email'];
            if(pos == "Secretary"){
                SignIn("dashboardMain.html",userName,passWord,pos,FULLNAME,deprt,eMail,firName,midName,lastName)
            }
            else if(pos == "Professor"){
                SignIn("dashboardTeacher.html",userName,passWord,pos,FULLNAME,deprt,eMail,firName,midName,lastName)
            }
        })
    })
}

function loadCurrentSchoolYearAndSemesterWVIEW(){
    firebase.database().ref("CurrentSY/").orderByKey().equalTo("SEM").once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var key = childSnapshot.key;
            var child = childSnapshot.val();
            localStorage.setItem("CurrentSem",child);
            localStorage.setItem("ViewSem",child);
        })
    })
    
        firebase.database().ref("CurrentSY/").orderByKey().equalTo("SY").once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var key = childSnapshot.key;
            var child = childSnapshot.val();
            localStorage.setItem("CurrentSY",child);
            localStorage.setItem("ViewSY",child);
        })
    })
}

function loadCurrentSchoolYearAndSemester(){
    firebase.database().ref("CurrentSY/").orderByKey().equalTo("SEM").once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var key = childSnapshot.key;
            var child = childSnapshot.val();
            localStorage.setItem("CurrentSem",child);
        })
    })
    
        firebase.database().ref("CurrentSY/").orderByKey().equalTo("SY").once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var key = childSnapshot.key;
            var child = childSnapshot.val();
            localStorage.setItem("CurrentSY",child);
        })
    })
}

function SignIn(toPage, userName, passWord, uRole, FName, Depat, Eml,name1,name2,name3){
    
    loadCurrentSchoolYearAndSemesterWVIEW();
    
    var uName = userName+"@gmail.com";
    
    localStorage.setItem("uName",uName);
    localStorage.setItem("uPass",passWord);
    localStorage.setItem("uRole",uRole);
    localStorage.setItem("firName",name1);
    localStorage.setItem("midName",name2);
    localStorage.setItem("lasName",name3);
    localStorage.setItem("FName",FName);
    localStorage.setItem("Depart",Depat);
    localStorage.setItem("uEmail",Eml);
    
    
    firebase.auth().signInWithEmailAndPassword(uName, passWord)
    .then((userCredential) => {
        var user = userCredential.user;
        Authenti(toPage);
    // ...
    })
    .catch((error) => {
        document.getElementById("userName").value = "";
        document.getElementById("passWord").value = "";
        swal("Oops...", "Invalid login credentials!", "error");
    });
}

function Logout(){
    
    swal({
      title: "Are you sure you want to logout?",
      icon: "info",
      buttons: ["No", "Yes"],
      dangerMode: true,
    })
    .then((answer) => {
      if (answer) {
        firebase.auth().signOut().then(() => {
            localStorage.setItem("uName","");
            localStorage.setItem("uPass","");
            localStorage.setItem("uRole","");
            location.href = "loginPage.html";
        }).catch((error) => {
            // An error happened.
        });
      } else {
      }
    });
    
    
//    if (confirm('Are you sure you want to Logout?')) {
//        firebase.auth().signOut().then(() => {
//            localStorage.setItem("uName","");
//            localStorage.setItem("uPass","");
//            localStorage.setItem("uRole","");
//            location.href = "loginPage.html";
//        }).catch((error) => {
//            // An error happened.
//        });
//    } else {
//      // Do nothing!
//    }
    
}

function goTo(page){
    location.href = page;
    clearImportQueue();
}
//========BASIC FUNCTIONS==============

//.===============SUBJECTS ===============

function importClearsubjTable(){
    $("#tableBodySubject tr").remove(); 
    document.getElementById("subjectFile").value = '';
    clearImportQueue();
}


function Create(subCode, subDesc, deptNcourse,schYear,schSem) {
    var nodatadiv =document.getElementById("checkifEmpty").style.display ="none";
    
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    var div = document.createElement('div');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var p3 = document.createElement('p');
//    div.id = 'container';
    div.className = 'subjCard';
    div.id = subCode;
    
    if (page == "subjectsTeacher.html"){
        var code = "make(" + "\""+subCode+"\"" + "," + "\""+schYear+"\"" + "," + "\""+schSem+"\"" + "," + "\""+deptNcourse+"\"" + ")";
    }
    if(page == "subjects.html"){
        var code = "getClass(" + "\""+subCode+"\""+ ",\""+subDesc+"\"" + ")";
    }
//    document.getElementById(subCode).setAttribute("data-toggle", "modal");
//    document.getElementById(subCode).setAttribute("data-target", "#viewSubjModal");
////    $("#"+subCode).attr("data-toggle", "modal");
////    $("#"+subCode).attr("data-target", "#viewSubjModal");
    p1.className = 'subCode';
    p2.className = "subDesc";
    p3.className = 'subDept';
    
    p1.innerHTML = subCode;
    p2.innerHTML = subDesc;
    p3.innerHTML = deptNcourse;
    
    document.getElementById('subjectsContainer').appendChild(div);
    
    div.appendChild(p1);
    div.appendChild(p2);
    div.appendChild(p3);
    
    
//    div.setAttribute("data-toggle", "modal");
//    div.setAttribute("data-target", "#viewSubjModal");
    div.setAttribute("onclick", code);
}

    

function getClass(code,desc){
    var btnStudentAdd = document.getElementById("addStudentBtn");
    btnStudentAdd.style.display="none";
    document.getElementById('sectionsView').innerHTML = "";
    firebase.database().ref("Subjects/"+code+"/Sections").orderByKey().once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
                var countStudents = -1;
                var childKey = childSnapshot.key;
                localStorage.setItem("BlockNumber",childKey);
                
                if(localStorage.getItem("BlockNumber")!=""||localStorage.getItem("TeacherInCharge")!=""||localStorage.getItem("StudentCount")){
                    document.getElementById('classViewNone').style.display = "none";
                    document.getElementById('sectionsView').style.display = "block";
                    document.getElementById('backClassBtn').style.display = "none";
                    document.getElementById("classViewFull").style.display = "none";
                    var div = document.createElement('div');
                    var indiv = document.createElement('div');
                    var p1 = document.createElement('p');
                    var p2 = document.createElement('p');
                    var p3 = document.createElement('p');
                    var img = document.createElement('img');
                    
                    var codeNblock = code +"|"+ childKey;
                    
                    div.className = 'toClassCard';
                    indiv.className = 'imgNcount';

                    p1.innerHTML = localStorage.getItem("BlockNumber");
                    p2.innerHTML = localStorage.getItem("TeacherInCharge");
                    p3.innerHTML = localStorage.getItem("StudentCount");
                    img.setAttribute("src","Icons/Student.png");

                    div.setAttribute("onclick","GetClassList("+"\""+codeNblock+"\","+"\""+desc+"\""+")");
                    document.getElementById('sectionsView').appendChild(div);

                    div.appendChild(p1);
                //    div.appendChild(p2);
                //    div.appendChild(indiv);
                //    indiv.appendChild(img);
                //    indiv.appendChild(p3);
                    }else{
                        document.getElementById('sectionsView').style.display = "none";
                    }
            })
    })
    
    
//    localStorage.setItem("BlockNumber","");
//    localStorage.setItem("TeacherInCharge","");
//    localStorage.setItem("StudentCount","");
    if(document.getElementById('sectionsView').innerHTML == ""){
        document.getElementById('sectionsView').style.display = "none";
        document.getElementById('classViewNone').style.display = "block";
        document.getElementById('backClassBtn').style.display = "none";
        document.getElementById("classViewFull").style.display = "none";
    }
    document.getElementById("sectionName").innerHTML=code+"<br>"+desc;
    localStorage.setItem("theDesc",code+"<br>"+desc);
    $("#viewSubjModal").modal({show: true});
}

function make(subjectS,year,sem,dnc){
    document.getElementById("blkNumber").value = "";
    document.getElementById("SubCODE").value = subjectS;
    document.getElementById("dNc").value = dnc;
    document.getElementById("SYnS").value = year+" \( "+sem+" Semester )";
    
    document.getElementById("importBtn1").style.display = "none";
    document.getElementById("confirmButton").style.display = "inline-block";
    
    document.getElementById("sectionsModalSubject").style.display = "grid";
    document.getElementById("importblockModalSubject").style.display = "none";
    
    document.getElementById("subjectNameID").innerHTML = "Create Section";
    $("#viewSubjModal").modal({show: true});
    importClearTable('Student')
}

function GetClassList(code,desc){
    document.getElementById("classViewFull").style.display = "block";
    document.getElementById("backClassBtn").style.display = "inline-block";
    document.getElementById("sectionsView").style.display = "none";
    var classCodeBlock = code.split("|");
    
    localStorage.setItem("dashTeachcode",classCodeBlock[0]);
    localStorage.setItem("dashTeachblock",classCodeBlock[1]);
    localStorage.setItem("dashTeachdesk",desc);
    
    getClassTeacher(
        localStorage.getItem("dashTeachcode"),
        localStorage.getItem("dashTeachblock"),
        localStorage.getItem("dashTeachdesk")
    );
    
    var btnStudentAdd = document.getElementById("addStudentBtn");
    btnStudentAdd.style.display="flex";
//    console.log(classCodeBlock[0]+" "+classCodeBlock[1]+desc);
//    var countStudents = 0;
//    document.getElementById("sectionName").innerHTML=classCodeBlock[0]+" ( "+classCodeBlock[1]+" )<br>"+desc;
//    $("#tableBodyclassFull tr").remove(); 
//    firebase.database().ref("Subjects/"+classCodeBlock[0]+"/Sections/"+classCodeBlock[1]).orderByKey().once('value', function(snapshot){
//            snapshot.forEach(function(childSnapshot){
//                
//                var childKey = childSnapshot.key;
//                var child = childSnapshot.val();
//                if(childKey!="TeacherInCharge"){
//                    document.getElementById("tableBodyclassFull").innerHTML +=
//                            "<tr class=\"trRow\"><td>" + childKey + "</td><td class=\"trTable\">" + child['fName']+" "+child['mName']+" "+child['lName']+ "<img src=\"Icons/editbutton.png\" class=\"editicon\" data-toggle=\"modal\" data-target=\"#EditAccountModal\" onclick=\"getTBedited('"+childKey.toString()+"')\"> <img src=\"Icons/deleteicon.png\" class=\"delicon\" onclick=\"removefromclass('"+childKey.toString()+"','"+child['fName']+" "+child['lName']+"')\"></td></tr>";
//                    countStudents+=1;
//                    document.getElementById("classCount").innerHTML = countStudents;
//                }else{
//                    firebase.database().ref("Staff/").orderByKey().equalTo(child).once('value', function(snapshot){
//                        snapshot.forEach(function(childSnapshot){
//                            var cKey = childSnapshot.key;
//                            var cD = childSnapshot.val();
//                            document.getElementById("teacherINCharge").innerHTML = "Professor:"+" "+cD['fName']+" "+cD['mName']+" "+cD['lName'];
//                        })
//                    })
//                    
//                }
//                
//            })
//    })
    
}

function goBack(){
    var btnStudentAdd = document.getElementById("addStudentBtn");
    btnStudentAdd.style.display="none";
    document.getElementById('classViewNone').style.display = "none";
    document.getElementById('sectionsView').style.display = "block";
    document.getElementById('backClassBtn').style.display = "none";
    document.getElementById("classViewFull").style.display = "none";
    document.getElementById("sectionName").innerHTML=localStorage.getItem("theDesc");
    
}




    

const CEA =["BSAR","BSCE","BSCPE","BSEE","BSECE","BSME"];
const CHS =["BSN","BSMLS","BSPHARMA"];
const CITE =["ACT","BSIT"];
const CMA =["BSA","BSACT","BSAIS","BSHM","BSMA","BSTM","BSBA-FM","BSBA-MM"];
const CSS =["ABCOMM","ABPOLSCI","BEED","BSCRIM","BSED","BSED-EN","BSED-MATH","BSED-SCI","BSED-SOC"];

const CEAcount = CEA.length;
const CHScount = CHS.length;
const CITEcount = CITE.length;
const CMAcount = CMA.length;
const CSScount = CSS.length;

function getCourses(select,depart){
    var list = [];
    if(depart=="CEA"){
        list = CEA.slice();
    }else if(depart=="CHS"){
        list = CHS.slice();
    }else if(depart=="CITE"){
        list = CITE.slice();
    }else if(depart=="CMA"){
        list = CMA.slice();
    }else if(depart=="CSS"){
        list = CSS.slice();
    }
    
    removeOptions(x);
    var option = document.createElement("option");
//    option.text = "All Courses";
//    option.value = "";
//    select.add(option,0);
    
    for(i=0; i<list.length; i++){
        select.options[select.options.length] = new Option(list[i]);
    }
    
    list = [];
}

function getSubjs(Filter){
    loadCurrentSchoolYearAndSemester();
    var nodatadiv =document.getElementById("checkifEmpty").style.display ="grid";
//    document.getElementById("checkifEmpty").style.display="flex";
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            
            var path = window. location. pathname;
            var page = path. split("/"). pop();
            var Parent = document.getElementById("subjectsContainer");
            var courseCon = document.getElementById("dptCrsSub");

            while(Parent.hasChildNodes())
            {
               Parent.removeChild(Parent.firstChild);
            }
            
            

            var deptSel = document.getElementById("dptOutSub").value;
            var courseSel = document.getElementById("dptCrsSub").value;
            
            
            
                var deptSelection = document.getElementById("dptOutSub");
                var departTeacher=localStorage.getItem("Depart");
                
                var op = document.getElementById("dptOutSub").getElementsByTagName("option");
                for (var i = 0; i < op.length; i++) {
                    if(op[i].value != departTeacher){
                        op[i].disabled = true;
                        op[i].selected = false;
                        
                    }else{
                        op[i].disabled = false;
                        op[i].selected = true;
                        deptSel = document.getElementById("dptOutSub").value;
                    }
                }
            


            if(Filter == "deptChange"){
                if (deptSel == "All Departments" || deptSel == "CAS"){
                    courseCon.style.display = "none";
                }else{
                    getCourses(courseCon,deptSel);
                    courseCon.style.display = "block";
                }
            }
            firebase.database().ref("Subjects").orderByKey().once('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    var code= childData['subID'];
                    var desc= childData['subDesc'];
                    var dept= childData['dept'];
                    var course = childData['course'];
                    var Year = childData['SY'];
                    var Semes = childData['SM'];

                    if(childData['SY']==localStorage.getItem("ViewSY") && childData['SM']==localStorage.getItem("ViewSem")){
                        if (deptSel == "All Departments"){
                            Create(code,desc,dept+" | "+course,Year,Semes);
                        }
                        else if(deptSel != "All Departments"){
                            if(dept == deptSel && courseSel=="All Courses"){
                                Create(code,desc,dept+" | "+course,Year,Semes);
                            }
                            else if(dept == deptSel && course == courseSel){
                                Create(code,desc,dept+" | "+course,Year,Semes);
                            }
                        }
                    }

                })
           })
            
        } else {
            location.href = "loginPage.html";
        }
        
    });
    
    
}



//.===============SUBJECTS ===============
function openPassChange(){
    var OldPass = document.getElementById("OldPass").value = "";
    var NewPass = document.getElementById("NewPass").value = "";
    var ConfirmPass = document.getElementById("ConfirmPass").value ="";
}
//a ACCOUNTTTT
function updatePass(){
    var ComparePass = localStorage.getItem("uPass");
    var OldPass = document.getElementById("OldPass").value;
    var NewPass = document.getElementById("NewPass").value;
    var ConfirmPass = document.getElementById("ConfirmPass").value;
    
    swal({
        title: "Are you sure?",
        text: "Update your account information?",
        icon: "info",
        buttons: ["No", "Yes"]
    }).then((answer) => {
        if(OldPass.length >= 6 && OldPass == ComparePass && ConfirmPass == NewPass){
        var user = firebase.auth().currentUser;

            user.updatePassword(NewPass).then(function() {
                
                localStorage.setItem("uPass",NewPass);
                swal({
                      title: "Success!",
                      text: "Password has been changed",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        $("#ChangePassModal").modal('toggle');
                    });
            }).catch(function(error) {
                swal({
                    title: "Ooops...",
                    text: error.message,
                    icon: "error",
                    button: "OK",
                });
            });
            }else if(OldPass.length < 6){
                swal({
                    title: "Ooops...",
                    text: "Password must be 6 or more characters long",
                    icon: "error",
                    button: "OK",
                });
                OldPass.value="";
                NewPass.value="";
                ConfirmPass.value="";

            }else if(OldPass != ComparePass || ConfirmPass != NewPass){
                swal({
                    title: "Ooops...",
                    text: "Invalid update attempt",
                    icon: "error",
                    button: "OK",
                });
                OldPass.value="";
                NewPass.value="";
                ConfirmPass.value="";

            }
    });
    
    
}


//aaa========TIME CONVERTERS 
function timeConverter(UNIX_timestamp){
    var time;
    if(UNIX_timestamp <= 0){  
        time = (UNIX_timestamp*(-1));
    }else{
        time = UNIX_timestamp;
    }
    
    var date = new Date(time * 1000);
    const options = {year: 'numeric', month: '2-digit', day: '2-digit' };
    var d = new Date(date).toLocaleDateString('en-US',options)
    var t = new Date(date).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
    var datime = d+' '+t;
    
    return datime;
}

    
function timeElapsed(date) {
    if (typeof date !== 'object') {
        if(date<=0){
            date = new Date(date*(-1));
        }else{
            date = new Date(date);
        }
    }
    
    var seconds = Math.floor(((new Date().getTime()/1000) - date))
    var intervalType;

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        intervalType = 'y';
    }else {
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            intervalType = 'm';
        }else {
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) {
                intervalType = 'd';
            }else {
                interval = Math.floor(seconds / 3600);
                if (interval >= 1) {
                    intervalType = "hr";
                } else {
                    interval = Math.floor(seconds / 60);
                    if (interval >= 1) {
                        intervalType = "min";
                    } else {
                        interval = seconds;
                        intervalType = "s";
                    }
                }
            }
        }
    }

//    if (interval > 1 || interval === 0) {
//        intervalType += 's';
//    }

    return interval + '' + intervalType;
};
var aDay = 24 * 60 * 60 * 1000;

//aaa========TIME CONVERTERS 

//=====================ANNOUNCEMENT CREATE
function writeData(){
    loadCurrentSchoolYearAndSemester();
    var uidofposter = document.getElementById("profileID").value;
    var nameofposter = document.getElementById("profileName").innerHTML;
    var ts = (Math.round((new Date()).getTime() / 1000));
    var descTs = ts*(-1);
    var postListRef = firebase.database().ref('Posts - ALL');
    var newPostRef = postListRef.push();
        newPostRef.set({
            title: document.getElementById("title-announcement").value,
            content: document.getElementById("content-announcement").value,
            dateASC: ts,
            dateDSC: descTs,
            department:document.getElementById("department-announcement").value,
            SY: localStorage.getItem("CurrentSY"),
            SM: localStorage.getItem("CurrentSem"),
            postedByUID: uidofposter,
            postedByName: nameofposter

            
        }).then(function() {
            
            var departTo = document.getElementById("department-announcement").value;
            if(departTo=="ALL")
            {
                departTo = "the whole university";
            }
            
            createUserLog("created an announcement for "+departTo);
            
                    swal({
                      title: "Success!",
                      text: "Announcement has been posted for "+departTo,
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        getDataAnnouncements();
                        $("#addPostModal").modal('toggle');
                    });
        }).catch(function(error) {
        });
}
var second = 0;
function getDataAnnouncements(){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    var nodatadiv=document.getElementById("checkifEmpty").style.display="grid";
        
    var dept = document.getElementById("deptAnnouncement").value;
    var selectBar = document.getElementById("deptAnnouncement");
    var table = document.getElementById("viewAnnouncements");
    var teacherID = localStorage.getItem("uName").replace("@gmail.com", "");
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            
                if(page == "posts.html"){
                    var deptSelection = document.getElementById("deptAnnouncement");
                    var departTeacher=localStorage.getItem("Depart");

                    var op = document.getElementById("deptAnnouncement").getElementsByTagName("option");
                    for (var i = 0; i < op.length; i++) {
                        if(op[i].value != departTeacher){
                            op[i].disabled = true;
                            op[i].selected = false;

                        }else{
                            op[i].disabled = false;
                            op[i].selected = true;
                            dept = document.getElementById("deptAnnouncement").value;
                        }
                    }


                    if(second==0){
                        firebase.database().ref("Staff/"+teacherID+"/Assigned Class").orderByKey().once('value', function(snapshot){
                        snapshot.forEach(function(childSnapshot){
                                var childKey = childSnapshot.key;
                                var opt = document.createElement('option');
                                opt.value = childKey;
                                opt.innerHTML = childKey;
                                selectBar.appendChild(opt);
                                console.log(childKey);
                            });

                        })
                        second = 1;
                    }
                
                }
            else if(page == "postsTeacher.html"||page == "postsSecretary.html"){
                var deptSelection = document.getElementById("deptAnnouncement");
                var departTeacher=localStorage.getItem("Depart");
                
                var op1 = document.getElementById("deptAnnouncement").getElementsByTagName("option");
                for (var i = 0; i < op1.length; i++) {
                    if(op1[i].value != departTeacher && !op1[i].value.includes("Block")){
                        op1[i].disabled = true;
                        
                    }else{
                        op1[i].disabled = false;
                        dept = document.getElementById("deptAnnouncement").value;
                    }
                }
                
                if(second==0){
                    firebase.database().ref("Staff/"+teacherID+"/Assigned Class").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var opt = document.createElement('option');
                        opt.value = childKey;
                        opt.innerHTML = childKey;
                        selectBar.appendChild(opt);
                        console.log(childKey);
                        });

                    })
                    second = 1;
                }
                
                
            }
            
            
            table.innerHTML = "";
            firebase.database().ref('Posts - ALL').orderByChild('dateDSC').once('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    var ttl= childData['title'];
                    var content= childData['content'];
                    var department= childData['department'];
                    var date= childData['dateDSC'];
                    
                    
                    
                    
                    if(dept == department){
                        if(childData['SY']==localStorage.getItem("ViewSY") && childData['SM']==localStorage.getItem("ViewSem")){
                            if(department == "ALL"){
                                var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                                table.innerHTML += "<tr class=\"anncHov\" data-toggle=\"modal\" data-target=\"#editPostModal\" onclick=\"gtbEditedAnnouncement('"+childKey+"')\"><td>"+"University-Wide"+"</td><td class='commenttd'>"+ttl+"</td><td>"+timeConverter(date)+"</td></tr>"
                            }else{
                                var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                                table.innerHTML += "<tr class=\"anncHov\" data-toggle=\"modal\" data-target=\"#editPostModal\" onclick=\"gtbEditedAnnouncement('"+childKey+"')\"><td>"+department+"</td><td class='commenttd'>"+ttl+"</td><td>"+timeConverter(date)+"</td></tr>"
                            }
                        }
                    }else{
                        
                    }
            
                
            })
        })
            
            
            
        } else {
            location.href = "loginPage.html";
        }
    });  
    
}

function importClearAnnouncement(){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    document.getElementById("title-announcement").value = '';
    document.getElementById("content-announcement").value = '';
    document.getElementById("department-announcement").value = '';
    
    
    if(page === "postsTeacher.html"){
        var selectBar = document.getElementById("department-announcement");
        removeOptions(selectBar);

        var teacherID = localStorage.getItem("uName").replace("@gmail.com", "");

        firebase.database().ref("Staff/"+teacherID+"/Assigned Class").orderByKey().once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
                var childKey = childSnapshot.key;

                var opt = document.createElement('option');
                opt.value = childKey;
                opt.innerHTML = childKey;
                selectBar.appendChild(opt);
            });

        })
    }
    else if(page === "posts.html"){
        var deptSelection = document.getElementById("department-announcement");
                var departTeacher=localStorage.getItem("Depart");
                
                var op1 = document.getElementById("department-announcement").getElementsByTagName("option");
                for (var i = 0; i < op1.length; i++) {
                    if(op1[i].value != departTeacher && !op1[i].value.includes("Block")){
                        op1[i].disabled = true;
                        op1[i].selected = false;
                        
                    }else{
                        op1[i].selected = true;
                        op1[i].disabled = false;
                        dept = document.getElementById("department-announcement").value;
                    }
                }
        
    }
}




function getTimeReminder(){
    var unixtime = Date.parse("24-Nov-2009 17:57:35")/1000;
}


function writeReminder(){
    var uidofposter = document.getElementById("profileID").value;
    var nameofposter = document.getElementById("profileName").innerHTML;
    loadCurrentSchoolYearAndSemester();
    var daten = document.getElementById("date-reminder").value;
    daten = new Date(daten.split(' ').join('T'));
    daten = daten.getTime()/1000;
    
    var ts = (Math.round((new Date()).getTime() / 1000));
    var descTs = ts*(-1);
    var postListRef = firebase.database().ref('Reminders - ALL');
    var newPostRef = postListRef.push();
        newPostRef.set({
            title: document.getElementById("title-reminder").value,
            content: document.getElementById("content-reminder").value,
            dateASC: ts,
            dateDSC: descTs,
            department:document.getElementById("department-reminder").value,
            notifyDate: daten,
            SY: localStorage.getItem("CurrentSY"),
            SM: localStorage.getItem("CurrentSem"),
            postedByUID: uidofposter,
            postedByName: nameofposter
        }).then(function() {
            
            var departTo = document.getElementById("department-reminder").value;
            if(departTo=="ALL")
            {
                departTo = "the whole university";
            }
            
            createUserLog("created a reminder for "+departTo);
            
                    swal({
                      title: "Success!",
                      text: "Reminder has been created for "+departTo,
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        getDataReminders();
                        $("#addReminderModal").modal('toggle');
                    });
        }).catch(function(error) {
        });
    
}

function importClearReminder(){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    document.getElementById("title-reminder").value = '';
    document.getElementById("content-reminder").value = '';
    document.getElementById("department-reminder").value = '';
    document.getElementById("date-reminder").value = '';
    
    if(page === "remindersTeacher.html"){
        var selectBar = document.getElementById("department-reminder");
        removeOptions(selectBar);

        var teacherID = localStorage.getItem("uName").replace("@gmail.com", "");

        firebase.database().ref("Staff/"+teacherID+"/Assigned Class").orderByKey().once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
                var childKey = childSnapshot.key;

                var opt = document.createElement('option');
                opt.value = childKey;
                opt.innerHTML = childKey;
                selectBar.appendChild(opt);
            });

        })
    }
    else if(page === "reminders.html"){
        var deptSelection = document.getElementById("department-reminder");
                var departTeacher=localStorage.getItem("Depart");
                
                var op1 = document.getElementById("department-reminder").getElementsByTagName("option");
                for (var i = 0; i < op1.length; i++) {
                    if(op1[i].value != departTeacher && !op1[i].value.includes("Block")){
                        op1[i].disabled = true;
                        op1[i].selected = false;
                        
                    }else{
                        op1[i].selected = true;
                        op1[i].disabled = false;
                        dept = document.getElementById("department-reminder").value;
                    }
                }
        
    }
    
}

var first = 0;
function getDataReminders(){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    var nodatadiv=document.getElementById("checkifEmpty").style.display="grid";
    var dept = document.getElementById("deptReminder").value;
    var table = document.getElementById("viewReminders");
    
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            
            if(page === "reminders.html"){
                var deptSelection = document.getElementById("deptReminder");
                var departTeacher=localStorage.getItem("Depart");
                
                var op1 = document.getElementById("deptReminder").getElementsByTagName("option");
                for (var i = 0; i < op1.length; i++) {
                    if(op1[i].value != departTeacher && !op1[i].value.includes("Block")){
                        op1[i].disabled = true;
                        op1[i].selected = false;
                        
                    }else{
                        op1[i].disabled = false;
                        op1[i].selected = true;
                        dept = document.getElementById("deptReminder").value;
                    }
                }
                
                
                
                var selectBar = document.getElementById("deptReminder");
                var teacherID = localStorage.getItem("uName").replace("@gmail.com", "");
            
                if(first==0){
                    firebase.database().ref("Staff/"+teacherID+"/Assigned Class").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var opt = document.createElement('option');
                        opt.value = childKey;
                        opt.innerHTML = childKey;
                        selectBar.appendChild(opt);
                        });

                    })
                    first = 1;
                }
                
            }else if(page === "remindersTeacher.html" || page === "remindersSecretary.html"){
                var deptSelection = document.getElementById("deptReminder");
                var departTeacher=localStorage.getItem("Depart");
                
                var op1 = document.getElementById("deptReminder").getElementsByTagName("option");
                for (var i = 0; i < op1.length; i++) {
                    if(op1[i].value != departTeacher && !op1[i].value.includes("Block")){
                        op1[i].disabled = true;
                        
                    }else{
                        op1[i].disabled = false;
                        dept = document.getElementById("deptReminder").value;
                    }
                }
                
                var selectBar = document.getElementById("deptReminder");
                var teacherID = localStorage.getItem("uName").replace("@gmail.com", "");
            
                if(first==0){
                    firebase.database().ref("Staff/"+teacherID+"/Assigned Class").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var opt = document.createElement('option');
                        opt.value = childKey;
                        opt.innerHTML = childKey;
                        selectBar.appendChild(opt);
                        });

                    })
                    first = 1;
                }
                
            }
            
            
            table.innerHTML = "";
            firebase.database().ref('Reminders - ALL').orderByChild('dateDSC').once('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    var ttl= childData['title'];
                    var content= childData['content'];
                    var department= childData['department'];
                    var date= childData['dateDSC'];
                    var nDate = childData['notifyDate'];
                    
                    
                    if(dept == department){
                        if(childData['SY']==localStorage.getItem("ViewSY") && childData['SM']==localStorage.getItem("ViewSem")){
                            if(department == "ALL"){
                                var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                                table.innerHTML += "<tr onclick=\"getTBeditReminder('"+childKey+"')\" class=\"remindermods\" data-toggle=\"modal\" data-target=\"#editReminderModal\"><td>"+"University-Wide"+"</td><td>"+ttl+"</td><td>"+timeConverter(nDate)+"</td></tr>"
                            }else{
                                var nodatadiv=document.getElementById("checkifEmpty").style.display="none";
                                table.innerHTML += "<tr onclick=\"getTBeditReminder('"+childKey+"')\" class=\"remindermods\" data-toggle=\"modal\" data-target=\"#editReminderModal\"><td>"+department+"</td><td>"+ttl+"</td><td>"+timeConverter(nDate)+"</td></tr>"
                            }
                        }
                    }else{
                        
                    }
            
                
            })
        })
            
            
            
        } else {
            location.href = "loginPage.html";
        }
    });  
    
}

//asd =======================import students subjects ()

function moveToImport(){
    var subjectCode = document.getElementById("SubCODE").value;
    var blockNumber = document.getElementById("blkNumber").value;

    document.getElementById("importBtn1").style.display = "inline-block";
    document.getElementById("confirmButton").style.display = "none";
    
    document.getElementById("sectionsModalSubject").style.display = "none";
    document.getElementById("importblockModalSubject").style.display = "block";
    
    document.getElementById("subjectNameID").innerHTML = subjectCode+" | Block "+blockNumber;
}

function CreateSectionDiv(BlockNo,subCode, subDesc) {
    
    var noTextDiv = document.getElementById("noData-dashTeach").style.display="none";
    var Maindiv = document.createElement('div');
    var labelBlock = document.createElement('label');
    var labelCodeDesc = document.createElement('label');
    var countDiv = document.createElement('div');
    var image = document.createElement('img');
    var labelCount = document.createElement('label');
    
    Maindiv.className = 'sectionDiv';
    countDiv.className = 'count';
    
    labelBlock.id = "SecBlock";
    labelCodeDesc.id = "SecDesc";
    labelCount.id = "SecCount"
    
    labelBlock.innerHTML = subCode;
    labelCodeDesc.innerHTML = subDesc;
    labelCount.innerHTML = BlockNo;
    
    image.setAttribute("src","Icons/Student.png");
    
    
    document.getElementById('flexDash').appendChild(Maindiv);
    
    
    Maindiv.appendChild(labelBlock);
    Maindiv.appendChild(labelCodeDesc);
    Maindiv.appendChild(labelCount);
//    Maindiv.appendChild(countDiv);
//    countDiv.appendChild(image);
//    countDiv.appendChild(labelCount);
    var code = "getClassTeacher(" + "\""+subCode+"\"" + "," + "\""+BlockNo+"\"" + "," + "\""+subDesc+"\"" +")";
//    div.appendChild(p1);
//    div.appendChild(p2);
//    div.appendChild(p3);
    Maindiv.setAttribute("onclick", code);
    Maindiv.setAttribute("data-toggle", "modal");
    Maindiv.setAttribute("data-target", "#viewSubjModal");
    
//    asd CODE TO MAKE IT WORK WITH ONCLICK AND MODAL
}

function getClassTeacher(code, block, desc){
    var btnStudentAdd = document.getElementById("addStudentBtn");
    btnStudentAdd.setAttribute("onclick","addStudentsToSubj('"+code+"','"+block+"')");
    
    localStorage.setItem("dashTeachcode",code);
    localStorage.setItem("dashTeachblock",block);
    localStorage.setItem("dashTeachdesk",desc);
    var countStudents = 0;
    var modalhead = document.getElementById("sectionName").innerHTML = (code+" ("+block+")<br>"+desc);
    var table = document.getElementById("classFullTable");
    var teacher = document.getElementById("teacherINCharge");
    var classCount = document.getElementById("classCount")
//    window.alert(code+" ("+block+")<br>"+desc);
    
    
    $("#tableBodyclassFull tr").remove(); 
    firebase.database().ref("Subjects/"+code+"/Sections/"+block).orderByKey().once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
                
                var childKey = childSnapshot.key;
                var child = childSnapshot.val();
                if(childKey!="TeacherInCharge"){
                    document.getElementById("tableBodyclassFull").innerHTML +=
                            "<tr class=\"trRow\"><td>" + childKey + "</td><td class=\"trTable\">" + child['fName']+" "+child['mName']+" "+child['lName']+ "<img src=\"Icons/editbutton.png\" class=\"editicon\" data-toggle=\"modal\" data-target=\"#EditAccountModal\" onclick=\"getTBedited('"+childKey.toString()+"')\"> <img src=\"Icons/deleteicon.png\" class=\"delicon\" onclick=\"removefromclass('"+childKey.toString()+"','"+child['fName']+" "+child['lName']+"')\"></td></tr>";
                    countStudents+=1;
                    document.getElementById("classCount").innerHTML = countStudents;
                }else{
                    firebase.database().ref("Staff/").orderByKey().equalTo(child).once('value', function(snapshot){
                        snapshot.forEach(function(childSnapshot){
                            var cKey = childSnapshot.key;
                            var cD = childSnapshot.val();
                            document.getElementById("teacherINCharge").innerHTML = "Professor:"+" "+cD['fName']+" "+cD['mName']+" "+cD['lName'];
                        })
                    })
                    
                }
                
            })
    })
}

function removefromclass(StudentId,StudName){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    
    var fullString = (document.getElementById("sectionName").innerHTML).split("<br>");
    fullString = fullString[0].split("(");
    var subj = fullString[0].trim();
    var block =fullString[1].replace(")", "");
    
    if(page=="subjects.html"){
        block = block.trim();
    }
    
//    window.alert(subj+StudentId+block);
    var student = StudentId;
    swal({
        title: "Are you sure?",
        text: "Remove "+StudName+" from "+subj+" ("+block+")",
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
    })
    .then((answer) => {
      if (answer) {
            var Key = firebase.database().ref("Subjects/"+subj+"/Sections/"+block+"/"+StudentId);
            Key.remove().then(function() {
                var StudentListOfSubs = firebase.database().ref("Student/"+StudentId+"/Subjects/"+subj);
                  StudentListOfSubs.remove().then(function() {
                        swal({
                          title: "Success!",
                          text: StudName+" has been removed from "+subj+" ("+block+").",
                          icon: "success",
                          button: "OK",
                        }).then((answer) => {
                            createUserLog(" removed "+StudName+" from "+subj+" ("+block+").");
                            getClassTeacher(
                            localStorage.getItem("dashTeachcode"),
                            localStorage.getItem("dashTeachblock"),
                            localStorage.getItem("dashTeachdesk"));
                        });
                }).catch(function(error) {
                });
              
              
            }).catch(function(error) {
                
            });
      } else {
          
      }
    });
}

function getTBedited(studentId){
    localStorage.setItem("getTBedited",studentId);
    hidetbEdit();
    var pid = document.getElementById("editprofUID");
    var pfname =document.getElementById("editproffName");
    var pmname =document.getElementById("editprofmName");
    var plname =document.getElementById("editproflName");
    var pemail =document.getElementById("editprofEmail");
    var pcontact =document.getElementById("editprofNumber");
    var pdept =document.getElementById("editprofDept");
    var pcourse =document.getElementById("editprofCrs");
    
    firebase.database().ref("Student/").orderByKey().equalTo(studentId).once('value', function(snapshot){
            snapshot.forEach(function(childSnapshot){
                var cKey = childSnapshot.key;
                var cD = childSnapshot.val();
                pid.value = cKey;
                pfname.value = cD['fName'];
                pmname.value = cD['mName'];
                plname.value = cD['lName'];
                pemail.value = cD['email'];
                pcontact.value = cD['contact'];
                pdept.value = cD['dept'];
                pcourse.value = cD['course'];
            })
    })
    
}

function hidetbEdit(){
    document.getElementById("updateStudentProfileBtn").style.display ="none";
}

function changedtbEdit(){
    document.getElementById("updateStudentProfileBtn").style.display ="inline-block";
}


function updateTBedit(){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    
    var pid = document.getElementById("editprofUID");
    var pfname = document.getElementById("editproffName");
    var pmname = document.getElementById("editprofmName");
    var plname = document.getElementById("editproflName");
    var pemail = document.getElementById("editprofEmail");
    var pcontact = document.getElementById("editprofNumber");
    
    StudName = pfname.value + " " + plname.value;
    swal({
        title: "Are you sure?",
        text: "Update account information of account ("+pid.value+")",
        icon: "info",
        buttons: ["No", "Yes"]
    })
    .then((answer) => {
        if (answer) {
          var editTBedited = firebase.database().ref("Student/"+pid.value);
          editTBedited.update({
                fName : pfname.value,
                mName : pmname.value,
                lName : plname.value,
                email : pemail.value,
                contact : pcontact.value

          }).then(function() {
                firebase.database().ref("Student/"+pid.value+"/Subjects").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        firebase.database().ref("Student/"+pid.value+"/Subjects").orderByKey().equalTo(childKey).once('value', function(snapshot){
                                snapshot.forEach(function(childSnapshot){
                                    var cK= childSnapshot.key;
                                    var cD= childSnapshot.val();
                                    console.log(childKey+" "+cD['block']);

                                    var editTBedited2 = firebase.database().ref("Subjects/"+childKey+"/Sections/"+cD['block']+"/"+pid.value);
                                    editTBedited2.update({
                                        fName : pfname.value,
                                        mName : pmname.value,
                                        lName : plname.value

                                    })
                                })
                        })
                    })
                }).then(function() {
                                        swal({
                                          title: "Success!",
                                          text: "Account ("+pid.value+") has been updated.",
                                          icon: "success",
                                          button: "OK",
                                        }).then((answer) => {
                                            createUserLog("updated student account ("+pid.value+")'s details.");
                                            $("#EditAccountModal").modal('toggle');
//                                            $("#EditAccountModal").modal({show: false});
                                            if(page=="accountStudent.html"){
                                                getUsers("Student");
                                            }else{
                                                getClassTeacher(
                                                localStorage.getItem("dashTeachcode"),
                                                localStorage.getItem("dashTeachblock"),
                                                localStorage.getItem("dashTeachdesk")
                                            );
                                                
                                            }
                                            
                                        });

                                    }).catch(function(error) {
                                        
                                    });

          }).catch(function(error) {
              
          });
          
      } else {
          
      }
        
    });
}



function changedtbEditStaff(){
    document.getElementById("updateStaffProfileBtn").style.display ="inline-block";
}

function hidetbEditStaff(){
    document.getElementById("updateStaffProfileBtn").style.display ="none";
}

function getTBeditStaff(){
    hidetbEditStaff();
    var currUser = localStorage.getItem("uName").replace("@gmail.com", "");
    firebase.database().ref("Staff/").orderByKey().equalTo(currUser).once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var childKey = childSnapshot.key;
                        var cd = childSnapshot.val();
                        
                        document.getElementById("profileDepartment").value = cd['dept'];
                        document.getElementById("profilePosition").value = cd['position'];
                        document.getElementById("profileEmail").value = cd['email'];
                        document.getElementById("profilefName").value = cd['fName'];
                        document.getElementById("profilemName").value = cd['mName'];
                        document.getElementById("profilelName").value = cd['lName'];
                        
                        
                        document.getElementById("profileName").innerHTML = cd['fName']+" "+cd['mName']+" "+cd['lName'];
                    })
    })
    
}

function updateTBeditStaff(){
    var pid = document.getElementById("profileID");
    var pfname = document.getElementById("profilefName");
    var pmname = document.getElementById("profilemName");
    var plname = document.getElementById("profilelName");
    var pemail = document.getElementById("profileEmail");
    
    StudName = pfname.value + " " + plname.value;
    swal({
        title: "Are you sure?",
        text: "Update your account information?",
        icon: "info",
        buttons: ["No", "Yes"]
    }).then((answer) => {
        if(answer){
            var editTBedited = firebase.database().ref("Staff/"+pid.value);
              editTBedited.update({
                    fName : pfname.value,
                    mName : pmname.value,
                    lName : plname.value,
                    email : pemail.value
              }).then(function() {
                  swal({
                          title: "Success!",
                          text: "Your account details have been updated",
                          icon: "success",
                          button: "OK",
                        }).then((answer) => {
                            createUserLog("updated his/her account details")
                            document.getElementById("profileName").innerHTML = pfname.value+" "+pmname.value+" "+plname.value;
                            hidetbEditStaff();
                        });
              }).catch(function(error) {

              });
        }else{
            
        }
    });
}
function gtbEditedAnnouncement(code){
    var commentBtn = document.getElementById("openComment");
    
    var title = document.getElementById("tbtitle-announcement");
    var content = document.getElementById("tbcontent-announcement");
    var dept = document.getElementById("tbdepartment-announcement");
    var btnEdit = document.getElementById("btnEditPost").style.display = "none";
    var btnToEdit = document.getElementById("btnEditPost");
    var btnToDelete = document.getElementById("btnDelPost");
    dept.setAttribute("disabled","true");
    
    
    
    
    
    var op = document.getElementById("tbdepartment-announcement").getElementsByTagName("option");
    
    var ref = firebase.database().ref("Posts - ALL/"+code+"/Comments");
    ref.once("value")
    .then(function(snapshot) {
        commentBtn.innerHTML = "Comments ( "+snapshot.numChildren().toString()+" )";
    });
    
//    window.alert(code);
    firebase.database().ref("Posts - ALL/").orderByKey().equalTo(code).once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            localStorage.setItem("defaultTitle",childData['title']);
            localStorage.setItem("defaultContent",childData['content']);
            btnToEdit.setAttribute("onclick","updateAnnouncement(\""+code+"\")");
            btnToDelete.setAttribute("onclick","delAnnouncement(\""+code+"\")");
            commentBtn.setAttribute("onclick","getComments(\""+code+"\",\""+childData['department']+"\")");
            title.value = childData['title'];
            content.value = childData['content'];
            
            
            var opt = document.createElement('option');
            opt.value = childData['department'];
            opt.innerHTML = childData['department'];
            if(opt.innerHTML=="ALL"){
               opt.innerHTML="University-Wide";
            }
            dept.appendChild(opt);
            
            for (var i = 0; i < op.length; i++) {
                if(op[i].value != childData['department']){
                    op[i].disabled = true;
                    op[i].selected = false;
                        
                }else{
                    op[i].disabled = false;
                    op[i].selected = true;
                }
            }
            
            var UserDept =document.getElementById("profileDepartment").value;
            var UserPos =document.getElementById("profilePosition").value;

            if(UserPos=="Admin"){
                title.disabled = false;
                content.disabled = false;
                btnToDelete.style.display="inline-block";
            }else if(UserPos=="Secretary"){
                if(childData['department'] == UserDept){
                    title.disabled = false;
                    content.disabled = false;
                    btnToDelete.style.display="inline-block";
                }else{
                    title.setAttribute("disabled","true");
                    content.setAttribute("disabled","true");
                    btnToDelete.style.display="none";
                }
                
            }else if(UserPos=="Professor"){
                if(childData['department'] == "ALL"){
                    title.setAttribute("disabled","true");
                    content.setAttribute("disabled","true");
                    btnToDelete.style.display="none";
                }
                else if(childData['department'] == UserDept){
                    title.setAttribute("disabled","true");
                    content.setAttribute("disabled","true");
                    btnToDelete.style.display="none";
                }
                else{
                    title.disabled = false;
                    content.disabled = false;
                    btnToDelete.style.display="inline-block";
                }
            }
            
        })
    })
    
    
}

function editAnnounceInput(){
    var title = document.getElementById("tbtitle-announcement").value;
    var content = document.getElementById("tbcontent-announcement").value;
    
    
    if(title == localStorage.getItem("defaultTitle") && content == localStorage.getItem("defaultContent")){
        var btnEdit = document.getElementById("btnEditPost").style.display = "none";
        
    }else{
        var btnEdit = document.getElementById("btnEditPost").style.display = "inline-block"
    }
}

function updateAnnouncement(code){
    var title = document.getElementById("tbtitle-announcement").value;
    var content = document.getElementById("tbcontent-announcement").value;
    swal({
      title: "Are you sure?",
      text: "Edit the contents of this Announcement",
      icon: "info",
      buttons: ["No", "Yes"]
    })
    .then((answer) => {
      if (answer) {
          var importAccInfo = firebase.database().ref("Posts - ALL/" + code);
            importAccInfo.update({
                title : title,
                content : content
            }).then(function() {
                    swal({
                      title: "Success!",
                      text: "Announcement has been updated",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        createUserLog("edited an announcement (\""+title+"\")");
                        var btnEdit = document.getElementById("btnEditPost").style.display = "none";
                        getDataAnnouncements();
                    });
            }).catch(function(error) {
            });
      } else {
          
      }
    });
}

function delAnnouncement(code){
    swal({
      title: "Are you sure?",
      text: "Delete this Announcement",
      icon: "warning",
      dangerMode: true,
      buttons: ["No", "Yes"]
    }).then((answer) => {
      if (answer) {
          var daAnnouncement = 
          firebase.database().ref("Posts - ALL/" + code);
          daAnnouncement.remove().then(function() {
                    swal({
                      title: "Success!",
                      text: "Announcement has been deleted",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        createUserLog("deleted an announcement.")
                        $("#editPostModal").modal('toggle');
                        getDataAnnouncements();
                    });
            }).catch(function(error) {
            });
          
      } else {
          
      }
    });
    
}

function getTBeditReminder(codeReminder){
    var btnEdit = document.getElementById("btnEditReminder").style.display="none";
    var titleR = document.getElementById("tbetitle-reminder");
    var contentR = document.getElementById("tbecontent-reminder");
    var deptR = document.getElementById("tbedepartment-reminder");
    var dateR = document.getElementById("tbedate-reminder");
    var dateC = document.getElementById("tbecurrdate-reminder");
    document.getElementById("tbedepartment-reminder").setAttribute("disabled", "true");
    var btnUpdateReminder = document.getElementById("btnEditReminder");
    var btnToDeleteR = document.getElementById("btnDelReminder");
    var btnShowdateInput = document.getElementById("popeditNotif");
    var op = document.getElementById("tbedepartment-reminder").getElementsByTagName("option");
    
    firebase.database().ref("Reminders - ALL/").orderByKey().equalTo(codeReminder).once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            titleR.value = childData['title'];
            contentR.value = childData['content'];
            dateRValue = parseInt(childData['notifyDate']);
            dateC.value = timeConverter(dateRValue);
//            console.log(timeConverter(dateRValue));
            btnUpdateReminder.setAttribute("onclick","updateReminderTB('"+childKey+"')");
            btnToDeleteR.setAttribute("onclick","deleteReminderTB('"+childKey+"')");
            localStorage.setItem("currReminderTitle",childData['title']);
            localStorage.setItem("currReminderContent",childData['content']);
            
            var opt = document.createElement('option');
            opt.value = childData['department'];
            opt.innerHTML = childData['department'];
            if(opt.innerHTML=="ALL"){
               opt.innerHTML="University-Wide";
            }
            deptR.appendChild(opt);
            
            for (var i = 0; i < op.length; i++) {
                if(op[i].value != childData['department']){
                    op[i].disabled = true;
                    op[i].selected = false;
                        
                }else{
                    op[i].disabled = false;
                    op[i].selected = true;
                }
            }
            
            var UserDept =document.getElementById("profileDepartment").value;
            var UserPos =document.getElementById("profilePosition").value;

            if(UserPos=="Admin"){
                titleR.disabled = false;
                contentR.disabled = false;
                btnShowdateInput.setAttribute("onclick","clickedthenotif()");
                btnToDeleteR.style.display="inline-block";
                
            }else if(UserPos=="Secretary"){
                if(childData['department'] == UserDept){
                    titleR.disabled = false;
                    contentR.disabled = false;
                    btnShowdateInput.setAttribute("onclick","clickedthenotif()");
                    btnToDeleteR.style.display="inline-block";
                }else{
                    titleR.setAttribute("disabled","true");
                    contentR.setAttribute("disabled","true");
                    btnShowdateInput.setAttribute("onclick","");
                    btnToDeleteR.style.display="none";
                }
                
            }else if(UserPos=="Professor"){
                if(childData['department'] == "ALL"){
                    titleR.setAttribute("disabled","true");
                    contentR.setAttribute("disabled","true");
                    btnShowdateInput.setAttribute("onclick","");
                    btnToDeleteR.style.display="none";
                }
                else if(childData['department'] == UserDept){
                    titleR.setAttribute("disabled","true");
                    contentR.setAttribute("disabled","true");
                    btnShowdateInput.setAttribute("onclick","");
                    btnToDeleteR.style.display="none";
                }
                else{
                    titleR.disabled = false;
                    contentR.disabled = false;
                    btnShowdateInput.setAttribute("onclick","clickedthenotif()");
                    btnToDeleteR.style.display="inline-block";
                }
            }
        })
    })
}

function clickedthenotif(){
    var dateR = document.getElementById("tbedate-reminder");
    
    var titleR = document.getElementById("tbetitle-reminder");
    var contentR = document.getElementById("tbecontent-reminder");
    
    var dateR = document.getElementById("tbedate-reminder");
    var dateC = document.getElementById("tbecurrdate-reminder");
    var button = document.getElementById("popeditNotif");
    
    var currtitle = localStorage.getItem("currReminderTitle");
    var currcontent = localStorage.getItem("currReminderContent");
    if(button.innerHTML=="Change Notify Date"){
        dateC.style.display = "none";
        dateR.style.display = "block";
        button.innerHTML="Keep Notify Date";
        
    }else if(button.innerHTML=="Keep Notify Date"){
        dateC.style.display = "block";
        dateR.style.display = "none";
        button.innerHTML="Change Notify Date";
        var dateR = document.getElementById("tbedate-reminder").value = "";
    }
}
function hidevieweditDate(){
    
    var dateR = document.getElementById("tbedate-reminder");
    var btnEdit = document.getElementById("btnEditReminder").style.display="none";
    
    var titleR = document.getElementById("tbetitle-reminder");
    var contentR = document.getElementById("tbecontent-reminder");
    
    var dateR = document.getElementById("tbedate-reminder");
    var dateC = document.getElementById("tbecurrdate-reminder");
    var button = document.getElementById("popeditNotif");
    
    var currtitle = localStorage.getItem("currReminderTitle");
    var currcontent = localStorage.getItem("currReminderContent");
    
    if(currtitle == titleR.value && currcontent == contentR.value){
        var btnEdit = document.getElementById("btnEditReminder").style.display="none";
    }else{
        var btnEdit = document.getElementById("btnEditReminder").style.display="inline-block";
    }
}

function showvieweditDate(){
    var dateR = document.getElementById("tbedate-reminder");
    var button = document.getElementById("popeditNotif");
    
    if(dateR.value == ""){
        var btnEdit = document.getElementById("btnEditReminder").style.display="none";
    }else if(dateR.value != ""){
        var btnEdit = document.getElementById("btnEditReminder").style.display="inline-block";
    }
}

function updateReminderTB(code){
    var dateR = document.getElementById("tbedate-reminder");
    var titleR = document.getElementById("tbetitle-reminder");
    var contentR = document.getElementById("tbecontent-reminder");
    swal({
      title: "Are you sure?",
      text: "Update reminder details",
      icon: "info",
      buttons: ["No", "Yes"],
    })
    .then((answer) => {
      if (answer) {
          var importAccInfo = firebase.database().ref("Reminders - ALL/" + code);
          
          if(dateR.value==""){
            importAccInfo.update({
                title : titleR.value,
                content : contentR.value, 
            }).then(function() {
                createUserLog("edited a reminder (\""+titleR.value+"\")")
                
                swal({
                      title: "Success!",
                      text: "Reminder has been updated",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        getTBeditReminder(code);
                        getDataReminders();
//                        $("#ChangePassModal").modal('toggle');
                    });
            }).catch(function(error) {
//              window.alert(error.message);
            });
          }else if(dateR.value!=""){
              var daten = document.getElementById("tbedate-reminder").value;
              daten = new Date(daten.split(' ').join('T'));
              daten = daten.getTime()/1000;
              
            importAccInfo.update({
                title : titleR.value,
                content : contentR.value,
                notifyDate: daten,
            }).then(function() {
                swal({
                      title: "Success!",
                      text: "Reminder has been updated",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        getTBeditReminder(code);
                        getDataReminders();
//                        $("#ChangePassModal").modal('toggle');
                    });
            }).catch(function(error) {
              window.alert(error.message);
            });
          }
          
      } else {
      }
    });
    
}

function deleteReminderTB(code){
    swal({
      title: "Are you sure?",
      text: "Delete this Reminder",
      icon: "warning",
      dangerMode: true,
      buttons: ["No", "Yes"]
    }).then((answer) => {
      if (answer) {
          var daAnnouncement = 
          firebase.database().ref("Reminders - ALL/" + code);
          daAnnouncement.remove().then(function() {
                createUserLog("deleted a reminder");
              
                    swal({
                      title: "Success!",
                      text: "Reminder has been deleted",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        getDataReminders();
                        $("#editReminderModal").modal('toggle');
                    });
            }).catch(function(error) {
            });
          
      } else {
          
      }
    });
}

function loadUserLogs(){
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var table = document.getElementById("viewUserLogs");
            table.innerHTML="";
            
            firebase.database().ref('UserLogs - ALL').orderByChild('dateDSC').once('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    if(childData['SY']==localStorage.getItem("ViewSY") && childData['SM']==localStorage.getItem("ViewSem")){
                        table.innerHTML += "<tr class=\"anncHov\"><td   class=\"userlogdesc\">"+childData['desc']+"</td><td>"+timeConverter(childData['dateDSC'])+"</td></tr>"
                    }
                    
                });

            })
            
        } else {
            location.href = "loginPage.html";
        }
    });
}

function createUserLog(description){
    loadCurrentSchoolYearAndSemester();
    var UserId = document.getElementById("profileID").value;
    var FullName = document.getElementById("profilefName").value +" "+document.getElementById("profilelName").value;
    var Position = document.getElementById("profilePosition").value;
    
    var ts = (Math.round((new Date()).getTime() / 1000));
    var descTs = ts*(-1);
    var postListRef = firebase.database().ref('UserLogs - ALL');
    var newPostRef = postListRef.push();
        newPostRef.set({
            desc: Position+", "+FullName+" ("+UserId+") "+description,
            dateASC: ts,
            dateDSC: descTs,
            SY: localStorage.getItem("CurrentSY"),
            SM: localStorage.getItem("CurrentSem")
        });
}

function deleteAccFromDatabase(UIDcode,Role){
    $("#AccountStaffModal").modal('toggle');
    $("#EditAccountModal").modal('toggle');
    var role = Role.split("|");
    
    var textWarning = "Delete this account ("+UIDcode+")";
    if (role[1] == "Professor"){
        textWarning = "Delete this account ("+UIDcode+") \nand any subject blocks assigned to it?";
    }else{
        textWarning = "Delete this account ("+UIDcode+")";
    }
    
    swal({
      title: "Are you sure?",
      text: textWarning,
      icon: "warning",
      buttons: ["No", "Yes"],
      dangerMode: true,
    })
    .then((answer) => {
      if (answer) {
          
            if(role[0]=="Student"){
                firebase.database().ref("Student/"+UIDcode+"/Subjects").orderByKey().once('value', function(snapshot){
                    snapshot.forEach(function(childSnapshot){
                        var key = childSnapshot.key;
                        var child = childSnapshot.val();
                        var subjBlockStud= firebase.database().ref("Subjects/"+key+"/Sections/"+child['block']+"/"+UIDcode);
                        subjBlockStud.remove();
                        
                    })
                }).then(function() {
                    var stud= firebase.database().ref("Student/"+UIDcode);
                    stud.remove().then(function() {
                        createUserLog("permanently removed student account("+UIDcode+").");
                        swal({
                              title: "Success!",
                              text: "Student account ("+UIDcode+") has been deleted.",
                              icon: "success",
                              button: "OK",
                            }).then((answer) => {
                                getUsers('Student');
                            }).catch((error) => {
                                var errorCode = error.code;
                                var errorMessage = error.message;
                            });

                        });

                    });
                
                
            }
            else if(role[0]=="Staff"){
                if(role[1]=="Secretary"){
                    var Key= firebase.database().ref("Staff/"+UIDcode);
                    Key.remove().then(function() {
                            createUserLog("permanently removed secretary account("+UIDcode+").");
                            
                            swal({
                              title: "Success!",
                              text: "Staff(Secretary) account ("+UIDcode+") has been deleted.",
                              icon: "success",
                              button: "OK",
                            }).then((answer) => {
                                getUsers('Staff');
                            }).catch((error) => {
                                var errorCode = error.code;
                                var errorMessage = error.message;
                            });

                    });
                }
                else if(role[1]=="Professor"){
                        firebase.database().ref("Staff/"+UIDcode+"/Assigned Class").orderByKey().once('value', function(snapshot){
                            snapshot.forEach(function(childSnapshot){
                                var childKey = childSnapshot.key;
                                var subjblock = childKey.split(' | ');
                                
                                deletesubjfromStudent(subjblock[0],subjblock[1]);
                                
                                
                            })
                        })
                    
                            var profAcc= firebase.database().ref("Staff/"+UIDcode);
                                profAcc.remove().then(function(){
                                    createUserLog("permanently removed staff(Professor) account("+UIDcode+") and subject blocks assigned to it.");
                            
                                    swal({
                                      title: "Success!",
                                      text: "Staff(Professor) account ("+UIDcode+") & Subject blocks assigned to it have been deleted.",
                                      icon: "success",
                                      button: "OK",
                                    }).then((answer) => {
                                        getUsers('Staff');
                                    }).catch((error) => {
                                        var errorCode = error.code;
                                        var errorMessage = error.message;
                                    });
                                    
                                });
                }
            }
          
      } else {
          
      }
    });
    
    
}

function deletesubjfromStudent(subjcode,block){
//    DELETE SUBJ FROM STUDENT
    firebase.database().ref("Student/").orderByKey().once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var firekey = childSnapshot.key;
            
            firebase.database().ref("Student/"+firekey+"/Subjects/").orderByKey().equalTo(subjcode).once('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    var firekey2 = childSnapshot.key;
                    var firechild2 = childSnapshot.val();
                    if(firechild2['block']==block){
                        console.log(firekey+" "+firekey2 +" "+firechild2['block']);
                        
                        var subStud= firebase.database().ref("Student/"+firekey+"/Subjects/"+firekey2);
                        subStud.remove();
                    }
                })
            })
            
        })
    })
//    DELETE BLOCK FROM SUBJ
    firebase.database().ref("Subjects/"+subjcode+"/Sections/").orderByKey().equalTo(block).once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var bkey = childSnapshot.key;
            console.log(subjcode+" "+bkey);
            
            var subBlock = firebase.database().ref("Subjects/"+subjcode+"/Sections/"+bkey);
            subBlock.remove();
        })
    })
    
    
}

function getStaffAccDets(code){
    var uid = document.getElementById("profileIDstaff");
    var finame= document.getElementById("profilefNamestaff");
    var miname= document.getElementById("profilemNamestaff");
    var laname= document.getElementById("profilelNamestaff");
    var emil= document.getElementById("profileEmailstaff");
    var dptm= document.getElementById("profileDepartmentstaff");
    var postn= document.getElementById("profilePositionstaff");
    var updbtn= document.getElementById("updateStaffProfileBtnStaff");
    
    updbtn.style.display="none";
    firebase.database().ref("Staff/").orderByKey().equalTo(code).once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var key = childSnapshot.key;
            var child = childSnapshot.val();
            uid.value = key;
            finame.value = child['fName'];
            miname.value = child['mName'];
            laname.value = child['lName'];
            emil.value = child['email'];
            dptm.value = child['dept'];
            postn.value = child['position'];
            
            localStorage.setItem("getStaffAccDetsf",child['fName']);
            localStorage.setItem("getStaffAccDetsm",child['mName']);
            localStorage.setItem("getStaffAccDetsl",child['lName']);
            localStorage.setItem("getStaffAccDetse",child['email']);
        })
    })
    
}

function updateStaffAccDets(){
    var updbtn= document.getElementById("updateStaffProfileBtnStaff");
    var uid = document.getElementById("profileIDstaff").value;
    var finame= document.getElementById("profilefNamestaff").value;
    var miname= document.getElementById("profilemNamestaff").value;
    var laname= document.getElementById("profilelNamestaff").value;
    var emil= document.getElementById("profileEmailstaff").value;
    swal({
        title: "Are you sure?",
        text: "Update staff account ("+uid+") information",
        icon: "info",
        buttons: ["No", "Yes"],
    })
    .then((answer) => {
      if (answer) {
          var updateAccInfo = firebase.database().ref("Staff/" + uid);
          updateAccInfo.update({
              fName : finame,
              mName : miname, 
              lName : laname, 
              email : emil,
          }).then(function(){
              createUserLog("updated information of staff account ("+uid+")");
              swal({
                title: "Success!",
                text:  "Updated account ("+uid+")'s information.",
                icon: "success",
                button: "OK",
              }).then((answer) => {
                  getStaffAccDets(uid);
                  getUsers('Staff');
                  
              });
              
                
          }).catch(function(error) {
              console.log(error.message);
          });
          
      } else {
          
      }
    });
}

function changedtbEditStaff1(){
    var cfname = localStorage.getItem("getStaffAccDetsf");
    var cmname = localStorage.getItem("getStaffAccDetsm");
    var clname = localStorage.getItem("getStaffAccDetsl");
    var cemail = localStorage.getItem("getStaffAccDetse");
    
    var updbtn= document.getElementById("updateStaffProfileBtnStaff");
    
    var finame= document.getElementById("profilefNamestaff").value;
    var miname= document.getElementById("profilemNamestaff").value;
    var laname= document.getElementById("profilelNamestaff").value;
    var emil= document.getElementById("profileEmailstaff").value;
    
    if(cfname==finame && cmname==miname && clname==laname && cemail==emil ){
        updbtn.style.display = "none"; 
    }else{
        updbtn.style.display = "inline-block"; 
    }
}

function getStaffAccAdmin(code){
    var uid = document.getElementById("profileIDadmin");
    var finame= document.getElementById("profilefNameadmin");
    var miname= document.getElementById("profilemNameadmin");
    var laname= document.getElementById("profilelNameadmin");
    var emil= document.getElementById("profileEmailadmin");
    var dptm= document.getElementById("profileDepartmentadmin");
    var postn= document.getElementById("profilePositionadmin");
    
    firebase.database().ref("Staff/").orderByKey().equalTo(code).once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var key = childSnapshot.key;
            var child = childSnapshot.val();
            uid.value = key;
            finame.value = child['fName'];
            miname.value = child['mName'];
            laname.value = child['lName'];
            emil.value = child['email'];
            dptm.value = child['dept'];
            postn.value = child['position'];
        })
    })
    
}

function addStudentsToSubj(subjcode,block){
    importClearTable('Student');
    var subjectBlock = document.getElementById("subjectNameID");
    subjectBlock.innerHTML = subjcode+" | "+block;
}

function hidedisplayUpdateSYSEM(){
    var cSY = document.getElementById("cSY");
    var cSEM = document.getElementById("cSEM");
    var vSY = document.getElementById("vSY");
    
    var currentCSY = localStorage.getItem("CurrentSY");
    var currentCSEM = localStorage.getItem("CurrentSem");
    var currentvSY= localStorage.getItem("ViewSY")+" | "+localStorage.getItem("ViewSem");
    
    if(cSY.value!=currentCSY || cSEM.value!=currentCSEM || vSY.value !=currentvSY ){
        
        var btn = document.getElementById("updateSYSEM").style.display="inline-block";
    }else{
        var btn = document.getElementById("updateSYSEM").style.display="none";
    }
    
}

function loadCurrSemNYear(){
    var btn = document.getElementById("updateSYSEM").style.display="none";
    var cSY = document.getElementById("cSY");
    var cSEM = document.getElementById("cSEM");
    var vSY = document.getElementById("vSY");
    removeOptions(cSY);
    removeOptions(vSY);
    
    var d = new Date();
    var n = d.getFullYear()-2000;
    var nn1 = n - 1;
    var np1 = n + 1;
    var list = [(nn1.toString()+"-"+n.toString()),(n.toString()+"-"+np1.toString())];
    
    for(i=0; i<list.length; i++){
        cSY.options[i] = new Option(list[i]);
    }
    
    var count=0;
    
    firebase.database().ref("SchoolYears/").orderByKey().once('value', function(snapshot){
        snapshot.forEach(function(childSnapshot){
            var bkey = childSnapshot.key;
            var bchild =childSnapshot.val();
            vSY.options[count] = new Option(bkey);
            count+=1;
        })
    }).then(function() {
        
        var op3 = vSY.getElementsByTagName("option");
                for (var i = 0; i < op3.length; i++) {
                    var viewtext = (localStorage.getItem("ViewSY")+" | "+localStorage.getItem("ViewSem"));
                    console.log(op3[i].value+" "+viewtext);
                    if(op3[i].value != viewtext){
                        op3[i].selected = false;
                    }else{
                        op3[i].selected = true;
                    }
                }

    }).catch(function(error) {
    });
    

    
    
    
    
    var op = document.getElementById("cSY").getElementsByTagName("option");
                for (var i = 0; i < op.length; i++) {
                    if(op[i].value != localStorage.getItem("CurrentSY")){
                        op[i].selected = false;
                        
                    }else{
                        op[i].selected = true;
                    }
                }
    
    var op2 = document.getElementById("cSEM").getElementsByTagName("option");
                for (var i = 0; i < op2.length; i++) {
                    if(op2[i].value != localStorage.getItem("CurrentSem")){
                        op2[i].selected = false;
                        
                    }else{
                        op2[i].selected = true;
                    }
                }
    
    
     
    
//    window.alert(viewtext);
    
    
}

function putCurrentSY(){
    var path = window. location. pathname;
    var page = path. split("/"). pop();
    
    
    
    var cSY = document.getElementById("cSY");
    var cSEM = document.getElementById("cSEM");
    var vSY = document.getElementById("vSY");
    
    swal({
      title: "Are you sure?",
      text: "Set Current S.Y. & Sem: "+cSY.value+" "+cSEM.value+"\nSet View S.Y. & Sem: "+vSY.value,
      icon: "info",
      buttons: ["No", "Yes"],
    })
    .then((answer) => {
      if (answer) {
            var importCurrSY= firebase.database().ref("CurrentSY/");
            importCurrSY.update({
                SY : cSY.value,
                SEM : cSEM.value
            });

            localStorage.setItem("CurrentSY",cSY.value);
            localStorage.setItem("CurrentSem",cSEM.value);

            var importCurrSY2= firebase.database().ref("SchoolYears/"+cSY.value+" | "+cSEM.value);
            importCurrSY2.update({
                current:"true"
            });
            var viewtext = vSY.value;
            viewtxt = viewtext.split(" | ");
            localStorage.setItem("ViewSY",viewtxt[0]);
            localStorage.setItem("ViewSem",viewtxt[1]);
          
            swal({
                title: "Success!",
                text:  "Current S.Y. & Sem: "+cSY.value+" "+cSEM.value+"\nView S.Y. & Sem: "+vSY.value,
                icon: "success",
                button: "OK",
                }).then((answer) => {
                    goTo(page);
                });
          
      } else {
      }
    });
}

function getComments(code,department){
    disableCommentBtn();
    var commentdiv =document.getElementById("CommentContainer").style.display ="none";
    var nodatadiv =document.getElementById("CommentContainerNoDATA").style.display ="grid";
    var postbtn = document.getElementById("postComment");
    postbtn.setAttribute("onclick","postComment(\""+code+"\",\""+department+"\")");
    var commentText = document.getElementById("contentComment").value='';
    
    Parent = document.getElementById("CommentContainer");
    while(Parent.hasChildNodes()){
        Parent.removeChild(Parent.firstChild);
    }
    
    firebase.database().ref("Posts - ALL/"+code+"/Comments").orderByChild('dateDSC').once('value', function(snapshot){
                snapshot.forEach(function(childSnapshot){
                    var childKey = childSnapshot.key;
                    var childData = childSnapshot.val();
                    var id = childData['postedByUID'];
                    var name = childData['postedByName'];
                    var date = childData['dateDSC'];
                    var content = childData['content'];
                    CreateCommentCard(id,name,date,content,code,childKey,department);
                })
    })
}

function postComment(Postcode,department){
    loadCurrentSchoolYearAndSemester();
    var textContentComment = document.getElementById("contentComment");
    var uidofposter = document.getElementById("profileID").value;
    var nameofposter = document.getElementById("profileName").innerHTML;
    
    var ts = (Math.round((new Date()).getTime() / 1000));
    var descTs = ts*(-1);
    var postListRef = firebase.database().ref('Posts - ALL/'+Postcode+'/Comments/');
    var newPostRef = postListRef.push();
        newPostRef.set({
            postedByUID: uidofposter,
            postedByName: nameofposter,
            content: textContentComment.value,
            dateASC: ts,
            dateDSC: descTs
        }).then(function() {
            
            createUserLog("posted a comment for a "+department+" announcement");
            
                    swal({
                      title: "Success!",
                      text: "Posted a comment for a "+department+" announcement",
                      icon: "success",
                      button: "OK",
                    }).then((answer) => {
                        getComments(Postcode,department);
                        disableCommentBtn();
                        var commentBtn = document.getElementById("openComment");
                            var ref = firebase.database().ref("Posts - ALL/"+Postcode+"/Comments");
                            ref.once("value")
                            .then(function(snapshot) {
                                commentBtn.innerHTML = "Comments ( "+snapshot.numChildren().toString()+" )";
                            });
                    });
        }).catch(function(error) {
        });
}

function CreateCommentCard(id, name, date,content,postcode,commentcode,department) {
    console.log(postcode+" "+commentcode);
    var nodatadiv =document.getElementById("CommentContainerNoDATA").style.display ="none";
    var commentdiv =document.getElementById("CommentContainer").style.display ="block";
//    var path = window. location. pathname;
//    var page = path. split("/"). pop();
    var div = document.createElement('div');
    var m1 = document.createElement('img');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var p3 = document.createElement('p');
    var p4 = document.createElement('p');
    
    div.className = "CommentCard";
    
    m1.src = "Icons/deleteicon.png";
    p1.innerHTML = name+" ("+id+")";
    p2.innerHTML = content;
    p3.innerHTML = timeElapsed(date);
    p4.innerHTML = timeConverter(date);
    
    m1.className = 'deleteComment';
    p1.className = 'commentUser';
    p2.className = "commentContent";
    p3.className = 'timepassedComm';
    p4.className = 'dateComm';
    
    m1.setAttribute("onclick","removeComment('"+postcode+"','"+commentcode+"','"+department+"')");
    
    document.getElementById('CommentContainer').appendChild(div);
    
    div.appendChild(m1);
    div.appendChild(p1);
    div.appendChild(p2);
    div.appendChild(p3);
    div.appendChild(p4);
    
    
    
    
    
//    div.setAttribute("data-toggle", "modal");
//    div.setAttribute("data-target", "#viewSubjModal");
    
//    div.setAttribute("onclick", code);
}

function disableCommentBtn(){
    var btn = document.getElementById("postComment");
    var text = document.getElementById("contentComment");
    
    if(text.value===''){
        btn.disabled=true;
        btn.style.display="none";
    }else if(text.value!=''){
        btn.disabled=false;
        btn.style.display="inline-block";
    }
}

function removeComment(postcode,commentcode,department){
    swal({
        title: "Are you sure?",
        text: "Remove comment from this announcement",
        icon: "warning",
        buttons: ["No", "Yes"],
        dangerMode: true,
    })
    .then((answer) => {
      if (answer) {
            var Key = firebase.database().ref("Posts - ALL/"+postcode+"/Comments/"+commentcode);
            Key.remove().then(function() {
                swal({
                          title: "Success!",
                          text: "Comment has been removed from "+department+" announcement",
                          icon: "success",
                          button: "OK",
                        }).then((answer) => {
                            createUserLog(" removed comment from "+department+" announcement");
                            getComments(postcode,department);
                            disableCommentBtn();
                            var commentBtn = document.getElementById("openComment");
                            var ref = firebase.database().ref("Posts - ALL/"+postcode+"/Comments");
                            ref.once("value")
                            .then(function(snapshot) {
                                commentBtn.innerHTML = "Comments ( "+snapshot.numChildren().toString()+" )";
                            });
                        });
              
              
            }).catch(function(error) {
                
            });
      } else {
          
      }
    });
    
}

















