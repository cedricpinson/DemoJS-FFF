$(document).ready(function() {
    var removeLoading = function() {
        $('body').removeClass('loading');
    };
    
    var showCredits = function() {
        $('#View').fadeOut(500);
        $('#credits').fadeIn(1000);
    };
    
   $(".email").defuscate_mailto();
});