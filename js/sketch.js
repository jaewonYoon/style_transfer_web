let inputImg;
let statusMsg;
let transferBtn;
let style1;
let style2;

function setup() {
    noCanvas();
    // Status Msg
    statusMsg = select('#statusMsg');

    // Get the input image
    inputImg = select('#inputImg');

    // Transfer Button
    transferBtn = select('#transferBtn')
    transferBtn.mousePressed(transferImages);

    // Create two Style methods with different pre-trained models
    style1 = ml5.styleTransfer('../ckpts/wave', modelLoaded);
    style2 = ml5.styleTransfer('../ckpts/udnie', modelLoaded);
}

// A function to be called when the models have loaded
function modelLoaded() {
    // Check if both models are loaded
    if (style1.ready && style2.ready) {
        statusMsg.html('Ready!')
    }
}

// Apply the transfer to both images!
function transferImages() {
    statusMsg.html('Applying Style Transfer...!');

    style1.transfer(inputImg, function (err, result) {
        createImg(result.src).parent('styleA');
    });

    style2.transfer(inputImg, function (err, result) {
        createImg(result.src).parent('styleB');
    });

    statusMsg.html('Done!');
}

//styletransfer image select

$('.myitem').each(function () {
    if ($(this).hasClass('selected')) {
        $('#myImage').attr('src') = 'img/styles' + $(this).attr('id')[1] + '.jpg';
    }
}); 
