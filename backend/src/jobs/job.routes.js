const express = require("express");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const { createJobController, getJobsController, getJobByIdController, updateJobController, deleteJobController } = require("./job.controller");

const router =  express.Router();

// authenticated users can view open jobs
router.get(
    "/",
    authenticate,
    getJobsController
);

// authenticated isers see one specific job
router.get(
    "/:id",
    authenticate,
    getJobByIdController
);

// authenticated clients can create obs
router.post(
    "/",
    authenticate,
    authorize("CLIENT"),
    createJobController
);

// update own job
router.put(
    "/:id",
    authenticate,
    authorize("CLIENT"),
    updateJobController
);

router.delete(
    "/:id",
    authenticate,
    authorize("CLIENT"),
    deleteJobController
);

module.exports = router;