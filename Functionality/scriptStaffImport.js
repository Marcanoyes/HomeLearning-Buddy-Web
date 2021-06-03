var importBtnStaff = document.getElementById("staffFile").addEventListener("change", function(){
    Papa.parse(document.getElementById("staffFile").files[0], {
//        header: true,
        complete: function(results) {
            console.log(results);
//            window.alert("wow");
//            window.alert(results.data.length);
//            window.alert(results.data[0]["User I.D."]);
            for (i = 1; i < results.data.length; i++) {
                
                if(results.data[i][0] == ""||results.data[i][1] == "" || results.data[i][3] == ""||results.data[i][4] == ""){
                    document.getElementById("tableBodyStaff").innerHTML +=
                            "<tr class="+"'rejected'"+"><td>" + results.data[i][0]+ 
                            "</td><td>" + results.data[i][3]+" "+results.data[i][2]+" "+results.data[i][1] + 
                            "</td><td>" + results.data[i][4]+ 
                            "</td><td>" + results.data[i][5] + "</td></tr>";
                   
                }else{
                    document.getElementById("tableBodyStaff").innerHTML +=
                                "<tr><td>" + results.data[i][0]+ 
                                "</td><td>" + results.data[i][3]+" "+results.data[i][2]+" "+results.data[i][1] + 
                                "</td><td>" + results.data[i][4]+ 
                                "</td><td>" + results.data[i][5] + "</td></tr>";
                    addImportQueueStaff(results.data[i][0],results.data[i][3],results.data[i][2],results.data[i][1],results.data[i][4],results.data[i][5]);
                }
            }
            
           
	   }
    });
    
});