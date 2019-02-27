// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
Style Transfer Image Example using p5.js
This uses a pre-trained model of The Great Wave off Kanagawa and Udnie (Young American Girl, The Dance)
=== */

var image_src;
var model_src;
var transferStyle; 
//image change using select tag 
$("#style-select").change(function () {
    cur_value = $('option:selected', this).text();
    console.log(cur_value);
    image_src = "img/styles/" + cur_value + ".jpg";
    model_src = "ckpts/"+cur_value;
    console.log(image_src);
    console.log(model_src);
    $("#style-img").attr("src", image_src);
    transferStyle = ml5.styleTransfer(model_src,modelLoaded);
});
//

let inputImg;
let statusMsg;
let transferBtn;
let style1;
let style2;

function setup() {
  //let myCanvas = createCanvas(600,400);
  noCanvas();
  // Get the input image
  inputImg = select('#content-img');

  // Transfer Button
  transferBtn = select('.transferBtn')
  transferBtn.mousePressed(transferImages);

  // Create two Style methods with different pre-trained models
  style1 = ml5.styleTransfer(model_src, modelLoaded);
}

// A function to be called when the models have loaded
function modelLoaded() {
  // Check if both models are loaded
  if(style1.ready){
    console.log('Ready!')
  }
}

// Apply the transfer to both images!
function transferImages() {
  console.log('Applying Style Transfer...!');

  style1.transfer(inputImg, function(err, result) {
    createImg(result.src).parent('style-img');
  });

}