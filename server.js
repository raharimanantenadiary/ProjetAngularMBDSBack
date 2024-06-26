let express = require('express');
let Matiere = require('./model/matieres');
let Utilisateur = require('./model/utilisateurs');
let Assignments = require('./model/assignment');
let AssignmentDetails = require('./model/assignmentDetails');
let app = express();
let bodyParser = require('body-parser');
let assignment = require('./routes/assignments');
let matieres = require('./routes/matieres');
let utilisateur_routes = require('./routes/utilisateurs');
let assignmentDetails = require('./routes/assignmentDetails');
const multer = require('multer');
const upload = multer({
    dest: 'uploads/'
});
var cors = require("cors");
app.use(cors());

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.set('debug', true);

const uri = 'mongodb+srv://master:masterM2@cluster0.zpspipp.mongodb.net/assignments?retryWrites=true&w=majority&appName=Cluster0';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

mongoose.connect(uri, options)
  .then(() => {
    console.log("Connecté à la base MongoDB assignments dans le cloud !");
    console.log("at URI = " + uri);
    console.log("vérifiez with http://localhost:8010/api/assignments que cela fonctionne")
  },
    err => {
      console.log('Erreur de connexion: ', err);
    });



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let port = process.env.PORT || 8010;
const prefix = '/api';

app.route(prefix + '/utilisateurs')
  .get(utilisateur_routes.getUtilisateurs)
  .put(upload.any(),utilisateur_routes.updateUtilisateur);

app.route(prefix + '/utilisateurs/modifierUtilisateur').put(upload.any(),utilisateur_routes.updateUtilisateur);
app.route(prefix + '/utilisateurs/listeprof').get(utilisateur_routes.getListeProf);

app.route(prefix + '/utilisateurs/:id')
  .get(utilisateur_routes.getUtilisateurById)
  .delete(utilisateur_routes.deleteUtilisateur);

app.post(prefix + '/utilisateurs/login',utilisateur_routes.se_connecter );
app.post(prefix + '/utilisateurs/inscription',utilisateur_routes.s_inscrire);
app.route(prefix + '/utilisateurs/:id').get(utilisateur_routes.getUtilisateurById)
app.route(prefix + '/utilisateurs/getListeMatiere/:id').get(utilisateur_routes.getListeMatiere);

app.route(prefix + '/assignments')
  .post(assignment.postAssignment)
  .put(assignment.updateAssignment)
  .get(assignment.getAssignments);

app.route(prefix + '/assignments/:id')
  .get(assignment.getAssignmentById)
  .delete(assignment.deleteAssignment);

app.route(prefix + '/assignments/RenduEleve/:id').get(assignment.getAssignmentsRenduEleve);
app.route(prefix + '/assignments/NonRenduEleve/:id').get(assignment.getAssignmentsNonRenduEleve);
app.route(prefix + '/assignments/byMatiere/:matiereId/:profId').get(assignment.getAssignmentsByMatiereAndProf);
app.route(prefix + '/assignments/eleve/byMatiere/:matiereId/:auteurId').get(assignment.getAssignmentsEleveByMatiere);

app.route(prefix + '/matieres')
  .get(matieres.getMatieres)
  .put(upload.any(),matieres.updateMatiere);

app.route(prefix + '/matieres/:id')
  .get(matieres.getMatiereById);

app.route(prefix + '/matieres/byProf/:idProf').get(matieres.getMatiereByProf);
app.route(prefix + '/matieres/supprimer').delete(matieres.deleteMatiere);
app.post(prefix + '/matieres/ajouter', upload.any(), matieres.postMatiere);



// http://serveur...../assignmentDetails
app.route(prefix + '/assignmentDetails')
  .post(assignmentDetails.postAssignmentDetail)
  .get(assignmentDetails.getAssignmentDetails)
  .put(assignmentDetails.updateAssignmentDetail);

app.route(prefix + '/assignmentDetails/:id')
  .get(assignmentDetails.getAssignmentDetailById)
  .delete(assignmentDetails.deleteAssignmentDetail);

app.route(prefix + '/assignmentsDetails/new').post(assignmentDetails.newAssignmentDetail);
app.route(prefix + '/assignmentsDetails/getDetailDevoir/:idEleve/:idAssignment').get(assignmentDetails.getDetailDevoirByAssignmentId);

app.route(prefix + '/assignmentsDetails/statistique/:id/:idp').get(assignmentDetails.getAssignmentsTotalCount);

app.route(prefix + '/assignmentsDetails/RenduProf/:id/:idp').get(assignmentDetails.getAssignmentsRenduProf);
app.route(prefix + '/assignmentsDetails/NonRenduProf/:id/:idp').get(assignmentDetails.getAssignmentsNonRenduProf);
app.route(prefix + '/assignmentsDetails/DevoirRenduProf/:id/:idp').get(assignmentDetails.getAssignmentsRenduParDevoirProf);
app.route(prefix + '/assignmentsDetails/DevoirNonRenduProf/:id/:idp').get(assignmentDetails.getAssignmentsNonRenduParDevoirProf);

app.route(prefix + '/assignmentsDetails/information/:idu/:ida').get(assignment.getInformationAssignmentDetailByEleve);


// mise en cache
const staticOptions = {
  maxAge: '1y', // Durée de mise en cache
}; 

// dossier image uploader 
app.use("/api/uploads", express.static("uploads", staticOptions));




// On démarre le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;


