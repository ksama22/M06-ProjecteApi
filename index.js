let API_BASE = 'https://api.nasa.gov';
let API_KEY = 'yns2Tz49qdSIKPohDnbeNoeRfCIrqRtt5smy1cnM'
//Controla el zoom
let zoomPressed = false;
let zoomxyz = { x: 0, y: 0, z: 0 }
let speedCamera = 1;
let llistaMeteorids = null;
let uidLastMetorid = null;
let actualSelect = 0;

//del treejs 

//https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=DEMO_KEY

let camera, scene, renderer;
//Tamany del canas
let cvSize = { "height": 400, "width": 800 }

//Vigila la camara
camera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
camera.position.z = 300;
camera.position.x = 0;
camera.position.y = 0;

//L'aspecte de la camara es la divisio entre l'alçada del canvas i la amplada
camera.aspect = cvSize.width / cvSize.height;
camera.updateProjectionMatrix();
scene = new THREE.Scene();


renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(1);
renderer.setSize(cvSize.width, cvSize.height,);
document.getElementById("escenario").appendChild(renderer.domElement);
//window.addEventListener('resize', onWindowResize(renderer,camera));

let mesh = createMeshPlanet(20, 30, 30, 'textures/4k.jpg');
//F7A49AAF-FF41-4A69-BF89-62FFE62C7DB7
mesh.position.y = 0
mesh.position.x = 0
console.log(mesh.uuid);
/*
for (let i = 0; i < 5; i++) {
    let meshn = createMeshPlanet(20 + i, 30, 30, 'textures/mars.png');
    meshn.position.x = (i + 1) * 50;
    scene.add(meshn);
    animate(meshn);

}*/

//Afegeix el planeta
scene.add(mesh);


//Para per parametre el mesh
animate(mesh);


function getData() {
    fetch(API_URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)))
    console.log("hi");
}



function findDate() {
    document.getElementById("loading").style.display = "block";
    let inici = document.getElementById("start-date").value;
    //let query = `${API_BASE}/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=yns2Tz49qdSIKPohDnbeNoeRfCIrqRtt5smy1cnM`;
    let query = `${API_BASE}/neo/rest/v1/feed?start_date=${inici}&end_date=${inici}&api_key=${API_KEY}`;
    console.log(query);
    fetch(query, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => listAsteroids(response, inici))

}

function findPhoto() {
    //https://api.nasa.gov/planetary/apod?api_key=yns2Tz49qdSIKPohDnbeNoeRfCIrqRtt5smy1cnM
    let query = `${API_BASE}/planetary/apod?api_key=${API_KEY}`;
    console.log("findPhoto()", query);
    fetch(query, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json()) ///*{if (response.status !== 200) {alert("Hubo algun problema \nNASA API: Status Code " + response.status)}}
        .then(response => getDayPhoto(response))

}

//Coding a 3D Solar System with JavaScript + Three.js  https://www.youtube.com/watch?v=KOSMzSyiEiA
function listAsteroids(asteroid, date) {
    //Esborra l'anterior

    llistaMeteorids = asteroid.near_earth_objects["1996-01-01"][actualSelect];
    document.getElementById("loading").style.display = "none";
    let pare = document.getElementById("meteoritos");
    pare.innerHTML = "";
    drawMeteroid(0)

}

//Pinta un asteorid
function drawMeteroid(num) {
    actualSelect = actualSelect + num;
    let obj = llistaMeteorids;
    //Esborra l'anterior existent per 'uid'
    if (uidLastMetorid !== null) {
        scene.remove(scene.getObjectByProperty('uuid', uidLastMetorid));
    }
    let size = llistaMeteorids.estimated_diameter.kilometers.estimated_diameter_min;
    console.log("size", size);
    console.log(obj.name);
    console.log(obj.estimated_diameter.meters.estimated_diameter_min);
    console.log(obj.close_approach_data[0].epoch_date_close_approach); //close_approach_date_full
    //{obj.estimated_diameter.meters.estimated_diameter_min}
    //${obj.name}
    let mesh = createMeshPlanet(size * 10, 30, 30, 'textures/stone.png');
    mesh.position.y = 0;
    mesh.position.x = 50;
    uidLastMetorid = mesh.uuid;
    animate(mesh);
    console.log(mesh.uuid);
    //Afegeix el planeta
    scene.add(mesh);
    console.log(actualSelect, "defv");

}




//Esto es un planeta
function createMeshPlanet(size, wSegments, hSegments, textureMap) {
    const geometry = new THREE.SphereGeometry(size, wSegments, hSegments);
    const material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(textureMap) });
    return new THREE.Mesh(geometry, material);
}

function onWindowResize(renderer, camera) {
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize(300, 300);
}

function move(nmesh) {
    //console.log(nmesh.position);
    nmesh.position.x += 0.05;
    return nmesh
}

//Aplica animacio de gir
function animate(mesh) {
    requestAnimationFrame(animate.bind(this, mesh));
    //mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;
    if (zoomPressed) {
        camera.position.x += zoomxyz.x;
        camera.position.y += zoomxyz.y;
        camera.position.z += zoomxyz.z;
    }
    //mesh = move(mesh);
    renderer.render(scene, camera);
}

function moveCamera(x, y, z) {
    //Controlem la velocitat de camera
    zoomxyz.x = x * speedCamera;
    zoomxyz.y = y * speedCamera;
    zoomxyz.z = z * speedCamera;
    //S'executa mentre 'zoomPressed'' es true
    zoomPressed = true;
}


/*
function Escucha(e, down) {
    let id;
    switch (e.button) {
        case 0: // Primary button ("left")
            id = "midle-show";
            break;
        case 2: // Secondary button ("right")
            id = "midle-show";
            break;
    }
    let clickedElem = e.target;
    //esto verifica si clicas en un elemento en concreto
    do {
        if (clickedElem == document.getElementById("minesT")) {
            //esto es para verificar aunque se puede quitar en este caso
            if (document.getElementById(id).innerHTML != "☠️" && document.getElementById(id).innerHTML != "🥳") {
                document.getElementById(id).innerHTML = down ? "😱" : "😃";
            }
            return;
        }
        clickedElem = clickedElem.parentNode;
    } while (clickedElem);
    // alert(`Click is Outside The Element`);

}*/
// Controla la velocitat de la camara
function actualitzaVelocitat() {
    speedCamera = document.getElementById('velocityCamera').value;
    console.log("spped", speedCamera);
}

function getDayPhoto(props) {
    console.log(props);
    document.getElementById("title").innerText = props.title;
    let image = document.getElementById("image");
    image.src = props.url;
    image.alt = props.title;
    document.getElementById("imagehd").href = props.hdurl;
    document.getElementById("description").innerText = props.explanation;
}

window.onload = function () {
    findPhoto();
}