var removeLoading;
var showCredits;
$(document).ready(function() {
    removeLoading = function() {
        $('body').removeClass('loading');
    };
    
    showCredits = function() {
        $('#View').fadeOut(500);
        $('#credits').fadeIn(1000);
        $('#skip').hide();
        $('#replay').show();

        setTimeout( function () { 
            Viewer.setDone();
            $('#View').remove() 
        } , 600);
    };
   
   $('#skip').click(function() {
       showCredits();
   });
    
   $(".email").defuscate_mailto();
});