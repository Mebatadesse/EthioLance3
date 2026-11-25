const { createJobCategories } = require("./src/jobs/job.service");

const seed = async () => {
    try {
        await createJobCategories();
        console.log("Job categories inserted successfully!");
    } catch (error) {
        console.error("Error inserting job categories:", error);
    } finally {
        process.exit();
    }
};

seed();