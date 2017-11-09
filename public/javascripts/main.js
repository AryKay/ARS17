$(function () {

  // highest # of choices (inputs) allowed
  window.highestChoice = 2;
  // hide again button on page load
  $("#again").hide();

  var goDecide = function(e) {
    // prevent default browser behavior upon submit
    clearInterval();
    e.preventDefault();
    // erase old values
    $("#status").text('');
    $("#score").text('');
    // hide decision text
    $("#decision-text").hide();
    $("#again").hide();
    // display processing text, update color to black in case of an error
    $("#status").css("color", "black");
    $("#status").text("Processing ...");
    // create variable to see if any of the inputs are input
    var anyEmpty = false;
    // array to hold inputs
    var choices = [];
    // grab values, add to choices array
    for(var i = 1; i <= window.highestChoice; i++) {
      var choiceValue = $("#choice"+i).val();
      if(choiceValue == '') {
        anyEmpty = true;
      } else {
        if(choices.indexOf(choiceValue) == -1) {
          choices.push(choiceValue);
        }
      }
    }
    // send values to server side for processing, wait for callback, getting AJAX
  $.post('/search', {'choices': JSON.stringify(choices)}, function(data) {
        data = JSON.parse(data);
        // append data to the DOM
        $(".form-container").hide()
        $("#status").text("");
        $("#decision-text").text(data['choice']);
        $("#score").text('has a score of ' + data['score'] + '');
        $("#decision-text").fadeIn();
        $("#score").fadeIn();
        $("#again").show()
      });
  }



  // ----- MAIN ----- //

  // on click, run the goDecide function
  $("#decision").click(goDecide);
  // on click new form is shown
  $("#again").click(function() {
    $(".form-container").show()
    $("#again").hide()
    // erase old values
    $("#status").text('');
    $("#score").text('');
    $("#choice1").val('');
    $("#choice2").val('');
    // hide decision text
    $("#decision-text").hide();
  });

});