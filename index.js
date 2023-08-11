var left = 37;
var up = 38;
var right = 39;
var down = 40;

data_url = "http://i.imgur.com/CzXTtJV.jpg";
// in browser, URLs can be relative or absolute
base_url = "Inception/";
model_url = base_url + "inception_v3.json";
weights_url = base_url + "inception_v3_weights.buf";
meta_url = base_url + "inception_v3_metadata.json";
this.model = new KerasJS.Model({
    filepaths: {
        model: model_url,
        weights: weights_url,
        metadata: meta_url
    },
//    layerCallPauses: true,
    gpu: this.hasWebgl
});
    
this.model.ready()
    .then(() => {
        console.log("INCEPTION V3 READY");
        loadImageToCanvas(data_url, predict, initVis);
    });

function predict(updateFn) {
    console.log("BEGIN COMPUTE");
    const ctx = document.getElementById('input-canvas').getContext('2d');
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const { data, width, height } = imageData;
    
    var inputData = loadDataToTensor(data, width, height);

    this.model.predict(inputData).then(outputData => {
        this.output = outputData['predictions'];
        this.modelRunning = false;
        console.log("COMPUTE DONE");
        
        let topK = imagenetClassesTopK(this.output);
        let str = "";
        for (i=0; i<topK.length; i++) {
            let pred = topK[i];
            str = str + pred["name"] + "\t" + pred["probability"];
                str = str + " </br>";
        }
        document.getElementById("predictions").innerHTML = str;
        
        updateFn(this.model);
        refresh();
        hideLoading();
    })
        .catch(err => {
            console.log(err);
        });
}

// from image_urls.js
select.onchange = function() {
    let selected = select.options[select.selectedIndex];
    console.log(selected.text);
    showLoading();
    loadImageToCanvas(selected.value, predict, updateVis);
};

var text_input = document.getElementById("image-input");
var button = document.getElementById("button");
button.onclick = function() {
    showLoading();
    loadImageToCanvas(text_input.value, predict, updateVis);
}

document.onkeydown = checkKey;
function checkKey(e) {
    switch (e.keyCode) {
    case right:
        theta += -Math.PI/50;
        refresh();
        e.preventDefault();
        break;
    case left:
        theta += Math.PI/50;
        refresh();
        e.preventDefault();        
        break;
    case up:
        distance += -100;
        refresh();
        e.preventDefault();                
        break;
    case down:
        distance += 100;
        refresh();
        e.preventDefault();        
        break;        
    }
}

function hideLoading() {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('predictions').style.display = 'block';
}
function showLoading() {
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('predictions').style.display = 'none';
}
//var interval_key = setInterval(updateVis, 5000);
//function updateVis() {
//    let is_running = model.isRunning;
//    console.log(model.layersWithResults);
//    if (!is_running) {
//        window.clearInterval(interval_key);
//    } 
//}