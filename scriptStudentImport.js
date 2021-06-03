var importBtnStudent = document.getElementById("studentFile").addEventListener("change", function(){
    Papa.parse(document.getElementById("studentFile").files[0], {
//        header: true,
        complete: function(results) {
            console.log(results);
//            window.alert("wow");
//            window.alert(results.data.length);
//            window.alert(results.data[0]["User I.D."]);
            
            
            for (i = 1; i < results.data.length; i++) {
                if(results.data[i][4]=="CAS"){
                    if(results.data[i][0] == ""||results.data[i][1] == "" || results.data[i][3] == ""||results.data[i][4] == ""||results.data[i][5] != ""){
                        document.getElementById("tableBodyStudent").innerHTML +=
                            "<tr class="+'rejected'+"><td>" + results.data[i][0]+ 
                            "</td><td>" + results.data[i][3]+" "+results.data[i][2]+" "+results.data[i][1] + 
                            "</td><td>" + results.data[i][4]+"</td></tr>";
                    }else if(results.data[i][0] != ""||results.data[i][1] != "" || results.data[i][3] != ""||results.data[i][4] != ""||results.data[i][4] != ""||results.data[i][5] == ""){
                        document.getElementById("tableBodyStudent").innerHTML +=
                                "<tr><td>" + results.data[i][0]+ 
                                "</td><td>" + results.data[i][3]+" "+results.data[i][2]+" "+results.data[i][1] + 
                                "</td><td>" + results.data[i][4]+results.data[i][5]+"</td></tr>";
                        addImportQueueStudent(results.data[i][0],results.data[i][3],results.data[i][2],results.data[i][1],results.data[i][4],results.data[i][5],results.data[i][6],results.data[i][7]);
                        console.log(userID[0]);
        
                    }
                }else{
                    if(results.data[i][0] == ""||results.data[i][1] == "" || results.data[i][3] == ""||results.data[i][4] == ""||results.data[i][5] == ""){
                        document.getElementById("tableBodyStudent").innerHTML +=
                            "<tr class="+'rejected'+"><td>" + results.data[i][0]+ 
                            "</td><td>" + results.data[i][3]+" "+results.data[i][2]+" "+results.data[i][1] + 
                            "</td><td>" + results.data[i][4]+" - "+results.data[i][5]+"</td></tr>";
                    }else{
                        document.getElementById("tableBodyStudent").innerHTML +=
                                "<tr><td>" + results.data[i][0]+ 
                                "</td><td>" + results.data[i][3]+" "+results.data[i][2]+" "+results.data[i][1] + 
                                "</td><td>" + results.data[i][4]+" - "+results.data[i][5]+"</td></tr>";
                        addImportQueueStudent(results.data[i][0],results.data[i][3],results.data[i][2],results.data[i][1],results.data[i][4],results.data[i][5],results.data[i][6],results.data[i][7]);
                        console.log(userID[0]);
        
                    }
                    
                }
            }
            
           
	   }
    });
    
});