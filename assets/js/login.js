function validateForm() {
  
  
   
    var userId = document.forms["loginEmail"]["password"].value;
    
    
    if ((userId == "123456789")) {
             window.location.href = 'inbox.html';
              return false;
          }
          else {
              alert ("Login unsuccessful.");
          }
    
  }