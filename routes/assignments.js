let Assignment = require('../model/assignment');
const assignmentDetails = require('../model/assignmentDetails');

function getAssignments(req, res){
    let aggregateQuery = Assignment.aggregate();

    Assignment.aggregatePaginate(
        aggregateQuery, 
        {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        },
        (err, data) => {
            if(err){
                res.send(err)
            }
    
            res.send(data);
        }
    );
}

function getAssignmentById(req, res) {
    let assignmentId = req.params.id;
    Assignment.findById(assignmentId)
        .populate('details')
        .exec((err, assignment) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(assignment);
            }
        });
}

function postAssignment(req, res){
    let assignment = new Assignment();
    assignment.nom = req.body.nom;
    assignment.dateDeRendu = req.body.dateDeRendu;
    assignment.matiere= req.body.matiere;

    console.log("POST assignment reçu :");
    console.log(assignment)

    assignment.save( (err) => {
        if(err){
            res.send('cant post assignment ', err);
        }
        res.json({ message: `${assignment.nom} saved!`})
    })
}

function updateAssignment(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);
    Assignment.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, assignment) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
          res.json({message: 'updated'})
        }
    });

}

function deleteAssignment(req, res) {
    const assignmentId = req.params.id;
    assignmentDetails.deleteMany({ assignment: assignmentId }, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        Assignment.findByIdAndRemove(assignmentId, (err, assignment) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.json({ message: `${assignment.nom} deleted` });
        });
    });
}

function getAssignmentsRenduEleve(req, res) {
    const auteurId = req.params.id; 
    Assignment.find({})
        .populate({
            path: 'details',
            match: {
                auteur: auteurId
            }
        })
        .populate({
            path: 'matiere',
            populate: {
                path: 'prof'
            }
        })
        .exec((err, assignments) => {
            if (err) {
                return res.status(500).send(err);
            }
            const filteredAssignments = assignments.filter(assignment => assignment.details.length > 0);
            res.json(filteredAssignments);
        });
}

function getAssignmentsNonRenduEleve(req, res) {
    const auteurId = req.params.id; 
    Assignment.find({})
        .populate({
            path: 'details',
            match: {
                auteur: auteurId
            }
        })
        .populate({
            path: 'matiere',
            populate: {
                path: 'prof'
            }
        })
        .exec((err, assignments) => {
            if (err) {
                return res.status(500).send(err);
            }

            const filteredAssignments = assignments.filter(assignment => {
                if (assignment.details.length > 0) {
                    const isAuteurPresent = assignment.details.some(detail => detail.auteur.toString() === auteurId);
                    return !isAuteurPresent;
                }
                return true;
            });

            res.json(filteredAssignments);
        });
}

function getAssignmentsByMatiereAndProf(req, res) {
    const matiereId = req.params.matiereId;
    const profId = req.params.profId;

    Assignment.find({
        matiere: matiereId
    })
    .populate({
        path: 'matiere',
        match: { prof: profId },
        populate: 'prof'
    })
    .exec((err, assignments) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(assignments);
    });
}

function getAssignmentsEleveByMatiere(req, res) {
    const auteurId = req.params.auteurId; 
    const matiereId = req.params.matiereId; // Ajout de la récupération de l'ID de la matière

    Assignment.find({ matiere: matiereId }) // Filtrer par l'ID de la matière
        .populate({
            path: 'details',
            match: {
                auteur: auteurId
            }
        })
        .populate('matiere')
        .exec((err, assignments) => {
            if (err) {
                return res.status(500).send(err);
            }

            

            res.json(assignments);
    });
}





module.exports = { 
    getAssignmentById, 
    getAssignments,
    postAssignment, 
    updateAssignment, 
    deleteAssignment,
    getAssignmentsRenduEleve,
    getAssignmentsNonRenduEleve,
    getAssignmentsByMatiereAndProf,
    getAssignmentsEleveByMatiere
};
