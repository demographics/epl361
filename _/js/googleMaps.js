var map=null;
var cur_location=null;
var cur_event=null;
var cur_comments=null;

function initialize() {

    var minZoomLevel = 10;

    var mapOptions = {
        center: { lat: 35.142604, lng: 33.405216},
        zoom: minZoomLevel,
        disableDefaultUI:true
    };

    geocoder = new google.maps.Geocoder();

    var strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(34.630248, 31.994110),
        new google.maps.LatLng(35.493534, 33.840351)
    );

    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

    google.maps.event.addListener(map, 'drag', function() {
        if (strictBounds.contains(map.getCenter())) return;

        var c = map.getCenter(),
        x = c.lng(),
        y = c.lat(),
        maxX = strictBounds.getNorthEast().lng(),
        maxY = strictBounds.getNorthEast().lat(),
        minX = strictBounds.getSouthWest().lng(),
        minY = strictBounds.getSouthWest().lat();

        if (x < minX) x = minX;
        if (x > maxX) x = maxX;
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;

        map.setCenter(new google.maps.LatLng(y, x));
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
    });

    google.maps.event.addListener(map, 'click', function(event) {
        cur_location = null;
        cur_location=event.latLng;
        if(flag){
            $("#marker-modal").modal("toggle");
        }else{
            swal({
              title: "You are not logged in.",
              text: "You have to be logged in to post an event.",
              type: "warning",
              showCancelButton: false,
              confirmButtonClass: 'btn-warning',
              confirmButtonText: 'Got it!'
            });
        }
    });			

    loadMarkers();

};

function placeMarker(eventID,location) {

    
    var eventJSON = null;
    var propertyType = null;
    var photoPath = null;
    var description = null;
    
     $.ajax({
        url: "markers/phpsqlajax_getcontents.php",
        type: "POST",
        data: {
            eventID:eventID
        },
        async: false,
        success: function (data) {
            eventJSON = JSON.parse(data);
        }
    });

    var icon = null;
    switch(eventJSON.type){
        case 'memoir':
            icon = "_/img/markers/memoir.png";
            break;
        case 'property':
            icon = "_/img/markers/property.png";
            break;
        case 'photo':
            icon = "_/img/markers/photo.png";
            break;
        case 'article':
            icon = "_/img/markers/article.png";
            break;
    }
    
     var placeMarker = new google.maps.Marker({
        position: location,
        map: map,
        animation:google.maps.Animation.DROP,
        icon:icon
    });
    
    var infowindow = new InfoBubble({
          content: 
                    '<div class="info-element">'+
                        '<h5>'+eventJSON.title+'</h5>'+
                    '</div>',
          minWidth:50,
          minHeight:55,
          maxWidth:150,
          maxHeight:180,
          shadowStyle: 1,
          padding: 1 ,
          backgroundColor: '#FFF',
          borderRadius: 5,
          arrowSize: 10,
          borderWidth: 1,
          borderColor: '#FFF',
          disableAutoPan: true,
          hideCloseButton: true,
          arrowPosition: 50,
          backgroundClassName: 'transparent',
          arrowStyle: 0
    });

    google.maps.event.addListener(placeMarker, 'mouseover', function() {
        infowindow.open(map,placeMarker);
    });

    google.maps.event.addListener(placeMarker,'mouseout',function(){
        infowindow.close();
    });           

    google.maps.event.addListener(placeMarker,'click',function() {
        map.setZoom(12);
        map.setCenter(placeMarker.getPosition());
        cur_event = eventID;
        
         $.ajax({
                url: "markers/phpsqlajax_load_comment.php",
                type: "POST",
                data: {
                    eventID:cur_event
                },
                success: function (data) {
                    cur_comments = JSON.parse(data);
                    loadComments();
                },
                async: false
            });
        
        $.ajax({
            url: "markers/phpsqlajax_views.php",
            type: "POST",
            data: {
                eventID:eventID
            },
            async: false
        });
        
        $('#marker-body').html( '<h1 class="modal-title"><center>'+eventJSON.title+'</center></h1><center><p>'+eventJSON.eventDate+'</p></center><br>'+eventJSON.content);
        
        $('#marker-view').modal('toggle');
        $('#marker-view').on('hide.bs.modal', function () {            
            map.setZoom(10);
            $("#comment-list").html("");
            document.getElementById("comment-input").value = "";
        });
    });

};

function saveMarker(eventID,location){

    $.ajax({
        url: 'markers/phpsqlajax_store.php',
        type: 'post',
        data: {
            lat:location.lat(),
            lng:location.lng(),
            event:eventID
        },
        success: function(output) {
             console.log(output);
        }
    });

}

function loadMarkers() {

    downloadUrl("markers/phpsqlajax_genxml.php", function(data) {
      
        var xml = data.responseXML;
        var markers = xml.documentElement.getElementsByTagName("marker");
        for (var i = 0; i < markers.length; i++) {
            var location = new google.maps.LatLng(
                markers[i].getAttribute("lat"),
                markers[i].getAttribute("lng")
            );
            
            var eventID = markers[i].getAttribute("eventID");
            placeMarker(eventID,location);
        }
    });

};

function insertMarker(eventID){
    console.log('lattidute : '+cur_location.lat()+', longitude : '+cur_location.lng());
    placeMarker(eventID,cur_location);	
    saveMarker(eventID,cur_location);
}

google.maps.event.addDomListener(window, 'load', initialize);