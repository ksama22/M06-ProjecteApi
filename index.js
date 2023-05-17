let API_BASE = 'https://api.nasa.gov';
let API_KEY = 'yns2Tz49qdSIKPohDnbeNoeRfCIrqRtt5smy1cnM';


//Controla el zoom
let zoomPressed = false;
let zoomxyz = { x: 0, y: 0, z: 0 }
let speedCamera = 1;
let llistaMeteorids = null;
let uidEarh = null;
let actualSelect = 0;

let listAsteroids = []


window.onload = function () {
    //   findPhoto();
    console.log("Carregat");
}

//del treejs 

//https://api.nasa.gov/neo/rest/v1/feed?start_date=2015-09-07&end_date=2015-09-08&api_key=DEMO_KEY

let camera, scene, renderer;
//Tamany del canas
let cvSize = { "height": 400, "width": 800 }

//Vigila la camara
camera = new THREE.PerspectiveCamera(50, 1, 1, 1000);
camera.position.z = 1000;
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

//Creacio de la terra
let mesh = createMeshPlanet(400, 30, 30, 'textures/4k.jpg');
mesh.position.y = 0
mesh.position.x = 0
//Identificador global de la terra
uidEarh = mesh.uuid;
animate(mesh);


function findDate() {
    document.getElementById("loading").style.display = "block";
    let inici = document.getElementById("start-date").value;
    //let query = `${API_BASE}/neo/rest/v1/feed?start_date=${inici}&end_date=${inici}&api_key=${API_KEY}`;
    let query = "hola.json";
    console.log(query);
    fetch(query, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json())
        .then(response => getAsteroids(response, inici))

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
function getAsteroids(asteroid, date) {
    document.getElementById("loading").style.display = "none";
    // L'objecte com a tal te el [1998-12-31], exemple  com obj.
    llistaMeteorids = asteroid.near_earth_objects[date];
    //Llista neta de tots els meteorits
    llistaMeteorids.forEach(data => {
        //Guardo les dades en un objecte Meteorid
        let meteoridOBJ = new Meteoroid(
            data.neo_reference_id,
            data.name,
            data.absolute_magnitude_h,
            data.estimated_diameter.meters.estimated_diameter_min,
            data.estimated_diameter.meters.estimated_diameter_max,
            data.is_potentially_hazardous_asteroid,
            data.close_approach_data[0].relative_velocity.kilometers_per_hour,
            data.close_approach_data[0].miss_distance.kilometers,
            data.close_approach_data[0].orbiting_body,
            //Creo per defecte DOS mesh unic per cada meteorit
            [createMeshForMeteorid(data.estimated_diameter.meters.estimated_diameter_min),
            createMeshForMeteorid(data.estimated_diameter.meters.estimated_diameter_min)
            ]
        )
        //Guarda el llista global
        listAsteroids.push(meteoridOBJ);
    });
    //Omple els selectors amb la llista
    fillSelector();
    fillTaula();

    drawMeteroid();
    console.log("mi lista", listAsteroids);

}

function fillSelector() {
    let pare1 = document.getElementById("selector1");
    let pare2 = document.getElementById("selector2");

    deleteChild(pare1);
    deleteChild(pare2);

    for (let i = 0; i < listAsteroids.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.innerText = listAsteroids[i].name;
        pare1.appendChild(option);
        //Omple el primer i segon select a l'hora amb els mateixos elements
        let option2 = document.createElement("option");
        option2.value = i;
        option2.innerText = listAsteroids[i].name;
        pare2.appendChild(option2);
    }


}

function fillTaula() {
    //Agafa el valor del selector
    let nSelect = parseInt(document.getElementById("selector1").value);
    let th = document.getElementById("thGenerated");
    let td = document.getElementById("tdGenerated");

    //Agafa el valor del selector
    let nSelect2 = parseInt(document.getElementById("selector2").value);
    let th2 = document.getElementById("thGenerated2");
    let td2 = document.getElementById("tdGenerated2");

    //Codi repetit es posa en funcio per omplir taula
    fillChildTaula(th, td, nSelect, 0)
    fillChildTaula(th2, td2, nSelect2, 1)
}

function fillChildTaula(th, td, nSelect, numMesh) {
    //Como no renderitza el carrego els fills per tornar a generar
    deleteChild(th);
    deleteChild(td);
    //La tindra l'objecte {"algo":"valor"} amb Object.keys agafa el "algo"
    Object.keys(listAsteroids[nSelect]).forEach(element => {
        let child = document.createElement("th");
        child.innerText = element;
        th.appendChild(child);
    });

    //La tindra l'objecte {"algo":"valor"} amb Object.values agafa el "valor"
    Object.values(listAsteroids[nSelect]).forEach(element => {
        let child = document.createElement("td");
        child.innerText = element;
        td.appendChild(child);
    });

    console.log("cambiame");
}


function deleteChild(parentElement) {
    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
    }
}

//Pinta un asteorid
function drawMeteroid() {

    //Cada mesh te un identificador, i es por esborrar de la escena aixi
    /* listAsteroids.forEach(element => {
         scene.remove(scene.getObjectByProperty('uuid', element.mesh.uuid));
     });
 */

    let slct1 = parseInt(document.getElementById("selector1").value);
    let slct2 = parseInt(document.getElementById("selector2").value);
    scene.remove(scene.getObjectByProperty('uuid', listAsteroids[slct1].meshOBJ[0].uuid));
    scene.remove(scene.getObjectByProperty('uuid', listAsteroids[slct2].meshOBJ[1].uuid));

    let meshAsteroid1 = listAsteroids[slct1].meshOBJ;
    let meshAsteroid2 = listAsteroids[slct2].meshOBJ;

    meshAsteroid1[0].position.y = 0;
    meshAsteroid2[1].position.y = 0;

    meshAsteroid1[0].position.x = 0;
    meshAsteroid2[1].position.x = 500;

    scene.add(meshAsteroid1[0]);
    scene.add(meshAsteroid2[1]);




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


class Meteoroid {
    constructor(neoReference, name, magnitude, minDiameter, maxDiameter, isDangerous, velocity, distance, orbiting, meshOBJ) {
        this.neoReference = neoReference;
        this.name = name;
        this.magnitude = magnitude;
        this.minDiameter = minDiameter;
        this.maxDiameter = maxDiameter;
        this.isDangerous = isDangerous;
        this.velocity = velocity;
        this.distance = distance;
        this.orbiting = orbiting;
        //El mesh es el sprite que despres es dibuixa sobre l'escena
        this.meshOBJ = meshOBJ;
    }
}

//Preceo un mesh
function createMeshForMeteorid(size) {
    let mesh = createMeshPlanet(size, 30, 30, 'textures/stone.png');
    mesh.position.y = 0;
    mesh.position.x = 50;
    animate(mesh);
    return mesh;
}

function generaNovesDades() {
    fillTaula()
    drawMeteroid();
}

function generaEarth(event) {
    // se que puedo por id 'tierra' pero con el event tambien sirve
    if (event.target.checked) {
        scene.add(mesh);
        return;
    }
    scene.remove(scene.getObjectByProperty('uuid', uidEarh));
}

//Canvia el materials dels asteroides, agafa el value del select que es la ruta de les textures
function changeMaterial(num, event) {
    let opcio = event.target.value;
    listAsteroids.forEach(element => {
        //Mesh 0 meteorit esquerra, mesh 1 meteorit dreta
        element.meshOBJ[num].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(opcio) });
    });

}
