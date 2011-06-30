var removeLoading;
var showCredits;
$(document).ready(function() {
    removeLoading = function() {
        $('body').removeClass('loading');
    };
    
    showCredits = function() {
        $('#View').fadeOut(500);
        $('#credits').fadeIn(1000);

        setTimeout( function () { 
            Viewer.setDone();
            $('#View').remove() 
        } , 600);
    };
    
   $(".email").defuscate_mailto();
});