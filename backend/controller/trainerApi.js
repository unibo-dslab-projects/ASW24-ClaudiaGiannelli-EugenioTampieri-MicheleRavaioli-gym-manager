const Client = require('../models/clientModel');
const Course = require('../models/courseModel');
const Trainer = require('../models/trainerModel');
const idProjection = require('./idProjection');

//API RESTFUL CRUD CON LOCK PER LA GESTIONE DELLA MUTUA ESCLUSIONE
// le funzioni di Mongoose sono CRUD

module.exports = class API {
    static async createTrainer(req, res) {
        const trainer = req.body;
        try {
            const trainerAlreadyPresent = await Trainer.findOne({ username: req.body.username }, idProjection(Trainer), null).exec();

            if (!trainerAlreadyPresent) {
                await Trainer.create(trainer, null);
                res.status(201).json({ message: 'Trainer created successfully' });
            }
            else {
                res.status(500).json({ message: "Trainer already present" });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        } finally {
        }
    }

    static async fetchAllTrainers(req, res) {
        try {
            const trainers = await Trainer.find({}, idProjection(Trainer), null).exec();
            // trainers array
            res.status(200).json(trainers);
        } catch (error) {
            res.status(404).json({ message: error.message })
        } finally {
        }
    }

    static async fetchTrainerByUsername(req, res) {
        const username = req.params.username;
        try {
            const trainer = await Trainer.findOne({ username: username }, idProjection(Trainer), null).exec();
            res.status(200).json(trainer);
        } catch (error) {
            res.status(404).json({ message: error.message });
        } finally {
        }
    }
    static async fetchTrainerBy_Id(req, res) {
        const id = req.params.id;
        try {
            const trainer = await Trainer.findById(id, idProjection(Trainer), null).exec();
            res.status(200).json(trainer);
        } catch (error) {
            res.status(404).json({ message: error.message });
        } finally {
        }
    }



    static async updateTrainer(req, res) {
        const username = req.body.username;
        const { password, email, phoneNumber, courses, sessions } = req.body; // Extract the fields to update

        try {
            const updateFields = {}; // Object that will contain only the fields to update
            // Check and add non-empty fields to the update object
            if (password) updateFields.password = password;
            if (email) updateFields.email = email;
            if (phoneNumber) updateFields.phoneNumber = phoneNumber;
            if (courses) updateFields.courses = courses;
            if (sessions) updateFields.sessions = sessions;

            // Perform the update only if there are fields to update
            if (Object.keys(updateFields).length > 0) {
                await Trainer.updateOne({ username: username }, updateFields, null);
                res.status(200).json({ message: 'Trainer updated successfully' });
            } else {
                res.status(400).json({ message: 'No fields to update' });
            }

        } catch (error) {
            res.status(404).json({ message: error.message });
        } finally {
        }
    }

    static async deleteTrainer(req, res) {
        const id = req.params.id;
        try {
            // Trova il trainer e i suoi corsi
            const trainer = await Trainer.findById(id);
            if (!trainer) {
                return res.status(404).json({ message: 'Trainer not found' });
            }

            // Trova tutti i corsi che il trainer possiede
            const trainerCourses = await Course.find({ _id: { $in: trainer.courses } });

            if (trainerCourses.length > 0) {
                // Rimuove tutti i corsi del trainer dal Client
                await Client.updateMany(
                    { 'courses.course': { $in: trainer.courses } },
                    { $pull: { courses: { course: { $in: trainer.courses } } } }
                );

                // Elimina tutti i corsi assegnati al trainer
                await Course.deleteMany({ _id: { $in: trainer.courses } });
            }

            // Infine, elimina il trainer dal database
            await Trainer.findOneAndDelete({ _id: id });

            res.status(200).json({ message: 'Trainer and all associated courses deleted successfully' });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    static async fetchAllTrainerCourses(req, res) {
        const id = req.params.id;
        try {
            // Trova il trainer e popola i corsi con i dettagli dei partecipanti
            const trainer = await Trainer.findOne({ _id: id })
                .populate({
                    path: "courses",
                    select: "name description schedule capacity trainer", // Seleziona i campi necessari del corso
                    populate: {
                        path: "schedule.participants", // Popola l'array `participants` dentro `schedule`
                        select: "firstName lastName" // Seleziona solo nome e cognome del partecipante
                    }
                })
                .exec();
            if (!trainer) {
                return res.status(404).json({ message: 'Trainer not found' });
            }
            res.status(200).json(trainer.courses);
        } catch (error) {
            res.status(404).json({ message: error.message });
        } finally {
        }
    }

    static async fetchAllTrainerSessions(req, res) {
        const id = req.params.id;
        try {
            const trainer = await Trainer.findOne({ _id: id }, idProjection(Trainer), null)
                .populate({
                    path: 'sessions',
                    populate: {
                        path: 'trainer participant', // Popola trainer e participant se servono
                        select: 'username firstName lastName' // Se vuoi solo alcune info di trainer e participant
                    }
                })
                .exec();
            if (!trainer) {
                return res.status(404).json({ message: 'Trainer not found' });
            }
            res.status(200).json(trainer.sessions);
        } catch (error) {
            res.status(404).json({ message: error.message });
        } finally {
        }
    }
}