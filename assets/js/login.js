function fakeLogin() {
  

    var userId = document.forms["login"]["idnumber"].value;
    
    
    if ((userId == "9607306333181")) {
             window.location.href = 'dashboard.html';
              return false;
          }
          else {
              alert ("Login unsuccessful.");
          }
    
  }

//   pattern="/^-?\d+\.?\d*$/" onKeyPress="if(this.value.length==13) return false;"