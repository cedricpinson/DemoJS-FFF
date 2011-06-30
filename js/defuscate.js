email_format = /\s*\(.+\)\s*/

jQuery.fn.defuscate = function() {
   return this.each(function() {
     $(this).html(String($(this).html()).replace(email_format, "@"));
   });
}; 

jQuery.fn.defuscate_mailto = function() {
   return this.each(function() {
     $(this).attr('href', String($(this).attr('href')).replace(email_format, "@"));
   });
};