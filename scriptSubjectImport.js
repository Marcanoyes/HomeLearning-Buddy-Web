var currSY = localStorage.getItem("CurrentSY");
var currSem = localStorage.getItem("CurrentSem");
var importBtnSubject = document.getElementById("subjectFile").addEventListener("change", function(){
    Papa.parse(document.getElementById("subjectFile").files[0], {
//        header: true,
        complete: function(results) {
            console.log(results);
            for (i = 1; i < results.data.length; i++) {
                if(results.data[i][2]=="CAS"){
                    if(results.data[i][0] == ""||results.data[i][1] == "" ||results.data[i][2] == "" || results.data[i][3] != ""){
                        document.getElementById("tableBodySubject").innerHTML +=
                            "<tr class="+'rejected'+"><td>" + results.data[i][0]+ 
                            "</td><td>" + results.data[i][1]+
                            "</td><td>" + results.data[i][2]+
                            "</td><td>" + currSY+" - "+currSem+"</td></tr>";
                    }else if(results.data[i][0] != ""||results.data[i][1] != "" || results.data[i][2] != ""|| results.data[i][3] == ""){
                        document.getElementById("tableBodySubject").innerHTML +=
                            "<tr><td>" + results.data[i][0]+ 
                            "</td><td>" + results.data[i][1]+
                            "</td><td>" + results.data[i][2]+
                            "</td><td>" + currSY+" - "+currSem+"</td></tr>";
                            addImportQueueSubject(results.data[i][0],results.data[i][1],results.data[i][2],results.data[i][3],results.data[i][4],currSY,currSem);
                            console.log(userID[0]);
                    }
                    
                }else{
                    if(results.data[i][0] == ""||results.data[i][1] == "" ||results.data[i][2] == "" || results.data[i][3] == ""){
                        document.getElementById("tableBodySubject").innerHTML +=
                            "<tr class="+'rejected'+"><td>" + results.data[i][0]+ 
                            "</td><td>" + results.data[i][1]+
                            "</td><td>" + results.data[i][2]+
                            "</td><td>" + currSY+" - "+currSem+"</td></tr>";
                    }
                    else{
                
                        document.getElementById("tableBodySubject").innerHTML +=
                                    "<tr><td>" + results.data[i][0]+ 
                                    "</td><td>" + results.data[i][1]+
                                    "</td><td>" + results.data[i][2]+
                                    "</td><td>" + currSY+" - "+currSem+"</td></tr>";
                        addImportQueueSubject(results.data[i][0],results.data[i][1],results.data[i][2],results.data[i][3],results.data[i][4],currSY,currSem);
                        console.log(userID[0]);
                        
                    }
                    
                }
            }
            
           
	   }
    });
    
});

