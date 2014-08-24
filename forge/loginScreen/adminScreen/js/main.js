function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}
$(function () {
    $( '#table' ).searchable({
        striped: true,
        oddRow: { 'background-color': '#f5f5f5' },
        evenRow: { 'background-color': '#fff' },
        searchType: 'fuzzy'
    });
    
    $( '#searchable-container' ).searchable({
        searchField: '#container-search',
        selector: '.row',
        childSelector: '.col-xs-4',
        show: function( elem ) {
            elem.slideDown(100);
        },
        hide: function( elem ) {
            elem.slideUp( 100 );
        }
    })
});

$(document).ready(function(){
    var patientId = GetURLParameter('id');

    var nfcReceiverReference = new Firebase("https://nfcreceiver.firebaseio.com/");

    nfcReceiverReference.on("value", function(snapshot) {

        var patientAge = snapshot.child("Patients").child(patientId).child("Age").val();
        $("#patientAge").html(patientAge);
        var patientName = snapshot.child("Patients").child(patientId).child("Name").val();
        $(".patientName").html(patientName);
        var patientCodeStatus = snapshot.child("Patients").child(patientId).child("CodeStatus").val();
        $("#codeStatus").html(patientCodeStatus);

        var patientProcedure = snapshot.child("Patients").child(patientId).child("InProcedure").child("ProcedureStatus").val();
        if(patientProcedure){
            //if true return doctor name
            patientProcedure = "Yes, with "+snapshot.child("Patients").child(patientId).child("InProcedure").child("DoctorName").val();
        }else{
            //return "NO"
            patientProcedure = "No";
        }
        $("#procedure").html(patientProcedure);


        snapshot.child("Rooms").forEach(function(roomSnapshot){
            if(roomSnapshot.child("Occupied").val() === "true"){
                if(roomSnapshot.child("PID").val() === patientId){
                    var patientLocation = roomSnapshot.name();
                    var lastUpdated = roomSnapshot.child("Timestamp").val();
                    var d = new Date();
                    var n = d.getTime();
                    var miliseconds = n - lastUpdated;
                    var minutes = Math.round(miliseconds/(1000*60));
                    if(minutes<0){
                        $("#duration").html("0 minutes");
                    }
                    else if (minutes>60){
                        $("#duration").html(Math.round(minutes/60));
                    }else{
                        $("#duration").html(minutes+" minutes");
                    }
                    $("#location").html(patientLocation);
                    
                    //alert("n: "+n);
                    //alert("lastUpdated: "+lastUpdated);
                }
            }
        });

        var patientAllergies = [];
        var allergies = snapshot.child('Patients').child(patientId).child('Allergies');
        for(var i = 0;i<allergies.numChildren();i++){
                patientAllergies.push(allergies.child(''+i).val());
        }
        deleteAllChilds("allergies");
        for(var i = 0;i<patientAllergies.length;i++){
            //add cell
            $("#allergies").append("<tr class=\"warning\"><td>"+patientAllergies[i]+"</td></tr>");                           
        }

        var AdmittedFor = snapshot.child('Patients').child(patientId).child('AdmittedFor').val();
        $("#admittedFor").html(AdmittedFor);
/*
        alert(patientAge);
        alert(patientName);
        alert(patientCodeStatus);
        alert(patientProcedure);
        alert(patientAllergies.length);
        alert(patientAdmittedFor.length);*/

    });

});

function deleteAllChilds(param){
    var myNode = document.getElementById(''+param);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}