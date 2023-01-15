
// client-side js
// run by the browser each time your view template is loaded

console.log('hello world :o');


// define variables that reference elements on our page
const santaForm = document.forms[0];

// listen for the form to be submitted and add a new dream when it is
santaForm.onsubmit = function (event) {
  //prevent default action of the event
  event.preventDefault();
  //char length check , limit 100 char
  if(santaForm?.wish?.value?.length <= 100){
    santaForm.submit();
  }else if(santaForm?.wish?.value?.length > 100){
    //char limit exceeded alert
    alert('Char limit for making a wish is 100 chars, Kindly shorten up!!..');
  }
};
