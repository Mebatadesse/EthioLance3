const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { getMyFreelancerProfile, createMyFreelancerProfile, updateMyFreelancerProfile,
        getMyClientProfile, createMyClientProfile, updateMyClientProfile } = require("./profile.controller");
const { getMyExperiences, createMyExperience, updateMyExperience, deleteMyExperience } = require("./experience.controller");
const { getMyEducations, createMyEducation, updateMyEducation, deleteMyEducation } = require("./education.controller");
const { getMyCertifications, createMyCertification, updateMyCertification, deleteMyCertification } = require("./certification.controller");
const { getMyPortfolio, createMyPortfolioItem, updateMyPortfolioItem, deleteMyPortfolioItem } = require("./portfolio.controller");

const router = express.Router();

router.get(
    "/freelancer/me",
    authenticate,
    authorize("FREELANCER"),
    getMyFreelancerProfile
);

router.post(
    "/freelancer/me",
    authenticate,
    authorize("FREELANCER"),
    createMyFreelancerProfile
);

router.put(
    "/freelancer/me",
    authenticate,
    authorize("FREELANCER"),
    updateMyFreelancerProfile
);

router.get(
    "/freelancer/experiences",
    authenticate,
    authorize("FREELANCER"),
    getMyExperiences
);

router.post(
    "/freelancer/experiences",
    authenticate,
    authorize("FREELANCER"),
    createMyExperience
);

router.put(
    "/freelancer/experiences/:id",
    authenticate,
    authorize("FREELANCER"),
    updateMyExperience
);

router.delete(
    "/freelancer/experiences/:id",
    authenticate,
    authorize("FREELANCER"),
    deleteMyExperience
);

router.get(
    "/freelancer/educations",
    authenticate,
    authorize("FREELANCER"),
    getMyEducations
);

router.post(
    "/freelancer/educations",
    authenticate,
    authorize("FREELANCER"),
    createMyEducation
);

router.put(
    "/freelancer/educations/:id",
    authenticate,
    authorize("FREELANCER"),
    updateMyEducation
);

router.delete(
    "/freelancer/educations/:id",
    authenticate,
    authorize("FREELANCER"),
    deleteMyEducation
);

// Certification
router.get(
    "/freelancer/certifications",
    authenticate,
    authorize("FREELANCER"),
    getMyCertifications
);

router.post(
    "/freelancer/certifications",
    authenticate,
    authorize("FREELANCER"),
    createMyCertification
);

router.put(
    "/freelancer/certifications/:id",
    authenticate,
    authorize("FREELANCER"),
    updateMyCertification
);

router.delete(
    "/freelancer/certifications/:id",
    authenticate,
    authorize("FREELANCER"),
    deleteMyCertification
);

// Portfolio
router.get(
    "/freelancer/portfolio",
    authenticate,
    authorize("FREELANCER"),
    getMyPortfolio
);

router.post(
    "/freelancer/portfolio",
    authenticate,
    authorize("FREELANCER"),
    createMyPortfolioItem
);

router.put(
    "/freelancer/portfolio/:id",
    authenticate,
    authorize("FREELANCER"),
    updateMyPortfolioItem
);

router.delete(
    "/freelancer/portfolio/:id",
    authenticate,
    authorize("FREELANCER"),
    deleteMyPortfolioItem
);

// Client 
router.get(
    "/client/me",
    authenticate,
    authorize("CLIENT"),
    getMyClientProfile
);

router.post(
    "/client/me",
    authenticate,
    authorize("CLIENT"),
    createMyClientProfile
);

router.put(
    "/client/me",
    authenticate,
    authorize("CLIENT"),
    updateMyClientProfile
);

module.exports = router;