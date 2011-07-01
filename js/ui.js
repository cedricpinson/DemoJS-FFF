var removeLoading;
var showCredits;
$(document).ready(function() {
    removeLoading = function() {
        $('#loading').fadeOut(400);
        setTimeout(function() {
            $('body').removeClass('loading');
        }, 500);
    };
    
    showCredits = function() {
        $('#View').fadeOut(500);
        $('#credits').fadeIn(1000);
        $('#skip').hide();
        $('#replay').show();
        $('#tweet').show();

        setTimeout( function () { 
            if (Viewer !== undefined) {
                Viewer.setDone();
            }
            $('#View').remove() 
        } , 600);
    };
   
   $('#skip').click(function() {
       showCredits();
       var audioSound=document.getElementById('zik');
       audioSound.pause();
   });
    
   $(".email").defuscate_mailto();
});