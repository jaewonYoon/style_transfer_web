var image_src;
var model_src;
var transferStyle;
let inputImg; 
//image change using select tag
function select_style(selected) {
  cur_value = selected.text();
  console.log(cur_value);
  image_src = "img/styles/" + cur_value + ".jpg";
  model_src = "ckpts/"+cur_value;
  console.log(image_src);
  console.log(model_src);
  $("#style-img").attr("src", image_src);
  // Create two Style methods with different pre-trained models
  transferStyle = ml5.styleTransfer(model_src,modelLoaded);
}
function select_content(selected) {
  cur_value = selected.text();
  console.log(cur_value);
  $("#content-img").attr("src", "img/" + cur_value + ".jpg");
  inputImg = select('#content-img');
}
$("#style-select").change(function() {
  select_style($('option:selected', this));
});
$("#content-select").change(function() {
  select_content($('option:selected', this));
});
//

// let statusMsg;
let transferBtn;
// let style1;
// let style2;

function setup() {
  //let myCanvas = createCanvas(600,400);
  noCanvas();
  // Get the input image
  select_style($("#style-select option:selected"));
  select_content($("#content-select option:selected"));
  // Transfer Button
  transferBtn = select('.transferBtn')
  transferBtn.mousePressed(transferImages);
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Check if both models are loaded
  if(transferStyle.ready){
    console.log('Ready!')
  }
}

// Apply the transfer to both images!
function transferImages() {
  console.log('Applying Style Transfer...!');

  transferStyle.transfer(inputImg, function(err, result) {
    $(".outputImg").attr("src", result.src);
  });

}